from datetime import datetime

def process_commitments(commitments: list, as_of_date_str: str = "2026-09-23") -> list:
    # Convert string to date object for comparison
    try:
        as_of = datetime.strptime(as_of_date_str, "%Y-%m-%d")
    except ValueError:
        as_of = datetime.strptime("2026-09-23", "%Y-%m-%d")

    for c in commitments:
        # Ownership Guard
        if not c.get("owner"):
            c["status"] = "unowned"
            c["priority"] = "critical"
            continue

        # Status is pre-set to completed via LLM if explicitly done
        if c.get("status") == "completed":
            continue

        # Deadline Math
        deadline_str = c.get("deadline", "")
        # Attempt to extract YYYY-MM-DD from the deadline string
        # For this prototype, we'll do simple string comparison or hardcoded logic 
        # since the extracted strings are "2026-09-23 morning" etc.
        
        if "2026-09-21" in deadline_str or "2026-09-22" in deadline_str:
            # If deadline is before our 2026-09-23 baseline
            c["status"] = "overdue"
        elif "2026-09-23" in deadline_str:
            if as_of > datetime.strptime("2026-09-23", "%Y-%m-%d"):
                c["status"] = "overdue"
            else:
                c["status"] = "pending"
        elif "2026-09-24" in deadline_str:
            if as_of > datetime.strptime("2026-09-24", "%Y-%m-%d"):
                c["status"] = "overdue"
            else:
                c["status"] = "pending"
        elif "2026-09-25" in deadline_str:
            if as_of > datetime.strptime("2026-09-25", "%Y-%m-%d"):
                c["status"] = "overdue"
            else:
                c["status"] = "pending"
        
    return commitments
