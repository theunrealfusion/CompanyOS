from pydantic import BaseModel
from typing import Optional

class Department(BaseModel):
    id: str
    organization_id: str
    name: str
    description: Optional[str] = None
    head_id: Optional[str] = None
