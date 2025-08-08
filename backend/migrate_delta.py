#!/usr/bin/env python3
"""
Additive migration for delta-first module tables.
This script is idempotent and safe to run multiple times.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.db import DATABASE_URL, Base  # type: ignore
from app.delta_models import (  # noqa: F401 - ensure models are imported so metadata is populated
    DBFiling,
    DBFilingVersion,
    DBSourceLog,
    DBDeltaCard,
    DBEvidence,
    DBCatalyst,
    DBMemoDelta,
    DBRun,
)


def run_migration() -> None:
    engine: Engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Delta module tables ensured.")


if __name__ == "__main__":
    run_migration()


