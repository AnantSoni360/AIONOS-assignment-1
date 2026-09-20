from fastapi import APIRouter
from app.services.brief_service import generate_brief

router = APIRouter()

@router.get("/health")
def health():
    return {
        "status": "healthy"
    }

@router.get("/brief")
def get_brief():
    return generate_brief()
