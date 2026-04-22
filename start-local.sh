#!/bin/bash

# CineLuxe Local Development Startup Script
# This script starts both the backend and frontend for local development

echo "Starting CineLuxe locally..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null
then
    echo "⚠️  Warning: MongoDB doesn't appear to be running."
    echo "Please start MongoDB first:"
    echo "  - On macOS with Homebrew: brew services start mongodb-community"
    echo "  - Or using Docker: docker run -d -p 27017:27017 mongo"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Terminal 1: Start Backend
echo "🚀 Starting Backend Server..."
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)/backend"' && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn server:app --reload --reload-exclude venv --host 0.0.0.0 --port 8000"' 2>/dev/null || (
    echo "Opening backend in new terminal..."
    cd backend || exit
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    uvicorn server:app --reload --reload-exclude venv --host 0.0.0.0 --port 8000
) &

# Wait a bit for backend to start
sleep 3

# Terminal 2: Start Frontend
echo "🚀 Starting Frontend..."
cd frontend || exit

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    yarn install
fi

osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && yarn start"' 2>/dev/null || yarn start

echo ""
echo "✅ CineLuxe is starting up!"
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "API documentation will be at: http://localhost:8000/docs"
