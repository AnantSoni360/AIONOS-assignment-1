import os
import json
import httpx

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

async def extract_commitments(text: str):
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        return {"error": "No Mistral API key provided"}

    prompt = f"""
You are ExecPilot AI, an executive productivity agent.

Extract ONLY information explicitly supported by the input.

Identify:
- commitments
- actions
- owners
- people being waited on
- deadlines
- status
- ambiguity

Rules:
1. Never invent ownership.
2. Never invent deadlines.
3. Preserve uncertainty.
4. If ownership is unclear, return null.
5. Return valid JSON only.

INPUT:
{text}
"""

    payload = {
        "model": "mistral-small-latest",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0
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
            timeout=30
        )

        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        return json.loads(content)
