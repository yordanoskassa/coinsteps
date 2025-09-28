from datetime import datetime, date
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
import motor.motor_asyncio
import os
import uuid
import time
from dotenv import load_dotenv
from auth import (
    User, UserCreate, UserLogin, UserInDB, Token,
    verify_password, get_password_hash, create_access_token, verify_token
)
from wallet import SolanaWalletService, WalletInfo, TransferRequest, TransferResponse
from anchor_client import StepBettingClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "stepbet")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="StepBet API")
security = HTTPBearer(auto_error=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "ngrok-skip-browser-warning"],
)


class StepData(BaseModel):
    date: str  # YYYY-MM-DD format
    steps: int
    source: str = "manual"  # apple_health, pedometer, manual

class StepIn(BaseModel):
    user_id: str
    date: str = Field(description="YYYY-MM-DD")
    steps: int
    source: str = Field(default="pedometer")

class StepOut(StepIn):
    updated_at: str

# Auth dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        print("DEBUG: No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        token = credentials.credentials
        print(f"DEBUG: Received token: {token[:20]}..." if token else "No token")
        token_data = verify_token(token)
        print(f"DEBUG: Token verified for user: {token_data.username}")
        user = await db.users.find_one({"username": token_data.username})
        if user is None:
            print(f"DEBUG: User not found in database: {token_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        print(f"DEBUG: Auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Handle legacy users without avatar_seed
    if "avatar_seed" not in user:
        avatar_seed = str(uuid.uuid4())
        await db.users.update_one(
            {"username": token_data.username},
            {"$set": {"avatar_seed": avatar_seed}}
        )
        user["avatar_seed"] = avatar_seed
    
    # Auto-create wallet for users who don't have one
    if not user.get("wallet_public_key"):
        wallet_data = wallet_service.create_wallet()
        await db.users.update_one(
            {"username": token_data.username},
            {
                "$set": {
                    "wallet_public_key": wallet_data["public_key"],
                    "encrypted_private_key": wallet_data["encrypted_private_key"]
                }
            }
        )
        user["wallet_public_key"] = wallet_data["public_key"]
    
    user.pop("_id", None)
    user.pop("hashed_password", None)
    return User(**user)

@app.get("/health")
async def health():
    return {"status": "ok"}

# Authentication endpoints
@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user with avatar seed
    import uuid
    hashed_password = get_password_hash(user.password)
    avatar_seed = str(uuid.uuid4())  # Generate unique avatar seed
    user_doc = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_seed": avatar_seed,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Find user
    db_user = await db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/steps")
async def upsert_steps(steps: StepData, current_user: User = Depends(get_current_user)):
    """Upsert step data for the authenticated user on a specific date"""
    # Use the authenticated user's username instead of user_id from payload
    step_data = steps.dict()
    step_data["user_id"] = current_user.username
    
    result = await db.steps.update_one(
        {"user_id": current_user.username, "date": steps.date},
        {"$set": step_data},
        upsert=True
    )
    return {"message": "Steps updated successfully", "upserted": result.upserted_id is not None}


@app.get("/steps/{user_id}", response_model=List[StepOut])
async def get_steps(user_id: str, limit: int = 30):
    try:
        cur = db.steps.find({"user_id": user_id}).sort("date", -1).limit(limit)
        out = []
        async for doc in cur:
            doc.pop("_id", None)
            out.append(doc)
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Friends system models
class FriendRequest(BaseModel):
    friend_username: str

class FriendResponse(BaseModel):
    username: str
    full_name: Optional[str]
    avatar_seed: str
    status: str  # "pending", "accepted", "blocked"

# Friends endpoints
@app.post("/friends/request")
async def send_friend_request(request: FriendRequest, current_user: User = Depends(get_current_user)):
    """Send a friend request to another user"""
    # Check if target user exists
    target_user = await db.users.find_one({"username": request.friend_username})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user["username"] == current_user.username:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")
    
    # Check if friendship already exists
    existing = await db.friendships.find_one({
        "$or": [
            {"user1": current_user.username, "user2": request.friend_username},
            {"user1": request.friend_username, "user2": current_user.username}
        ]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists or pending")
    
    # Create friend request
    friendship_doc = {
        "user1": current_user.username,
        "user2": request.friend_username,
        "status": "pending",
        "requested_by": current_user.username,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.friendships.insert_one(friendship_doc)
    return {"message": "Friend request sent"}

@app.post("/friends/accept/{friend_username}")
async def accept_friend_request(friend_username: str, current_user: User = Depends(get_current_user)):
    """Accept a friend request"""
    friendship = await db.friendships.find_one({
        "user1": friend_username,
        "user2": current_user.username,
        "status": "pending"
    })
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    await db.friendships.update_one(
        {"_id": friendship["_id"]},
        {"$set": {"status": "accepted", "accepted_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "Friend request accepted"}

@app.get("/friends", response_model=List[FriendResponse])
async def get_friends(current_user: User = Depends(get_current_user)):
    """Get list of friends"""
    friendships = db.friendships.find({
        "$or": [
            {"user1": current_user.username, "status": "accepted"},
            {"user2": current_user.username, "status": "accepted"}
        ]
    })
    
    friends = []
    async for friendship in friendships:
        friend_username = friendship["user2"] if friendship["user1"] == current_user.username else friendship["user1"]
        friend_user = await db.users.find_one({"username": friend_username})
        if friend_user:
            friends.append(FriendResponse(
                username=friend_user["username"],
                full_name=friend_user.get("full_name"),
                avatar_seed=friend_user["avatar_seed"],
                status="accepted"
            ))
    
    return friends

@app.get("/friends/requests", response_model=List[FriendResponse])
async def get_friend_requests(current_user: User = Depends(get_current_user)):
    """Get pending friend requests"""
    requests = db.friendships.find({
        "user2": current_user.username,
        "status": "pending"
    })
    
    pending_requests = []
    async for request in requests:
        requester = await db.users.find_one({"username": request["user1"]})
        if requester:
            pending_requests.append(FriendResponse(
                username=requester["username"],
                full_name=requester.get("full_name"),
                avatar_seed=requester["avatar_seed"],
                status="pending"
            ))
    
    return pending_requests

@app.get("/users/search")
async def search_users(q: str, current_user: User = Depends(get_current_user)):
    """Search for users by username"""
    if len(q) < 2:
        return []
    
    users = db.users.find({
        "username": {"$regex": q, "$options": "i"},
        "username": {"$ne": current_user.username}
    }).limit(10)
    
    results = []
    async for user in users:
        results.append({
            "username": user["username"],
            "full_name": user.get("full_name"),
            "avatar_seed": user["avatar_seed"]
        })
    
    return results


# Wallet endpoints
@app.post("/wallet/create")
async def create_wallet(current_user: User = Depends(get_current_user)):
    """Create a Solana wallet for the authenticated user"""
    # Check if user already has a wallet
    if current_user.wallet_public_key:
        raise HTTPException(status_code=400, detail="User already has a wallet")
    
    # Create new wallet
    wallet_data = wallet_service.create_wallet()
    
    # Update user with wallet info
    await db.users.update_one(
        {"username": current_user.username},
        {
            "$set": {
                "wallet_public_key": wallet_data["public_key"],
                "encrypted_private_key": wallet_data["encrypted_private_key"]
            }
        }
    )
    
    return {
        "public_key": wallet_data["public_key"],
        "message": "Wallet created successfully"
    }

@app.get("/wallet/info", response_model=WalletInfo)
async def get_wallet_info(current_user: User = Depends(get_current_user)):
    """Get wallet information"""
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=404, detail="User does not have a wallet")
    
    # Get on-chain balance
    balance = await wallet_service.get_balance(current_user.wallet_public_key)
    
    # Add simulated balance for testing (when devnet faucet is down)
    user_data = await db.users.find_one({"username": current_user.username})
    simulated_balance = user_data.get("simulated_balance", 0.0) if user_data else 0.0
    
    total_balance = balance + simulated_balance
    
    return WalletInfo(
        public_key=current_user.wallet_public_key,
        balance=total_balance
    )

@app.post("/wallet/airdrop")
async def request_airdrop(amount: float = 1.0, current_user: User = Depends(get_current_user)):
    """Request SOL airdrop (testnet)"""
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=404, detail="User does not have a wallet")
    
    result = await wallet_service.airdrop_sol(current_user.wallet_public_key, amount)
    
    if result["status"] == "error":
        error_msg = result["error"]
        print(f"Airdrop error for user {current_user.username}: {error_msg}")  # Debug logging
        
        # Provide more user-friendly error messages
        if "rate limit" in error_msg.lower() or "429" in error_msg:
            error_msg = "Testnet faucet rate limit exceeded. Please try again in a few minutes or use the web faucet at https://faucet.solana.com"
        elif "insufficient" in error_msg.lower() or "empty" in error_msg.lower():
            error_msg = "Testnet faucet is temporarily empty. Try the web faucet at https://faucet.solana.com"
        elif "timeout" in error_msg.lower():
            error_msg = "Network timeout. Please check your connection and try again."
        elif "invalid" in error_msg.lower():
            error_msg = "Invalid wallet address. Please refresh the app."
        else:
            error_msg = f"Testnet airdrop unavailable: {error_msg}\n\nTry the web faucet: https://faucet.solana.com"
        
        raise HTTPException(status_code=400, detail=error_msg)
    
    return result

@app.post("/wallet/manual-airdrop")
async def manual_airdrop(current_user: User = Depends(get_current_user)):
    """Manual airdrop for testing - gives 1 SOL directly to user's balance"""
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=404, detail="User does not have a wallet")
    
    # For development/testing: simulate an airdrop by updating user balance
    # In production, this would be removed or require admin privileges
    try:
        # Update user's balance in database (simulated airdrop)
        await db.users.update_one(
            {"username": current_user.username},
            {"$inc": {"simulated_balance": 1.0}}
        )
        
        return {
            "transaction_signature": "simulated_airdrop_" + str(int(time.time())),
            "status": "success",
            "amount": 1.0,
            "note": "Simulated airdrop for testing"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual airdrop failed: {str(e)}")

@app.post("/wallet/transfer", response_model=TransferResponse)
async def transfer_sol(transfer_request: TransferRequest, current_user: User = Depends(get_current_user)):
    """Transfer SOL to another user"""
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=404, detail="You don't have a wallet yet. Please refresh the app.")
    
    # Get sender's encrypted private key
    sender_user = await db.users.find_one({"username": current_user.username})
    if not sender_user or "encrypted_private_key" not in sender_user:
        raise HTTPException(status_code=404, detail="Wallet configuration error. Please contact support.")
    
    # Find recipient user
    recipient_user = await db.users.find_one({"username": transfer_request.recipient_username})
    if not recipient_user:
        raise HTTPException(status_code=404, detail=f"User '{transfer_request.recipient_username}' not found")
    if not recipient_user.get("wallet_public_key"):
        raise HTTPException(status_code=404, detail=f"User '{transfer_request.recipient_username}' doesn't have a wallet yet")
    
    # Check sender balance
    sender_balance = await wallet_service.get_balance(current_user.wallet_public_key)
    if sender_balance < transfer_request.amount:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. You have {sender_balance:.4f} SOL but need {transfer_request.amount} SOL")
    
    # Execute transfer
    result = await wallet_service.transfer_sol(
        sender_user["encrypted_private_key"],
        recipient_user["wallet_public_key"],
        transfer_request.amount
    )
    
    if result["status"] == "error":
        error_msg = result["error"]
        # Provide more user-friendly error messages
        if "insufficient" in error_msg.lower():
            error_msg = "Insufficient balance for transaction fees. Please request an airdrop first."
        elif "timeout" in error_msg.lower():
            error_msg = "Network timeout. Please try again."
        elif "invalid" in error_msg.lower():
            error_msg = "Invalid transaction. Please check the recipient and amount."
        else:
            error_msg = f"Transfer failed: {error_msg}"
        
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Record transaction in database
    transaction_record = {
        "sender_username": current_user.username,
        "recipient_username": transfer_request.recipient_username,
        "amount": transfer_request.amount,
        "transaction_signature": result["transaction_signature"],
        "memo": transfer_request.memo,
        "timestamp": datetime.utcnow().isoformat(),
        "status": result["status"]
    }
    
    await db.transactions.insert_one(transaction_record)
    
    return TransferResponse(
        transaction_signature=result["transaction_signature"],
        status=result["status"],
        amount=transfer_request.amount,
        recipient=transfer_request.recipient_username
    )

@app.get("/wallet/transactions")
async def get_transactions(limit: int = 20, current_user: User = Depends(get_current_user)):
    """Get transaction history for the authenticated user"""
    transactions = db.transactions.find({
        "$or": [
            {"sender_username": current_user.username},
            {"recipient_username": current_user.username}
        ]
    }).sort("timestamp", -1).limit(limit)
    
    result = []
    async for tx in transactions:
        tx.pop("_id", None)
        result.append(tx)
    
    return result


# Initialize services
wallet_service = SolanaWalletService(
    encryption_key=os.getenv("WALLET_ENCRYPTION_KEY")
)
betting_client = StepBettingClient()

# Initialize oracle keypair for health verification
oracle_keypair = wallet_service.generate_keypair()  # In production, load from secure storage
from health_verifier import HealthDataVerifier, HealthDataSubmission
health_verifier = HealthDataVerifier(oracle_keypair)


# Step Betting Smart Contract Endpoints
class ChallengeCreate(BaseModel):
    target_steps: int
    stake_amount: float  # SOL amount
    duration_hours: int = 24

class ChallengeJoin(BaseModel):
    challenge_address: str

class StepsSubmission(BaseModel):
    challenge_address: str
    steps_count: int
    health_data: dict  # HealthKit or other verification data
    device_info: dict  # Device information for integrity checks

@app.post("/challenges/create")
async def create_challenge(
    challenge_data: ChallengeCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new step challenge with smart contract escrow"""
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=400, detail="User must have a wallet to create challenges")
    
    # Get user's wallet keypair
    user_keypair = wallet_service.get_user_keypair(current_user.username)
    if not user_keypair:
        raise HTTPException(status_code=400, detail="Could not access user wallet")
    
    # Convert SOL to lamports
    stake_lamports = int(challenge_data.stake_amount * 1_000_000_000)
    
    # Create challenge on blockchain with oracle
    result = await betting_client.create_challenge(
        user_keypair,
        challenge_data.target_steps,
        stake_lamports,
        challenge_data.duration_hours,
        oracle_keypair.public_key
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=f"Failed to create challenge: {result['error']}")
    
    # Store challenge in database
    challenge_record = {
        "challenge_address": result["challenge_address"],
        "creator_username": current_user.username,
        "target_steps": challenge_data.target_steps,
        "stake_amount": challenge_data.stake_amount,
        "duration_hours": challenge_data.duration_hours,
        "created_at": datetime.utcnow().isoformat(),
        "transaction_signature": result["transaction_signature"],
        "status": "active",
        "participants": [current_user.username]
    }
    
    await db.challenges.insert_one(challenge_record)
    
    return {
        "success": True,
        "challenge_address": result["challenge_address"],
        "transaction_signature": result["transaction_signature"],
        "target_steps": challenge_data.target_steps,
        "stake_amount": challenge_data.stake_amount
    }

@app.post("/challenges/join")
async def join_challenge(
    join_data: ChallengeJoin,
    current_user: User = Depends(get_current_user)
):
    """Join an existing challenge"""
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=400, detail="User must have a wallet to join challenges")
    
    # Check if challenge exists and is active
    challenge = await db.challenges.find_one({
        "challenge_address": join_data.challenge_address,
        "status": "active"
    })
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found or inactive")
    
    if current_user.username in challenge["participants"]:
        raise HTTPException(status_code=400, detail="Already participating in this challenge")
    
    # Get user's wallet keypair
    user_keypair = wallet_service.get_user_keypair(current_user.username)
    if not user_keypair:
        raise HTTPException(status_code=400, detail="Could not access user wallet")
    
    # Join challenge on blockchain
    result = await betting_client.join_challenge(
        user_keypair,
        join_data.challenge_address
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=f"Failed to join challenge: {result['error']}")
    
    # Update challenge in database
    await db.challenges.update_one(
        {"challenge_address": join_data.challenge_address},
        {
            "$push": {"participants": current_user.username},
            "$set": {"updated_at": datetime.utcnow().isoformat()}
        }
    )
    
    return {
        "success": True,
        "transaction_signature": result["transaction_signature"],
        "challenge_address": join_data.challenge_address
    }

@app.post("/challenges/submit-steps")
async def submit_steps(
    submission: StepsSubmission,
    current_user: User = Depends(get_current_user)
):
    """Submit step count for off-chain verification"""
    # Verify user is participating in challenge
    challenge = await db.challenges.find_one({
        "challenge_address": submission.challenge_address,
        "participants": current_user.username,
        "status": "active"
    })
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found or user not participating")
    
    # Create health data submission for verification
    health_submission = HealthDataSubmission(
        username=current_user.username,
        challenge_address=submission.challenge_address,
        steps_count=submission.steps_count,
        date=datetime.utcnow().strftime("%Y-%m-%d"),
        source=submission.health_data.get("source", "manual"),
        raw_data=submission.health_data,
        device_info=submission.device_info,
        timestamp=datetime.utcnow()
    )
    
    # Submit for off-chain verification
    verification_result = await health_verifier.submit_health_data(health_submission)
    
    # Record submission in database
    submission_record = {
        "challenge_address": submission.challenge_address,
        "username": current_user.username,
        "steps_count": submission.steps_count,
        "health_data": submission.health_data,
        "device_info": submission.device_info,
        "verification_id": verification_result["verification_id"],
        "verification_status": "pending",
        "submitted_at": datetime.utcnow().isoformat()
    }
    
    await db.step_submissions.insert_one(submission_record)
    
    return {
        "success": True,
        "verification_id": verification_result["verification_id"],
        "status": "pending_verification",
        "estimated_completion": verification_result["estimated_completion"].isoformat(),
        "steps_submitted": submission.steps_count
    }

@app.get("/challenges")
async def get_challenges(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get challenges (all, active, completed, or user's challenges)"""
    query = {}
    if status:
        query["status"] = status
    
    challenges = db.challenges.find(query).sort("created_at", -1).limit(50)
    
    result = []
    async for challenge in challenges:
        challenge.pop("_id", None)
        
        # Add user participation info
        challenge["is_participating"] = current_user.username in challenge.get("participants", [])
        challenge["is_creator"] = challenge.get("creator_username") == current_user.username
        challenge["is_winner"] = challenge.get("winner") == current_user.username
        
        result.append(challenge)
    
    return result
