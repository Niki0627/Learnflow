#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
MANAGE_PY="$ROOT_DIR/manage.py"
BACKEND_PORT=8000

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Usage: ./run-all.sh

Starts the Django backend and React frontend together from the repository root.

The script expects:
  - an existing Python virtual environment at .venv
  - frontend dependencies already installed in frontend/

Press Ctrl+C to stop both processes.
EOF
  exit 0
fi

if [[ ! -d "$ROOT_DIR/.venv" ]]; then
  echo "Error: .venv not found. Create it with: python3 -m venv .venv" >&2
  exit 1
fi

if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Error: $PYTHON_BIN not found or not executable." >&2
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Error: frontend directory not found." >&2
  exit 1
fi

if [[ ! -f "$MANAGE_PY" ]]; then
  echo "Error: manage.py not found in repository root." >&2
  exit 1
fi

trap 'echo "Shutting down both servers..."; kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true' EXIT INT TERM

echo "Starting frontend..."
(
  cd "$FRONTEND_DIR"
  npm start
) &
FRONTEND_PID=$!

sleep 2

echo "Starting backend..."
(
  cd "$ROOT_DIR"
  "$PYTHON_BIN" "$MANAGE_PY" runserver "$BACKEND_PORT"
) &
BACKEND_PID=$!

wait -n "$FRONTEND_PID" "$BACKEND_PID"
EXIT_CODE=$?
kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
exit "$EXIT_CODE"
