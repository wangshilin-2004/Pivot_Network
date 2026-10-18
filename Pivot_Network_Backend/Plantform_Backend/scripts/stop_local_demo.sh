#!/usr/bin/env bash
# Stop the Pivot local demo backend, and optionally the local PostgreSQL server.
#
#   bash scripts/stop_local_demo.sh              # stop uvicorn only
#   bash scripts/stop_local_demo.sh --with-db    # stop uvicorn + local PostgreSQL
#
# Environment overrides: PIVOT_PYTHON, PIVOT_PORT, PIVOT_BACKEND_PID, PIVOT_PGDATA
set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

PYTHON="${PIVOT_PYTHON:-python3}"
PORT="${PIVOT_PORT:-8000}"
PID_FILE="${PIVOT_BACKEND_PID:-/tmp/pivot-backend.pid}"
WITH_DB=0

for argument in "$@"; do
  case "$argument" in
    --with-db) WITH_DB=1 ;;
    *) echo "unknown argument: $argument" >&2; exit 2 ;;
  esac
done

echo "==> stopping uvicorn on port ${PORT}"
if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  if kill "$PID" 2>/dev/null; then
    echo "stopped pid ${PID}"
  fi
  rm -f "$PID_FILE"
fi

# Also stop a process that is holding the port but was started without a pid file.
PIDS="$(lsof -ti "tcp:${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$PIDS" ]]; then
  # shellcheck disable=SC2086
  kill $PIDS 2>/dev/null || true
  echo "stopped listener(s): ${PIDS}"
fi

if [[ "$WITH_DB" == "1" ]]; then
  echo
  echo "==> stopping local PostgreSQL"
  "$PYTHON" scripts/local_postgres.py stop
fi

echo
echo "done. backend: $(curl -sf -m 2 "http://127.0.0.1:${PORT}/api/v1/health" >/dev/null 2>&1 && echo 'STILL RUNNING' || echo stopped)"
