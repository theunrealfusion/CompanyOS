from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Claim(BaseModel):
    id: str
    description: str
    confidence: float
    expected_benefit: Optional[float] = None
    expected_cost: Optional[float] = None
    expected_risk: Optional[float] = None
    evidence_ids: List[str] = []

class Proposal(BaseModel):
    id: str
    agent_id: str
    description: str
    claims: List[Claim] = []
    status: str = "proposed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Evidence(BaseModel):
    id: str
    agent_id: str
    description: str
    reference_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Friction(BaseModel):
    id: str
    organization_id: str
    subject: str
    conflict_type: str
    participants: List[str]
    proposals: List[Proposal] = []
    evidence: List[Evidence] = []
    status: str = "open"  # detected, open, challenged, evidence_requested, negotiating, resolved, escalated
    resolution_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
