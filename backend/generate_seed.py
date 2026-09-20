import json
import os

data = {
    "commitments": [
        {
            "id": "vendor-list-001",
            "action": "Send updated vendor list to Raghav",
            "owner": "Arjun Malhotra",
            "waiting_on": None,
            "deadline": "2026-09-23T12:00:00",
            "status": "pending",
            "priority": "high",
            "confidence": "high",
            "evidence": [
                {
                    "source_type": "meeting_transcript",
                    "source_id": "Leadership Sync",
                    "text": "I told Raghav I'd send him the updated vendor list. I'll get that to him by end of day tomorrow.",
                    "timestamp": "2026-09-21T09:35:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 1 - Vendor List 1",
                    "text": "can you send the updated vendor list today?",
                    "timestamp": "2026-09-21T09:50:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 1 - Vendor List 2",
                    "text": "Running behind, will send first thing tomorrow morning instead.",
                    "timestamp": "2026-09-21T17:40:00"
                },
                {
                    "source_type": "voice_note",
                    "source_id": "Voice Note 1",
                    "text": "need to get Raghav that vendor list, I think I said today but it might slip to tomorrow morning",
                    "timestamp": "2026-09-21T18:40:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 1 - Vendor List 3",
                    "text": "No worries, whenever you get a chance today works.",
                    "timestamp": "2026-09-22T09:15:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 1 - Vendor List 4",
                    "text": "Sorry, got pulled into board prep - will send by tomorrow (Wednesday) morning for sure.",
                    "timestamp": "2026-09-22T18:30:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 1 - Vendor List 5",
                    "text": "Just checking - still good for this morning?",
                    "timestamp": "2026-09-23T08:45:00"
                }
            ]
        },
        {
            "id": "q3-campaign-deck-002",
            "action": "Review Q3 campaign deck from Neha",
            "owner": "Arjun Malhotra",
            "waiting_on": "Neha Kapoor",
            "deadline": "2026-09-24T09:30:00",
            "status": "pending",
            "priority": "medium",
            "confidence": "high",
            "evidence": [
                {
                    "source_type": "meeting_transcript",
                    "source_id": "Leadership Sync",
                    "text": "Draft is 80% done. I'll send it to Arjun for review by Wednesday... realistically Thursday morning is safer.",
                    "timestamp": "2026-09-21T09:35:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 2 - Q3 Campaign Deck 1",
                    "text": "Deck's coming together, still targeting Wednesday for your review.",
                    "timestamp": "2026-09-21T11:00:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 2 - Q3 Campaign Deck 2",
                    "text": "shifting the review to Thursday morning instead of Wednesday",
                    "timestamp": "2026-09-22T16:15:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 2 - Q3 Campaign Deck 4",
                    "text": "Let's say 9:30 AM Thursday, before your board prep block.",
                    "timestamp": "2026-09-23T10:20:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 2 - Q3 Campaign Deck 5",
                    "text": "Deck is ready, attaching the draft ahead of our 9:30 review.",
                    "timestamp": "2026-09-24T08:00:00"
                }
            ]
        },
        {
            "id": "expense-variance-003",
            "action": "Review July expense variance report from Divya",
            "owner": "Arjun Malhotra",
            "waiting_on": "Divya Rao",
            "deadline": "2026-09-23T18:00:00",
            "status": "pending",
            "priority": "high",
            "confidence": "high",
            "evidence": [
                {
                    "source_type": "meeting_transcript",
                    "source_id": "Leadership Sync",
                    "text": "Divya, can you also pull the July expense variance report before Thursday's board prep? Divya: Yes, I'll have it ready Wednesday evening.",
                    "timestamp": "2026-09-21T09:35:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 4 - Expense Variance Report 1",
                    "text": "Starting on the July variance numbers, targeting Thursday morning for board prep as discussed.",
                    "timestamp": "2026-09-21T14:30:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 4 - Expense Variance Report 2",
                    "text": "Actually, can I get it by Wednesday evening instead? Want time to review before Thursday.",
                    "timestamp": "2026-09-22T09:00:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 4 - Expense Variance Report 3",
                    "text": "Wednesday evening is tight but doable, I'll prioritize it.",
                    "timestamp": "2026-09-22T09:40:00"
                },
                {
                    "source_type": "voice_note",
                    "source_id": "Voice Note 2",
                    "text": "expense variance report from Divya needs to be in my hands by Wednesday evening, not Thursday",
                    "timestamp": "2026-09-23T08:15:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 4 - Expense Variance Report 4",
                    "text": "Report attached, sent as promised.",
                    "timestamp": "2026-09-23T18:00:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 4 - Expense Variance Report 5",
                    "text": "Got it, thank you \u2014 exactly what I needed before tomorrow.",
                    "timestamp": "2026-09-23T18:10:00"
                }
            ]
        },
        {
            "id": "mumbai-lease-004",
            "action": "Confirm ownership of Mumbai office lease renewal",
            "owner": None,
            "waiting_on": None,
            "deadline": "2026-09-25T17:00:00",
            "status": "pending",
            "priority": "high",
            "confidence": "high",
            "evidence": [
                {
                    "source_type": "email",
                    "source_id": "Thread 5 - Mumbai Office Lease Renewal 1",
                    "text": "Reminder: the Mumbai office lease renewal requires an authorized signature by Friday, 25 September.",
                    "timestamp": "2026-09-21T10:15:00"
                },
                {
                    "source_type": "meeting_transcript",
                    "source_id": "Leadership Sync",
                    "text": "the Mumbai office renewal paperwork needs someone to sign off this week... Divya: I think that's supposed to be Facilities, but I haven't seen anyone pick it up. Arjun: Okay, flag it, don't assume.",
                    "timestamp": "2026-09-21T09:35:00"
                },
                {
                    "source_type": "voice_note",
                    "source_id": "Voice Note 1",
                    "text": "still haven't heard back on the Mumbai lease thing, someone needs to own that, I don't think it's me.",
                    "timestamp": "2026-09-21T18:40:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 5 - Mumbai Office Lease Renewal 2",
                    "text": "has anyone confirmed who's signing off on the Mumbai renewal? Don't think it's been assigned.",
                    "timestamp": "2026-09-22T11:00:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 5 - Mumbai Office Lease Renewal 3",
                    "text": "Not on my end - I believe this typically sits with Facilities directly, not us.",
                    "timestamp": "2026-09-23T09:30:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 5 - Mumbai Office Lease Renewal 4",
                    "text": "Second reminder: signature is still pending. Deadline is Friday, 25 September, end of day.",
                    "timestamp": "2026-09-24T16:00:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 5 - Mumbai Office Lease Renewal 5",
                    "text": "This is now one day out and still unowned - can you confirm who's handling it?",
                    "timestamp": "2026-09-24T16:45:00"
                }
            ]
        },
        {
            "id": "meridian-call-005",
            "action": "Reconfirm Meridian Logistics call time with Priya",
            "owner": "Arjun Malhotra",
            "waiting_on": None,
            "deadline": "2026-09-23T15:00:00",
            "status": "pending",
            "priority": "medium",
            "confidence": "high",
            "evidence": [
                {
                    "source_type": "meeting_transcript",
                    "source_id": "Leadership Sync",
                    "text": "client call with Meridian Logistics got pushed. I need to reconfirm the new time with their team myself.",
                    "timestamp": "2026-09-21T09:35:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 3 - Call Reschedule 1",
                    "text": "Our scheduled call this week got bumped from our side - can you propose a new time?",
                    "timestamp": "2026-09-21T13:00:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 3 - Call Reschedule 2",
                    "text": "Apologies for the delay - how about Wednesday 3:00 PM?",
                    "timestamp": "2026-09-22T15:00:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 3 - Call Reschedule 3",
                    "text": "Wednesday 3 PM works on our end, confirmed.",
                    "timestamp": "2026-09-22T17:45:00"
                },
                {
                    "source_type": "voice_note",
                    "source_id": "Voice Note 2",
                    "text": "Also Meridian call - I owe Priya a time, need to lock that in today.",
                    "timestamp": "2026-09-23T08:15:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 3 - Call Reschedule 4",
                    "text": "Quick check - still on for 3 PM today?",
                    "timestamp": "2026-09-23T13:30:00"
                },
                {
                    "source_type": "email",
                    "source_id": "Thread 3 - Call Reschedule 5",
                    "text": "Yes, confirmed, see you at 3.",
                    "timestamp": "2026-09-23T14:00:00"
                }
            ]
        }
    ]
}

path = os.path.join(os.path.dirname(__file__), "app", "data", "seed_data.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)
print("Generated seed_data.json successfully!")
