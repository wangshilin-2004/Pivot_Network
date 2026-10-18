#!/usr/bin/env python3
"""Seed the local demo dataset for Plantform_Backend.

Creates (idempotently):

* buyer ``demo@pivot.local`` / ``demo1234``  (role buyer, fixed id ``user_demo_buyer``)
* three sellers for 天津 / 北京 / 上海, all with password ``demo1234``
* the three demo offers the frontend catalogue expects:
  ``offer-a100-80g-tianjin``, ``offer-rtx4090-beijing``, ``offer-l40s-shanghai``

Run from anywhere after ``alembic upgrade head``:

    /tmp/pivot-be-venv/bin/python scripts/seed_local_demo.py

The script is safe to re-run: users are updated in place and offers are upserted
by fixed id, so ids the frontend may still hold stay valid.
"""

from __future__ import annotations

import os
import sys
from datetime import UTC, datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
# ``.env`` is resolved relative to the process cwd (see core/config.py) and
# ``backend_app`` is imported from the project root, so pin both to this project.
os.chdir(PROJECT_ROOT)
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import inspect as sqlalchemy_inspect  # noqa: E402

from backend_app.core.security import hash_password, new_password_salt  # noqa: E402
from backend_app.db.session import SessionLocal, engine  # noqa: E402
from backend_app.repositories.auth_repository import AuthRepository  # noqa: E402
from backend_app.repositories.trade_repository import TradeRepository  # noqa: E402
from backend_app.storage.memory_store import UserRecord  # noqa: E402

DEMO_PASSWORD = "demo1234"

DEMO_USERS: list[tuple[str, str, str, str]] = [
    # (user_id, email, display_name, role)
    ("user_demo_buyer", "demo@pivot.local", "演示买家", "buyer"),
    ("user_demo_seller_tianjin", "seller.tianjin@pivot.local", "天津智算中心", "seller"),
    ("user_demo_seller_beijing", "seller.beijing@pivot.local", "北京边缘云", "seller"),
    ("user_demo_seller_shanghai", "seller.shanghai@pivot.local", "上海云图", "seller"),
]


def _ensure_tables() -> None:
    tables = set(sqlalchemy_inspect(engine).get_table_names())
    required = {"users", "offers"}
    missing = sorted(required - tables)
    if missing:
        raise SystemExit(
            "Database is not migrated yet (missing tables: "
            + ", ".join(missing)
            + ").\nRun `alembic upgrade head` first, from "
            + str(PROJECT_ROOT)
            + "."
        )


def _ensure_user(
    repository: AuthRepository,
    *,
    user_id: str,
    email: str,
    display_name: str,
    role: str,
) -> tuple[UserRecord, bool]:
    """Create or refresh one demo user; returns (record, created)."""
    existing = repository.get_user_by_email(email)
    now = datetime.now(UTC)
    if existing is not None:
        # Re-running the seed must always leave known credentials / active status.
        existing.display_name = display_name
        existing.role = role
        existing.status = "active"
        existing.password_salt = new_password_salt()
        existing.password_hash = hash_password(DEMO_PASSWORD, existing.password_salt)
        existing.updated_at = now
        return repository.save_user(existing), False

    salt = new_password_salt()
    record = UserRecord(
        id=user_id,
        email=email,
        display_name=display_name,
        password_salt=salt,
        password_hash=hash_password(DEMO_PASSWORD, salt),
        role=role,
        status="active",
        created_at=now,
        updated_at=now,
    )
    return repository.save_user(record), True


def main() -> int:
    _ensure_tables()

    session = SessionLocal()
    try:
        auth_repository = AuthRepository(session)
        trade_repository = TradeRepository(session)

        created = 0
        for user_id, email, display_name, role in DEMO_USERS:
            record, was_created = _ensure_user(
                auth_repository,
                user_id=user_id,
                email=email,
                display_name=display_name,
                role=role,
            )
            created += int(was_created)
            print(f"[user] {'created' if was_created else 'updated'} {record.id:<24} {record.email:<30} role={record.role}")
        session.commit()

        trade_repository.ensure_seed_offers()
        session.commit()

        print()
        print(f"[users] {len(DEMO_USERS)} demo users ready ({created} created this run), password: {DEMO_PASSWORD}")
        offers = trade_repository.list_offers(status="listed")
        print(f"[offers] {len(offers)} listed offers:")
        for offer in offers:
            price = offer.price_snapshot.get("hourly_price")
            currency = offer.price_snapshot.get("currency", "CNY")
            print(f"  - {offer.id:<26} {currency} {price}/h  {offer.title}")
    finally:
        session.close()

    print()
    print("Demo credentials:")
    print(f"  buyer : demo@pivot.local / {DEMO_PASSWORD}")
    for _user_id, email, display_name, role in DEMO_USERS:
        if role != "buyer":
            print(f"  seller: {email} / {DEMO_PASSWORD}  ({display_name})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
