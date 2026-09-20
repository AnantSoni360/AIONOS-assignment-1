import asyncio
from app.services.qa_service import answer_question
from app.services.brief_service import generate_brief

async def main():
    questions = [
        "What did I promise Raghav?",
        "What needs action today?",
        "Who owns the Mumbai lease renewal?",
        "What did I promise Priya?",
        "Did Divya send the expense report?",
        "Do I have any meeting conflicts on Thursday?"
    ]
    for q in questions:
        ans = await answer_question(q, "2026-09-23T09:00:00")
        print(f"Q: {q}\nA: {ans}\n")

if __name__ == '__main__':
    asyncio.run(main())
