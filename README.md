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
- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons
- **Backend:** FastAPI (Python), Uvicorn
- **LLM:** Mistral AI (For candidate extraction)
- **Data:** JSON-based persistence (Prototype)

## How to Run

### 1. Run the Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend will run on `http://127.0.0.1:8000`.

### 2. Run the Frontend
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Frontend will run on `http://localhost:3000`.

*(Note: On Windows PowerShell, if you face an execution policy error, use `npm.cmd` instead of `npm` or run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted`)*

## AI Tools Used
- Mistral-small-latest (Agentic Extraction Layer)
- Gemini (Code Generation & Planning)
