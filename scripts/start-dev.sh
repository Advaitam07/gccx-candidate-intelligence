#!/bin/bash
# GCCX Dual-stack startup: starts FastAPI backend on 8001 and Vite frontend on 3000

# Start backend if not already listening on port 8001
if ! curl -s http://127.0.0.1:8001/health > /dev/null 2>&1; then
  echo "[Startup] Launching FastAPI backend on http://0.0.0.0:8001..."
  python3 -m uvicorn backend.app.main:app --port 8001 --host 0.0.0.0 &
fi

# Launch Vite development server
echo "[Startup] Launching Vite development server on http://0.0.0.0:3000..."
exec vite --port=3000 --host=0.0.0.0
