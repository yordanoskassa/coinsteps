#!/usr/bin/env python3
"""
Generate a treasury keypair for airdrop fallback
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from solders.keypair import Keypair
import json
import base64

def main():
    # Generate treasury keypair
    treasury = Keypair()
    secret_bytes = bytes(treasury)
    pubkey = str(treasury.pubkey())
    
    # Output both formats
    json_array = list(secret_bytes)
    b64_secret = base64.b64encode(secret_bytes).decode()
    
    print("=" * 60)
    print("TREASURY KEYPAIR GENERATED")
    print("=" * 60)
    print(f"Treasury Public Key: {pubkey}")
    print()
    print("Add ONE of these to your backend/.env:")
    print()
    print("Option 1 (JSON format):")
    print(f"AIRDROP_TREASURY_SECRET_JSON={json_array}")
    print()
    print("Option 2 (Base64 format):")
    print(f"AIRDROP_TREASURY_SECRET_B64={b64_secret}")
    print()
    print("Also add:")
    print("AIRDROP_MODE=auto")
    print()
    print("=" * 60)
    print("NEXT STEPS:")
    print("1. Fund this treasury address on testnet:")
    print(f"   https://faucet.solana.com (select Testnet, paste: {pubkey})")
    print("2. Add the treasury secret to backend/.env")
    print("3. Restart your backend server")
    print("=" * 60)

if __name__ == "__main__":
    main()
