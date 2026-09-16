import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.database.session import get_db
from apps.api.models.agent import Agent, Task
from apps.api.models.event import Approval, Event, FinancialTransaction
from apps.api.models.organization import Company

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/")
async def get_metrics(company_id: str | None = None, db: AsyncSession = Depends(get_db)):
    # 1. Total & Completed Tasks
    total_tasks_res = await db.execute(select(func.count(Task.id)))
    total_tasks = total_tasks_res.scalar() or 0

    completed_tasks_res = await db.execute(
        select(func.count(Task.id)).where(Task.status == "COMPLETED")
    )
    completed_tasks = completed_tasks_res.scalar() or 0

    # 2. Total & Active Agents
    total_agents_res = await db.execute(select(func.count(Agent.id)))
    total_agents = total_agents_res.scalar() or 0

    active_agents_res = await db.execute(
        select(func.count(Agent.id)).where(Agent.status == "WORKING")
    )
    active_agents = active_agents_res.scalar() or 0

    # 3. Total Events
    total_events_res = await db.execute(select(func.count(Event.id)))
    total_events = total_events_res.scalar() or 0

    # 4. Approvals Count
    pending_approvals_res = await db.execute(
        select(func.count(Approval.id)).where(Approval.status == "PENDING")
    )
    pending_approvals = pending_approvals_res.scalar() or 0

    # 5. Financial Transactions
    revenue_res = await db.execute(
        select(func.sum(FinancialTransaction.amount)).where(
            FinancialTransaction.transaction_type == "REVENUE"
        )
    )
    total_revenue = revenue_res.scalar() or 0.0

    expense_res = await db.execute(
        select(func.sum(FinancialTransaction.amount)).where(
            FinancialTransaction.transaction_type != "REVENUE"
        )
    )
    total_expenses = expense_res.scalar() or 0.0

    net_profit = total_revenue - total_expenses

    # Recent Transactions
    tx_res = await db.execute(
        select(FinancialTransaction).order_by(FinancialTransaction.created_at.desc()).limit(10)
    )
    transactions = tx_res.scalars().all()

    # Calculate real compute cost based on completed tasks
    compute_cost = round(completed_tasks * 2.50, 2)

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "total_agents": total_agents,
        "active_agents": active_agents,
        "total_events": total_events,
        "pending_approvals": pending_approvals,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "compute_cost": compute_cost,
        "recent_transactions": [
            {
                "id": str(t.id),
                "description": t.description,
                "amount": f"₹{t.amount:,.2f}",
                "type": t.transaction_type,
                "customer": t.customer or "Autonomous Billing",
                "time": t.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for t in transactions
        ],
    }


@router.post("/transactions")
async def create_transaction(
    payload: dict[str, Any] = Body(...), db: AsyncSession = Depends(get_db)
):
    company_id = payload.get("company_id")
    if not company_id:
        comp_res = await db.execute(select(Company))
        comp = comp_res.scalars().first()
        if not comp:
            raise HTTPException(status_code=400, detail="No company found")
        company_id = comp.id
    else:
        company_id = uuid.UUID(company_id)

    amount = float(payload.get("amount", 0.0))
    tx = FinancialTransaction(
        company_id=company_id,
        description=payload.get("description", "Revenue Transaction"),
        amount=amount,
        transaction_type=payload.get("type", "REVENUE").upper(),
        customer=payload.get("customer", "Direct Client"),
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx
