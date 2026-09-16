from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from apps.api.database.session import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)

    name = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False)
    mission = Column(Text, nullable=True)
    status = Column(String, default="IDLE")

    system_prompt = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    model_id = Column(String, nullable=True)
    runtime_type = Column(String, default="native")
    autonomy_level = Column(Integer, default=3)
    token_budget = Column(Integer, nullable=True)
    cost_budget = Column(Float, nullable=True)
    icon = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    config = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="agents")
    department = relationship("Department", back_populates="agents", foreign_keys=[department_id])
    subordinates = relationship("Agent", back_populates="manager")
    manager = relationship("Agent", back_populates="subordinates", remote_side=[id])
    tasks = relationship("Task", back_populates="assignee", foreign_keys="[Task.assignee_id]")
    versions = relationship("AgentVersion", back_populates="agent")


class AgentVersion(Base):
    __tablename__ = "agent_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    version = Column(Integer, nullable=False)

    system_prompt = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    model_id = Column(String, nullable=True)
    runtime_type = Column(String, nullable=True)
    autonomy_level = Column(Integer, nullable=True)
    config_snapshot = Column(JSON, default=dict)

    status = Column(String, default="DRAFT")
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)

    agent = relationship("Agent", back_populates="versions")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    creator_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    parent_task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Integer, default=5)
    status = Column(String, default="PENDING")
    result = Column(Text, nullable=True)

    expected_outcome = Column(Text, nullable=True)
    acceptance_criteria = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    token_usage = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)
    error = Column(Text, nullable=True)
    correlation_id = Column(UUID(as_uuid=True), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    assignee = relationship("Agent", foreign_keys=[assignee_id], back_populates="tasks")
    creator = relationship("Agent", foreign_keys=[creator_agent_id])
    company = relationship("Company")
