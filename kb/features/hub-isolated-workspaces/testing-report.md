---
title: Feature - Hub Isolated Workspaces
feature_id: FEAT-003
artifact: testing-report
status: draft
version: 1.0-legacy
owner_agent: qa
parent_feature: kb/features/hub-isolated-workspaces
related_artifacts:
  - kb/features/hub-isolated-workspaces/requirements.md
  - kb/features/hub-isolated-workspaces/testing-plan.md
phase_gate: testing-in-progress
last_updated: 2026-04-03
---

# Result Summary

This feature is planned but not yet implemented. The current report records the known risk surface and the evidence that informed the plan.

# Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Current storage defaults reviewed | Observed | Current hub defaults still point to workspace-local `.data` paths. |
| Current cwd behavior reviewed | Observed | Current chat execution still resolves cwd from chat and provider settings without workspace-root confinement. |
| Current upload scoping reviewed | Observed | Local uploads are currently user-scoped, not project-scoped or chat-scoped. |
| Automated isolation evidence | Pending | Implementation and tests not yet executed. |

# Defects

- None recorded yet; implementation has not started.

# Acceptance Criteria Disposition

- [ ] A fresh Tracohub instance stores embedded runtime data under `~/.traco/.data` by default.
- [ ] Project and chat workspace roots are created using stable internal keys and remain stable across display-name changes.
- [ ] Chat execution cannot read or write outside its assigned workspace root through `cwd` changes or provider configuration.
- [ ] Local uploads and artifact staging are stored within project or chat isolation boundaries.
- [ ] Node UUID persistence is implemented and documented separately from browser-instance storage scoping.
- [ ] Migration and rollback notes exist for existing `${cwd}/.data` users.

# Follow-ups

- Implement the isolation foundation and add unit and integration coverage.
- Capture migration evidence once the new default is in place.

# Change Log

- 2026-04-03: Bootstrapped testing report from code inspection and planning evidence.