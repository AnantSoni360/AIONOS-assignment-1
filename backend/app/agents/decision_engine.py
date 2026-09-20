from datetime import datetime

# Natural language deadline keyword → time-of-day mapping (24h)
_NATURAL_DEADLINE_MAP = {
    "morning":      "09:00:00",
    "noon":         "12:00:00",
    "afternoon":    "14:00:00",
    "evening":      "18:00:00",
    "end of day":   "17:00:00",
    "eod":          "17:00:00",
    "night":        "20:00:00",
}

def _parse_deadline(deadline_str: str) -> datetime | None:
    """
    Try to parse a deadline string into a datetime object.
    Handles:
      - ISO 8601:  "2026-09-23T12:00:00"
      - Date only: "2026-09-23"
      - Natural language suffix: "2026-09-23 morning", "2026-09-23 end of day"
    Returns None if unparseable (treats task as no deadline).
    """
    if not deadline_str:
        return None

    s = deadline_str.strip()

    # 1. Try strict ISO first
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        pass

    # 2. Try "YYYY-MM-DD <keyword>" pattern
    for keyword, time_str in _NATURAL_DEADLINE_MAP.items():
        if s.lower().endswith(keyword):
            date_part = s[: -len(keyword)].strip().rstrip(",").strip()
            try:
                return datetime.fromisoformat(f"{date_part}T{time_str}")
            except ValueError:
                pass

    # 3. Try plain date "YYYY-MM-DD" — treat as start of day
    try:
        return datetime.fromisoformat(f"{s}T00:00:00")
    except ValueError:
        pass

    # 4. Unparseable — return None (will be treated as no deadline)
    print(f"[decision_engine] Could not parse deadline: '{deadline_str}'")
    return None


def process_commitments(commitments: list, as_of_date_str: str = "2026-09-23T09:00:00") -> list:
    # Parse the simulation clock
    try:
        as_of = datetime.fromisoformat(as_of_date_str)
    except ValueError:
        print(f"[decision_engine] Bad as_of value '{as_of_date_str}', defaulting to 2026-09-23T09:00:00")
        as_of = datetime.fromisoformat("2026-09-23T09:00:00")

    valid_commitments = []

    for c in commitments:
        # ── Time-travel evidence filter ─────────────────────────────────────
        # Keep only evidence whose timestamp is at or before the simulation clock.
        # Evidence without a timestamp is treated as Mon-start (safe default).
        visible_evidence = []
        for ev in c.get("evidence", []):
            raw_ts = ev.get("timestamp", "2026-09-21T00:00:00")
            try:
                ev_time = datetime.fromisoformat(raw_ts)
            except ValueError:
                ev_time = datetime.fromisoformat("2026-09-21T00:00:00")
            if ev_time <= as_of:
                visible_evidence.append(ev)

        # If this commitment has no evidence yet, it hasn't happened — skip it
        if not visible_evidence:
            continue

        # Mutate the commitment's evidence to only the visible slice
        c = dict(c)  # don't mutate original
        c["evidence"] = visible_evidence

        # ── Ownership Guard ─────────────────────────────────────────────────
        if not c.get("owner"):
            c["status"] = "unowned"
            c["priority"] = "critical"
            valid_commitments.append(c)
            continue

        # ── Already completed ────────────────────────────────────────────────
        if c.get("status") == "completed":
            valid_commitments.append(c)
            continue

        # ── Deadline Math ────────────────────────────────────────────────────
        deadline_dt = _parse_deadline(c.get("deadline"))
        if deadline_dt:
            if as_of > deadline_dt:
                c["status"] = "overdue"
                c["priority"] = "critical"
            else:
                c["status"] = "pending"
        else:
            c["status"] = "pending"

        valid_commitments.append(c)

    return valid_commitments
