from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Task(BaseModel):
    id: str
    organization_id: str
    project_id: str
    description: str
    owner: str
    executor: str
    dependencies: List[str] = []
    priority: str = "medium"
    status: str = "pending"
    deadline: Optional[datetime] = None
    risk: str = "low"
    expected_outcome: str
    actual_outcome: Optional[str] = None
