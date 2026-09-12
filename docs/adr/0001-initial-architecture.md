# 1. Initial Architecture and Technology Stack

Date: 2026-09-13

## Status
Accepted

## Context
We are building CompanyOS, an "Open-Source Autonomous AI Company Operating System". It needs to support a highly visual graph-based UI (Company Command Center), real-time message gateways (Telegram, Discord, Slack), external and internal agent runtimes (Antigravity, Hermes, native), and high reliability for long-running workflows with complex permissions. It must follow a modular monolith approach initially.

## Decision
We will use the following technology stack to ensure scalability, ease of development, and alignment with modern AI and web ecosystems:

- **Backend**: FastAPI (Python) for core API, routing, and orchestrator.
- **Frontend**: Next.js (React, TypeScript, TailwindCSS) with React Flow for the visual Company Graph.
- **Database**: PostgreSQL with `pgvector` for both relational data (users, companies, agents, tasks) and vector memory (episodic, semantic).
- **ORMs/Data Layer**: SQLAlchemy & Pydantic.
- **Workflow Engine**: Temporal. This is critical to guarantee durable execution for agent workflows, human-in-the-loop approvals, and external tool calls.
- **Real-time / Event Bus**: Redis (Streams) for event broadcasting, leading to WebSockets/SSE for real-time frontend updates.
- **Model Router**: Support LiteLLM, NIM, and direct integrations.
- **Repository Structure**: Monorepo with `apps/` (web, api, worker), `packages/` (core logic, sdk, workflows), and `adapters/` (plugins for runtimes and messaging).

## Consequences
- **Positive**: We get type safety across Python and TypeScript. Temporal manages complex distributed state and failure recovery. React Flow provides a mature base for the core visual requirement.
- **Negative**: Temporal adds infrastructure complexity (requires a Temporal server), but it is necessary for the durability requirements of autonomous companies. PostgreSQL + pgvector reduces database footprint compared to running a separate vector DB initially.
