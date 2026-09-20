def normalize_action(action: str) -> str:
    return (
        action.lower()
        .replace("send", "")
        .replace("please", "")
        .strip()
    )

def deduplicate(commitments):
    unique = {}

    for commitment in commitments:
        key = normalize_action(commitment["action"])

        if key not in unique:
            unique[key] = commitment
        else:
            existing = unique[key]

            existing["evidence"].extend(
                commitment.get("evidence", [])
            )

            if commitment.get("status") == "completed":
                existing["status"] = "completed"

    return list(unique.values())
