from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Objective(BaseModel):
    id: str
    organization_id: str
    description: str
    owner: str
    priority: str = "medium"
    deadline: Optional[datetime] = None
    kpis: List[str] = []
    status: str = "active"
    strategic_alignment: str

class Project(BaseModel):
    id: str
    organization_id: str
    name: str
    objective_id: Optional[str] = None
    owner: str
    status: str = "active"
    depends_on: List[str] = []
    blocks: List[str] = []
    contains: List[str] = []
