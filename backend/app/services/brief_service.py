import json
from pathlib import Path

DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "seed_data.json"
)

def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)

def generate_brief():
    data = load_data()
    commitments = data["commitments"]

    return {
        "executive": "Arjun Malhotra",
        "date": "2026-09-23",
        "summary": {
            "total": len(commitments),
            "overdue": sum(
                1 for c in commitments
                if c["status"] == "overdue"
            ),
            "unowned": sum(
                1 for c in commitments
                if c["status"] == "unowned"
            ),
            "waiting_on_others": sum(
                1 for c in commitments
                if c["waiting_on"]
            ),
            "completed": sum(
                1 for c in commitments
                if c["status"] == "completed"
            )
        },
        "commitments": commitments
    }
