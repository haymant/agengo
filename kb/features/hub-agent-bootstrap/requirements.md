---
title: Feature - Hub Agent Bootstrap
feature_id: FEAT-007
artifact: requirements
status: draft
version: 1.0
owner_agent: ba
parent_feature: kb/features/hub-agent-bootstrap
related_artifacts:
  - kb/features/hub-agent-bootstrap/design.md
  - kb/features/hub-agent-bootstrap/implementation-plan.md
  - kb/features/hub-agent-bootstrap/testing-plan.md
  - kb/features/hub-agent-bootstrap/testing-report.md
jira_keys: []
phase_gate: requirements-draft
last_updated: 2026-04-09
---

# Context

Tracohub already allocates isolated project and chat workspaces under `~/.traco/.data/workspace`, but its current `.traco` bootstrap is only a minimal catalog seed. It creates directories, imports recognizable catalog content from template roots when present, and writes a placeholder orchestrator agent. That is weaker than the OpenClaw first-run model, which treats workspace bootstrap as a durable initialization ritual that seeds stable workspace instructions and starter capabilities on first use.

After node restarts or when older isolated workspaces are revisited, users can reach a state where no meaningful local agent appears to be available. The requirement for this feature is to make `.traco` bootstrapping durable and self-healing for every isolated workspace so agent discovery does not depend on whether that workspace happened to be freshly created in the current process.

# Goals

- Ensure every isolated project and chat workspace has an initialized `.traco` directory with a starter agent and starter skills.
- Make workspace catalog reads self-heal missing bootstrap state for existing isolated workspaces after reboot or upgrade.
- Preserve workspace-local customization so imported or user-authored catalog entries are not overwritten by later bootstrap passes.
- Record the OpenClaw-inspired bootstrap model and the Tracohub adaptation explicitly in the KB.

# Non-goals

- This feature does not implement OpenClaw's interactive first-run Q&A ritual.
- This feature does not introduce global user memory files, persona prompts, or session transcript migration.
- This feature does not change remote discovery room rules or room-scoped handoff behavior directly.

# Requirements

## Functional

- Each isolated project workspace must contain a `.traco` directory with `agents`, `skills`, `rules`, and runtime subdirectories.
- Each isolated chat workspace must contain a `.traco` directory with the same baseline structure.
- Tracohub must seed a default workspace orchestrator agent into each isolated workspace when no local agent exists yet.
- Tracohub must seed starter workspace skills into each isolated workspace when those skills are missing.
- Catalog reads for isolated workspaces must bootstrap missing `.traco` state on demand so existing workspaces recover after node restart, upgrade, or partial deletion.
- Bootstrap state must be versioned so Tracohub can add newly required starter files in later releases without overwriting user-authored catalog entries.
- Template imports from recognizable source directories such as `.github/skills`, `.github/agents`, `.pi/skills`, or `.claude/skills` must continue to work and must coexist with the default starter catalog.

## Non-functional

- Bootstrap must be idempotent across repeated reads and repeated workspace initialization calls.
- User-authored files under `.traco` must not be overwritten by default bootstrap passes.
- The implementation must work for fresh workspaces and for workspaces created before this feature landed.
- The design must distinguish OpenClaw-inspired workspace seeding from OpenClaw-specific onboarding rituals that Tracohub is not implementing yet.

# Acceptance Criteria

- [ ] A fresh isolated workspace contains a starter `.traco` catalog with at least one agent and at least one skill.
- [ ] Route or catalog discovery against an existing isolated workspace recreates missing starter bootstrap state without requiring the workspace to be recreated.
- [ ] Re-running bootstrap does not overwrite user-authored agent or skill files.
- [ ] Remote-candidate publication and local route discovery continue to work when template-imported catalog entries are present alongside the default starter catalog.
- [ ] KB artifacts document the OpenClaw comparison, the Tracohub adaptation, the implementation plan, and the test evidence.

# Open Questions

- Should a later slice add optional workspace-level files analogous to OpenClaw `AGENTS.md`, `TOOLS.md`, or `IDENTITY.md`, or is Tracohub's `.traco` catalog sufficient for now?
- Should the starter skill set remain minimal and provider-agnostic, or should future slices tailor it per configured provider family such as Pi, Copilot, or OpenClaw?

# Change Log

- 2026-04-09: Bootstrapped from runtime-code inspection and OpenClaw bootstrap workspace documentation.