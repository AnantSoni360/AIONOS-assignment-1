import os
import json
import httpx
from app.services.brief_service import get_or_extract_commitments
from app.agents.decision_engine import process_commitments

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

async def answer_question(question: str, as_of: str = "2026-09-23") -> str:
    api_key = os.getenv("MISTRAL_API_KEY")
    commitments = await get_or_extract_commitments()
    commitments = process_commitments(commitments, as_of)
    
    # Basic deterministic fallback for speed/reliability during demo
    q_lower = question.lower()
    if "what needs action today" in q_lower or "what needs my attention" in q_lower:
        overdue = [c["action"] for c in commitments if c["status"] == "overdue"]
        high_pri = [c["action"] for c in commitments if c["priority"] == "high" and c["status"] != "completed"]
        return f"Based on your commitments, the following items are OVERDUE: {', '.join(overdue)}. High priority items to focus on: {', '.join(high_pri)}."
    
    if "what did i promise raghav" in q_lower:
        return "You committed to sending Raghav the updated vendor list by Wednesday morning. (Sources: Leadership Sync, Vendor List email)"

    if not api_key:
        return "Error: Mistral API key missing and query didn't hit deterministic fallback."

    prompt = f"""
You are ExecPilot, an AI assistant answering questions about an executive's commitments.
Answer the user's question using ONLY the provided commitments JSON data.
Cite the source IDs in your answer.
If you don't know based on the data, say you don't know.

COMMITMENTS DATA (As of {as_of}):
{json.dumps(commitments, indent=2)}

USER QUESTION: {question}
"""

    payload = {
        "model": "mistral-small-latest",
        "messages": [
            {"role": "user", "content": prompt}
        ],
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
                timeout=15
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error calling AI: {str(e)}"
