# Architectural Decisions

- **Backend Framework**: FastAPI (Python) for type safety, async support, and high performance.
- **Frontend Framework**: Next.js (React, TypeScript, Tailwind) for modern, fast, SSR UI.
- **Database**: PostgreSQL with pgvector. Mature, relational, vector support built-in.
- **Graph Visualization**: React Flow / XYFlow. Excellent for interactive organizational canvas.
- **Workflow Engine**: Temporal. Essential for durable executions, long-running agent loops.
- **Event Bus**: Redis Streams for initial real-time event streaming and pub/sub.
- **ORMs**: SQLAlchemy for backend DB access.
- **Monorepo**: Structured as a modular monolith, separating `apps`, `packages`, `adapters` for clean boundaries.
