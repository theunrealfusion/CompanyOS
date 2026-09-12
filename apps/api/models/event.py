import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from apps.api.database.session import Base

class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    
    event_type = Column(String, index=True, nullable=False) # e.g., TaskCreated, AgentStarted
    payload = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), nullable=False) # Can be user_id or agent_id
    actor_type = Column(String, nullable=False) # USER, AGENT
    
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
