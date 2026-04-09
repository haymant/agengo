---
title: Feature - Hub Agent Bootstrap
feature_id: FEAT-007
artifact: testing-plan
status: draft
version: 1.0
owner_agent: qa
parent_feature: kb/features/hub-agent-bootstrap
related_artifacts:
  - kb/features/hub-agent-bootstrap/requirements.md
  - kb/features/hub-agent-bootstrap/design.md
  - kb/features/hub-agent-bootstrap/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-09
---

# Test Strategy

Verify that isolated workspaces always expose a usable starter `.traco` catalog, that catalog reads repair missing bootstrap state for existing workspaces, and that default seeding does not overwrite user-authored entries.

# Coverage Matrix

| Acceptance Criterion | Test Layers | Planned Checks | Evidence Expectation |
| --- | --- | --- | --- |
| Fresh isolated workspace contains starter agent and skill content | Unit | Ensure chat workspace root, inspect seeded `.traco` files, confirm starter catalog presence | Passing unit output plus file-content assertions |
| Existing isolated workspace self-heals missing bootstrap state during discovery | Unit | Resolve route options for a project or chat workspace without `.traco`, verify bootstrap occurs and local provider exposes starter agent or skills | Passing unit output proving discovery without pre-created `.traco` |
| Re-running bootstrap does not overwrite user-authored files | Unit | Seed a custom agent or skill, rerun bootstrap, verify content remains intact | File-content assertions and passing unit output |
| Template imports coexist with starter defaults | Unit | Provide template-root skills or rules, bootstrap workspace, verify imported files and starter defaults both exist | File-content assertions and passing unit output |
| KB documents the OpenClaw comparison and implemented behavior | Artifact review, validation | Check artifact set, frontmatter, and evidence mapping | Successful KB validation result |

# Test Cases

1. Ensure a fresh chat workspace root and verify `.traco/agents/orchestrator/AGENT.md` exists.
2. Ensure a fresh chat workspace root and verify starter skills exist under `.traco/skills`.
3. Create an isolated project or chat workspace path without `.traco`, run route discovery, and verify the returned Pi provider exposes the starter agent.
4. Seed a custom agent file, rerun bootstrap, and verify its content is unchanged.
5. Provide compatible `.pi` or `.github` template content and verify imports coexist with starter defaults.
6. Run KB validation for `kb/features/hub-agent-bootstrap`.

# Data and Environment

- Unit tests can use temporary `TRACOHUB_DATA_HOME` directories.
- No external network or provider credentials are required.
- KB validation requires the repository Python environment.

# Exit Criteria

- All acceptance criteria have at least one evidence row in `testing-report.md`.
- Fresh and pre-existing isolated workspaces both expose a usable local agent catalog.
- No default seeding path overwrites user-authored files.

# Change Log

- 2026-04-09: Bootstrapped testing plan for durable `.traco` seeding and self-healing catalog discovery.