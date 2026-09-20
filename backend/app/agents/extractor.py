import os
import json
import httpx
import re
from pathlib import Path
from app.models.schemas import Commitment
from pydantic import ValidationError

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

def _load_seed_fallback() -> list:
    """Load seed_data.json as a reliable fallback when Mistral is unavailable."""
    seed_file = Path(__file__).resolve().parent.parent / "data" / "seed_data.json"
    with open(seed_file, "r", encoding="utf-8") as f:
        return json.load(f)["commitments"]

async def extract_commitments(raw_sources: list) -> list:
    api_key = os.getenv("MISTRAL_API_KEY")

    # Gracefully fall back to seed data when API key is missing
    if not api_key:
        print("No Mistral API key found — falling back to seed_data.json")
        return _load_seed_fallback()

    # Prepare the input data string
    sources_str = json.dumps(raw_sources, indent=2)

    prompt = f"""
You are ExecPilot AI, an executive productivity agent.
Your task is to extract commitments from the provided raw sources (meetings, emails, voice notes).

CRITICAL INSTRUCTIONS:
1. IDENTIFY commitments, actions, owners, people being waited on, and deadlines.
2. DEDUPLICATE: If the same real-world commitment is mentioned across multiple sources (e.g. sending a vendor list), merge them into ONE single commitment object.
3. EVIDENCE: Add multiple evidence entries for a merged commitment, citing each source where it was mentioned.
4. OWNERSHIP: Never invent ownership. If ownership is unclear or unassigned, set owner to null.
5. DEADLINES: Never invent deadlines. Extract them exactly as stated. ALL deadlines MUST be formatted as ISO 8601 datetime strings (e.g. "2026-09-23T12:00:00"). Use T09:00:00 for "morning", T17:00:00 for "evening/end of day", T12:00:00 for "noon", T15:00:00 for specific times like "3 PM". If no deadline, use null.
6. STATUS & PRIORITY: Set status to "pending" for all items (the decision engine will calculate if it's overdue later). Set priority to "high", "medium", or "critical" based on context.
7. TIMESTAMPS: Each evidence entry MUST include the exact timestamp from the source, formatted as ISO 8601 (e.g. "2026-09-21T09:35:00").

You must output ONLY valid JSON matching this schema exactly:
{{
  "commitments": [
    {{
      "id": "C001",
      "action": "Send updated vendor list to Raghav",
      "owner": "Arjun Malhotra",
      "waiting_on": null,
      "deadline": "2026-09-23T09:00:00",
      "status": "pending",
      "priority": "high",
      "confidence": "high",
      "evidence": [
        {{
          "source_type": "email",
          "source_id": "Thread 1 - Vendor List 4",
          "text": "will send by tomorrow (Wednesday) morning for sure.",
          "timestamp": "2026-09-22T18:30:00"
        }}
      ]
    }}
  ]
}}

Do not include any markdown formatting or explanations. Output pure JSON only.

INPUT SOURCES:
{sources_str}
"""

    payload = {
        "model": "mistral-small-latest",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"}
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
                timeout=60
            )
            if response.status_code == 429:
                print("Mistral rate limit (429) — falling back to seed_data.json")
                return _load_seed_fallback()
            response.raise_for_status()
            result = response.json()
        except (httpx.HTTPError, httpx.TimeoutException) as e:
            print(f"Mistral API error: {e}. Falling back to seed_data.json")
            return _load_seed_fallback()

        content = result["choices"][0]["message"]["content"]

        # Clean markdown fences if any are returned accidentally
        content = re.sub(r'^```json\s*|\s*```$', '', content.strip())

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}. Falling back to seed_data.json")
            return _load_seed_fallback()

        commitments = parsed.get("commitments", [])

        # Validate through Pydantic
        valid_commitments = []
        for c in commitments:
            try:
                validated = Commitment(**c)
                valid_commitments.append(validated.dict())
            except ValidationError as e:
                print(f"Validation error for commitment {c.get('id', '?')}: {e}")

        # If LLM returned nothing usable, fall back
        if not valid_commitments:
            print("LLM returned no valid commitments — falling back to seed_data.json")
            return _load_seed_fallback()

        return valid_commitments
