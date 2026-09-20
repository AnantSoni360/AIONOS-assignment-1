# Core Assumptions & Constraints

1. **Verbatim Data:** We assume the agent must process exactly what was provided in the data pack, without inventing ownership or paraphrasing inputs to make the AI's job easier.
2. **Time-of-Day Matters:** Since multiple emails arrive on the same calendar day (e.g., Wednesday), we assume the simulation clock must run at a time-of-day level (e.g., `2026-09-23T08:45:00`).
3. **LLM Non-determinism:** We assume that LLMs cannot reliably perform complex date math (e.g. "is Thursday after Wednesday 3pm?"). Thus, we use strict Python `datetime` for all logic and status calculations.
4. **Ownership Guard:** We assume it is safer for an executive agent to flag a task as UNOWNED than to hallucinate an incorrect owner based on vague context.
