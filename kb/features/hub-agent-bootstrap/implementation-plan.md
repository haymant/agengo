---
title: Feature - Hub Agent Bootstrap
feature_id: FEAT-007
artifact: implementation-plan
status: in-progress
version: 1.0
owner_agent: developer
parent_feature: kb/features/hub-agent-bootstrap
related_artifacts:
  - kb/features/hub-agent-bootstrap/requirements.md
  - kb/features/hub-agent-bootstrap/design.md
  - kb/features/hub-agent-bootstrap/testing-plan.md
phase_gate: implementation-in-progress
last_updated: 2026-04-09
---

# Plan Summary

Upgrade `.traco` bootstrapping from a minimal placeholder into a durable, versioned isolated-workspace seed, then route catalog discovery through ensured project and chat workspace resolvers so existing workspaces recover after reboot.

# Work Breakdown

1. Add a dedicated `hub-agent-bootstrap` KB feature folder that records the OpenClaw comparison and the Tracohub adaptation.
2. Extend the runtime bootstrap module to seed a starter orchestrator agent and starter skills when those entries are missing.
3. Version the bootstrap manifest so later starter defaults can be introduced without overwriting user-authored files.
4. Add an async workspace-catalog resolver that ensures project or chat `.traco` bootstrap before route discovery reads local agents and skills.
5. Update unit coverage for isolated workspace bootstrap contents and for route discovery recovery on an existing workspace after bootstrap drift.
6. Validate the targeted unit tests and KB structure.

# Dependencies

- FEAT-003 isolated workspace allocation remains the filesystem boundary layer this feature depends on.
- Existing route discovery and remote-candidate publication continue to consume `.traco` catalogs and must remain backward compatible.

# Validation Strategy

- Unit-test workspace bootstrap contents for starter agent and starter skills.
- Unit-test route discovery against an existing isolated workspace that has no `.traco` yet and verify bootstrap self-heals.
- Run KB validation for the new feature folder.

# Rollback Notes

- If starter catalog content causes regressions, keep the ensured workspace resolver and revert only the extra seeded defaults.
- If read-time bootstrap proves too aggressive, fall back to explicit workspace creation hooks while preserving the versioned bootstrap manifest format.

# Change Log

- 2026-04-09: Bootstrapped and marked in progress while implementing durable `.traco` seeding and self-healing catalog discovery.