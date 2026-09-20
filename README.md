# ExecPilot AI

Executive Productivity Agent built for AIONOS Assignment 1 (Arjun Malhotra, VP Sales).

## Overview
ExecPilot AI turns messy executive inputs (meetings, emails, voice notes) into a trusted daily action brief.
It uses Mistral AI to extract commitments from unstructured text, and deterministic Python to resolve ownership, deduplicate actions, detect overdue items, and filter evidence by simulation clock.

## Architecture — "One Story"

- **Mistral AI (Extraction Layer):** The LLM's only job is to read messy, unstructured text (emails, transcripts, voice notes) and extract raw "commitments" and pieces of "evidence". It does **NOT** do date math or assign ownership. It must return ISO 8601 deadline strings.
- **Deterministic Python (Resolution Layer):** `decision_engine.py` is entirely deterministic:
  - Filters evidence by the "Time Machine" clock (`as_of` timestamp) — future evidence is hidden
  - Parses deadlines (ISO, date-only, and natural language like "morning" / "end of day")
  - Sets status to `overdue` when the clock exceeds the deadline
  - Enforces the Ownership Guard (null owner → `unowned` + `critical`)
- **Fallback:** If Mistral is unavailable (no key, timeout, rate limit), the system falls back to `seed_data.json` — a pre-validated, timestamped commitment set matching the exact data pack.

## Features
- **Ownership Guard:** Explicitly flags unowned tasks (e.g. Mumbai Lease) rather than inventing ownership.
- **Time Machine:** 5 scenario presets from Mon 9 AM → Fri 5 PM. Evidence grows over time. Overdue status kicks in exactly when the clock passes the deadline.
- **Deduplication:** Same commitment mentioned across meeting, email, and voice note → merged into one item with all source evidence preserved.
- **Evidence Trace:** Every commitment links back to original source text ("Why I Know This" drawer).
- **Daily Action Dashboard:** Split view — MY ACTIONS vs WAITING ON / UNOWNED. All counters match the cards.
- **Q&A:** 8 deterministic handlers for the most common executive questions. No API key needed.

## Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS, deployed on Vercel
- **Backend:** FastAPI (Python), deployed on Render
- **LLM:** Mistral AI (`mistral-small-latest`)

## Environment Variables
```
MISTRAL_API_KEY=<your key>          # Backend — for live extraction and open-ended Q&A
NEXT_PUBLIC_API_URL=<backend url>   # Frontend — points to Render backend
```

## How to Run

### 1. Run the Backend
```bash
# Mac/Linux:
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
MISTRAL_API_KEY=your_key uvicorn app.main:app --reload

# Windows (PowerShell):
cd backend
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
$env:MISTRAL_API_KEY="your_key"
uvicorn app.main:app --reload
```
Backend runs on `http://127.0.0.1:8000`. Works WITHOUT an API key (falls back to seed data).

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev         # Mac/Linux
npm.cmd run dev     # Windows PowerShell
```
Frontend runs on `http://localhost:3000`.

## AI Tools Used
- **Mistral AI** (`mistral-small-latest`): Used for commitment extraction only. Prompted with zero-shot JSON schema requiring ISO 8601 deadlines and per-evidence timestamps. Validation via Pydantic before downstream use.
- **Antigravity IDE (Gemini)**: Used to scaffold the Next.js + FastAPI structure, assist with the deterministic decision engine, and iterate on the time-filtering logic.
