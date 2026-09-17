from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ToolCallResponse(BaseModel):
    id: UUID
    step_id: UUID
    tool_name: str
    input_args: dict[str, Any]
    output: dict[str, Any] | None = None
    status: str
    started_at: datetime
    completed_at: datetime | None = None
    duration_ms: int | None = None
    error: str | None = None
    model_config = ConfigDict(from_attributes=True)

class AgentStepResponse(BaseModel):
    id: UUID
    run_id: UUID
    step_number: int
    step_type: str
    input_text: str | None = None
    output_text: str | None = None
    model_id: str | None = None
    tokens: int
    cost: float
    started_at: datetime
    completed_at: datetime | None = None
    duration_ms: int | None = None
    error: str | None = None
    metadata_: dict[str, Any]
    tool_calls: list[ToolCallResponse] = []
    model_config = ConfigDict(from_attributes=True)

class AgentRunResponse(BaseModel):
    id: UUID
    company_id: UUID
    agent_id: UUID
    agent_version_id: UUID | None = None
    task_id: UUID | None = None
    parent_run_id: UUID | None = None
    workflow_run_id: str | None = None
    status: str
    model_id: str | None = None
    provider_id: str | None = None
    input_text: str | None = None
    output_text: str | None = None
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost: float
    started_at: datetime
    completed_at: datetime | None = None
    duration_ms: int | None = None
    error: str | None = None
    error_type: str | None = None
    retry_count: int
    correlation_id: UUID | None = None
    trace_id: str | None = None
    span_id: str | None = None
    metadata_: dict[str, Any]
    steps: list[AgentStepResponse] = []
    model_config = ConfigDict(from_attributes=True)
