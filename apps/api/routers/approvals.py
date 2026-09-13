from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from apps.api.database.session import get_db
from apps.api.models.event import Approval
from apps.api.models.organization import Company
from apps.api.routers.ws import publish_event

router = APIRouter(prefix="/approvals", tags=["approvals"])

@router.get("/")
async def get_approvals(company_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Approval).order_by(Approval.created_at.desc())
    if company_id:
        try:
            c_uuid = uuid.UUID(company_id)
            query = query.where(Approval.company_id == c_uuid)
        except ValueError:
            pass

    result = await db.execute(query)
    approvals = result.scalars().all()
    return approvals

@router.post("/")
async def create_approval(payload: Dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)):
    company_id = payload.get("company_id")
    if not company_id:
        comp_res = await db.execute(select(Company))
        comp = comp_res.scalars().first()
        if not comp:
            raise HTTPException(status_code=400, detail="No company found")
        company_id = comp.id
    else:
        company_id = uuid.UUID(company_id)

    approval = Approval(
        company_id=company_id,
        requester=payload.get("requester", "Agent"),
        department=payload.get("department", "General"),
        title=payload.get("title", "Budget Authorization"),
        cost=payload.get("cost", "₹0"),
        expected_return=payload.get("expected_return", "N/A"),
        risk=payload.get("risk", "LOW"),
        status="PENDING"
    )
    db.add(approval)
    await db.commit()
    await db.refresh(approval)

    await publish_event("ApprovalRequired", {
        "id": str(approval.id),
        "title": approval.title,
        "cost": approval.cost,
        "requester": approval.requester,
        "status": "PENDING"
    })
    return approval

@router.post("/{approval_id}/decision")
async def decide_approval(approval_id: str, payload: Dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)):
    try:
        a_uuid = uuid.UUID(approval_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid approval ID format")

    res = await db.execute(select(Approval).where(Approval.id == a_uuid))
    approval = res.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")

    decision = payload.get("decision", "APPROVED").upper()
    if decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be APPROVED or REJECTED")

    approval.status = decision
    approval.decided_at = datetime.utcnow()
    await db.commit()
    await db.refresh(approval)

    await publish_event("ApprovalDecided", {
        "id": str(approval.id),
        "title": approval.title,
        "status": decision
    })

    return approval
