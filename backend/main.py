from datetime import datetime, date, timedelta
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
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    print(f"DEBUG: Token received: {token[:20]}...")
    
    try:
        token_data = verify_token(token)
        print(f"DEBUG: Token verified for user: {token_data.username}")
        
        # Get user from database
        user_doc = await db.users.find_one({"username": token_data.username})
        if user_doc is None:
            print(f"DEBUG: User not found in database: {token_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Remove MongoDB _id field and convert to User model
        user_doc.pop("_id", None)
        # Ensure sol_balance exists for existing users
        if "sol_balance" not in user_doc:
            user_doc["sol_balance"] = 0.0
            # Update the database with the new field
            await db.users.update_one(
                {"username": token_data.username},
                {"$set": {"sol_balance": 0.0}}
            )
        user = User(**user_doc)
        print(f"DEBUG: User loaded: {user.username}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
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
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/test-email")
async def test_email_sending():
    """Test endpoint to verify AgentMail integration with AI-generated content"""
    try:
        challenge_data = {
            "type": "Weekend Warrior Challenge",
            "target": "15,000",
            "duration": "72",
            "stakeAmount": "5.0",
            "id": "test-challenge-789",
            "message": "Yordanos! It's time for our epic weekend challenge! I'm feeling confident about this one - think you can keep up? Winner takes all! 🏆"
        }
        
        result = await agentmail_client.send_challenge_invitation(
            recipient_email="kassay@mail.gvsu.edu",
            recipient_name="Yordanos",
            challenge_data=challenge_data,
            sender_name="Sarah"
        )
        
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/test-challenge-creation")
async def test_challenge_creation():
    """Test endpoint to verify end-to-end challenge creation with email invitations"""
    try:
        # Simulate challenge creation data
        test_challenge_data = {
            "metrics": ["steps"],
            "duration": 24,
            "stake": 0.5,
            "friends": ["kassay@mail.gvsu.edu"],
            "message": "Ready for a fun fitness challenge? Let's see who can get more steps!"
        }
        
        # Create mock challenge record
        challenge_record = {
            "id": str(uuid.uuid4()),
            "type": "Steps Challenge", 
            "target": 10000,
            "duration": test_challenge_data["duration"],
            "stake": test_challenge_data["stake"],
            "message": test_challenge_data["message"]
        }
        
        # Send invitations
        await send_challenge_invitations(
            challenge_record=challenge_record,
            friend_emails=test_challenge_data["friends"],
            sender_name="Test User"
        )
        
        return {
            "success": True, 
            "message": "Test challenge created and invitations sent",
            "challenge_id": challenge_record["id"]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Note: We intentionally allow multiple accounts to share the same email address.
    # This removes the uniqueness constraint on email.
    
    # Create new user with avatar seed
    import uuid
    hashed_password = get_password_hash(user.password)
    # Use provided avatar_seed or generate a unique one if not provided
    avatar_seed = user.avatar_seed if user.avatar_seed else str(uuid.uuid4())
    user_doc = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_seed": avatar_seed,
        "hashed_password": hashed_password,
        "sol_balance": 0.0,  # Start with 0 SOL balance
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

@app.get("/users/me")
async def get_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users")
async def get_all_users(current_user: User = Depends(get_current_user)):
    """Get all registered users for friend selection"""
    users = await User.find_all().to_list()
    # Return users excluding the current user and only include necessary fields
    return [
        {
            "id": str(user.id),
            "username": user.username,
            "email": user.email
        }
        for user in users if str(user.id) != str(current_user.id)
    ]


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
        # Auto-create wallet for user if they don't have one
        wallet_data = wallet_service.create_wallet()
        
        # Update user with wallet info
        await db.users.update_one(
            {"username": current_user.username},
            {
                "$set": {
                    "wallet_public_key": wallet_data["public_key"],
                    "encrypted_private_key": wallet_data["encrypted_private_key"],
                    "sol_balance": 0.0  # Start with 0 SOL balance
                }
            }
        )
        
        # Update current_user object
        current_user.wallet_public_key = wallet_data["public_key"]
        current_user.sol_balance = 1.0
    
    # Get user's database balance (includes simulated airdrops)
    user_data = await db.users.find_one({"username": current_user.username})
    database_balance = user_data.get("sol_balance", 0.0) if user_data else 0.0
    
    # Try to get on-chain balance, but don't fail if network is down
    on_chain_balance = 0.0
    try:
        on_chain_balance = await wallet_service.get_balance(current_user.wallet_public_key)
    except Exception as e:
        print(f"Could not fetch on-chain balance for {current_user.username}: {e}")
    
    # Use the higher of database balance or on-chain balance
    # This ensures simulated balances work when testnet is down
    total_balance = max(database_balance, on_chain_balance)
    
    return WalletInfo(
        public_key=current_user.wallet_public_key,
        balance=total_balance
    )

@app.post("/wallet/airdrop")
async def request_airdrop(amount: float = 1.0, current_user: User = Depends(get_current_user)):
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

@app.post("/wallet/claim-airdrop")
async def claim_initial_airdrop(current_user: User = Depends(get_current_user)):
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=404, detail="User does not have a wallet")
    
    # Check if user has already claimed their initial airdrop
    user_doc = await db.users.find_one({"username": current_user.username})
    if user_doc and user_doc.get("has_claimed_airdrop", False):
        raise HTTPException(status_code=400, detail="Initial airdrop already claimed")
    
    # Try actual SOL airdrop first, but fall back to database balance
    try:
        result = await wallet_service.airdrop_sol(current_user.wallet_public_key, 1.0)
        
        if result["status"] == "error":
            print(f"Real airdrop failed for {current_user.username}: {result['error']}")
            # Fall back to database balance system
            result = await simulate_airdrop(current_user.username, 1.0)
        
    except Exception as e:
        print(f"Airdrop exception for {current_user.username}: {str(e)}")
        # Fall back to database balance system
        result = await simulate_airdrop(current_user.username, 1.0)
    
    # Mark user as having claimed their initial airdrop
    await db.users.update_one(
        {"username": current_user.username},
        {"$set": {"has_claimed_airdrop": True}}
    )
    
    return result

async def simulate_airdrop(username: str, amount: float) -> dict:
    """Simulate an airdrop by adding to user's database balance when real airdrops fail"""
    try:
        # Add to user's SOL balance in database
        await db.users.update_one(
            {"username": username},
            {"$inc": {"sol_balance": amount}}
        )
        
        # Generate a simulated transaction signature
        import time
        import hashlib
        signature_data = f"{username}_{amount}_{time.time()}"
        signature = hashlib.sha256(signature_data.encode()).hexdigest()
        
        print(f"Simulated airdrop: {amount} SOL added to {username}'s balance")
        
        return {
            "transaction_signature": f"sim_{signature}",
            "status": "success",
            "amount": amount,
            "note": "Simulated airdrop - balance added to account"
        }
    except Exception as e:
        return {
            "transaction_signature": None,
            "status": "error", 
            "error": f"Failed to simulate airdrop: {str(e)}"
        }

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
            {"$inc": {"sol_balance": 1.0}}
        )
        
        import time
        return {
            "transaction_signature": "manual_airdrop_" + str(int(time.time())),
            "status": "success",
            "amount": 1.0,
            "note": "Manual airdrop for testing - added to database balance"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual airdrop failed: {str(e)}")

@app.post("/wallet/add-test-funds")
async def add_test_funds(amount: float = 5.0, current_user: User = Depends(get_current_user)):
    """Add test funds to user's account - useful for development/testing"""
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=404, detail="User does not have a wallet")
    
    # Limit the amount to prevent abuse
    if amount > 10.0:
        amount = 10.0
    elif amount < 0.1:
        amount = 0.1
    
    try:
        await db.users.update_one(
            {"username": current_user.username},
            {"$inc": {"sol_balance": amount}}
        )
        
        import time
        import hashlib
        signature_data = f"test_funds_{current_user.username}_{amount}_{time.time()}"
        signature = hashlib.sha256(signature_data.encode()).hexdigest()[:16]
        
        print(f"Added {amount} SOL test funds to {current_user.username}")
        
        return {
            "transaction_signature": f"test_{signature}",
            "status": "success",
            "amount": amount,
            "note": f"Test funds added to account for development purposes"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add test funds: {str(e)}")

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
from health_ai import HealthAIAnalyzer
from agentmail_client import AgentMailClient
from challenge_agent import ChallengeAgent

# Initialize AgentMail client
agentmail_client = AgentMailClient()
health_verifier = HealthDataVerifier(oracle_keypair)
health_ai = HealthAIAnalyzer()
challenge_agent = ChallengeAgent(client)

# Helper function to send challenge invitations
async def send_challenge_invitations(challenge_record: dict, friend_emails_or_usernames: List[str], sender_name: str):
    """Send email invitations to friends for a challenge.
    Accepts a list of emails or usernames; usernames will be resolved to user emails.
    Skips invalid entries and logs results.
    """
    try:
        # Prepare challenge data for email template
        email_challenge_data = {
            "id": challenge_record["id"],
            "type": challenge_record.get("type", "Steps Challenge"),
            "target": str(challenge_record.get("target", 10000)),
            "duration": str(challenge_record["duration"]),
            "stakeAmount": str(challenge_record["stake"]),
            "message": challenge_record.get("message", "")
        }

        async def resolve_email(identifier: str) -> Optional[str]:
            # If looks like an email, return as-is
            if identifier and "@" in identifier:
                return identifier
            # Otherwise treat as username and try to resolve
            try:
                user = await db.users.find_one({"username": identifier})
                if user and user.get("email"):
                    return user["email"]
            except Exception as e:
                print(f"Email resolve error for '{identifier}': {e}")
            return None

        # Resolve all identifiers to emails
        resolved_emails: List[str] = []
        for ident in friend_emails_or_usernames or []:
            email = await resolve_email(ident)
            if email:
                resolved_emails.append(email)
            else:
                print(f"Skipping invite, invalid identifier: '{ident}'")

        if not resolved_emails:
            print("No valid emails resolved for invitations; skipping send.")
            return

        # Send invitation to each friend
        for email in resolved_emails:
            try:
                friend_name = email.split('@')[0].title()
                result = await agentmail_client.send_challenge_invitation(
                    recipient_email=email,
                    recipient_name=friend_name,
                    challenge_data=email_challenge_data,
                    sender_name=sender_name
                )
                print(f"Sent invitation to {email}: {result}")
            except Exception as e:
                print(f"Failed to send invitation to {email}: {str(e)}")
                # Continue sending to other friends even if one fails

    except Exception as e:
        print(f"Error in send_challenge_invitations: {str(e)}")
        # Don't raise exception to avoid breaking challenge creation


# Step Betting Smart Contract Endpoints
class ChallengeCreate(BaseModel):
    target_steps: int
    stake_amount: float  # SOL amount
    duration_hours: int = 24

class ChallengeJoin(BaseModel):
    challenge_address: str

class StepsSubmission(BaseModel):
    challenge_address: str
    steps: int
    date: str  # YYYY-MM-DD format
    source: str = "healthkit"

# New flexible betting system
class BetCreate(BaseModel):
    bet_type: str  # steps, heart_rate, sleep, etc.
    target: float
    unit: str
    stake_amount: float  # SOL amount
    duration_hours: int = 168  # Default 1 week
    multiplier: float
    difficulty: str
    description: str

class HealthDataSubmission(BaseModel):
    bet_id: str
    health_data: dict  # Flexible health data structure
    date: str  # YYYY-MM-DD format
    source: str = "healthkit"  # Source of health data
    device_info: dict = {}  # Device information for integrity checks


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
        bet_id="",
        health_data=submission.health_data,
        date=submission.date,
        source=submission.source,
        device_info=submission.device_info,
        timestamp=datetime.utcnow()
    )
    
    # Submit for off-chain verification
    verification_result = await health_verifier.submit_health_data(health_submission)
    
    # Record submission in database
    submission_record = {
        "challenge_address": submission.challenge_address,
        "username": current_user.username,
        "steps_count": submission.steps,
        "health_data": submission.health_data,
        "device_info": submission.device_info,
        "verification_id": verification_result["verification_id"],
        "verification_status": "pending",
        "submitted_at": datetime.utcnow().isoformat()
    }
    
    await db.step_submissions.insert_one(submission_record)
    
    return {
        "success": True,
        "message": "Health data submitted for verification",
        "verification_status": "pending"
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

# New flexible betting endpoints
@app.post("/bets/place")
async def place_bet(
    bet_data: BetCreate,
    current_user: User = Depends(get_current_user)
):
    """Place a new health-based bet"""
    # Check if user has sufficient balance
    if current_user.sol_balance < bet_data.stake_amount:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient balance. You have {current_user.sol_balance} SOL but need {bet_data.stake_amount} SOL"
        )
    
    if current_user.sol_balance <= 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot place bet with zero balance. Please add funds to your account."
        )
    
    if not current_user.wallet_public_key:
        raise HTTPException(status_code=400, detail="User must have a wallet to place bets")
    
    # Get user's wallet keypair
    user_keypair = wallet_service.get_user_keypair(current_user.username)
    if not user_keypair:
        raise HTTPException(status_code=400, detail="Could not access user wallet")
    
    # Convert SOL to lamports
    stake_lamports = int(bet_data.stake_amount * 1_000_000_000)
    
    # Generate unique bet ID
    bet_id = str(uuid.uuid4())
    
    # Calculate expiration time
    expires_at = datetime.utcnow() + timedelta(hours=bet_data.duration_hours)
    
    # Store bet in database
    bet_record = {
        "bet_id": bet_id,
        "user_username": current_user.username,
        "bet_type": bet_data.bet_type,
        "target": bet_data.target,
        "unit": bet_data.unit,
        "stake_amount": bet_data.stake_amount,
        "potential_win": bet_data.stake_amount * bet_data.multiplier,
        "multiplier": bet_data.multiplier,
        "difficulty": bet_data.difficulty,
        "description": bet_data.description,
        "duration_hours": bet_data.duration_hours,
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": expires_at.isoformat(),
        "status": "active",
        "current_progress": 0,
        "health_submissions": []
    }
    
    # Deduct stake from user's balance
    await db.users.update_one(
        {"username": current_user.username},
        {"$inc": {"sol_balance": -bet_data.stake_amount}}
    )
    
    await db.bets.insert_one(bet_record)
    
    return {
        "success": True,
        "betId": bet_id,
        "message": "Bet placed successfully",
        "expiresAt": expires_at.isoformat()
    }

@app.get("/bets/user")
async def get_user_bets(current_user: User = Depends(get_current_user)):
    """Get all bets for the current user"""
    bets = await db.bets.find({
        "user_username": current_user.username
    }).sort("created_at", -1).to_list(100)
    
    # Convert ObjectId to string and format response
    user_bets = []
    for bet in bets:
        bet["_id"] = str(bet["_id"])
        user_bet = {
            "betId": bet["bet_id"],
            "betType": bet["bet_type"],
            "target": bet["target"],
            "unit": bet["unit"],
            "stakeAmount": bet["stake_amount"],
            "potentialWin": bet["potential_win"],
            "status": bet["status"],
            "createdAt": bet["created_at"],
            "expiresAt": bet["expires_at"],
            "currentProgress": bet.get("current_progress", 0),
            "description": bet["description"]
        }
        user_bets.append(user_bet)
    
    return user_bets

@app.post("/bets/{bet_id}/submit-health")
async def submit_health_data_for_bet(
    bet_id: str,
    health_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Submit health data for bet verification"""
    # Find the bet
    bet = await db.bets.find_one({
        "bet_id": bet_id,
        "user_username": current_user.username,
        "status": "active"
    })
    
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found or not active")
    
    # Extract relevant health metric based on bet type
    progress_value = 0
    bet_type = bet["bet_type"]
    
    if bet_type == "steps":
        progress_value = health_data.get("steps", 0)
    elif bet_type == "heart_rate":
        progress_value = health_data.get("heartRate", 0)
    elif bet_type == "sleep":
        progress_value = health_data.get("sleepHours", 0)
    elif bet_type == "active_energy":
        progress_value = health_data.get("activeEnergy", 0)
    elif bet_type == "distance":
        progress_value = health_data.get("distance", 0)
    elif bet_type == "workouts":
        progress_value = health_data.get("workouts", 0)
    elif bet_type == "flights":
        progress_value = health_data.get("flights", 0)
    elif bet_type == "stand_hours":
        progress_value = health_data.get("standHours", 0)
    elif bet_type == "hrv":
        progress_value = health_data.get("hrv", 0)
    elif bet_type == "vo2_max":
        progress_value = health_data.get("vo2Max", 0)
    
    # Check if bet is completed
    target_achieved = progress_value >= bet["target"]
    new_status = "completed" if target_achieved else "active"
    
    # Check if bet has expired
    expires_at = datetime.fromisoformat(bet["expires_at"])
    if datetime.utcnow() > expires_at and not target_achieved:
        new_status = "failed"
    
    # Update bet with new progress
    health_submission = {
        "submitted_at": datetime.utcnow().isoformat(),
        "health_data": health_data,
        "progress_value": progress_value
    }
    
    await db.bets.update_one(
        {"bet_id": bet_id},
        {
            "$set": {
                "current_progress": progress_value,
                "status": new_status,
                "last_updated": datetime.utcnow().isoformat()
            },
            "$push": {
                "health_submissions": health_submission
            }
        }
    )
    
    return {
        "success": True,
        "progress": progress_value,
        "target": bet["target"],
        "status": new_status,
        "targetAchieved": target_achieved
    }

@app.get("/bets/{bet_id}/status")
async def get_bet_status(
    bet_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get status of a specific bet"""
    bet = await db.bets.find_one({
        "bet_id": bet_id,
        "user_username": current_user.username
    })
    
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    
    return {
        "betId": bet["bet_id"],
        "betType": bet["bet_type"],
        "target": bet["target"],
        "unit": bet["unit"],
        "stakeAmount": bet["stake_amount"],
        "potentialWin": bet["potential_win"],
        "status": bet["status"],
        "createdAt": bet["created_at"],
        "expiresAt": bet["expires_at"],
        "currentProgress": bet.get("current_progress", 0),
        "description": bet["description"]
    }

# Health Metrics Models
class HealthMetricsSubmission(BaseModel):
    steps: int
    activeMinutes: int
    sleepHours: float
    heartRate: int
    caloriesBurned: int
    date: str = Field(description="YYYY-MM-DD")
    source: str = "healthkit"

# Health Metrics Endpoints
@app.post("/health/metrics")
async def submit_health_metrics(
    metrics: HealthMetricsSubmission,
    current_user: User = Depends(get_current_user)
):
    """Submit daily health metrics"""
    try:
        # Store metrics in database
        metrics_record = {
            "user_username": current_user.username,
            "steps": metrics.steps,
            "activeMinutes": metrics.activeMinutes,
            "sleepHours": metrics.sleepHours,
            "heartRate": metrics.heartRate,
            "caloriesBurned": metrics.caloriesBurned,
            "date": metrics.date,
            "source": metrics.source,
            "submitted_at": datetime.utcnow().isoformat()
        }
        
        # Upsert to handle duplicate dates
        await db.health_metrics.update_one(
            {"user_username": current_user.username, "date": metrics.date},
            {"$set": metrics_record},
            upsert=True
        )
        
        return {"success": True, "message": "Health metrics submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit metrics: {str(e)}")

@app.get("/health/history")
async def get_health_history(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get health metrics history"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Query health metrics
        metrics = await db.health_metrics.find({
            "user_username": current_user.username,
            "date": {
                "$gte": start_date.strftime("%Y-%m-%d"),
                "$lte": end_date.strftime("%Y-%m-%d")
            }
        }).sort("date", -1).to_list(days)
        
        # Remove MongoDB _id field
        for metric in metrics:
            metric.pop("_id", None)
            
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.post("/health/ai-score")
async def get_ai_health_score(current_user: User = Depends(get_current_user)):
    """Get AI-powered health analysis and scoring"""
    try:
        # Get user's health history
        health_history = await db.health_metrics.find({
            "user_username": current_user.username
        }).sort("date", -1).limit(30).to_list(30)
        
        # Remove MongoDB _id fields
        for record in health_history:
            record.pop("_id", None)
        
        # Prepare user profile
        user_profile = {
            "username": current_user.username,
            "full_name": current_user.full_name,
            "age": None,  # Could be added to user model
            "fitness_level": "intermediate"  # Could be determined from data
        }
        
        # Get AI analysis
        analysis = await health_ai.analyze_health_data(health_history, user_profile)
        
        # Store the analysis
        analysis_record = {
            "user_username": current_user.username,
            "analysis": analysis,
            "generated_at": datetime.utcnow().isoformat(),
            "data_points": len(health_history)
        }
        
        await db.health_analyses.insert_one(analysis_record)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI score: {str(e)}")

@app.post("/health/day-complete")
async def mark_day_complete(current_user: User = Depends(get_current_user)):
    """Mark day as complete and get comprehensive AI summary"""
    try:
        # Get today's date
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Check if user has submitted metrics for today
        today_metrics = await db.health_metrics.find_one({
            "user_username": current_user.username,
            "date": today
        })
        
        if not today_metrics:
            raise HTTPException(status_code=400, detail="Please submit today's health metrics first")
        
        # Get comprehensive health history
        health_history = await db.health_metrics.find({
            "user_username": current_user.username
        }).sort("date", -1).limit(30).to_list(30)
        
        # Remove MongoDB _id fields
        for record in health_history:
            record.pop("_id", None)
        
        # Prepare user profile
        user_profile = {
            "username": current_user.username,
            "full_name": current_user.full_name,
            "day_complete": True
        }
        
        # Get AI analysis with day-end summary
        analysis = await health_ai.analyze_health_data(health_history, user_profile)
        
        # Mark day as complete
        await db.health_metrics.update_one(
            {"user_username": current_user.username, "date": today},
            {"$set": {"day_completed": True, "completed_at": datetime.utcnow().isoformat()}}
        )
        
        # Store the day-end analysis
        analysis_record = {
            "user_username": current_user.username,
            "analysis": analysis,
            "analysis_type": "day_complete",
            "date": today,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        await db.health_analyses.insert_one(analysis_record)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete day analysis: {str(e)}")

@app.get("/health/trends")
async def get_health_trends(current_user: User = Depends(get_current_user)):
    """Get health trends analysis"""
    try:
        # Get last 14 days of data for trend analysis
        health_history = await db.health_metrics.find({
            "user_username": current_user.username
        }).sort("date", -1).limit(14).to_list(14)
        
        if len(health_history) < 7:
            return []
        
        trends = []
        metrics = ['steps', 'activeMinutes', 'sleepHours', 'heartRate', 'caloriesBurned']
        
        for metric in metrics:
            # Get values for the metric
            values = [record.get(metric, 0) for record in reversed(health_history) if record.get(metric) is not None]
            
            if len(values) >= 7:
                # Compare first and second week
                first_week = values[:7]
                second_week = values[7:14] if len(values) >= 14 else values[7:]
                
                first_avg = sum(first_week) / len(first_week)
                second_avg = sum(second_week) / len(second_week) if second_week else first_avg
                
                change_percent = ((second_avg - first_avg) / first_avg * 100) if first_avg > 0 else 0
                
                trend = "stable"
                if abs(change_percent) > 5:
                    trend = "improving" if change_percent > 0 else "declining"
                
                trends.append({
                    "metric": metric,
                    "trend": trend,
                    "changePercent": round(change_percent, 1),
                    "weeklyAverage": round(second_avg, 1)
                })
        
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate trends: {str(e)}")

# Challenge and Friends Models
class FriendAdd(BaseModel):
    email: str
    name: Optional[str] = None

class ChallengeCreateRequest(BaseModel):
    metrics: List[str]
    duration: int  # hours
    stake: float  # SOL
    friends: List[str]  # email addresses
    message: Optional[str] = None

class ChallengeInviteRequest(BaseModel):
    friends: List[dict]
    message: Optional[str] = None

# Friends Endpoints
@app.get("/friends/list")
async def get_friends_list(current_user: User = Depends(get_current_user)):
    """Get user's friends list"""
    try:
        friends = await db.friends.find({
            "user_username": current_user.username
        }).to_list(100)
        
        # Remove MongoDB _id fields
        for friend in friends:
            friend.pop("_id", None)
        return friends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch friends: {str(e)}")

@app.post("/friends/add")
async def add_friend(
    friend_data: FriendAdd,
    current_user: User = Depends(get_current_user)
):
    """Add a new friend"""
    try:
        # Check if friend already exists
        existing = await db.friends.find_one({
            "user_username": current_user.username,
            "email": friend_data.email
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Friend already exists")
        
        # Create friend record
        friend_record = {
            "id": str(uuid.uuid4()),
            "user_username": current_user.username,
            "email": friend_data.email,
            "name": friend_data.name or friend_data.email.split('@')[0],
            "added_at": datetime.utcnow().isoformat()
        }
        
        await db.friends.insert_one(friend_record)
        
        # Remove MongoDB _id field
        friend_record.pop("_id", None)
        
        return friend_record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add friend: {str(e)}")

# Challenge Endpoints
@app.post("/challenges/create")
async def create_challenge(
    challenge_data: ChallengeCreateRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new challenge in pending state and send invitations.
    No SOL is deducted until at least two users accept (two-way acceptance).
    """

    # Creator must have enough balance available for the stake (but we don't deduct yet)
    if current_user.sol_balance < challenge_data.stake:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. You have {current_user.sol_balance} SOL but need {challenge_data.stake} SOL"
        )

    try:
        challenge_id = str(uuid.uuid4())

        # Create challenge record in pending state
        challenge_record = {
            "id": challenge_id,
            "creator_username": current_user.username,
            "metrics": challenge_data.metrics,
            "duration": challenge_data.duration,
            "stake": challenge_data.stake,
            "invited": list(set(challenge_data.friends or [])),  # emails or usernames
            "message": challenge_data.message,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "participants": [current_user.username],  # creator is a participant
            "accepted": {current_user.username: True},  # creator auto-accepts
            "activated_at": None,
        }

        await db.challenges.insert_one(challenge_record)

        # Send email invitations to friends
        sender_display_name = current_user.full_name or current_user.username
        await send_challenge_invitations(
            challenge_record=challenge_record,
            friend_emails_or_usernames=challenge_data.friends,
            sender_name=sender_display_name,
        )

        challenge_record.pop("_id", None)
        return challenge_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create challenge: {str(e)}")

@app.post("/challenges/{challenge_id}/accept")
async def accept_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user)
):
    """User accepts a pending challenge. When >=2 users have accepted, activate the challenge
    and deduct the stake from all accepted participants.
    """
    try:
        challenge = await db.challenges.find_one({"id": challenge_id})
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")

        if challenge.get("status") not in ["pending"]:
            raise HTTPException(status_code=400, detail="Challenge is not pending")

        # Mark acceptance
        accepted = challenge.get("accepted", {})
        accepted[current_user.username] = True
        participants = set(challenge.get("participants", []))
        participants.add(current_user.username)

        # Update DB with acceptance
        await db.challenges.update_one(
            {"id": challenge_id},
            {"$set": {"accepted": accepted, "participants": list(participants)}}
        )

        # Activate if at least two users have accepted
        accepted_users = [u for u, ok in accepted.items() if ok]
        if len(accepted_users) >= 2:
            # Deduct stake from each accepted user now
            for username in accepted_users:
                user_doc = await db.users.find_one({"username": username})
                if not user_doc:
                    continue
                if user_doc.get("sol_balance", 0.0) < challenge["stake"]:
                    raise HTTPException(status_code=400, detail=f"User {username} has insufficient balance to activate")
            for username in accepted_users:
                await db.users.update_one(
                    {"username": username},
                    {"$inc": {"sol_balance": -challenge["stake"]}}
                )

            await db.challenges.update_one(
                {"id": challenge_id},
                {"$set": {"status": "active", "activated_at": datetime.utcnow().isoformat()}}
            )

        return {"success": True, "status": "active" if len(accepted_users) >= 2 else "pending"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to accept challenge: {str(e)}")

@app.post("/challenges/{challenge_id}/start")
async def start_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user)
):
    """Start a challenge and notify all participants"""
    try:
        result = await challenge_agent.handle_challenge_start(challenge_id, current_user.username)
        
        if result["success"]:
            return {
                "message": "Challenge started successfully",
                "challenge_id": challenge_id,
                "notifications_sent": result["notifications_sent"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start challenge: {str(e)}")

@app.post("/challenges/{challenge_id}/end-early")
async def end_challenge_early(
    challenge_id: str,
    reason: str = "User requested early termination",
    current_user: User = Depends(get_current_user)
):
    """End a challenge early and refund stakes"""
    try:
        result = await challenge_agent.handle_challenge_end_early(
            challenge_id, current_user.username, reason
        )
        
        if result["success"]:
            return {
                "message": "Challenge ended successfully",
                "challenge_id": challenge_id,
                "refunded_amount": result["refunded_amount"],
                "notifications_sent": result["notifications_sent"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end challenge: {str(e)}")

@app.post("/challenges/{challenge_id}/check-progress")
async def check_challenge_progress(
    challenge_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check challenge progress and send notifications if needed"""
    try:
        result = await challenge_agent.check_progress_and_notify(challenge_id)
        
        if result["success"]:
            return {
                "message": "Progress checked successfully",
                "challenge_id": challenge_id,
                "notifications_sent": result["notifications_sent"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check progress: {str(e)}")

@app.post("/challenges/{challenge_id}/invite")
async def send_challenge_invites(
    challenge_id: str,
    invite_data: ChallengeInviteRequest,
    current_user: User = Depends(get_current_user)
):
    """Send challenge invitations via email"""
    try:
        # Get challenge details
        challenge = await db.challenges.find_one({"id": challenge_id})
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if challenge["createdBy"] != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized to send invites for this challenge")
        
        # Prepare challenge data for email
        email_challenge_data = {
            "id": challenge_id,
            "type": challenge["type"],
            "target": challenge["target"],
            "duration": challenge["duration"],
            "stakeAmount": challenge["stakeAmount"],
            "message": invite_data.message,
            "unit": "steps" if challenge["type"] == "steps" else 
                   "minutes" if challenge["type"] == "active_minutes" else 
                   "calories" if challenge["type"] == "calories" else "points"
        }
        
        # Send emails to each friend
        sent_count = 0
        failed_emails = []
        
        for friend in invite_data.friends:
            try:
                result = await agentmail_client.send_challenge_invitation(
                    recipient_email=friend["email"],
                    recipient_name=friend.get("name", friend["email"].split('@')[0]),
                    challenge_data=email_challenge_data,
                    sender_name=current_user.full_name or current_user.username
                )
                
                if result["success"]:
                    sent_count += 1
                    
                    # Store invitation record
                    invitation_record = {
                        "challenge_id": challenge_id,
                        "invited_by": current_user.username,
                        "invited_email": friend["email"],
                        "invited_name": friend.get("name"),
                        "sent_at": datetime.utcnow().isoformat(),
                        "status": "sent",
                        "message_id": result.get("message_id")
                    }
                    await db.challenge_invitations.insert_one(invitation_record)
                else:
                    failed_emails.append(friend["email"])
                    
            except Exception as email_error:
                print(f"Failed to send email to {friend['email']}: {str(email_error)}")
                failed_emails.append(friend["email"])
        
        return {
            "success": True,
            "sentCount": sent_count,
            "totalInvited": len(invite_data.friends),
            "failedEmails": failed_emails
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invites: {str(e)}")

@app.get("/challenges/open")
async def get_open_challenges(current_user: User = Depends(get_current_user)):
    """Get all open (pending) challenges that other users can accept"""
    try:
        # Get pending challenges that user is not already participating in
        challenges = await db.challenges.find({
            "status": "pending",
            "participants": {"$ne": current_user.username}  # User is not already participating
        }).sort("created_at", -1).to_list(50)
        
        # Remove MongoDB _id fields and format for frontend
        for challenge in challenges:
            challenge.pop("_id", None)
            
            # Ensure required fields exist for frontend compatibility  
            if "metrics" not in challenge:
                challenge["metrics"] = [challenge.get("type", "steps")]
            if "stake" not in challenge:
                challenge["stake"] = challenge.get("stakeAmount", 0)
            if "startsAt" not in challenge:
                challenge["startsAt"] = challenge.get("created_at")
            if "endsAt" not in challenge:
                # Calculate end time based on duration
                from datetime import datetime, timedelta
                start_time = datetime.fromisoformat(challenge.get("created_at", datetime.utcnow().isoformat()))
                end_time = start_time + timedelta(hours=challenge.get("duration", 24))
                challenge["endsAt"] = end_time.isoformat()
            
            # Add participant count
            challenge["participantCount"] = len(challenge.get("participants", []))
            
        return challenges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch open challenges: {str(e)}")

@app.get("/challenges/user")
async def get_user_challenges(current_user: User = Depends(get_current_user)):
    """Get challenges for the current user"""
    try:
        # Get challenges where user is creator or participant
        challenges = await db.challenges.find({
            "$or": [
                {"creator_username": current_user.username},
                {"participants": current_user.username}
            ]
        }).sort("created_at", -1).to_list(50)
        
        # Remove MongoDB _id fields and format daily completions
        for challenge in challenges:
            challenge.pop("_id", None)
            
            # Transform daily_completions structure for frontend
            if "daily_completions" in challenge:
                user_completions = challenge["daily_completions"].get(current_user.username, {})
                challenge["dailyCompletions"] = user_completions
                challenge.pop("daily_completions", None)
            else:
                challenge["dailyCompletions"] = {}
            
            # Ensure required fields exist for frontend compatibility
            if "metrics" not in challenge:
                challenge["metrics"] = [challenge.get("type", "steps")]
            if "stake" not in challenge:
                challenge["stake"] = challenge.get("stakeAmount", 0)
            
        return challenges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch challenges: {str(e)}")

@app.post("/challenges/{challenge_id}/join")
async def join_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user)
):
    """Join an existing challenge"""
    try:
        # Get challenge
        challenge = await db.challenges.find_one({"id": challenge_id})
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if challenge["status"] != "pending":
            raise HTTPException(status_code=400, detail="Challenge is no longer accepting participants")
        
        if current_user.username in challenge["participants"]:
            raise HTTPException(status_code=400, detail="Already participating in this challenge")
        
        # Add user to participants
        await db.challenges.update_one(
            {"id": challenge_id},
            {
                "$push": {"participants": current_user.username},
                "$set": {f"progress.{current_user.username}": 0}
            }
        )
        
        return {"success": True, "message": "Successfully joined challenge"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join challenge: {str(e)}")

@app.post("/challenges/{challenge_id}/complete-daily")
async def mark_daily_completion(
    challenge_id: str,
    completion_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Mark daily completion for a challenge"""
    try:
        # Get challenge
        challenge = await db.challenges.find_one({"id": challenge_id})
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if challenge["status"] != "active":
            raise HTTPException(status_code=400, detail="Challenge is not active")
        
        if current_user.username not in challenge["participants"]:
            raise HTTPException(status_code=400, detail="Not participating in this challenge")
        
        # Get today's date
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Update daily completion
        daily_completions_key = f"daily_completions.{current_user.username}.{today}"
        
        await db.challenges.update_one(
            {"id": challenge_id},
            {
                "$set": {daily_completions_key: True}
            }
        )
        
        return {"success": True, "message": "Daily completion marked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark daily completion: {str(e)}")
