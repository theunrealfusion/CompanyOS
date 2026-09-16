from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.models.organization import Company, Department
from apps.api.schemas.companies import CompanyCreate

class OrganizationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_company(self, data: CompanyCreate) -> Company:
        comp = Company(**data.model_dump())
        self.db.add(comp)
        await self.db.commit()
        await self.db.refresh(comp)
        return comp

    async def get_company(self, company_id: UUID) -> Optional[Company]:
        result = await self.db.execute(select(Company).where(Company.id == company_id))
        return result.scalars().first()
