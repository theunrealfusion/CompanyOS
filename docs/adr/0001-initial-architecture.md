# 1. Foundational Architecture for CompanyOS

Date: 2026-09-13

## Status
Accepted

## Context
CompanyOS is an open-source, production-oriented operating system for AI-native organizations. It models an organization as a living computational system composed of humans, agents, teams, projects, objectives, tasks, and policies. The system focuses on organizational computation rather than simple chatbot workflows. We need a foundational architecture that supports this vision while adhering to the principle of "Modular Monolith before Microservices". The architecture must also handle structured friction, human governance, and provider-neutral AI abstractions.

## Decision
We adopt the following foundational architecture and technology stack:

1.  **Frontend**: React (with Vite), TypeScript, Tailwind CSS, React Flow (for organization graph visualization), TanStack Query, and Zustand (for local state).
2.  **Backend**: Python, FastAPI, Pydantic v2. Async-first architecture with WebSockets for real-time updates.
3.  **Messaging / Event Backbone**: NATS and JetStream. NATS provides the durable organizational event fabric required for reconstructing organizational history, tracking decisions, and handling asynchronous workflows. Redis is retained only for ephemeral caching, locks, and rate limits.
4.  **Database**: MongoDB. MongoDB provides the flexibility needed for organizational entities, agents, friction records, and audit metadata. Schemas are designed to allow a smooth transition to a graph database (e.g., Neo4j) in the future without domain model rewrites.
5.  **Agent Runtime & Model Routing**: A provider-neutral abstraction supporting OpenAI, Anthropic, Google, NVIDIA NIM, and self-hosted models. Business logic depends on a generic model interface, not provider SDKs.
6.  **Tool Interoperability**: Model Context Protocol (MCP) and standard HTTP/REST/WebSocket APIs for capability discovery and invocation.
7.  **Workflow & Autonomy**: We will build explicit state machines driven by NATS events rather than adopting complex orchestrators like Temporal initially. The Friction Engine and Decision Engine are core components.
8.  **Infrastructure**: Docker Compose for local development (FastAPI, React, MongoDB, Redis, NATS) without a hard requirement on Kubernetes or GPUs initially.

## Consequences
-   **Positive**: NATS/JetStream natively supports the event-driven, durable nature of organizational memory and friction resolution. MongoDB allows rapid iteration on complex, nested domain models. The provider-neutral AI layer prevents vendor lock-in. A modular monolith simplifies deployment and testing while retaining clear boundaries.
-   **Negative**: Building custom event-driven state machines for agent loops and friction is more upfront work than using an off-the-shelf workflow engine, but it is necessary to capture "Friction as Computation" natively in the domain.
-   **Decision on Replaced Technologies**: Next.js, PostgreSQL/pgvector, and Temporal (suggested in previous iterations) are explicitly rejected for the MVP to align with the core product vision and simplicity requirements.
