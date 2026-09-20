def resolve_ownership(commitment):
    """
    Never infer ownership from assumptions such as:
    'typically handled by X'.

    Ownership must be explicitly supported by source evidence.
    """

    owner = commitment.get("owner")

    if not owner:
        commitment["status"] = "unowned"
        commitment["priority"] = "critical"

    return commitment
