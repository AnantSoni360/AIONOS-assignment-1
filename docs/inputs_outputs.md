# ExecPilot AI: Inputs & Outputs

> **Inputs:** messy executive information.
> **Processing:** extract → validate → reason → track.
> **Outputs:** trusted actions, priorities, answers, and evidence.

## The Input → Agent → Output Flow

```text
┌─────────────────────────┐
│        INPUTS           │
│                         │
│ Emails                  │
│ Meetings                │
│ Voice Notes             │
│ Calendar                │
│ User Questions          │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│     EXECPILOT AGENT     │
│                         │
│ Extract                 │
│ Normalize               │
│ Deduplicate             │
│ Validate                │
│ Track                   │
│ Decide                  │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│        OUTPUTS          │
│                         │
│ Commitments             │
│ Daily Action Brief      │
│ Overdue Actions         │
│ Waiting-On Items        │
│ Unowned Items           │
│ Evidence / Audit Trail  │
│ Natural-Language Q&A    │
└─────────────────────────┘
```

## Detailed Breakdown

### Inputs

| Input | What ExecPilot uses it for |
|-------|----------------------------|
| 📧 **Emails / Email threads** | Promises, requests, deadline changes, confirmations |
| 📝 **Meeting notes / transcripts** | Commitments, decisions, action items |
| 🎙️ **Voice notes** | Executive's own reminders and commitments |
| 📅 **Calendar events** | Meeting context and timing |
| 📄 **Documents / SOPs** *(future extension)* | Supporting context and policies |
| 💬 **Natural-language questions** | Executive asks about commitments and priorities |

### Outputs

1. **Structured Commitments:** Canonical action, owner, recipient, deadline, status, priority.
2. **Daily Executive Brief:** A unified dashboard showing Today's Attention, Overdue items, High Priority items, Unowned risks, and Waiting On items.
3. **Commitment Status:** Categorized by "My Action", "Waiting on Others", "Completed", "Overdue", and "Unowned / Ambiguous".
4. **Evidence / Source Trace:** Explains *why* a decision was made (e.g., "Why is this overdue?") by presenting the exact source texts (Meeting + Email thread + Voice Note).
5. **Natural-Language Answers:** Direct responses to executive queries like "What did I promise Raghav?" backed by cited sources.
