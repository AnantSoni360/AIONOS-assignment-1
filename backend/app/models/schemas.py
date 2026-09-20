from typing import Optional, List
from pydantic import BaseModel

class Evidence(BaseModel):
    source_type: str
    source_id: str
    text: str
    timestamp: str

class Commitment(BaseModel):
    id: str
    action: str
    owner: Optional[str] = None
    waiting_on: Optional[str] = None
    deadline: Optional[str] = None
    status: str
    priority: str
    confidence: str
    evidence: List[Evidence]
