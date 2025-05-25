#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for the AI Task Manager backend.
"""

import secrets

def generate_secret_key():
    """Generate a secure secret key for JWT tokens."""
    key = secrets.token_urlsafe(32)
    print("\n🔐 Your secure SECRET_KEY:")
    print(f"\n{key}\n")
    print("Add this to your backend/.env file:")
    print(f"SECRET_KEY={key}\n")

if __name__ == "__main__":
    generate_secret_key()
