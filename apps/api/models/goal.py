from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from apps.api.database.session import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    owner_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    parent_goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    goal_type = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")

    target = Column(String, nullable=True)
    progress = Column(Float, default=0.0)
    confidence = Column(Float, default=100.0)
    metrics = Column(JSON, default=dict)

    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    parent = relationship("Goal", remote_side=[id])


class GoalDependency(Base):
    __tablename__ = "goal_dependencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=False)
    depends_on_goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=False)
    dependency_type = Column(String, default="BLOCKS")
