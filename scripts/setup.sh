#!/bin/bash

echo "=== SmartSupport AI - Development Setup ==="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }

echo "[1/4] Installing backend dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "[2/4] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "[3/4] Setting up environment files..."
cp backend/.env.example backend/.env || true
cp frontend/.env.local.example frontend/.env.local || true

echo "[4/4] Starting services with Docker Compose..."
docker-compose up -d postgres

echo ""
echo "=== Setup Complete ==="
echo "Start the backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "Start the frontend: cd frontend && npm run dev"
echo "Access the app: http://localhost:3000"
