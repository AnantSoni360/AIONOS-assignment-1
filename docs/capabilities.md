# ExecPilot AI: Capabilities

> **“ExecPilot converts messy executive inputs into traceable commitments, resolves deadlines and ownership, detects risks and overdue actions, and delivers an evidence-backed daily action brief.”**

**Agent Architecture Loop:**  
**Observe → Extract → Normalize → Deduplicate → Validate → Decide → Track → Brief → Answer**

## Agent Capability List

1. **Multi-Source Input Processing**
   * Meeting notes/transcripts
   * Emails and email threads
   * Voice notes
   * Calendar context

2. **Commitment Extraction**
   * Detects promises and action items
   * Identifies **who needs to do what**
   * Extracts recipient/stakeholder
   * Extracts deadlines

3. **Deadline Intelligence**
   * Tracks changing deadlines
   * Resolves the latest agreed deadline
   * Detects overdue commitments
   * Distinguishes completed vs pending work

4. **Ownership Intelligence**
   * Identifies the responsible person when explicitly supported
   * Detects missing/unclear ownership
   * **Does not invent an owner**

5. **Commitment Deduplication**
   * Detects the same commitment across meeting + email + voice
   * Merges evidence into a single commitment
   * Maintains all relevant source references

6. **Priority & Attention Detection**
   * Identifies critical/high/medium attention items
   * Surfaces overdue and unowned items
   * Highlights what requires executive attention

7. **Waiting-On Tracking**
   * Separates:
     * **My Actions**
     * **Waiting on Others**
     * **Unowned**
     * **Completed**

8. **Evidence & Traceability**
   * Every commitment links back to its source
   * Shows supporting email/meeting/voice evidence
   * Allows the executive to understand **“Why did the agent decide this?”**

9. **Executive Daily Brief**
   * Generates a concise daily action summary
   * Today's priorities
   * Overdue commitments
   * Waiting items
   * Unowned issues
   * Upcoming deadlines

10. **Natural-Language Executive Q&A**
    * “What did I promise Raghav?”
    * “What needs action today?”
    * “What am I waiting for?”
    * “Which items have unclear ownership?”
    * “Why is this commitment overdue?”

11. **Decision Guardrails**
    * Does not assume missing information
    * Does not convert calendar events automatically into commitments
    * Uses deterministic logic for deadlines/status
    * Escalates ambiguity instead of hallucinating an answer

12. **Audit Trail**
    * Records extracted action
    * Owner
    * Deadline
    * Status
    * Evidence/source
    * Decision/reasoning
