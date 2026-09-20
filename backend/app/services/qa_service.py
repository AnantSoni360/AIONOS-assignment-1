import os
import json
import httpx
from typing import List, Dict
from app.services.brief_service import get_or_extract_commitments
from app.agents.decision_engine import process_commitments

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

SYSTEM_PROMPT = """You are ExecPilot, a sharp and concise executive AI assistant for Arjun Malhotra, VP Sales.
You have full access to his commitments, email threads, voice notes, and calendar for the week of Mon 21 – Fri 25 Sep 2026.

Rules:
- Answer concisely and professionally. Use bullet points when listing multiple items.
- ALWAYS end your answer with a "**Sources:**" line citing which source IDs you used.
- Rate confidence as High / Medium / Low at the end.
- Never invent information not present in the provided data.
- If you don't know, say "I don't have enough data to answer that confidently."
- You have memory of this conversation — refer to earlier messages when relevant."""


# ---------------------------------------------------------------------------
# Deterministic keyword answers (no API key needed)
# ---------------------------------------------------------------------------

def _deterministic_answer(question: str, commitments: list) -> str | None:
    q = question.lower().strip()

    if "promise" in q and "raghav" in q:
        return (
            "You committed to sending Raghav the updated vendor list.\n\n"
            "- Originally promised by EOD Monday (Leadership Sync)\n"
            "- Slipped to Tuesday morning (Mon 5:40 PM email)\n"
            "- Slipped again to Wednesday morning (Tue 6:30 PM email)\n\n"
            "**Sources:** Leadership Sync · Thread 1 - Vendor List (emails 1–5) · Voice Note 1\n"
            "**Confidence:** High"
        )

    if "promise" in q and "priya" in q:
        return (
            "You committed to reconfirming a new time for the Meridian Logistics call.\n\n"
            "- Priya reached out Monday 1 PM asking for a new slot\n"
            "- You proposed Wednesday 3:00 PM (Tue 3 PM email)\n"
            "- Priya confirmed Wednesday 3 PM (Tue 5:45 PM email)\n\n"
            "**Sources:** Thread 3 - Call Reschedule (emails 1–5)\n"
            "**Confidence:** High"
        )

    if "mumbai" in q and ("own" in q or "who" in q or "lease" in q or "renewal" in q):
        return (
            "The Mumbai office lease renewal is currently **UNOWNED**.\n\n"
            "- Raghav flagged it in the Leadership Sync\n"
            "- Divya said it 'might be Facilities' but no one has picked it up\n"
            "- Arjun's instruction: 'flag it, don't assume'\n"
            "- Deadline: Friday 25 Sep EOD — still unassigned as of latest data\n\n"
            "**Sources:** Leadership Sync · Thread 5 - Mumbai Office Lease Renewal (emails 1–5) · Voice Note 1\n"
            "**Confidence:** High"
        )

    if ("divya" in q or "expense" in q or "report" in q) and ("send" in q or "sent" in q or "did" in q):
        expense = next((c for c in commitments if "expense" in c.get("action", "").lower()), None)
        if expense and expense.get("status") == "completed":
            return (
                "**Yes — Divya sent the report on time.**\n\n"
                "- Sent: Wednesday 23 Sep at 6:00 PM\n"
                "- Arjun acknowledged receipt at 6:10 PM\n"
                "- Status: ✅ COMPLETED\n\n"
                "**Sources:** Thread 4 - Expense Variance Report (emails 4 & 5)\n"
                "**Confidence:** High"
            )
        elif expense:
            return (
                f"Not yet as of the current simulation time.\n\n"
                f"- Divya committed to Wednesday evening delivery\n"
                f"- Current status: **{expense.get('status', 'pending').upper()}**\n\n"
                "**Sources:** Thread 4 - Expense Variance Report\n"
                "**Confidence:** High"
            )
        return "No expense report commitment found in the current data."

    if "needs action" in q or "action today" in q or "attention today" in q or "focus on" in q:
        overdue = [c["action"] for c in commitments if c.get("status") == "overdue"]
        pending_mine = [c["action"] for c in commitments
                        if c.get("status") == "pending" and c.get("owner") == "Arjun Malhotra"]
        unowned = [c["action"] for c in commitments if c.get("status") == "unowned"]
        parts = []
        if overdue:
            parts.append(f"🔴 **OVERDUE ({len(overdue)}):**\n" + "\n".join(f"  - {a}" for a in overdue))
        if pending_mine:
            parts.append(f"🟡 **MY PENDING ({len(pending_mine)}):**\n" + "\n".join(f"  - {a}" for a in pending_mine))
        if unowned:
            parts.append(f"⚠️ **UNOWNED — needs escalation ({len(unowned)}):**\n" + "\n".join(f"  - {a}" for a in unowned))
        result = "\n\n".join(parts) if parts else "No outstanding actions for you right now."
        return result + "\n\n**Sources:** All commitment data\n**Confidence:** High"

    if "waiting" in q and ("for" in q or "others" in q or "on" in q):
        waiting = [
            f"- {c['action']} *(waiting on {c['waiting_on']})*"
            for c in commitments if c.get("waiting_on") and c.get("status") != "completed"
        ]
        if waiting:
            return "You are currently waiting on:\n\n" + "\n".join(waiting) + \
                   "\n\n**Sources:** Commitment data\n**Confidence:** High"
        return "Nothing is currently waiting on others.\n\n**Sources:** Commitment data\n**Confidence:** High"

    if ("conflict" in q or "overlap" in q) and "thursday" in q:
        return (
            "**Yes — there is a calendar conflict on Thursday.**\n\n"
            "- Neha's Q3 Campaign Deck review: **Thu 9:30 AM**\n"
            "- Arjun's Board Prep Session: **Thu 9:00–10:00 AM**\n\n"
            "These overlap by 30 minutes. Recommend rescheduling the deck review to Thursday afternoon.\n\n"
            "**Sources:** Thread 2 - Q3 Campaign Deck (email 4) · Arjun Calendar - Board Prep\n"
            "**Confidence:** High"
        )

    if "overdue" in q or ("late" in q and "what" in q):
        overdue = [f"- {c['action']} (deadline: {c.get('deadline', 'unknown')})"
                   for c in commitments if c.get("status") == "overdue"]
        if overdue:
            return "Currently overdue items:\n\n" + "\n".join(overdue) + \
                   "\n\n**Sources:** Commitment data\n**Confidence:** High"
        return "No items are currently overdue.\n\n**Sources:** Commitment data\n**Confidence:** High"

    if "unown" in q or "no owner" in q or "unclear ownership" in q:
        unowned = [f"- {c['action']}" for c in commitments if c.get("status") == "unowned"]
        if unowned:
            return "Items with no confirmed owner:\n\n" + "\n".join(unowned) + \
                   "\n\n**Sources:** Commitment data\n**Confidence:** High"
        return "All items have confirmed owners.\n\n**Sources:** Commitment data\n**Confidence:** High"

    if "meridian" in q or "call" in q:
        meridian = next((c for c in commitments if "meridian" in c.get("action", "").lower()), None)
        if meridian:
            status = meridian.get("status", "unknown")
            deadline = meridian.get("deadline", "unknown")
            return (
                f"The Meridian Logistics call status: **{status.upper()}**\n\n"
                f"- Scheduled time: Wednesday 3:00 PM (confirmed by Priya)\n"
                f"- Deadline tracked as: {deadline}\n\n"
                "**Sources:** Thread 3 - Call Reschedule · Leadership Sync\n"
                "**Confidence:** High"
            )

    return None


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

async def answer_question(question: str, as_of: str = "2026-09-23T09:00:00",
                          history: List[Dict] = []) -> str:
    api_key = os.getenv("MISTRAL_API_KEY")
    commitments = await get_or_extract_commitments()
    commitments = process_commitments(commitments, as_of)

    # 1. Deterministic fast-path (no API needed)
    det = _deterministic_answer(question, commitments)
    if det:
        return det

    # 2. No API key → helpful offline message
    if not api_key:
        return (
            "I couldn't match a deterministic answer for that question, "
            "and the Mistral API key is not configured for open-ended queries.\n\n"
            "Try one of these questions that always work offline:\n"
            "- What did I promise Raghav?\n"
            "- What needs action today?\n"
            "- Who owns the Mumbai lease?\n"
            "- What did I promise Priya?\n"
            "- Did Divya send the expense report?\n"
            "- Do I have any meeting conflicts on Thursday?"
        )

    # 3. Build full message array with system prompt + history + current question
    context_block = (
        f"COMMITMENTS DATA (simulated as-of {as_of}):\n"
        f"{json.dumps(commitments, indent=2)}"
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + context_block},
    ]
    # Inject conversation history
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    # Add current question
    messages.append({"role": "user", "content": question})

    payload = {
        "model": "mistral-small-latest",
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 600,
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
                timeout=25
            )
            if response.status_code == 429:
                return (
                    "The AI service is rate-limited right now. Please wait a moment and try again, "
                    "or use one of the suggested questions which always work offline."
                )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return (
                f"Unable to reach AI service ({type(e).__name__}). "
                "Try one of the suggested questions which always work offline."
            )
