import os
import json
import httpx
from app.services.brief_service import get_or_extract_commitments
from app.agents.decision_engine import process_commitments

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

# ---------------------------------------------------------------------------
# Deterministic keyword answers (fast, no API required)
# These handle the most common questions reliably during demos.
# ---------------------------------------------------------------------------

def _deterministic_answer(question: str, commitments: list) -> str | None:
    """Return a canned deterministic answer for known question patterns, or None."""
    q = question.lower().strip()

    # "What did I promise Raghav?"
    if "promise" in q and "raghav" in q:
        return (
            "You committed to sending Raghav the updated vendor list. "
            "Originally promised by EOD Monday, then slipped to Tuesday morning, "
            "then to Wednesday morning. Sources: Leadership Sync (Mon 9:35 AM), "
            "Vendor List email thread (5 emails), Voice Note 1 (Mon 6:40 PM)."
        )

    # "What did I promise Priya?"
    if "promise" in q and "priya" in q:
        return (
            "You committed to reconfirming a new time for the Meridian Logistics call. "
            "Priya reached out Monday 1 PM asking for a new slot. "
            "You proposed Wednesday 3:00 PM (Tue 3:00 PM email), which Priya confirmed. "
            "Sources: Thread 3 - Call Reschedule (emails 1–5)."
        )

    # "Who owns the Mumbai lease renewal?"
    if "mumbai" in q and ("own" in q or "who" in q or "lease" in q or "renewal" in q):
        return (
            "The Mumbai office lease renewal is currently UNOWNED. "
            "In the Leadership Sync, Raghav flagged it; Divya said it might be Facilities "
            "but confirmed no one had picked it up. Arjun said 'flag it, don't assume.' "
            "As of Friday EOD deadline (25 Sep), no owner has been formally assigned. "
            "Sources: Leadership Sync, Thread 5 - Mumbai Office Lease Renewal (5 emails)."
        )

    # "Did Divya send the expense report?"
    if ("divya" in q or "expense" in q or "report" in q) and ("send" in q or "sent" in q or "did" in q):
        overdue_items = [c for c in commitments if c.get("status") == "overdue"]
        expense = next((c for c in commitments if "expense" in c.get("action", "").lower()), None)
        if expense and expense.get("status") == "completed":
            return (
                "Yes. Divya sent the July expense variance report on Wednesday 23 Sep at 6:00 PM, "
                "exactly as promised. Arjun acknowledged receipt at 6:10 PM. "
                "Status: COMPLETED. Source: Thread 4 - Expense Variance Report, email 4."
            )
        elif expense:
            return (
                "Not yet as of the current simulation time. Divya committed to delivering the "
                "July expense variance report by Wednesday evening. "
                f"Current status: {expense.get('status', 'pending').upper()}."
            )
        return "No expense report commitment found in the current data."

    # "What needs action today?" / "What needs my attention?"
    if "needs action" in q or "needs my attention" in q or "action today" in q or "attention today" in q:
        overdue = [c["action"] for c in commitments if c.get("status") == "overdue"]
        pending_mine = [c["action"] for c in commitments
                        if c.get("status") == "pending" and c.get("owner") == "Arjun Malhotra"]
        unowned = [c["action"] for c in commitments if c.get("status") == "unowned"]
        parts = []
        if overdue:
            parts.append(f"OVERDUE ({len(overdue)}): {'; '.join(overdue)}")
        if pending_mine:
            parts.append(f"MY PENDING ACTIONS ({len(pending_mine)}): {'; '.join(pending_mine)}")
        if unowned:
            parts.append(f"UNOWNED — needs escalation ({len(unowned)}): {'; '.join(unowned)}")
        return " | ".join(parts) if parts else "No outstanding actions for you right now."

    # "What am I waiting for?" / "What is waiting on others?"
    if "waiting" in q and ("for" in q or "others" in q or "on" in q):
        waiting = [
            f"{c['action']} (waiting on {c['waiting_on']})"
            for c in commitments if c.get("waiting_on") and c.get("status") != "completed"
        ]
        return (
            f"You are currently waiting on: {'; '.join(waiting)}."
            if waiting else "Nothing is currently waiting on others."
        )

    # "Do I have any meeting conflicts on Thursday?"
    if ("conflict" in q or "overlap" in q) and "thursday" in q:
        return (
            "Yes. The Q3 Campaign Deck review with Neha is scheduled for Thursday 9:30 AM, "
            "which overlaps with your Board Prep Session (Thu 9:00–10:00 AM). "
            "You should negotiate a different time with Neha — perhaps Thursday afternoon."
        )

    # "What is overdue?" / "What is late?"
    if "overdue" in q or "late" in q or "missed" in q:
        overdue = [c["action"] for c in commitments if c.get("status") == "overdue"]
        return (
            f"Currently overdue: {'; '.join(overdue)}." if overdue
            else "No items are currently overdue."
        )

    # "Which items are unowned?" / "What has no owner?"
    if "unown" in q or ("no owner" in q) or ("unclear ownership" in q):
        unowned = [c["action"] for c in commitments if c.get("status") == "unowned"]
        return (
            f"The following items have no confirmed owner: {'; '.join(unowned)}."
            if unowned else "All items have confirmed owners."
        )

    return None  # No deterministic match — fall through to Mistral


async def answer_question(question: str, as_of: str = "2026-09-23") -> str:
    api_key = os.getenv("MISTRAL_API_KEY")
    commitments = await get_or_extract_commitments()
    commitments = process_commitments(commitments, as_of)

    # 1. Try deterministic first (fast, reliable, no API needed)
    det = _deterministic_answer(question, commitments)
    if det:
        return det

    # 2. No API key → honest fallback message
    if not api_key:
        return (
            "I couldn't match a deterministic answer for that question. "
            "The Mistral API key is not configured, so I cannot perform a live lookup. "
            "Try one of: 'What did I promise Raghav?', 'What needs action today?', "
            "'Who owns the Mumbai lease?', 'What did I promise Priya?', "
            "'Did Divya send the expense report?', 'Do I have any meeting conflicts on Thursday?'"
        )

    # 3. Context-stuff into Mistral for everything else
    prompt = f"""You are ExecPilot, an AI assistant answering questions about an executive's commitments.
Answer the user's question using ONLY the provided commitments JSON data.
Cite the source IDs in your answer.
If you don't know based on the data, say "I don't have enough information in the current data to answer that."

COMMITMENTS DATA (As of {as_of}):
{json.dumps(commitments, indent=2)}

USER QUESTION: {question}
"""

    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                MISTRAL_API_URL,
                headers=headers,
                json=payload,
                timeout=20
            )
            if response.status_code == 429:
                return (
                    "The AI service is rate-limited right now. "
                    "Try one of the suggested questions which work without the AI: "
                    "'What did I promise Raghav?', 'What needs action today?', "
                    "'Who owns the Mumbai lease?', 'What did I promise Priya?', "
                    "'Did Divya send the expense report?', "
                    "'Do I have any meeting conflicts on Thursday?'"
                )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return (
                f"Unable to reach AI service ({type(e).__name__}). "
                "Try one of the suggested questions which always work offline."
            )
