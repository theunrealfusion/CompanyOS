from typing import Optional, Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ToolCallResponse(BaseModel):
    id: UUID
    step_id: UUID
    tool_name: str
    input_args: Dict[str, Any]
    output: Optional[Dict[str, Any]] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AgentStepResponse(BaseModel):
    id: UUID
    run_id: UUID
    step_number: int
    step_type: str
    input_text: Optional[str] = None
    output_text: Optional[str] = None
    model_id: Optional[str] = None
    tokens: int
    cost: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    metadata_: Dict[str, Any]
    tool_calls: List[ToolCallResponse] = []
    model_config = ConfigDict(from_attributes=True)

class AgentRunResponse(BaseModel):
    id: UUID
    company_id: UUID
    agent_id: UUID
    agent_version_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    parent_run_id: Optional[UUID] = None
    workflow_run_id: Optional[str] = None
    status: str
    model_id: Optional[str] = None
    provider_id: Optional[str] = None
    input_text: Optional[str] = None
    output_text: Optional[str] = None
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    error_type: Optional[str] = None
    retry_count: int
    correlation_id: Optional[UUID] = None
    trace_id: Optional[str] = None
    span_id: Optional[str] = None
    metadata_: Dict[str, Any]
    steps: List[AgentStepResponse] = []
    model_config = ConfigDict(from_attributes=True)
