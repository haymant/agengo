---
title: Feature - Hub Isolated Workspaces
feature_id: FEAT-003
artifact: implementation-plan
status: draft
version: 1.0-legacy
owner_agent: developer
parent_feature: kb/features/hub-isolated-workspaces
related_artifacts:
  - kb/features/hub-isolated-workspaces/requirements.md
  - kb/features/hub-isolated-workspaces/design.md
  - kb/features/hub-isolated-workspaces/testing-plan.md
phase_gate: implementation-not-started
last_updated: 2026-04-03
---

# Plan Summary

Implement the isolation foundation in four slices: data-home resolution, workspace-key allocation, execution boundary enforcement, and scoped file storage plus migration.

# Work Breakdown

1. Introduce a shared data-home resolver and update embedded database and upload defaults to use `~/.traco/.data`.
2. Add persisted node UUID creation and loading in managed bootstrap and runtime startup.
3. Add project and chat workspace-key allocation helpers and ensure new chats receive nested workspace roots.
4. Reserve chat-state subdirectories that FEAT-006 can adopt for memory, artifacts, and run sandboxes.
5. Replace permissive cwd resolution with chat-root path guards in chat execution.
6. Rework local uploads and artifact staging to use scoped project or chat paths.
7. Update docs and migration notes for legacy `${cwd}/.data` installs.

# Dependencies

- Coordination with later p2p features so node UUID format and storage are reusable.
- Coordination with FEAT-006 so the chat root layout is compatible with the unified memory and artifact model.
- A product decision on whether legacy data copy-forward is automatic with notice or confirmation-gated in managed installs.

# Validation Strategy

- Unit-test data-home resolution and node UUID persistence.
- Unit-test path guards against absolute, relative, and symlink escape attempts.
- Integration-test chat creation and upload storage to confirm scoped workspace roots.
- Integration-test provider-level working-directory confinement against the same workspace-root rules.
- Update docs and example environment settings to match the new defaults.

# Rollback Notes

- Preserve an override path so developers can temporarily opt back into legacy locations if migration issues appear.
- If path confinement causes provider regressions, keep the guard layer feature-flagged long enough to isolate failures without reverting storage migration.

# Change Log

- 2026-04-03: Bootstrapped implementation plan for home-root storage and workspace confinement.
- 2026-04-03: Removed resolved workspace-key ambiguity and added provider-cwd validation coverage.