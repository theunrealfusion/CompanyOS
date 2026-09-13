from typing import Protocol, Any, Dict
import uuid
from packages.events.publisher import publish_event
from packages.events.envelope import EventEnvelope

class ActionRequest:
    def __init__(self, action_type: str, payload: Dict[str, Any]):
        self.action_type = action_type
        self.payload = payload

class ActionResult:
    def __init__(self, success: bool, output: Any):
        self.success = success
        self.output = output

class ActionExecutor(Protocol):
    async def execute(self, action: ActionRequest) -> ActionResult:
        ...

class GenericActionExecutor(ActionExecutor):
    async def execute(self, action: ActionRequest) -> ActionResult:
        # Mock execution
        return ActionResult(success=True, output=f"Executed {action.action_type}")
