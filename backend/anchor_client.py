import json
import asyncio
from typing import List, Optional, Dict, Any
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey as PublicKey
from solders.transaction import Transaction
from anchorpy import Program, Provider, Wallet
import os
from datetime import datetime, timedelta

class StepBettingClient:
    def __init__(self, rpc_url: str = None):
        self.rpc_url = rpc_url or os.getenv("SOLANA_RPC_URL", "https://api.testnet.solana.com")
        self.client = AsyncClient(self.rpc_url)
        # Convert base58 string to PublicKey
        from solders.pubkey import Pubkey
        self.program_id = Pubkey.from_string("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")
        
    async def get_program(self, wallet_keypair: Keypair) -> Program:
        """Initialize the Anchor program with a wallet"""
        wallet = Wallet(wallet_keypair)
        provider = Provider(self.client, wallet)
        
        # Load IDL (Interface Description Language)
        with open("step-betting/target/idl/step_betting.json", "r") as f:
            idl = json.load(f)
            
        return Program(idl, self.program_id, provider)
    
    async def create_challenge(
        self,
        creator_keypair: Keypair,
        target_steps: int,
        stake_amount: int,  # in lamports
        duration_hours: int = 24
    ) -> Dict[str, Any]:
        """Create a new step challenge"""
        try:
            program = await self.get_program(creator_keypair)
            
            # Generate challenge PDA
            challenge_seed = [b"challenge", bytes(creator_keypair.public_key)]
            challenge_pda, challenge_bump = PublicKey.find_program_address(
                challenge_seed, self.program_id
            )
            
            # Generate escrow PDA
            escrow_seed = [b"challenge_escrow", bytes(challenge_pda)]
            escrow_pda, escrow_bump = PublicKey.find_program_address(
                escrow_seed, self.program_id
            )
            
            # Create transaction
            tx = await program.rpc["create_challenge"](
                target_steps,
                stake_amount,
                duration_hours,
                ctx=program.Context(
                    accounts={
                        "challenge": challenge_pda,
                        "challenge_escrow": escrow_pda,
                        "creator": creator_keypair.public_key,
                        "creator_token_account": creator_keypair.public_key,  # Simplified
                        "sol_mint": PublicKey("So11111111111111111111111111111111111111112"),  # Native SOL
                        "token_program": PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                        "system_program": PublicKey("11111111111111111111111111111111"),
                        "rent": PublicKey("SysvarRent111111111111111111111111111111111"),
                    },
                    signers=[creator_keypair],
                )
            )
            
            return {
                "success": True,
                "transaction_signature": str(tx),
                "challenge_address": str(challenge_pda),
                "escrow_address": str(escrow_pda),
                "target_steps": target_steps,
                "stake_amount": stake_amount,
                "duration_hours": duration_hours
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def join_challenge(
        self,
        participant_keypair: Keypair,
        challenge_address: str
    ) -> Dict[str, Any]:
        """Join an existing challenge"""
        try:
            program = await self.get_program(participant_keypair)
            challenge_pda = PublicKey(challenge_address)
            
            # Get escrow PDA
            escrow_seed = [b"challenge_escrow", bytes(challenge_pda)]
            escrow_pda, _ = PublicKey.find_program_address(
                escrow_seed, self.program_id
            )
            
            tx = await program.rpc["join_challenge"](
                ctx=program.Context(
                    accounts={
                        "challenge": challenge_pda,
                        "challenge_escrow": escrow_pda,
                        "participant": participant_keypair.public_key,
                        "participant_token_account": participant_keypair.public_key,
                        "token_program": PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    },
                    signers=[participant_keypair],
                )
            )
            
            return {
                "success": True,
                "transaction_signature": str(tx),
                "challenge_address": challenge_address
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def submit_steps(
        self,
        participant_keypair: Keypair,
        challenge_address: str,
        steps_count: int,
        verification_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Submit step count for verification"""
        try:
            program = await self.get_program(participant_keypair)
            challenge_pda = PublicKey(challenge_address)
            
            # Create verification signature (simplified)
            verification_signature = json.dumps(verification_data).encode()
            
            tx = await program.rpc["submit_steps"](
                steps_count,
                verification_signature,
                ctx=program.Context(
                    accounts={
                        "challenge": challenge_pda,
                        "participant": participant_keypair.public_key,
                    },
                    signers=[participant_keypair],
                )
            )
            
            return {
                "success": True,
                "transaction_signature": str(tx),
                "steps_submitted": steps_count
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def claim_winnings(
        self,
        winner_keypair: Keypair,
        challenge_address: str
    ) -> Dict[str, Any]:
        """Claim winnings from a completed challenge"""
        try:
            program = await self.get_program(winner_keypair)
            challenge_pda = PublicKey(challenge_address)
            
            # Get escrow PDA
            escrow_seed = [b"challenge_escrow", bytes(challenge_pda)]
            escrow_pda, _ = PublicKey.find_program_address(
                escrow_seed, self.program_id
            )
            
            tx = await program.rpc["claim_winnings"](
                ctx=program.Context(
                    accounts={
                        "challenge": challenge_pda,
                        "challenge_escrow": escrow_pda,
                        "winner": winner_keypair.public_key,
                        "winner_token_account": winner_keypair.public_key,
                        "token_program": PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    },
                    signers=[winner_keypair],
                )
            )
            
            return {
                "success": True,
                "transaction_signature": str(tx)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_challenge_data(self, challenge_address: str) -> Dict[str, Any]:
        """Fetch challenge data from blockchain"""
        try:
            challenge_pda = PublicKey(challenge_address)
            account_info = await self.client.get_account_info(challenge_pda)
            
            if account_info.value is None:
                return {"success": False, "error": "Challenge not found"}
            
            # Decode account data (simplified)
            # In production, use proper Anchor deserialization
            return {
                "success": True,
                "challenge_address": challenge_address,
                "is_active": True,  # Placeholder
                "participants": [],  # Placeholder
                "winner": None  # Placeholder
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def close(self):
        """Close the RPC client"""
        await self.client.close()
