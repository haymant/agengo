---
title: Feature - Hub Isolated Workspaces
feature_id: FEAT-003
artifact: testing-plan
status: draft
version: 1.0-legacy
owner_agent: qa
parent_feature: kb/features/hub-isolated-workspaces
related_artifacts:
  - kb/features/hub-isolated-workspaces/requirements.md
  - kb/features/hub-isolated-workspaces/design.md
  - kb/features/hub-isolated-workspaces/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-03
---

# Test Strategy

Prove that the new storage and workspace model is deterministic, isolated, and compatible with current single-node usage.

# Coverage Matrix

| Acceptance Criterion | Test Type | Evidence |
| --- | --- | --- |
| Home-root data default | Unit or integration | Data-home resolver, managed bootstrap, and override-path checks |
| Stable project and chat workspace keys | Unit | Workspace allocation tests |
| Chat and provider cwd confinement | Unit and integration | Path-escape rejection and provider-working-directory checks |
| Scoped uploads and artifact staging | Integration | Upload-path, artifact-staging-path, and file-read authorization tests |
| Node UUID persistence | Unit | Reuse across restart simulation plus identity-documentation evidence |
| Migration and rollback notes | Artifact review and integration | Updated docs plus legacy-data migration fixture |

# Test Cases

1. Start a fresh embedded instance and verify runtime data is created under `~/.traco/.data` by default.
2. Set `TRACOHUB_DATA_HOME` to a temporary location and verify all managed directories plus the node-identity file are created under that override.
3. Create and rename a project, then confirm its workspace root remains stable.
4. Create, rename, and reopen a chat, then verify its nested chat workspace root remains stable.
5. Attempt `/cwd` changes to an external absolute path, a `..` escape, and a symlink escape; confirm all are rejected.
6. Attempt to use a provider-configured working directory outside the active chat root and verify it is rejected or normalized into the allowed root.
7. Upload files in different projects or chats and verify they land in isolated chat storage roots.
8. Stage artifacts in different projects or chats and verify they land in isolated storage roots with no sibling-chat access.
9. Restart the app and verify the node UUID remains stable and remains documented separately from browser-instance scoping.
10. Run migration from a legacy `${cwd}/.data` fixture, verify content is copied forward into the home-root layout, and verify rollback guidance matches the observed behavior.

# Data and Environment

- Use temporary home directories in automated tests where possible.
- Cover both embedded database mode and remote database mode where the filesystem boundary still applies.
- Prepare a migration fixture that simulates an existing `${cwd}/.data` install.
- Include provider configurations that attempt external working-directory access.

# Exit Criteria

- All isolation acceptance criteria have automated or direct artifact evidence.
- No tested path can escape the owning chat or project workspace.
- Migration and rollback instructions are documented.

# Change Log

- 2026-04-03: Bootstrapped testing plan for storage and workspace isolation.
- 2026-04-03: Added override-path, provider-cwd, artifact-staging, and migration-evidence coverage after QA review.