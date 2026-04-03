---
title: Feature - Hub Isolated Workspaces
feature_id: FEAT-003
artifact: design
status: approved
version: 1.1
owner_agent: architect
parent_feature: kb/features/hub-isolated-workspaces
related_artifacts:
  - kb/features/hub-isolated-workspaces/requirements.md
  - kb/features/hub-isolated-workspaces/implementation-plan.md
  - kb/features/hub-isolated-workspaces/testing-plan.md
phase_gate: design-approved
last_updated: 2026-04-03
---

# Design Summary

The isolation layer should be introduced before any p2p sharing or remote handoff logic. The design centers on a single Tracohub data-home resolver, a workspace allocator that maps projects and chats to stable filesystem roots, a persisted node-identity file or equivalent server-side record, and a path-guard layer that constrains all `cwd`, upload, and artifact activity to the active workspace.

# Scope Mapping

- The data-home requirement maps to `lib/db/client.ts`, `lib/storage/uploads.ts`, `bin/tracohub.mjs`, and environment documentation.
- The workspace-boundary requirement maps to chat cwd resolution and upload or artifact path generation.
- The node UUID requirement maps to managed bootstrap logic and runtime identity storage.

# Architecture

## Components

- Data-home resolver: one helper responsible for resolving `TRACOHUB_DATA_HOME` or defaulting to `~/.traco/.data`.
- Workspace allocator: server-side logic that computes deterministic project and chat workspace roots directly from immutable Project.id and Chat.id values.
- Node identity store: a persisted UUID file or equivalent server-owned record under the Tracohub data home, loaded on startup and reused for future room registration and audit records.
- Chat state root skeleton: reserved directories inside each chat workspace that future unified memory, artifact, and run-sandbox features can rely on.
- Path-guard utilities: helpers that normalize candidate paths, resolve symlinks, and reject any path outside the active chat root.
- Scoped upload store: updated upload and artifact helpers that place files inside chat-scoped or project-scoped roots.

## Data Flow

1. Tracohub startup resolves the data-home root and ensures required directories exist.
2. Project creation allocates a stable project workspace root derived from the immutable project ID.
3. Chat creation allocates a stable nested chat workspace root derived from the immutable chat ID.
4. Chat execution resolves the active workspace root and uses it as the only valid base for `cwd` changes.
5. Upload and artifact writes use the owning workspace root rather than a shared user-level directory.
6. Chat workspace creation reserves state subdirectories expected by the unified memory and artifact model.

## Failure Modes

- Relative or absolute requested working directories escape the assigned chat root.
- Provider-level working directories point outside the allowed project or chat root.
- Legacy local data is stranded because migration behavior is unclear.
- Node UUID regeneration breaks future node ownership and audit expectations.

# Tradeoffs

- Using immutable IDs for filesystem roots protects rename safety and avoids extra schema state, but makes direct shell browsing less human-friendly than raw names.
- A strict chat-root boundary is safer than project-wide write access, but it may require future explicit share rules for legitimate cross-chat collaboration.
- Home-root defaults improve portability across working directories, but introduce migration work for existing installs.

# Decisions

- Use immutable Project.id and Chat.id values as the canonical workspace path keys and future room key inputs.
- Use `TRACOHUB_DATA_HOME` as the single canonical override for home-root storage.
- Keep browser-instance scoping and persisted runtime node identity separate.
- Treat chat isolation as the default write boundary; broader sharing must be explicit and modeled later.
- Preserve current visibility and sharing behavior for now; this feature only establishes the local boundary model.
- Use copy-forward migration from legacy `${cwd}/.data` into the new home-root location with rollback guidance instead of long-lived legacy fallback.
- Make chat workspace creation compatible with FEAT-006 so later memory/artifact persistence does not require another root-layout migration.

# Open Risks

- Embedded and remote database modes may need different migration guidance if workspace metadata becomes persisted.
- Provider integrations that assume unrestricted `cwd` may break when chat-root enforcement is introduced.
- Local scripts or tests that assume `${cwd}/.data` may need explicit environment overrides.

# Change Log

- 2026-04-03: Bootstrapped local-isolation design from current hub storage and execution behavior.
- 2026-04-03: Approved design after fixing canonical data-home, ID-derived paths, and migration direction.