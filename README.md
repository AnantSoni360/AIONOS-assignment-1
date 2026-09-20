# ExecPilot AI

Executive Productivity Agent built for AIONOS Assignment 1 (Arjun Malhotra, VP Sales).

## Overview
ExecPilot AI turns messy executive inputs (meetings, emails, voice notes) into a trusted daily action brief.
It uses AI to extract intent, and deterministic code to resolve ownership, deduplicate actions, and track deadlines. 

## Features
- **Ownership Guard:** Explicitly flags unowned tasks (e.g. Mumbai Lease) rather than inventing ownership.
- **Deduplication Engine:** Merges overlapping tasks from different sources (e.g. Vendor list mentioned in meeting and email) into a single commitment with updated state.
- **Evidence Trace:** Every commitment links directly back to original source text (the "Why I Know This" feature).
- **Daily Action Dashboard:** White/Orange enterprise UI showing Action summaries, today's attention, and an "Ask ExecPilot" Q&A feature.

## Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** FastAPI (Python)
- **LLM:** Mistral AI

## How to Run

### 1. Run the Backend
```bash
# Mac/Linux:
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Windows (PowerShell):
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend will run on `http://127.0.0.1:8000`.

### 2. Run the Frontend
```bash
# Mac/Linux:
cd frontend
npm install
npm run dev

# Windows (PowerShell):
cd frontend
npm.cmd install
npm.cmd run dev
```
Frontend will run on `http://localhost:3000`.

## System Architecture & The "One Story"
- **Mistral AI (Extraction Layer):** The LLM's only job is to read the messy, unstructured text (emails, transcripts, voice notes) and extract raw "commitments" and pieces of "evidence". It does NOT do date math or assign ownership.
- **Deterministic Python (Resolution Layer):** The `decision_engine.py` is entirely deterministic. It filters evidence based on the "Time Machine" clock (preventing future leaks), resolves the final status (e.g. `overdue` vs `pending`) using strict `datetime` math, and enforces the Ownership Guard (preventing hallucinated owners).

