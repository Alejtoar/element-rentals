#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for production use.
Run this script and copy the output to your .env file or Dokploy panel.
"""

import secrets

def generate_secret_key(length=32):
    """Generate a cryptographically secure random key."""
    return secrets.token_hex(length)

if __name__ == "__main__":
    secret_key = generate_secret_key()
    print("=" * 70)
    print("🔐 GENERATED SECRET_KEY")
    print("=" * 70)
    print(f"\n{secret_key}\n")
    print("=" * 70)
    print("📋 Copy this key to:")
    print("   - Development: backend/.env")
    print("   - Production: Dokploy panel → Environment Variables")
    print("\n⚠️  NEVER commit this key to git!")
    print("⚠️  Use different keys for development and production!")
    print("=" * 70)
