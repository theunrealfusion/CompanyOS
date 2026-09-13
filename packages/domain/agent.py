from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Agent(BaseModel):
    id: str
    organization_id: str
    name: str
    role: str
    mission: str
    system_instructions: str
    model_provider: str
    model: str
    capabilities: List[str] = Field(default_factory=list)
    authority: int = 0
    budget: float = 0.0
    risk_tolerance: str = "medium"
    escalation_policy: str = "human"
    memory_policy: str = "standard"
    status: str = "active"
