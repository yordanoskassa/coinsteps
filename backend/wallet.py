import os
import json
import base64
from typing import Optional, Dict, Any
from cryptography.fernet import Fernet
from solders.keypair import Keypair
from solana.rpc.api import Client
from solana.rpc.types import TxOpts
from solders.transaction import Transaction
from solders.system_program import TransferParams, transfer
from solders.pubkey import Pubkey as PublicKey
from pydantic import BaseModel
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Pydantic models
class WalletCreate(BaseModel):
    user_id: str

class WalletInfo(BaseModel):
    public_key: str
    balance: float

class TransferRequest(BaseModel):
    recipient_username: str
    amount: float
    memo: Optional[str] = None

class TransferResponse(BaseModel):
    transaction_signature: str
    status: str
    amount: float
    recipient: str

class SolanaWalletService:
    def __init__(self, rpc_url: str = None, encryption_key: str = None):
        # Use testnet for development, mainnet for production
        self.rpc_url = rpc_url or os.getenv("SOLANA_RPC_URL", "https://api.testnet.solana.com")
        self.client = Client(self.rpc_url)
        
        # Optional: treasury keypair used to fund airdrops when public faucet is down/rate-limited
        self.treasury_keypair: Optional[Keypair] = self._load_treasury_keypair()
        if self.treasury_keypair:
            try:
                print(f"Airdrop treasury configured. Address: {str(self.treasury_keypair.pubkey())}")
            except Exception:
                pass
        
        # Encryption key for storing private keys securely
        if encryption_key:
            self.cipher = Fernet(encryption_key.encode())
        else:
            # Generate a new key if none provided (store this securely!)
            key = Fernet.generate_key()
            self.cipher = Fernet(key)
            print(f"Generated encryption key: {key.decode()}")
            print("IMPORTANT: Store this key securely in your environment variables!")
    
    def create_wallet(self) -> Dict[str, str]:
        """Create a new Solana wallet keypair"""
        keypair = Keypair()
        
        # Encrypt the private key for secure storage
        private_key_bytes = bytes(keypair)
        encrypted_private_key = self.cipher.encrypt(private_key_bytes)
        
        return {
            "public_key": str(keypair.pubkey()),
            "encrypted_private_key": base64.b64encode(encrypted_private_key).decode(),
        }
    
    def decrypt_private_key(self, encrypted_private_key: str) -> Keypair:
        """Decrypt and reconstruct keypair from encrypted private key"""
        encrypted_bytes = base64.b64decode(encrypted_private_key.encode())
        decrypted_bytes = self.cipher.decrypt(encrypted_bytes)
        return Keypair.from_bytes(decrypted_bytes)
    
    def _load_treasury_keypair(self) -> Optional[Keypair]:
        """Load a funding (treasury) keypair from environment variables.
        Supported formats:
          - AIRDROP_TREASURY_SECRET_B64: base64-encoded 64-byte secret key
          - AIRDROP_TREASURY_SECRET_JSON: JSON array string of 64 integers (Solana CLI format)
        """
        try:
            b64_secret = os.getenv("AIRDROP_TREASURY_SECRET_B64")
            json_secret = os.getenv("AIRDROP_TREASURY_SECRET_JSON")
            raw: Optional[bytes] = None
            if b64_secret:
                raw = base64.b64decode(b64_secret)
            elif json_secret:
                arr = json.loads(json_secret)
                if isinstance(arr, list):
                    raw = bytes(arr)
            if raw and len(raw) == 64:
                return Keypair.from_bytes(raw)
            if raw is not None:
                print("AIRDROP_TREASURY secret length invalid. Expected 64 bytes.")
            return None
        except Exception as e:
            print(f"Failed to load treasury keypair: {e}")
            return None
    
    def generate_keypair(self) -> Keypair:
        """Generate a new keypair"""
        return Keypair()
    
    def get_user_keypair(self, username: str) -> Optional[Keypair]:
        """Get user's keypair from database (placeholder - needs database integration)"""
        # This would need to fetch from database and decrypt
        # For now, return None to indicate not implemented
        return None
    
    async def get_balance(self, public_key: str) -> float:
        """Get SOL balance for a public key"""
        try:
            from solders.pubkey import Pubkey
            pubkey = Pubkey.from_string(public_key)
            response = self.client.get_balance(pubkey)
            # Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
            balance_sol = response.value / 1_000_000_000
            return balance_sol
        except Exception as e:
            print(f"Error getting balance: {e}")
            return 0.0
    
    async def transfer_sol(self, sender_encrypted_key: str, recipient_public_key: str, amount: float) -> Dict[str, Any]:
        """Transfer SOL from sender to recipient"""
        try:
            # Decrypt sender's keypair
            sender_keypair = self.decrypt_private_key(sender_encrypted_key)
            from solders.pubkey import Pubkey
            recipient_pubkey = Pubkey.from_string(recipient_public_key)
            
            # Convert SOL to lamports
            lamports = int(amount * 1_000_000_000)
            
            # Create transfer transaction
            transfer_instruction = transfer(
                TransferParams(
                    from_pubkey=sender_keypair.pubkey(),
                    to_pubkey=recipient_pubkey,
                    lamports=lamports
                )
            )
            
            # Get recent blockhash
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            
            # Create and sign transaction
            transaction = Transaction()
            transaction.add(transfer_instruction)
            transaction.recent_blockhash = recent_blockhash
            transaction.fee_payer = sender_keypair.pubkey()
            transaction.sign(sender_keypair)
            
            # Send transaction
            response = self.client.send_transaction(
                transaction,
                opts=TxOpts(skip_preflight=False, preflight_commitment="confirmed")
            )
            
            return {
                "transaction_signature": str(response.value),
                "status": "success",
                "amount": amount,
                "lamports": lamports
            }
            
        except Exception as e:
            return {
                "transaction_signature": None,
                "status": "error",
                "error": str(e),
                "amount": amount
            }
    
    def fund_from_treasury(self, recipient_public_key: str, amount: float) -> Dict[str, Any]:
        """Send SOL from a configured treasury keypair to the recipient.
        Requires AIRDROP_TREASURY_SECRET_B64 or AIRDROP_TREASURY_SECRET_JSON to be set.
        """
        if not self.treasury_keypair:
            raise Exception("Treasury not configured")
        try:
            from solders.pubkey import Pubkey
            from solders.message import Message
            from solders.transaction import VersionedTransaction
            recipient_pubkey = Pubkey.from_string(recipient_public_key)
            lamports = int(amount * 1_000_000_000)
            
            # Create transfer instruction
            ix = transfer(TransferParams(
                from_pubkey=self.treasury_keypair.pubkey(),
                to_pubkey=recipient_pubkey,
                lamports=lamports
            ))
            
            # Get recent blockhash
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            
            # Create message and transaction using VersionedTransaction
            message = Message.new_with_blockhash([ix], self.treasury_keypair.pubkey(), recent_blockhash)
            tx = VersionedTransaction(message, [self.treasury_keypair])
            
            # Send transaction
            resp = self.client.send_transaction(
                tx,
                opts=TxOpts(skip_preflight=False, preflight_commitment="confirmed")
            )
            return {
                "transaction_signature": str(resp.value),
                "status": "success",
                "amount": amount,
                "lamports": lamports,
                "source": "treasury"
            }
        except Exception as e:
            raise Exception(f"Treasury transfer failed: {e}")
    
    async def airdrop_sol(self, public_key: str, amount: float = 1.0) -> Dict[str, Any]:
        """Request SOL airdrop.
        If a treasury is configured (AIRDROP_TREASURY_*), attempt to fund from treasury first.
        Otherwise, fall back to the public faucet via RPC request_airdrop.
        """
        try:
            # Prefer treasury funding if configured or if AIRDROP_MODE=treasury/auto
            preferred_mode = os.getenv("AIRDROP_MODE", "auto").lower()
            if self.treasury_keypair and preferred_mode in ("treasury", "auto"):
                print("Attempting treasury airdrop (transfer) ...")
                try:
                    return self.fund_from_treasury(public_key, amount)
                except Exception as te:
                    print(f"Treasury airdrop failed: {te}. Falling back to RPC faucet...")

            from solders.pubkey import Pubkey
            pubkey = Pubkey.from_string(public_key)
            lamports = int(amount * 1_000_000_000)
            
            print(f"Requesting airdrop: {amount} SOL ({lamports} lamports) to {public_key}")
            response = self.client.request_airdrop(pubkey, lamports)
            print(f"Airdrop response: {response}")
            
            # Handle different response types
            if hasattr(response, 'value'):
                if response.value is None:
                    raise Exception("Airdrop request returned None - faucet may be down")
                signature = response.value
            elif hasattr(response, 'message'):
                # Handle error messages
                raise Exception(f"Airdrop failed: {response.message}")
            else:
                # Handle unexpected response types
                raise Exception(f"Unexpected airdrop response: {type(response).__name__}")
            
            return {
                "transaction_signature": str(signature),
                "status": "success",
                "amount": amount
            }
        except Exception as e:
            error_msg = str(e)
            print(f"Airdrop exception: {error_msg}")
            
            # Handle common Solana airdrop errors
            if "Internal error" in error_msg:
                error_msg = "Testnet faucet is experiencing internal errors - try again later"
            elif "None" in error_msg or not error_msg:
                error_msg = "Testnet faucet is currently unavailable"
            elif "timeout" in error_msg.lower():
                error_msg = "Request timeout - testnet may be slow"
            elif "rate" in error_msg.lower():
                error_msg = "Rate limit exceeded"
            
            return {
                "transaction_signature": None,
                "status": "error",
                "error": error_msg
            }

# Global wallet service instance
wallet_service = SolanaWalletService(
    encryption_key=os.getenv("WALLET_ENCRYPTION_KEY")
)
