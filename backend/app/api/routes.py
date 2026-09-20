from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.brief_service import generate_brief
from app.services.qa_service import answer_question

router = APIRouter()

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class AskRequest(BaseModel):
    question: str
    as_of: str = "2026-09-23T09:00:00"
    history: List[ChatMessage] = []

@router.get("/health")
def health():
    return {"status": "healthy"}

@router.get("/brief")
async def get_brief(as_of: str = "2026-09-23T09:00:00"):
    return await generate_brief(as_of)

@router.post("/ask")
async def ask_execpilot(req: AskRequest):
    history = [{"role": m.role, "content": m.content} for m in req.history]
    answer = await answer_question(req.question, req.as_of, history)
    return {"answer": answer}

@router.post("/refresh")
async def refresh_agent(as_of: str = "2026-09-23T09:00:00"):
    import os
    from app.services.brief_service import CACHE_FILE
    if CACHE_FILE.exists():
        os.remove(CACHE_FILE)
    return await generate_brief(as_of)
