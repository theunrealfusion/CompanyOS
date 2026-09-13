# CompanyOS Architecture

CompanyOS is an operating system for autonomous and human-AI organizations. It models an organization as a living computational system.

## 1. Conceptual Architecture

```text
                         ┌─────────────────────┐
                         │       HUMAN         │
                         │ CEO / Manager / User│
                         └──────────┬──────────┘
                                    │
                                    ▼
                              INTENT LAYER
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │    ORGANIZATION GRAPH     │
                    │                           │
                    │ People / Agents / Teams   │
                    │ Projects / Goals / Tasks  │
                    │ Policies / Resources      │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ FRICTION ENGINE │
                         │                 │
                         │ Detect          │
                         │ Challenge       │
                         │ Evidence       │
                         │ Negotiate       │
                         │ Resolve         │
                         └────────┬────────┘
                                  │
                                  ▼
                         DECISION ENGINE
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                  Policy       Authority       Risk
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                                  ▼
                           ACTION FABRIC
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
           GitHub              Telegram              APIs
           Email               Slack                 Cloud
           CRM                 Browser               MCP
                                  │
                                  ▼
                              REAL WORLD
                                  │
                                  ▼
                         OBSERVATION ENGINE
                                  │
                                  ▼
                           MEMORY / LEARNING
                                  │
                                  └───────────► NEXT DECISION
```

## 2. Layered Architecture (Modular Monolith)

The codebase is organized following a strict separation of concerns:

-   **Domain**: Core business models (Organization, Agent, Friction, Decision). Pure Python, no external infrastructure dependencies.
-   **Application**: Use cases and orchestration (Services, State Machines).
-   **Infrastructure**: Database repositories (MongoDB), Event publishing (NATS), External APIs (MCP, LLMs).
-   **Interface**: HTTP endpoints (FastAPI), WebSockets, CLI, NATS subscribers.

## 3. Tech Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind, React Flow.
-   **Backend**: Python, FastAPI, Pydantic v2.
-   **Database**: MongoDB (Primary), designed to support future Graph/Vector stores.
-   **Events**: NATS + JetStream for durable message brokering.
-   **Cache**: Redis (ephemeral state, locks).
-   **Deployment**: Docker Compose.

## 4. Key Components

### 4.1 Friction Engine
Treats "Friction as Computation". Disagreements between agents/policies are escalated into structured Friction objects with Claims, Evidence, and Proposals.

### 4.2 Decision Engine
Evaluates options against organizational policy, authority, and risk. Never allows an LLM unchecked execution.

### 4.3 Agent Runtime
A provider-neutral execution layer. Abstracts away specific LLM SDKs (OpenAI, Anthropic, NVIDIA NIM).

### 4.4 Event Fabric
All state changes emit strongly-typed events to NATS (`company.{org_id}.*`). This powers the live React Flow UI, decision memory, and asynchronous workflows.
