import logging

from apps.api.database.session import async_session
from apps.api.services.task_service import TaskService

logger = logging.getLogger(__name__)

class TelegramAdapter:
    def __init__(self, bot_token: str):
        self.bot_token = bot_token

    async def handle_incoming_message(self, message_text: str, user_id: str, company_id: str):
        # Stub: parse message and create a task for the CEO
        async with async_session() as db:
            task_service = TaskService(db)
            # We would look up CEO id, hardcoding for stub
            import uuid

            from apps.api.schemas.tasks import TaskCreate
            task = await task_service.create_task(TaskCreate(
                title=f"Telegram Request from {user_id}",
                description=message_text,
                company_id=uuid.UUID(company_id),
                assignee_id=uuid.UUID("00000000-0000-0000-0000-000000000000") # placeholder
            ))
            await task_service.dispatch_task(task.id)
            logger.info(f"Dispatched task from Telegram: {task.id}")
