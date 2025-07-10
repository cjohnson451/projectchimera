#!/usr/bin/env python3
"""
Script to create a test user for debugging authentication issues.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import SessionLocal, DBUser
from app.auth import get_password_hash

def create_test_user():
    """Create a test user with known credentials."""
    db = SessionLocal()
    
    # Check if test user already exists
    existing_user = db.query(DBUser).filter(DBUser.email == "test@chimera.com").first()
    if existing_user:
        print("Test user already exists: test@chimera.com")
        db.close()
        return
    
    # Create test user
    hashed_password = get_password_hash("test123")
    test_user = DBUser(
        email="test@chimera.com",
        hashed_password=hashed_password,
        fund_name="Test Fund"
    )
    
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    print("Test user created successfully!")
    print("Email: test@chimera.com")
    print("Password: test123")
    print("Fund Name: Test Fund")
    
    db.close()

if __name__ == "__main__":
    create_test_user() 