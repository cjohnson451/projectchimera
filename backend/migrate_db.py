#!/usr/bin/env python3
"""
Database migration script to add new memo fields
"""
import sqlite3
import os

def migrate_database():
    # Try multiple possible database paths
    possible_paths = [
        "chimera.db",  # Local development from backend directory
        "backend/chimera.db",  # Deployment from root directory
        "../chimera.db"  # Fallback
    ]
    
    db_path = None
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        print("Database not found in any expected location. Creating new database at chimera.db...")
        db_path = "chimera.db"
    
    print(f"Using database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns exist
    cursor.execute("PRAGMA table_info(memos)")
    columns = [column[1] for column in cursor.fetchall()]
    
    # Columns to add
    new_columns = [
        "market_opportunity",
        "business_overview", 
        "competitive_analysis",
        "management_team",
        "investment_thesis",
        "risks_and_mitigation",
        "valuation_and_deal_structure",
        "source_citations"
    ]
    
    # Add missing columns
    for column in new_columns:
        if column not in columns:
            print(f"Adding column: {column}")
            cursor.execute(f"ALTER TABLE memos ADD COLUMN {column} TEXT")
        else:
            print(f"Column {column} already exists")
    
    conn.commit()
    conn.close()
    print("Migration completed!")

if __name__ == "__main__":
    migrate_database() 