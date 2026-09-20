# ExecPilot AI: Architecture & Process Flow

## 1. High-Level Architecture (Reusable Agentic Pipeline)

The architecture is designed as one reusable Agentic Decision Pipeline that can power three possible business applications. While this working prototype deeply implements **Case 1 (Executive Productivity Agent)**, the engine is built to support internal service and customer-facing cases as well.

```text
                 ┌──────────────────────────┐
                 │       DATA SOURCES       │
                 │ Email • Meeting • Voice  │
                 │ Calendar • Documents     │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │    AGENTIC AI ENGINE     │
                 │                          │
                 │ Extract → Normalize      │
                 │ Deduplicate → Validate   │
                 │ Decide → Track Evidence  │
                 └────────────┬─────────────┘
                              ↓
              ┌───────────────┼────────────────┐
              ↓               ↓                ↓
        Executive         Internal         Customer
       Productivity        Service         Resolution
          Agent             Agent             Agent
              ↓               ↓                ↓
        Action Brief       Resolve /        Recommend /
        + Q&A               Escalate          Execute
              └───────────────┼────────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │   AUDITABLE OUTCOME      │
                 │ Action + Owner + Status  │
                 │ Evidence + Audit Trail   │
                 └──────────────────────────┘
```

## 2. Implemented Flow: Executive Productivity Agent (Case 1)

For the ExecPilot implementation, the flow specifically turns messy executive inputs into a reliable daily action brief.

```text
                    ┌───────────────────┐
                    │ SUPPLIED DATA PACK│
                    └─────────┬─────────┘
                              ↓
                       SOURCE INGESTION
                              ↓
                  ┌──────────────────────┐
                  │ Meeting              │
                  │ Email                │
                  │ Calendar             │
                  │ Voice                │
                  └──────────┬───────────┘
                             ↓
                       MISTRAL EXTRACTION
                             ↓
                    CANDIDATE COMMITMENTS
                             ↓
                    NORMALIZATION ENGINE
                             ↓
                   DEDUPLICATION ENGINE
                             ↓
                    DEADLINE RESOLUTION
                             ↓
                    OWNERSHIP GUARD
                             ↓
                    STATUS RESOLUTION
                             ↓
                  ┌─────────────────────┐
                  │ TRUSTED COMMITMENTS │
                  └──────────┬──────────┘
                             ↓
                ┌────────────┴────────────┐
                ↓                         ↓
         DAILY EXECUTIVE BRIEF       ASK EXECPILOT
                ↓                         ↓
             DASHBOARD             ANSWER + EVIDENCE
```

## 3. Component Breakdown

1. **Mistral Extractor Layer:** Uses Mistral API (or mocked equivalent for deterministic demos) to perform NLP over raw text and identify intent (actions, people, dates).
2. **Deduplicator Engine (Python):** Identifies overlapping commitments (e.g., the Vendor List mentioned in a meeting, an email, and a voice note) and merges them into a single trackable task while retaining the full evidence graph.
3. **Decision & Guard Layer (Python):** 
   - Calculates `overdue` vs `completed` state based on hardcoded dates.
   - **Ownership Guard:** Validates if an explicit owner was assigned. If not (like the Mumbai lease), it rejects assumptions and forces the task into `UNOWNED` status.
4. **FastAPI Backend:** Serves the structured, verified data as a REST API (`/api/brief`).
5. **Next.js Frontend:** Provides an executive dashboard with clear actionable alerts and traceable evidence.
