from fastapi import APIRouter
from pydantic import BaseModel
from app.services.brief_service import generate_brief
from app.services.qa_service import answer_question

router = APIRouter()

class AskRequest(BaseModel):
    question: str
    as_of: str = "2026-09-23"

@router.get("/health")
def health():
    return {
        "status": "healthy"
    }

@router.get("/brief")
async def get_brief(as_of: str = "2026-09-23"):
    return await generate_brief(as_of)

@router.post("/ask")
async def ask_execpilot(req: AskRequest):
    answer = await answer_question(req.question, req.as_of)
    return {"answer": answer}

@router.post("/refresh")
async def refresh_agent(as_of: str = "2026-09-23"):
    import os
    from app.services.brief_service import CACHE_FILE
    if CACHE_FILE.exists():
        os.remove(CACHE_FILE)
    return await generate_brief(as_of)
