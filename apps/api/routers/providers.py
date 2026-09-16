import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.model_provider import ModelProvider
from apps.api.schemas.providers import (
    ModelProviderCreate,
    ModelProviderResponse,
    ModelProviderUpdate,
)

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/", response_model=list[ModelProviderResponse])
async def get_providers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ModelProvider))
    return result.scalars().all()


@router.get("/{provider_id}", response_model=ModelProviderResponse)
async def get_provider(provider_id: str, db: AsyncSession = Depends(get_db)):
    try:
        p_uuid = uuid.UUID(provider_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid provider ID format")
    result = await db.execute(select(ModelProvider).where(ModelProvider.id == p_uuid))
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.post("/", response_model=ModelProviderResponse)
async def create_provider(payload: ModelProviderCreate, db: AsyncSession = Depends(get_db)):
    provider = ModelProvider(
        name=payload.name,
        provider_type=payload.provider_type,
        base_url=payload.base_url,
        is_active=payload.is_active,
        config=payload.config,
        priority=payload.priority,
        company_id=payload.company_id,
    )
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return provider


@router.put("/{provider_id}", response_model=ModelProviderResponse)
async def update_provider(provider_id: str, payload: ModelProviderUpdate, db: AsyncSession = Depends(get_db)):
    try:
        p_uuid = uuid.UUID(provider_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid provider ID format")
    result = await db.execute(select(ModelProvider).where(ModelProvider.id == p_uuid))
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(provider, key, value)

    await db.commit()
    await db.refresh(provider)
    return provider


@router.delete("/{provider_id}")
async def delete_provider(provider_id: str, db: AsyncSession = Depends(get_db)):
    try:
        p_uuid = uuid.UUID(provider_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid provider ID format")
    result = await db.execute(select(ModelProvider).where(ModelProvider.id == p_uuid))
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    await db.delete(provider)
    await db.commit()
    return {"status": "success", "deleted_id": provider_id}
