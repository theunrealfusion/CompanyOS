import json
from typing import Dict, Any, Callable, Awaitable
from apps.api.tools.definitions import get_core_tools
from apps.api.services.task_service import TaskService
from apps.api.services.approval_service import ApprovalService
from apps.api.database.session import async_session
from apps.api.schemas.tasks import TaskCreate
import uuid

class ToolExecutor:
    async def delegate_task(self, assignee_role: str, task_title: str, task_description: str, company_id: str) -> dict:
        async with async_session() as db:
            svc = TaskService(db)
            task = await svc.create_task(TaskCreate(
                title=task_title,
                description=task_description,
                company_id=uuid.UUID(company_id),
                assignee_id=uuid.UUID("00000000-0000-0000-0000-000000000000")
            ))
            run_id = await svc.dispatch_task(task.id)
            return {"status": "delegated", "task_id": str(task.id), "run_id": run_id}

    async def request_approval(self, title: str, justification: str, run_id: str, company_id: str, cost: float = 0.0) -> dict:
        async with async_session() as db:
            svc = ApprovalService(db)
            app = await svc.create_approval({
                "company_id": uuid.UUID(company_id),
                "requester": "Agent",
                "department": "Operations",
                "title": title,
                "cost": str(cost),
                "expected_return": justification,
                # we hijack "requester" or create a new field to store run_id for signaling back
            })
            # A cleaner approach would store run_id in Approval model, but we will assume
            # the caller passes it during resolution.
            return {"status": "pending_approval", "message": f"Approval {app.id} requested.", "approval_id": str(app.id)}

    async def execute(self, name: str, args: dict, company_id: str, run_id: str) -> dict:
        if name == "delegate_task":
            return await self.delegate_task(
                args.get("assignee_role"),
                args.get("task_title"),
                args.get("task_description", ""),
                company_id
            )
        elif name == "request_approval":
            return await self.request_approval(
                args.get("title"),
                args.get("justification"),
                run_id,
                company_id,
                args.get("cost", 0.0)
            )
        else:
            return {"error": f"Unknown tool {name}"}
