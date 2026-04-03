---
title: Feature - Hub Isolated Workspaces
feature_id: FEAT-003
artifact: requirements
status: approved
version: 1.1
owner_agent: ba
parent_feature: kb/features/hub-isolated-workspaces
related_artifacts:
  - kb/features/hub-isolated-workspaces/design.md
  - kb/features/hub-isolated-workspaces/implementation-plan.md
  - kb/features/hub-isolated-workspaces/testing-plan.md
  - kb/features/hub-isolated-workspaces/testing-report.md
jira_keys: []
phase_gate: requirements-approved
last_updated: 2026-04-03
---

# Context

Tracohub currently defaults embedded runtime data to a workspace-local `.data` directory and resolves chat execution directories from chat-level or provider-level working-directory state. That model is workable for a single local runtime, but it is too permissive for the planned project and chat isolation model, remote sharing, and room-scoped agent handoff. This feature establishes the filesystem and runtime boundary layer that all later p2p and handoff features depend on.

This feature is a follow-on slice from the Tracohub runtime baseline and is intentionally limited to local storage, workspace allocation, path confinement, and node identity.

# Goals

- Move the default Tracohub runtime data root to `~/.traco/.data` with a supported override for controlled deployments.
- Allocate deterministic per-project and per-chat workspace roots below the Tracohub data home using stable internal identifiers rather than mutable display names.
- Enforce chat execution, uploads, and artifact staging so they cannot escape the owning chat or project workspace.
- Persist a runtime node UUID that identifies the current hub instance separately from browser-state scoping.

# Non-goals

- This feature does not publish projects or chats to any remote network.
- This feature does not add remote agent discovery or p2p routing.
- This feature does not define live synchronization between nodes.

# Assumptions And Constraints

- Project, chat, and room-related storage keys will use stable internal slugs or IDs rather than mutable display names.
- Chat-local execution remains the default write boundary unless a later approved feature explicitly broadens scope.
- Existing single-node local development must keep working with a documented override and migration path.

# Requirements

## Functional

- The embedded data root must default to `~/.traco/.data` instead of `${cwd}/.data`.
- Tracohub must support a single explicit override for the data root, such as `TRACOHUB_DATA_HOME`, so local development and controlled deployments remain configurable.
- Each project must have an isolated workspace root under `~/.traco/.data/workspace/<project-key>`.
- Each chat must have an isolated nested workspace root under `~/.traco/.data/workspace/<project-key>/<chat-key>`.
- Workspace directory keys and any corresponding room or storage identifiers must use stable internal slugs or IDs rather than raw mutable project and chat names.
- A persisted node UUID must be created for each running hub instance and stored under the Tracohub data home for reuse across restarts.
- Chat execution must resolve requested working directories only inside the owning chat workspace.
- Provider-level working-directory settings must not allow access outside the active project and chat workspace.
- Chat-local execution files, uploads, and transient artifacts must default to the owning chat scope rather than a user-wide shared pool.
- Project scope may be used only for explicit project-level provenance or other intentionally reusable metadata that is approved for reuse across sibling chats.
- Existing installs that currently use `${cwd}/.data` must have a documented migration or compatibility strategy with rollback guidance and no silent data loss.

## Non-functional

- Path validation must reject absolute path escapes, relative `..` escapes, and symlink escapes.
- The isolation model must preserve current single-node usage with minimal friction for local development.
- The implementation must remain compatible with embedded PGlite by default and remote Postgres when configured.
- The feature must document where browser-instance scoping and runtime node identity differ so later features do not conflate them.

# Acceptance Criteria

- [ ] A fresh Tracohub instance stores embedded runtime data under `~/.traco/.data` by default.
- [ ] Project and chat workspace roots are created using stable internal keys and remain stable across display-name changes.
- [ ] Chat execution cannot read or write outside its assigned workspace root through `cwd` changes or provider configuration.
- [ ] Local uploads and artifact staging are stored within project or chat isolation boundaries.
- [ ] Node UUID persistence is implemented and documented separately from browser-instance storage scoping.
- [ ] Migration and rollback notes exist for existing `${cwd}/.data` users.

# Open Questions

- Should first-run migration default to copying legacy `${cwd}/.data` content automatically, or require an explicit confirmation step before copy or fallback behavior begins?
- Does rollout need a temporary isolation-enforcement feature flag beyond the documented data-home override for provider compatibility triage?

# Change Log

- 2026-04-03: Bootstrapped from hub code inspection, storage-path analysis, and p2p planning notes.
- 2026-04-03: Approved BA requirements after recording stable internal key usage, chat-first storage boundaries, and migration expectations.