"""
Entry point for Project Chimera API
This file serves as the uvicorn entry point for deployment
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Import the FastAPI app from the app package
    from app.main import app
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    print(f"Files in current directory: {os.listdir('.')}")
    if os.path.exists('app'):
        print(f"Files in app directory: {os.listdir('app')}")
    raise

# This is the FastAPI app instance that uvicorn will run
app = app 