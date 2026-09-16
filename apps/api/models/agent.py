import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, Text
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
    status = Column(String, default="IDLE")  # IDLE, WORKING, WAITING, etc.

    # Store dynamic config like tools, permissions, models
    config = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="agents")
    department = relationship("Department", back_populates="agents")
    subordinates = relationship("Agent", back_populates="manager")
    manager = relationship("Agent", back_populates="subordinates", remote_side=[id])
    tasks = relationship("Task", back_populates="assignee", foreign_keys="[Task.assignee_id]")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, FAILED
    result = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    assignee = relationship("Agent", foreign_keys=[assignee_id], back_populates="tasks")
    creator = relationship("Agent", foreign_keys=[creator_agent_id])
