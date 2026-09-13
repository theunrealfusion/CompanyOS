# CompanyOS 🚀

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![CI Workflow](https://github.com/theunrealfusion/CompanyOS/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Code Style: Ruff / ESLint](https://img.shields.io/badge/code%20style-Ruff%20%2F%20ESLint-000000.svg)](https://github.com/astral-sh/ruff)

**CompanyOS** is an open-source autonomous AI company operating system designed to run, orchestrate, and observe autonomous AI agent teams, organizational workflows, and real-time message gateways.

---

## 🌟 Overview

CompanyOS provides an end-to-end framework for building and operating AI-native organizations:

- 🎨 **Visual Command Center**: Interactive graph-based interface (built with Next.js and React Flow) for mapping out agent roles, departmental relationships, and real-time task flows.
- ⚡ **Durable Execution Engine**: Powered by Temporal, ensuring long-running agent workflows, human-in-the-loop approvals, and external tool calls recover gracefully from failures.
- 💬 **Omnichannel Messaging Gateways**: Seamless integration adapters for Telegram, Discord, Slack, and open protocols.
- 🧠 **Hybrid Memory System**: Unified PostgreSQL + `pgvector` store for structured organizational data and semantic/episodic vector memory.
- 🔌 **Pluggable Agent Runtimes**: Support for direct agent runtimes (Antigravity, Hermes, LiteLLM, NIM, and custom adapters).

---

## 🏗 System Architecture

CompanyOS is built as a modular monorepo structured for performance, type safety, and maintainability:

```
CompanyOS/
├── apps/
│   ├── api/            # FastAPI core API, routing, and orchestrator gateway
│   ├── web/            # Next.js (React 19 + TypeScript + TailwindCSS + React Flow) visual UI
│   └── worker/         # Background worker processing long-running jobs & Temporal workflows
├── packages/
│   ├── cli/            # `companyos` command-line tools
│   ├── core/           # Core business logic and shared abstractions
│   ├── sdk/            # Python/TypeScript SDKs for runtime extensions
│   ├── models/         # Pydantic schemas and database models
│   ├── memory/         # Vector and relational memory interfaces
│   ├── messaging/      # Message routing and stream management
│   └── workflows/      # Durable workflow definitions
├── adapters/           # Runtime & platform integrations (Telegram, Discord, Slack, etc.)
├── docs/               # Architecture Decision Records (ADRs) and user guides
├── docker-compose.yml  # Local development stack (PostgreSQL + pgvector, Redis)
└── scripts/            # Helper scripts and utility tooling
```

---

## 🚀 Quickstart

### Prerequisites

- **Python**: `^3.10` or higher
- **Node.js**: `^20` or higher (`pnpm` or `npm`)
- **Docker & Docker Compose**: For running PostgreSQL (`pgvector`) and Redis

### 1. Clone the Repository

```bash
git clone https://github.com/theunrealfusion/CompanyOS.git
cd CompanyOS
```

### 2. Start Infrastructure (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 3. Setup Python Virtual Environment & Install Dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r apps/api/requirements.txt # (or editable package install)
```

### 4. Run the API Server

```bash
python apps/api/main.py
```

The API server will run at `http://localhost:8000`.

### 5. Setup & Start Visual Command Center (Frontend)

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000` in your browser to interact with the Company Command Center.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you are fixing a bug, adding a new agent adapter, improving documentation, or proposing architectural enhancements, your help is appreciated.

Please see our guidelines before contributing:
- 📖 **[Contributing Guide](CONTRIBUTING.md)**: Guidelines on coding standards, pull request workflow, and local setup.
- 📜 **[Code of Conduct](CODE_OF_CONDUCT.md)**: Our pledge to maintain an open and welcoming community.
- 🛡️ **[Security Policy](SECURITY.md)**: Instructions for reporting security vulnerabilities.
- 🏛️ **[Governance Model](GOVERNANCE.md)**: Details on project leadership and decision-making processes.

---

## 🛡️ Review Process & Branch Protection

To ensure main branch stability and code quality, CompanyOS enforces strict review processes:

1. **Pull Request Requirement**: All changes must be submitted via Pull Requests against the `main` branch. Direct pushes to `main` are prohibited.
2. **Automated CI**: PRs must pass automated linting, type-checking, and test suites.
3. **Peer Review**: At least one maintainer review and approval is required before merging.
4. **Clean Git History**: PRs are merged using Squash and Merge to maintain a clean linear commit history.

For detailed rules and administrator setup, consult the **[Branch Protection Guide](.github/BRANCH_PROTECTION.md)**.

---

## ⚖️ License

CompanyOS is open-source software licensed under the **[Apache License 2.0](LICENSE)**.
