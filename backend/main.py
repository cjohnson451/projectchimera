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

# For debugging - print some info
print(f"Successfully imported app from {app.__module__}")
print(f"App title: {app.title}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000) 