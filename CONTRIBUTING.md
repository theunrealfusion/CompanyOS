# Contributing to CompanyOS 💖

Thank you for your interest in contributing to **CompanyOS**! We are thrilled to welcome developers, researchers, technical writers, and designers to our open-source community.

This guide will help you get started with contributing, setting up your local environment, understanding our development workflow, and submitting code reviews.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Improving Documentation](#improving-documentation)
  - [Code Contributions](#code-contributions)
- [Development Setup](#development-setup)
- [Git Workflow & Branching Guidelines](#git-workflow--branching-guidelines)
- [Commit Message Format](#commit-message-format)
- [Coding Standards & Style Guide](#coding-standards--style-guide)
- [Pull Request & Review Process](#pull-request--review-process)
- [Community & Support](#community--support)

---

## 📜 Code of Conduct

By participating in CompanyOS, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the project maintainers.

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing [GitHub Issues](https://github.com/theunrealfusion/CompanyOS/issues). If you don't find your issue listed:

1. Open a new issue using our **[Bug Report Form](.github/ISSUE_TEMPLATE/bug_report.yml)**.
2. Include a clear, descriptive title and detailed steps to reproduce the behavior.
3. Specify your environment (OS, Python version, Node.js version, browser, etc.).
4. Include relevant log snippets or stack trace outputs.

### Suggesting Enhancements

Feature requests are welcome! To propose a new capability or architectural update:

1. Use the **[Feature Request Form](.github/ISSUE_TEMPLATE/feature_request.yml)**.
2. Provide a detailed explanation of the proposed feature and why it would benefit CompanyOS.
3. If proposing a major architectural shift, consider creating an **Architecture Decision Record (ADR)** draft in `docs/adr/`.

### Improving Documentation

Documentation improvements (fixing typos, adding inline docstrings, writing tutorials, clarifying setup guides) are highly appreciated! Feel free to submit PRs directly for documentation updates.

---

## 🛠 Development Setup

### Environment Requirements

- Python 3.10+
- Node.js 20+
- Docker & Docker Compose
- Git

### Initial Local Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CompanyOS.git
   cd CompanyOS
   git remote add upstream https://github.com/theunrealfusion/CompanyOS.git
   ```

2. **Start Infrastructure Services**
   ```bash
   docker-compose up -d
   ```

3. **Backend Setup (Python)**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip setuptools wheel
   ```

4. **Frontend Setup (Next.js)**
   ```bash
   cd apps/web
   npm install
   ```

---

## 🌿 Git Workflow & Branching Guidelines

We follow a topic-branch workflow based on the `main` branch.

1. **Keep `main` updated**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create a topic branch**
   Use standard prefixes for branch names:
   - `feat/feature-name` (New features)
   - `fix/bug-description` (Bug fixes)
   - `docs/topic-name` (Documentation updates)
   - `refactor/scope` (Code refactoring)
   - `test/feature-name` (Adding or fixing tests)

   Example:
   ```bash
   git checkout -b feat/discord-adapter-events
   ```

---

## 📝 Commit Message Format

We enforce the **Conventional Commits** specification for clean git history and automated changelogs.

### Format:
```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Code changes that improve performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Maintenance tasks, dependency updates, CI configuration

### Example Commit Messages:
```bash
git commit -m "feat(adapters): add Discord real-time event listener"
git commit -m "fix(api): handle missing organization_id in session context"
git commit -m "docs(readme): add docker-compose quickstart instructions"
```

---

## 🎨 Coding Standards & Style Guide

### Python Guidelines
- Follow **PEP 8** style guidelines.
- Use type hints for all function signatures and data models (`pydantic` / `typing`).
- Ensure all public modules, classes, and methods have clear docstrings.
- Code should be linted using `ruff` or `flake8`.

### TypeScript / React Guidelines
- Strict TypeScript mode enabled. Avoid using `any`.
- Functional components with React hooks.
- Linting enforced via ESLint (`npm run lint` inside `apps/web`).
- TailwindCSS for styling and React Flow for canvas graph management.

---

## 🔍 Pull Request & Review Process

All code changes enter `main` via Pull Requests. Here is how the review process works:

### 1. Submitting a Pull Request

- Fill out the **[PR Template](.github/pull_request_template.md)** completely.
- Link relevant issues (e.g., `Fixes #42` or `Closes #108`).
- Ensure all automated CI checks pass (linting, build, tests).

### 2. Code Review Expectations

When you submit a PR, code reviewers (Maintainers and Code Owners) will review for:
- **Correctness & Durability**: Does the code solve the problem safely?
- **Architecture & Modularity**: Does it follow the monorepo package boundaries (`apps/`, `packages/`, `adapters/`)?
- **Tests & Coverage**: Are unit tests included for new features or bug fixes?
- **Documentation**: Are docstrings, API definitions, or user guides updated?

### 3. Review Feedback Iteration

- Respond to reviewer feedback promptly and constructively.
- Push changes directly to your topic branch; the PR will automatically update.
- Mark resolved conversations as complete.

### 4. Merging

- Once approved by at least **1 maintainer** and all CI checks pass, a maintainer will merge your PR using **Squash and Merge**.

---

## 💬 Community & Support

- **GitHub Discussions**: For open-ended questions, design proposals, and community support.
- **GitHub Issues**: For verified bugs and tracked feature requests.

Thank you again for helping make CompanyOS the best open-source AI company operating system! 🚀
