#!/usr/bin/env python3
"""Manage the rootless local PostgreSQL server used by the local demo.

This is **not** needed for a normal production run (compose.yml + real PostgreSQL),
it only exists so the backend can be demonstrated on a machine without Docker.

It uses the optional `pgserver` pip package, which bundles PostgreSQL binaries and
runs them as the current user (no root, no brew service):

    /tmp/pivot-be-venv/bin/pip install pgserver

The server is started with ``cleanup_mode=None`` so it keeps running after this
helper exits; ``stop`` shuts it down explicitly.

Usage:
    python scripts/local_postgres.py start    # start, ensure DB, print URL
    python scripts/local_postgres.py uri      # print SQLAlchemy URL
    python scripts/local_postgres.py status   # is it running?
    python scripts/local_postgres.py stop     # stop the server

Environment:
    PIVOT_PGDATA       data directory (default /tmp/pivot-pgdata)
    PIVOT_PG_DATABASE  database name   (default plantform_backend)
"""

from __future__ import annotations

import argparse
import os
import signal
import sys
from pathlib import Path

DEFAULT_PGDATA = Path(os.environ.get("PIVOT_PGDATA", "/tmp/pivot-pgdata"))
DATABASE = os.environ.get("PIVOT_PG_DATABASE", "plantform_backend")


def _load_pgserver():
    try:
        import pgserver
    except ImportError:  # pragma: no cover - guidance only
        raise SystemExit(
            "pgserver is not installed.\n"
            "Install it into the same virtualenv as the backend:\n"
            "  pip install pgserver"
        ) from None
    return pgserver


def _patch_pgserver_runtime_dir() -> None:
    """Keep pgserver's lock/socket runtime directory inside a writable temp dir.

    pgserver stores its inter-process lock under ``platformdirs.user_runtime_path``
    (``~/Library/Caches/TemporaryItems`` on macOS).  Some sandboxed / restricted
    shells cannot write there, which aborts startup before PostgreSQL is even
    launched.  Redirecting that path to the system temp directory keeps startup
    deterministic without changing pgserver itself.
    """
    import tempfile

    import platformdirs

    runtime_dir = Path(
        os.environ.get("PIVOT_PG_RUNTIME_DIR", Path(tempfile.gettempdir()) / "pivot-pgserver-runtime")
    )
    runtime_dir.mkdir(parents=True, exist_ok=True)
    platformdirs.user_runtime_path = lambda *args, **kwargs: runtime_dir  # type: ignore[assignment]


def _postmaster_info(pgdata: Path):
    """Return (pid, socket_dir_or_port) of the running server, or None."""
    pid_file = pgdata / "postmaster.pid"
    if not pid_file.exists():
        return None
    lines = pid_file.read_text().splitlines()
    if len(lines) < 2:
        return None
    try:
        pid = int(lines[0].strip())
    except ValueError:
        return None
    try:
        os.kill(pid, 0)
    except OSError:
        return None
    return pid, lines[1].strip()


def _sqlalchemy_url(uri: str) -> str:
    if uri.startswith("postgresql+psycopg://"):
        return uri
    return "postgresql+psycopg://" + uri.removeprefix("postgresql://")


def _ensure_database(server) -> None:
    import psycopg

    with psycopg.connect(server.get_uri(), autocommit=True) as connection:
        exists = connection.execute(
            "select 1 from pg_database where datname = %s", (DATABASE,)
        ).fetchone()
        if not exists:
            connection.execute(f'create database "{DATABASE}" encoding \'UTF8\'')
            print(f"created database {DATABASE}")


def cmd_start(pgdata: Path) -> int:
    _patch_pgserver_runtime_dir()
    server = _load_pgserver().get_server(pgdata, cleanup_mode=None)
    _ensure_database(server)
    uri = server.get_uri(database=DATABASE)
    print(f"pgdata     : {pgdata}")
    print(f"server pid : {server.get_pid()}")
    print(f"database   : {DATABASE}")
    print()
    print("BACKEND_POSTGRES_URL=" + _sqlalchemy_url(uri))
    return 0


def cmd_uri(pgdata: Path) -> int:
    info = _postmaster_info(pgdata)
    if info is None:
        print("local PostgreSQL is not running (try: python scripts/local_postgres.py start)", file=sys.stderr)
        return 1
    _pid, location = info
    # postmaster.pid line 2 is the data directory; pgserver puts the Unix socket
    # there too (for the short default /tmp/pivot-pgdata path).
    host = Path(location)
    uri = f"postgresql://postgres:@/{DATABASE}?host={host}"
    print(_sqlalchemy_url(uri))
    return 0


def cmd_status(pgdata: Path) -> int:
    info = _postmaster_info(pgdata)
    if info is None:
        print(f"local PostgreSQL: stopped (pgdata {pgdata})")
        return 1
    pid, location = info
    print(f"local PostgreSQL: running (pid {pid}, socket {location})")
    print("BACKEND_POSTGRES_URL=" + _sqlalchemy_url(f"postgresql://postgres:@/{DATABASE}?host={pgdata}"))
    return 0


def cmd_stop(pgdata: Path) -> int:
    info = _postmaster_info(pgdata)
    if info is None:
        print("local PostgreSQL: already stopped")
        return 0
    pid, _location = info
    try:
        from pgserver._commands import pg_ctl

        pg_ctl(["-w", "stop"], pgdata=pgdata)
    except Exception as error:  # pragma: no cover - fallback for deleted venv
        print(f"pg_ctl unavailable ({error}); sending SIGTERM to pid {pid}", file=sys.stderr)
        os.kill(pid, signal.SIGTERM)
    print("local PostgreSQL: stopped")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("command", choices=["start", "stop", "status", "uri"])
    parser.add_argument("--pgdata", type=Path, default=DEFAULT_PGDATA)
    args = parser.parse_args(argv)

    pgdata: Path = args.pgdata.expanduser().resolve()
    if args.command == "start":
        return cmd_start(pgdata)
    return {"uri": cmd_uri, "status": cmd_status, "stop": cmd_stop}[args.command](pgdata)


if __name__ == "__main__":
    raise SystemExit(main())
