import asyncio
from app.services.brief_service import generate_brief

async def main():
    times = [
        ("a) Mon 21 Sep 09:40 AM", "2026-09-21T09:40:00"),
        ("b) Mon 21 Sep 06:45 PM", "2026-09-21T18:45:00"),
        ("c) Tue 22 Sep 06:35 PM", "2026-09-22T18:35:00"),
        ("d) Wed 23 Sep 08:50 AM", "2026-09-23T08:50:00"),
        ("e) Wed 23 Sep 06:15 PM", "2026-09-23T18:15:00"),
        ("f) Thu 24 Sep 04:50 PM", "2026-09-24T16:50:00"),
        ("g) Fri 25 Sep 09:00 AM", "2026-09-25T09:00:00")
    ]
    for label, t in times:
        print(f"=== {label} ===")
        brief = await generate_brief(t)
        for c in brief['commitments']:
            print(f"[{c['id']}] {c['action']}")
            print(f"    Owner: {c.get('owner')} | Status: {c.get('status')} | Deadline: {c.get('deadline')}")
            print(f"    Evidence count: {len(c.get('evidence', []))}")
        print("\n")

if __name__ == '__main__':
    asyncio.run(main())
