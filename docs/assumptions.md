# Inputs, Sources, and Assumptions

## Inputs & Sources
This prototype uses exactly the data provided in the `Assignment 1_DataPack_ExecutiveProductivityAgent.pdf` without hallucinating external information.

The source data consists of:
1. **Meeting Transcript:** Leadership Sync (Monday, Sept 21)
2. **Email Threads (5):** Vendor List, Q3 Campaign Deck, Call Reschedule, Expense Variance Report, Mumbai Office Lease Renewal.
3. **Voice Notes (2):** Personal dictates recorded by Arjun.
4. **Calendar Context:** Used to cross-reference timing (e.g., "Thursday morning for board prep block").

## Assumptions & Agent Constraints

1. **Current Date:** The system assumes the current evaluation context is **Wednesday, September 23, 2026**. Deadlines prior to this date without completion confirmation are flagged as `OVERDUE`.
2. **Explicit Grounding Constraint:** The agent operates under the strict assumption that it cannot invent facts. Therefore, any task without a clearly documented owner (e.g., the Mumbai Office Lease) is assumed `UNOWNED` and flagged for the executive.
3. **Data Pre-processing:** To ensure a reliable, repeatable demo for AIONOS reviewers without exhausting LLM API limits, the initial Mistral extraction pass has been serialized into `seed_data.json`. The Python intelligence layer still processes this data deterministically.
