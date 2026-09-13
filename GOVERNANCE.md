# Project Governance 🏛️

This document outlines the governance structure, maintainer responsibilities, decision-making processes, and review principles for the **CompanyOS** open-source project.

---

## 👥 Roles & Responsibilities

### 1. Contributors
Contributors are community members who submit pull requests, create issues, update documentation, or participate in discussions. Anyone can become a contributor.

### 2. Reviewers
Reviewers are experienced contributors with a history of quality code contributions and domain knowledge across specific sub-packages (`apps/`, `packages/`, `adapters/`). Reviewers review pull requests, triage issues, and guide new contributors.

### 3. Maintainers / Core Committers
Maintainers have write/admin access to the repository. Responsibilities include:
- Reviewing and merging Pull Requests.
- Maintaining project infrastructure, CI workflows, and release cycles.
- Enforcing the Code of Conduct and security policies.
- Setting project roadmap priorities.

---

## 🗳️ Decision-Making Process

CompanyOS strives for consensus among maintainers and active contributors:

1. **Minor Changes & Bug Fixes**: Approved by 1 maintainer after passing CI checks.
2. **Major Architectural Changes**: Proposed via an **Architecture Decision Record (ADR)** in `docs/adr/` or a GitHub RFC discussion. Discussion remains open for community review for at least 7 days before final voting/approval by maintainers.

---

## 🔒 Code Review & Branch Protection Policy

Maintainers enforce strict branch protection on `main`:
- No direct commits to `main`.
- All PRs require at least 1 approving review from a maintainer or designated Code Owner.
- CI status checks must pass before merging.
- Squash & merge policy to maintain clean linear history.

For details, refer to [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md).
