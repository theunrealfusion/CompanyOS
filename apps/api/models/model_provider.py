from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from apps.api.database.session import Base


class ModelProvider(Base):
    __tablename__ = "model_providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    provider_type = Column(String, nullable=False)
    base_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    config = Column(JSON, default=dict)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Model(Base):
    __tablename__ = "models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("model_providers.id"), nullable=False)
    model_id = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    capabilities = Column(JSON, default=dict)
    input_cost_per_1k = Column(Float, nullable=True)
    output_cost_per_1k = Column(Float, nullable=True)
    max_tokens = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)


class ModelPolicy(Base):
    __tablename__ = "model_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    reasoning_model_id = Column(String, nullable=True)
    execution_model_id = Column(String, nullable=True)
    fast_model_id = Column(String, nullable=True)
    vision_model_id = Column(String, nullable=True)
    embedding_model_id = Column(String, nullable=True)
    fallback_model_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
