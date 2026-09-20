import json
import os
from pathlib import Path
from app.agents.extractor import extract_commitments
from app.agents.decision_engine import process_commitments

RAW_DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "raw_sources.json"
)

CACHE_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "cache_commitments.json"
)

def load_raw_data():
    with open(RAW_DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)

async def get_or_extract_commitments():
    # If cache exists, use it to avoid spamming the Mistral API during demo/dev
    if CACHE_FILE.exists():
        with open(CACHE_FILE, "r", encoding="utf-8") as file:
            return json.load(file)

    # Otherwise, extract live
    raw_data = load_raw_data()
    commitments = await extract_commitments(raw_data)

    # Save to cache
    with open(CACHE_FILE, "w", encoding="utf-8") as file:
        json.dump(commitments, file, indent=2)

    return commitments

async def generate_brief(as_of: str = "2026-09-23"):
    commitments = await get_or_extract_commitments()

    # Run deterministic math
    commitments = process_commitments(commitments, as_of)

    return {
        "executive": "Arjun Malhotra",
        "date": as_of,
        "summary": {
            "total": len(commitments),
            "overdue": sum(
                1 for c in commitments
                if c.get("status") == "overdue"
            ),
            "unowned": sum(
                1 for c in commitments
                if c.get("status") == "unowned"
            ),
            "waiting_on_others": sum(
                1 for c in commitments
                if c.get("waiting_on")
            ),
            "completed": sum(
                1 for c in commitments
                if c.get("status") == "completed"
            )
        },
        "commitments": commitments
    }
