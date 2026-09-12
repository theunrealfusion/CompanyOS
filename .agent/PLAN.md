# CompanyOS - Master Plan

## Phase 0: Foundation (Current)
- [x] Create repository structure
- [ ] Create ADRs for initial architecture
- [ ] Set up PLAN.md, PROGRESS.md, DECISIONS.md
- [ ] Initialize git and basic configuration

## Phase 1: Core Platform
- [ ] Setup PostgreSQL database scheme
- [ ] Build FastAPI core backend
- [ ] Build Next.js core frontend
- [ ] Implement Auth
- [ ] Organization modeling (Company, Department, User, Role)
- [ ] Agent & Task entity modeling
- [ ] Event & Audit logging modeling

## Phase 2: Agent Runtime
- [ ] Native runtime implementation
- [ ] Model Router (LiteLLM, NIM, Gemini, OpenAI)
- [ ] Tool Registry
- [ ] Memory Engine (pgvector)

## Phase 3: Workflow
- [ ] Temporal setup
- [ ] Scheduling
- [ ] Approvals
- [ ] Recovery/Retries

## Phase 4: Real-time
- [ ] WebSocket / SSE implementation
- [ ] Event Streaming (Redis Streams)
- [ ] Company Graph (React Flow / XYFlow)
- [ ] Live agent states

## Phase 5: Messaging
- [ ] Message Gateway Architecture
- [ ] Telegram Adapter
- [ ] Web Chat Adapter
- [ ] Discord/Slack architecture stubs

## Phase 6: External Runtimes
- [ ] Antigravity adapter
- [ ] Hermes adapter
- [ ] OpenClaw adapter

## Phase 7: Business Intelligence
- [ ] Strategy logic
- [ ] Opportunity & Experiment modeling
- [ ] Revenue & Finance modeling

## Phase 8: Content & Social
- [ ] Content factory
- [ ] Platform adapters (LinkedIn, X, etc.)

## Phase 9: Developer Ecosystem
- [ ] Python SDK
- [ ] CLI (companyos)
- [ ] Plugin/Skill system
