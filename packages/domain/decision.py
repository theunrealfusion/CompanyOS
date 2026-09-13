from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Decision(BaseModel):
    id: str
    organization_id: str
    friction_id: Optional[str] = None
    objective_id: Optional[str] = None
    description: str
    chosen_proposal_id: Optional[str] = None
    arguments: List[str] = []
    risks: List[str] = []
    decision_score: float = 0.0
    required_authority: int = 0
    approvers: List[str] = []
    status: str = "pending_approval" # pending_approval, approved, rejected, executed
    actual_outcome: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
