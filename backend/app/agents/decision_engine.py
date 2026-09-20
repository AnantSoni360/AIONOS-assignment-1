from datetime import datetime

def process_commitments(commitments: list, as_of_date_str: str = "2026-09-23T09:00:00") -> list:
    # Use time-of-day parsing
    try:
        # E.g. "2026-09-23T08:45:00"
        as_of = datetime.fromisoformat(as_of_date_str)
    except ValueError:
        as_of = datetime.fromisoformat("2026-09-23T09:00:00")

    valid_commitments = []
    for c in commitments:
        # Filter evidence based on the "time travel" clock
        valid_evidence = []
        for ev in c.get("evidence", []):
            ev_time = datetime.fromisoformat(ev.get("timestamp", "2026-09-21T00:00:00"))
            if ev_time <= as_of:
                valid_evidence.append(ev)
        
        # If this commitment has no evidence up to this point in time, it hasn't happened yet
        if not valid_evidence:
            continue
            
        c["evidence"] = valid_evidence

        # Ownership Guard
        if not c.get("owner"):
            c["status"] = "unowned"
            c["priority"] = "critical"
            valid_commitments.append(c)
            continue

        if c.get("status") == "completed":
            valid_commitments.append(c)
            continue

        # Deadline Math
        deadline_str = c.get("deadline")
        if deadline_str:
            try:
                deadline = datetime.fromisoformat(deadline_str)
                if as_of > deadline:
                    c["status"] = "overdue"
                    c["priority"] = "critical"
                else:
                    c["status"] = "pending"
            except ValueError:
                c["status"] = "pending"
        else:
            c["status"] = "pending"
            
        valid_commitments.append(c)
        
    return valid_commitments

