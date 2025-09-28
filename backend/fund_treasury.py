#!/usr/bin/env python3
"""
Treasury Funding Script for StepBet

This script helps fund the treasury wallet when it runs low on SOL.
It can request airdrops or provide instructions for manual funding.
"""

import os
import json
import base64
from dotenv import load_dotenv
from solders.keypair import Keypair
from solana.rpc.api import Client
from solana.rpc.types import TxOpts
from solders.pubkey import Pubkey

load_dotenv()

class TreasuryManager:
    def __init__(self):
        self.rpc_url = os.getenv("SOLANA_RPC_URL", "https://api.testnet.solana.com")
        self.client = Client(self.rpc_url)
        self.treasury_keypair = self._load_treasury_keypair()
        
    def _load_treasury_keypair(self):
        """Load treasury keypair from environment"""
        try:
            json_secret = os.getenv("AIRDROP_TREASURY_SECRET_JSON")
            if json_secret:
                arr = json.loads(json_secret)
                if isinstance(arr, list) and len(arr) == 64:
                    return Keypair.from_bytes(bytes(arr))
            
            print("❌ Treasury keypair not found in environment")
            return None
        except Exception as e:
            print(f"❌ Error loading treasury keypair: {e}")
            return None
    
    async def get_treasury_balance(self):
        """Get current treasury balance"""
        if not self.treasury_keypair:
            return 0.0
        
        try:
            response = self.client.get_balance(self.treasury_keypair.pubkey())
            balance_sol = response.value / 1_000_000_000
            return balance_sol
        except Exception as e:
            print(f"❌ Error getting treasury balance: {e}")
            return 0.0
    
    async def request_treasury_airdrop(self, amount: float = 5.0):
        """Request airdrop to treasury wallet"""
        if not self.treasury_keypair:
            print("❌ Treasury keypair not configured")
            return False
        
        try:
            lamports = int(amount * 1_000_000_000)
            print(f"🚁 Requesting {amount} SOL airdrop to treasury...")
            
            response = self.client.request_airdrop(self.treasury_keypair.pubkey(), lamports)
            
            if hasattr(response, 'value') and response.value:
                print(f"✅ Airdrop successful! Signature: {response.value}")
                return True
            else:
                print("❌ Airdrop failed - testnet faucet may be down")
                return False
                
        except Exception as e:
            print(f"❌ Airdrop error: {e}")
            return False
    
    def get_treasury_info(self):
        """Get treasury wallet information"""
        if not self.treasury_keypair:
            return None
        
        return {
            "public_key": str(self.treasury_keypair.pubkey()),
            "network": "testnet" if "testnet" in self.rpc_url else "mainnet"
        }

async def main():
    print("=" * 60)
    print("🏦 STEPBET TREASURY MANAGER")
    print("=" * 60)
    
    manager = TreasuryManager()
    
    # Check treasury configuration
    treasury_info = manager.get_treasury_info()
    if not treasury_info:
        print("\n❌ Treasury not configured!")
        print("\nTo configure treasury:")
        print("1. Generate a new Solana keypair")
        print("2. Add AIRDROP_TREASURY_SECRET_JSON to .env file")
        print("3. Fund the treasury wallet with SOL")
        return
    
    print(f"\n🏦 Treasury Wallet: {treasury_info['public_key']}")
    print(f"🌐 Network: {treasury_info['network']}")
    
    # Check current balance
    balance = await manager.get_treasury_balance()
    print(f"💰 Current Balance: {balance:.4f} SOL")
    
    # Determine funding needs
    min_balance = 10.0  # Minimum SOL needed for operations
    recommended_balance = 50.0  # Recommended SOL for smooth operations
    
    if balance < min_balance:
        print(f"\n⚠️  WARNING: Treasury balance is low!")
        print(f"   Current: {balance:.4f} SOL")
        print(f"   Minimum needed: {min_balance} SOL")
        print(f"   Recommended: {recommended_balance} SOL")
        
        # Attempt automatic funding
        amount_needed = recommended_balance - balance
        print(f"\n🚁 Attempting to request {amount_needed:.1f} SOL airdrop...")
        
        success = await manager.request_treasury_airdrop(amount_needed)
        
        if success:
            print("✅ Treasury funded successfully!")
            new_balance = await manager.get_treasury_balance()
            print(f"💰 New Balance: {new_balance:.4f} SOL")
        else:
            print("\n❌ Automatic funding failed. Manual funding required:")
            print(f"\n📋 Manual Funding Instructions:")
            print(f"   1. Visit: https://faucet.solana.com/")
            print(f"   2. Enter treasury address: {treasury_info['public_key']}")
            print(f"   3. Request {amount_needed:.1f} SOL")
            print(f"   4. Repeat if needed to reach {recommended_balance} SOL")
            
    elif balance < recommended_balance:
        print(f"\n💡 Treasury has minimum SOL but could use more for optimal operation")
        print(f"   Consider adding {recommended_balance - balance:.1f} more SOL")
        
    else:
        print(f"\n✅ Treasury is well funded!")
        print(f"   Should support {int(balance)} airdrop operations")
    
    print("\n" + "=" * 60)
    print("📊 TREASURY USAGE ESTIMATES")
    print("=" * 60)
    print(f"• Each 1 SOL airdrop costs: ~1.001 SOL (including fees)")
    print(f"• Current balance supports: ~{int(balance)} airdrops")
    print(f"• Recommended for 50+ airdrops: 50+ SOL")
    print(f"• For production: Consider 100+ SOL")

async def check_treasury_status():
    """Quick treasury status check"""
    manager = TreasuryManager()
    
    treasury_info = manager.get_treasury_info()
    if not treasury_info:
        return {"status": "not_configured", "balance": 0}
    
    balance = await manager.get_treasury_balance()
    
    if balance >= 10.0:
        status = "healthy"
    elif balance >= 1.0:
        status = "low"
    else:
        status = "critical"
    
    return {
        "status": status,
        "balance": balance,
        "public_key": treasury_info["public_key"]
    }

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())