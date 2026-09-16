import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from apps.api.messaging.bus import event_bus
from apps.api.models.event import Approval
from apps.api.services.temporal_client import TemporalService

logger = logging.getLogger(__name__)

class ApprovalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_approval(self, data: dict) -> Approval:
        app = Approval(**data)
        self.db.add(app)
        await self.db.commit()
        await self.db.refresh(app)

        await event_bus.publish("ApprovalRequested", {
            "id": str(app.id),
            "title": app.title,
            "cost": app.cost
        })
        return app

    async def update_status(self, approval_id: uuid.UUID, status: str, run_id: str = None) -> Approval:
        app = await self.db.scalar(select(Approval).where(Approval.id == approval_id))
        if app:
            app.status = status
            await self.db.commit()
            await self.db.refresh(app)
            await event_bus.publish("ApprovalResolved", {
                "id": str(app.id),
                "status": status
            })

            if run_id:
                try:
                    client = await TemporalService.get_client()
                    handle = client.get_workflow_handle(f"agent-run-{run_id}")
                    await handle.signal("approval_response", status)
                except Exception as e:
                    logger.error(f"Failed to signal workflow {run_id}: {e}")

        return app
