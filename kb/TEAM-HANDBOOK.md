---
title: Agent Team Handbook
status: live
version: "1.0"
last_updated: 2026-03-29
applies_to:
  - GitHub Copilot
  - VS Code
  - SDLC starter
tags:
  - onboarding
  - agents
  - skills
  - knowledge-base
---

# Agent Team Handbook

This handbook is for human joiners working with this SDLC starter after it has been copied into a project root. Treat the agent team like a role-based engineering team with explicit handoffs, written artifacts, and quality gates. The KB under `kb/` is the source of truth. Chat is not.

## Quickstart

Use this sequence on day one:

1. Read `README.md` in the starter root to understand the pack layout and the KB-first SDLC.
2. If you need a broad onboarding pass first, read `kb/05-learning-paths/USER-GUIDE.md` for the shared business-user and developer entry points.
2. Read `.github/copilot-instructions.md` to understand the standing rules that apply across the starter.
3. Read `.github/agents/README.md` to learn which agent owns which phase.
4. Open a feature folder under `kb/features/` and inspect `requirements.md`, `design.md`, `implementation-plan.md`, `testing-plan.md`, and `testing-report.md`.
5. Start coordination with the Orchestrator agent for any non-trivial task so phase routing stays explicit.

If you are joining a legacy project instead of a clean sample, start with the legacy prompts and skills before requesting implementation work.

## Operating Model

The starter is built around a phase-gated SDLC:

1. BA clarifies business value, scope, constraints, and acceptance criteria.
2. Architect turns approved requirements into design, sequencing, interfaces, and risk controls.
3. Developer implements approved changes and updates tests.
4. QA maps acceptance criteria to evidence and records residual risk.
5. DevOps owns deployment, migration, configuration, rollback, and release readiness.
6. Orchestrator coordinates handoffs and blocks phase-skipping.

When in doubt, route through Orchestrator rather than skipping ahead based on chat context.

## Source Of Truth

Canonical project state lives in `kb/features/<feature-slug>/`.

Each feature is expected to contain:

- `requirements.md`
- `design.md`
- `implementation-plan.md`
- `testing-plan.md`
- `testing-report.md`

Update those files in place as the feature evolves. Do not split canonical state across ad hoc notes, issue comments, or chat transcripts.

## Agent Roles

For shared onboarding before role-specialized work, use the Guide agent.

### Orchestrator

Use for cross-phase requests, unclear next steps, legacy modernization intake, or gate decisions. Orchestrator should tell you the current feature state, next owner role, missing criteria, KB files to update, and whether a human decision is required.

### BA

Use for ideation, business analysis, scope boundaries, assumptions, constraints, and acceptance criteria. BA owns `requirements.md` quality and should not drift into architecture or implementation.

### Architect

Use when requirements are approved and you need technical design, sequencing, interfaces, data flow, risks, non-functional safeguards, or hybrid TypeScript-to-Python contract clarity. Architect owns `design.md` quality.

### Developer

Use when implementation is approved and ready for code, refactoring, tests, or defect fixes. Developer keeps code, tests, and KB artifacts aligned and should hand off release or migration work instead of doing it implicitly.

### QA

Use when acceptance criteria need test planning, verification, evidence capture, grouped analytics evidence, or a final `testing-report.md`. QA owns proof, defect reporting, and residual risk statements.

### DevOps

Use for environments, migrations, runtime configuration, releases, rollback, and operational readiness. DevOps is the owner for deployment procedure and runtime coherence across Node, Next.js, and Python surfaces.

## Skills, Prompts, Instructions, And Tools

New joiners should distinguish these clearly:

- Instructions are always-on guardrails. Read `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` to understand the standing rules.
- Agents are role personas in `.github/agents/*.agent.md`. Use them when you need a specific SDLC role.
- Skills are reusable workflows in `.github/skills/<name>/SKILL.md`. Use them when the task needs a repeatable method instead of just a role opinion.
- Prompts in `.github/prompts/*.prompt.md` are kickoff templates for a stage or workflow.
- Tools and MCP integrations are external runtime capabilities. The markdown files describe how to use them, but they do not register tools by themselves.

## Core Skills

These are the core workflows you will use most often:

- `knowledge-base`: validate feature folders, artifact completeness, frontmatter, and links.
- `impact-assessment`: assess blast radius across requirements, design, code, tests, configuration, and release.
- `design`: produce technical design, interfaces, failure modes, and hybrid system boundaries.
- `coding`: implement approved work with explicit contracts and boundary discipline.
- `unit-test`: add or review deterministic unit coverage.
- `sit-test`: validate cross-component and end-to-end flows.
- `production-readiness`: evaluate rollout, rollback, observability, runtime assumptions, and release gates.
- `data-api-analytics`: gather grouped or pivoted analytics evidence from MCP or HTTP-backed tools.

## Legacy Modernization Skills

For code-first systems with weak documentation, use this sequence:

1. `legacy-code-scanner` to inventory entrypoints, routes, jobs, user-visible workflows, and stack boundaries.
2. `kb-bootstrapper` to create or fill missing artifacts from code findings without overstating certainty.
3. `code-verifier` to compare KB claims against the actual repository structure and behavior.
4. `modernization-roadmap` to plan phased stabilization and migration work.

This order matters. Do not jump to a rewrite before reconstructing the KB.

## Prompt Entry Points

The prompt set under `.github/prompts/` gives joiners a safe way to start work without inventing their own flow.

Use these prompts as the normal entry points:

- `bootstrap-feature.prompt.md` for a new feature folder.
- `requirements-stage.prompt.md` for BA-stage refinement.
- `design-stage.prompt.md` for architecture and implementation sequencing.
- `implementation-plan-stage.prompt.md` before coding starts.
- `implementation-stage.prompt.md` for delivery work.
- `unit-test-stage.prompt.md` and `sit-stage.prompt.md` for test planning and execution.
- `qa-stage.prompt.md` and `test-evidence.prompt.md` for proof and evidence capture.
- `devops-stage.prompt.md` and `release-readiness.prompt.md` for operational readiness.
- `phase-gate-review.prompt.md` for a gate decision.
- `reverse-engineer-legacy.prompt.md`, `bootstrap-legacy-kb.prompt.md`, and `reconcile-legacy-kb.prompt.md` for legacy-first work.

## Deterministic Checks

Use scripts for objective validation whenever possible:

- `python3 scripts/validate_kb.py kb/features/<feature-slug>` checks artifact presence, frontmatter, and related links.
- `node scripts/release_gate.mjs kb/features/<feature-slug>` checks readiness and evidence expectations.
- `python3 scripts/legacy_inventory.py <target-dir>` inventories a legacy surface.
- `node scripts/hybrid_surface_map.mjs <target-dir>` maps likely Node, Next.js, and Python boundaries.

Treat these as supporting evidence, not as substitutes for human review.

## How Humans Should Work With Agents

Use a simple operating loop:

1. Start from the relevant feature folder, or establish one first.
2. Ask Orchestrator for the current phase, missing artifacts, and next owner.
3. Route to the specific role agent or stage prompt for the current phase.
4. Update KB artifacts before claiming progress.
5. Use scripts and tests to collect evidence.
6. Ask QA or DevOps for final proof or readiness instead of self-certifying.

Good requests are specific about the feature slug, the artifact being updated, the known constraints, and the desired outcome.

## Safety Rules

- Do not treat chat output as canonical if the KB was not updated.
- Do not let Developer bypass QA or DevOps for evidence or release claims.
- Do not turn assumptions from legacy code into confirmed requirements without marking them as open questions.
- Do not rely on MCP or analytics tools unless they are actually configured in the workspace.
- Do not mark testing complete because commands ran. Testing is complete when acceptance criteria are evidenced or the remaining risk is accepted explicitly.

## First-Day Exercises

Use these to build confidence quickly:

1. Open `kb/features/example-feature/` and identify which phase is incomplete and why.
2. Run the KB validator against the sample feature and inspect the output.
3. Ask Orchestrator which role should act next for the sample feature and compare the response against the files.
4. Use a stage prompt to refine one artifact in the sample feature.
5. Run the release gate and explain why it passes or fails.

## Reference Map

- Starter overview: `README.md`
- Global starter rules: `.github/copilot-instructions.md`
- Agent definitions: `.github/agents/`
- Skill definitions: `.github/skills/`
- Stage and workflow prompts: `.github/prompts/`
- KB source of truth: `kb/`
- Deterministic helpers: `scripts/`

Keep this handbook updated when the agent roster, quality gates, prompts, or required tools change.
