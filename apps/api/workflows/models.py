from typing import Optional, List, Dict, Any
from dataclasses import dataclass

@dataclass
class AgentWorkflowInput:
    run_id: str
    agent_id: str
    task_id: str
    input_text: str

@dataclass
class LLMStepResult:
    step_id: str
    content: Optional[str]
    tool_calls: List[Dict[str, Any]]
    is_final: bool

@dataclass
class ToolExecutionResult:
    tool_call_id: str
    result_data: Dict[str, Any]
    error: Optional[str] = None
