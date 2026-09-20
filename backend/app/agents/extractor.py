import os
import json
import httpx
import re
from app.models.schemas import Commitment
from pydantic import ValidationError

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

async def extract_commitments(raw_sources: list) -> list:
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise ValueError("No Mistral API key provided in environment.")

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
5. DEADLINES: Never invent deadlines. Extract them exactly as stated.
6. STATUS & PRIORITY: Set status to "pending" for all items (the decision engine will calculate if it's overdue later). Set priority to "high" or "medium" or "critical" based on context.

You must output ONLY valid JSON matching this schema exactly:
{{
  "commitments": [
    {{
      "id": "C001",
      "action": "Send updated vendor list to Raghav",
      "owner": "Arjun Malhotra",
      "waiting_on": null,
      "deadline": "2026-09-23 morning",
      "status": "pending",
      "priority": "high",
      "confidence": "high",
      "evidence": [
        {{
          "source_type": "email",
          "source_id": "Vendor List",
          "text": "will send by tomorrow (Wednesday) morning for sure."
        }}
      ]
    }}
  ]
}}

Do not include any markdown formatting or explanations. Output pure JSON.

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
        response = await client.post(
            MISTRAL_API_URL,
            headers=headers,
            json=payload,
            timeout=45
        )

        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        # Clean markdown fences if any are returned accidentally
        content = re.sub(r'^```json\s*|\s*```$', '', content.strip())
        
        parsed = json.loads(content)
        commitments = parsed.get("commitments", [])
        
        # Validate through Pydantic
        valid_commitments = []
        for c in commitments:
            try:
                validated = Commitment(**c)
                valid_commitments.append(validated.dict())
            except ValidationError as e:
                print(f"Validation error for commitment {c}: {e}")
        
        return valid_commitments
