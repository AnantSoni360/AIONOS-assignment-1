# ExecPilot AI: Capabilities

> **"ExecPilot converts messy executive inputs into traceable commitments, resolves deadlines and ownership, detects risks and overdue actions, and delivers an evidence-backed daily action brief."**

**Agent Architecture Loop:**  
**Observe → Extract → Normalize → Deduplicate → Validate → Decide → Track → Brief → Answer**

## Agent Capability List

1. **Multi-Source Input Processing** `[DONE]`
   * Meeting notes/transcripts (verbatim from data pack)
   * 25 emails across 5 threads (with exact ISO timestamps)
   * 2 voice notes (with correct dates/times)
   * Calendar events (1 — Board Prep Thu 9:00–10:00 AM)

2. **Commitment Extraction** `[DONE]`
   * Mistral AI extracts commitments from raw unstructured text
   * Graceful fallback to `seed_data.json` when API key is unavailable or API fails
   * Evidence timestamps extracted and stored per-piece

3. **Deadline Intelligence** `[DONE]`
   * Decision engine parses ISO 8601 (`2026-09-23T12:00:00`), date-only, and natural language deadlines (`morning`, `end of day`, `evening`)
   * Correctly marks items as `overdue` when simulation clock exceeds deadline
   * Vendor list: OVERDUE after Wed 12:00 PM

4. **Ownership Intelligence** `[DONE]`
   * Identifies the responsible person when explicitly stated
   * Detects missing/unclear ownership (Mumbai lease → `unowned`)
   * **Does not invent an owner**

5. **Commitment Deduplication** `[DONE via LLM]`
   * Mistral merges same commitment across meeting + email + voice into one object
   * All source evidence retained in the `evidence[]` array
   * Deterministic fallback (`seed_data.json`) has pre-merged commitments

6. **Priority & Attention Detection** `[DONE]`
   * `overdue` and `unowned` items auto-escalate to `critical` priority
   * Evidence count grows as the simulation clock advances

7. **Waiting-On Tracking** `[DONE]`
   * My Actions: `owner === "Arjun Malhotra" && !waiting_on`
   * Waiting on Others: `waiting_on !== null`
   * Unowned: `owner === null`
   * Completed: `status === "completed"`

8. **Evidence & Traceability** `[DONE]`
   * Every commitment links to per-source text quotes
   * Evidence is time-filtered: future evidence hidden when `as_of` is earlier
   * "Why I Know This" drawer in UI shows growing evidence count per scenario

9. **Executive Daily Brief** `[DONE]`
   * Summary counters (Total / Overdue / My Actions / Waiting+Unowned)
   * Time-scenario presets (Mon 9 AM → Fri 5 PM)
   * All counters derived from same filtered list as cards (no mismatch)

10. **Natural-Language Executive Q&A** `[DONE — 8 deterministic handlers]`
    * "What did I promise Raghav?" ✅ Cites all 3 deadline slips
    * "What needs action today?" ✅ Shows overdue + pending + unowned
    * "Who owns the Mumbai lease?" ✅ Explains UNOWNED with sources
    * "What did I promise Priya?" ✅ Cites Meridian call thread
    * "Did Divya send the expense report?" ✅ Date-aware (pending vs completed)
    * "Do I have any meeting conflicts on Thursday?" ✅ Detects deck/board prep overlap
    * "What is overdue?" ✅ Dynamic list from current as_of
    * "What am I waiting on?" ✅ Dynamic list from current as_of
    * Anything else → Mistral context-stuffed (when API key available)

11. **Decision Guardrails** `[DONE]`
    * Never assigns ownership from vague context
    * Never invents deadlines
    * Escalates ambiguity (unowned → critical)

12. **Calendar Conflict Detection** `[PARTIAL]`
    * Detects Neha's 9:30 AM deck review vs Board Prep 9:00–10:00 AM
    * Conflict triggered by `deadline === "2026-09-24T09:30:00"` (data-driven)
    * Only 1 calendar in data pack (Arjun's Board Prep) — other 3 not provided
