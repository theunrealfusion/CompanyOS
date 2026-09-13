from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Human(BaseModel):
    id: str
    organization_id: str
    name: str
    email: EmailStr
    role: str
    department: str
    authority: int = 0
    permissions: List[str] = []
    status: str = "active"
