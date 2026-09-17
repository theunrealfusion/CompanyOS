from dataclasses import dataclass
from typing import Any


@dataclass
class AgentWorkflowInput:
    run_id: str
    agent_id: str
    task_id: str
    input_text: str

@dataclass
class LLMStepResult:
    step_id: str
    content: str | None
    tool_calls: list[dict[str, Any]]
    is_final: bool

@dataclass
class ToolExecutionResult:
    tool_call_id: str
    result_data: dict[str, Any]
    error: str | None = None
