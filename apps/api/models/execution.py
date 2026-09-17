import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from apps.api.database.session import Base


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    agent_version_id = Column(UUID(as_uuid=True), ForeignKey("agent_versions.id"), nullable=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    parent_run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id"), nullable=True)
    workflow_run_id = Column(String, nullable=True)

    status = Column(String, default="RUNNING")
    model_id = Column(String, nullable=True)
    provider_id = Column(String, nullable=True)

    input_text = Column(Text, nullable=True)
    output_text = Column(Text, nullable=True)

    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)

    error = Column(Text, nullable=True)
    error_type = Column(String, nullable=True)
    retry_count = Column(Integer, default=0)

    correlation_id = Column(UUID(as_uuid=True), nullable=True)
    trace_id = Column(String, nullable=True)
    span_id = Column(String, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)

    steps = relationship("AgentStep", back_populates="run")


class AgentStep(Base):
    __tablename__ = "agent_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("agent_runs.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_type = Column(String, nullable=False)

    input_text = Column(Text, nullable=True)
    output_text = Column(Text, nullable=True)
    model_id = Column(String, nullable=True)

    tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)

    error = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)

    run = relationship("AgentRun", back_populates="steps")
    tool_calls = relationship("ToolCall", back_populates="step")


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    step_id = Column(UUID(as_uuid=True), ForeignKey("agent_steps.id"), nullable=False)
    tool_name = Column(String, nullable=False)

    input_args = Column(JSON, default=dict)
    output = Column(JSON, nullable=True)

    status = Column(String, default="PENDING")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)

    step = relationship("AgentStep", back_populates="tool_calls")
