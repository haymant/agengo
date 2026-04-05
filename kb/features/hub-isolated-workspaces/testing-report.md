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

The FEAT-003 foundation slice is implemented and unit-tested. The runtime now defaults local data to the Tracohub home root, allocates stable project/chat workspace paths from immutable IDs, persists node identity, constrains chat cwd resolution to the active chat workspace, and stores local uploads under scoped chat/project directories. Migration and rollback documentation for legacy `${cwd}/.data` installs remains pending.

# Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Data-home resolver and embedded DB default | Passed | `hub/lib/runtime/data-home.ts` and `hub/lib/db/client.ts` now default local state to `~/.traco/.data` unless `TRACOHUB_DATA_HOME` or `PGLITE_DATA_DIR` is explicitly set. |
| Workspace allocation and state skeleton | Passed | `hub/lib/runtime/workspace.ts` creates deterministic project/chat roots plus FEAT-006 state subdirectories under `workspace/projects/<projectId>/chats/<chatId>` or `workspace/root-chats/<chatId>`. |
| Cwd confinement | Passed | `hub/app/(chat)/api/chat/route.ts` now resolves provider and requested cwd values only within the active chat workspace. |
| Scoped upload storage | Passed | `hub/lib/storage/uploads.ts` and `hub/app/(chat)/api/files/upload/route.ts` now place uploads in chat/project-scoped directories when chat context is available. |
| Node UUID persistence | Passed | `hub/lib/runtime/node-identity.ts` creates and reuses a persisted node identity under the Tracohub data home. |
| Automated isolation evidence | Passed | `pnpm exec tsx tests/unit/chat-cwd.test.ts` and `pnpm exec tsx tests/unit/workspace-isolation.test.ts` passed on 2026-04-03. |

# Defects

- None recorded yet; implementation has not started.

# Acceptance Criteria Disposition

- [x] A fresh Tracohub instance stores embedded runtime data under `~/.traco/.data` by default.
- [x] Project and chat workspace roots are created using stable internal keys and remain stable across display-name changes.
- [x] Chat execution cannot read or write outside its assigned workspace root through `cwd` changes or provider configuration.
- [x] Local uploads and artifact staging are stored within project or chat isolation boundaries.
- [x] Node UUID persistence is implemented and documented separately from browser-instance storage scoping.
- [ ] Migration and rollback notes exist for existing `${cwd}/.data` users.

# Follow-ups

- Add migration and rollback guidance for legacy `${cwd}/.data` installs.
- Add integration coverage for upload retrieval and provider-level cwd configuration in a full request lifecycle.

# Change Log

- 2026-04-03: Bootstrapped testing report from code inspection and planning evidence.
- 2026-04-03: Updated with implemented FEAT-003 runtime helpers, scoped uploads, path guards, and passing unit evidence.