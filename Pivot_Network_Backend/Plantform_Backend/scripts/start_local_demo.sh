#!/usr/bin/env bash
# One-command startup for the Pivot local demo (no Docker required).
#
#   DB (pgserver) -> alembic upgrade head -> seed demo data -> uvicorn on 127.0.0.1:8000
#
# Usage (from the Plantform_Backend directory):
#   export PIVOT_PYTHON=/tmp/pivot-be-venv/bin/python
#   bash scripts/start_local_demo.sh
#
# Environment overrides:
#   PIVOT_PYTHON       python interpreter with the backend deps + pgserver (default: python3)
#   PIVOT_PORT         uvicorn port (default: 8000)
#   PIVOT_BACKEND_LOG  uvicorn log file (default: /tmp/pivot-backend.log)
#   PIVOT_BACKEND_PID  pid file (default: /tmp/pivot-backend.pid)
#   PIVOT_PGDATA       pgserver data directory (default: /tmp/pivot-pgdata)
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

PYTHON="${PIVOT_PYTHON:-python3}"
PORT="${PIVOT_PORT:-8000}"
LOG_FILE="${PIVOT_BACKEND_LOG:-/tmp/pivot-backend.log}"
PID_FILE="${PIVOT_BACKEND_PID:-/tmp/pivot-backend.pid}"
BASE_URL="http://127.0.0.1:${PORT}/api/v1"

echo "==> [1/4] starting local PostgreSQL (pgserver, no Docker)"
"$PYTHON" scripts/local_postgres.py start

echo
echo "==> [2/4] applying database migrations (alembic upgrade head)"
"$PYTHON" -m alembic upgrade head

echo
echo "==> [3/4] seeding local demo data (idempotent)"
"$PYTHON" scripts/seed_local_demo.py

echo
echo "==> [4/4] starting uvicorn on http://127.0.0.1:${PORT} (log: ${LOG_FILE})"
if curl -sf -m 2 "${BASE_URL}/health" >/dev/null 2>&1; then
  echo "backend already running on port ${PORT}; leaving it untouched."
else
  nohup "$PYTHON" -m uvicorn backend_app.main:app --host 127.0.0.1 --port "$PORT" \
    >>"$LOG_FILE" 2>&1 </dev/null &
  echo $! >"$PID_FILE"
  for _ in $(seq 1 60); do
    if curl -sf -m 2 "${BASE_URL}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
fi

echo
echo "==> health: $(curl -sf -m 5 "${BASE_URL}/health" || echo 'NOT REACHABLE')"
echo "==> ready : $(curl -sf -m 5 "${BASE_URL}/ready" || echo 'NOT REACHABLE')"
echo
echo "Backend : http://127.0.0.1:${PORT}  (OpenAPI docs: http://127.0.0.1:${PORT}/docs)"
echo "Buyer   : demo@pivot.local / demo1234"
echo "Sellers : seller.tianjin@pivot.local | seller.beijing@pivot.local | seller.shanghai@pivot.local (password demo1234)"
echo "Stop    : bash scripts/stop_local_demo.sh --with-db"
