---
title: Feature - Hub Sharing And Remote Discovery
feature_id: FEAT-004
artifact: requirements
status: approved
version: 1.2
owner_agent: ba
parent_feature: kb/features/hub-sharing-remote-discovery
related_artifacts:
  - kb/features/hub-sharing-remote-discovery/design.md
  - kb/features/hub-sharing-remote-discovery/implementation-plan.md
  - kb/features/hub-sharing-remote-discovery/testing-plan.md
  - kb/features/hub-sharing-remote-discovery/testing-report.md
jira_keys: []
phase_gate: requirements-approved
last_updated: 2026-04-03
---

# Context

Tracohub already groups chats by project and exposes provider or agent routing through `@provider/agent` mentions, but it does not support controlled publication of projects or chats to remote peers, pulling shared scopes into local copies, or discovering remote agents in the current room while typing `@`. This feature defines the user-facing share and pull model plus the remote discovery layer that should precede actual remote handoff execution.

The first release should optimize for safety and clarity: unshared scopes remain local by default, and shared scopes are pulled as read-only snapshots into local copies rather than live synchronized mounts.

# Goals

- Keep projects and chats local and unexposed by default.
- Add explicit project share and pull workflows in the UI.
- Add explicit chat share and pull workflows in the UI.
- Allow `@` mention suggestions to show remote candidate agents that are registered in the same shared room.
- Standardize remote-facing resource identity so published projects, chats, and remote agents can be referenced and searched through the human-readable path `userId/nodeName/resourceName` while internal room and node IDs remain the authorization source of truth.
- Keep pulled projects and chats as local copies with immutable provenance, optionally linked to a git URL or revision as versioned memory.

# Non-goals

- This feature does not implement the remote execution payload and finalize flow itself.
- This feature does not create live two-way synchronization between nodes.
- This feature does not broaden write access across sibling chats or unrelated projects.

# Assumptions And Constraints

- Projects and chats remain local and undiscoverable until the user explicitly shares them.
- Shared resources are published as snapshots, and pulls create local copies rather than remote mounts.
- Stable internal room keys or IDs, not mutable display labels, define discovery boundaries.
- Public remote identity labels must be user-configurable and distinct from internal auth primary keys and internal node UUIDs.

# Requirements

## Functional

- Newly created projects must remain unshared and undiscoverable by remote nodes by default.
- The project list UI must expose a share action beside each project and a pull-remote-project action near the existing new-project control.
- Share and pull actions must use vocabulary that is distinct from the existing local visibility control so users do not mistake visibility settings for remote publication state.
- Sharing a project must publish only the intended project metadata and allowed discovery state, and must not expose remote chat execution for chats that have not themselves been shared.
- Pulling a remote project must create a snapshot-based local copy rooted in the current node’s isolated workspace model rather than a live remote mount.
- Newly created chats must remain unshared and undiscoverable by remote nodes by default.
- The chat UI must expose a share action for the active chat.
- A pulled project must allow the user to pull remote chats as snapshot-based local copies.
- Pulled project and chat snapshots must expose an explicit re-pull or refresh affordance so users can request a newer snapshot without implying live synchronization.
- Remote route discovery must list only agents that are registered in the same shared room, identified by stable internal room keys or IDs, as the current context.
- Typing `@` in a shared chat must surface both local agents and same-room remote candidate agents, grouped and clearly labeled, alongside existing local route options.
- Remote candidate metadata must distinguish node identity, room context, locality or shared-state label, and capability summary.
- Remote candidate, project, and chat discovery metadata must expose a canonical human-readable path in the form `userId/nodeName/resourceName`, while preserving internal stable ids for authorization and routing.
- Project and chat pull surfaces must allow users to search remote snapshots by the canonical `userId/nodeName/resourceName` path as well as by resource title.
- If a shared project is linked to git, immutable git provenance including git URL and revision must be stored with the pulled local copy when available.

## Non-functional

- The first share model must be snapshot-based, not live synchronized.
- Discovery state must respect the local default of non-exposure until the user explicitly shares a scope.
- The UI must make local, shared, and pulled states understandable without requiring users to inspect raw metadata, and must keep share or pull state distinct from existing local visibility language.
- The UI must present human-readable remote identity labels without exposing internal auth UUIDs or internal node UUIDs as the primary user-facing address.
- The design must preserve existing local provider routing for users who never enable p2p sharing.
- Snapshot pulls must make it clear that the local copy may diverge from the remote source until the user performs another explicit pull.

# Acceptance Criteria

- [ ] A new project stays local by default and can be explicitly shared from the project list UI.
- [ ] A user can pull a remote project into a local isolated copy.
- [ ] A new chat stays local by default and can be explicitly shared from the chat UI.
- [ ] A pulled project can expose a pull-chat workflow for remote chats.
- [ ] Share and pull controls are labeled distinctly from the existing visibility control vocabulary.
- [ ] Pulled snapshots expose an explicit re-pull or refresh affordance that preserves snapshot semantics.
- [ ] Typing `@` in a shared chat lists local agents and remote agents that are registered in the same room, grouped and clearly labeled.
- [ ] Remote project, chat, and agent references are shown in the canonical `userId/nodeName/resourceName` format while internal ids remain hidden from the default UI.
- [ ] Remote project and chat pull flows can search or filter by canonical `userId/nodeName/resourceName` labels.
- [ ] Remote discovery state is clearly labeled as local, shared, or pulled and does not expose unrelated scopes.

# Open Questions

- None at BA requirements level after aligning v1 with explicit share or pull vocabulary and explicit re-pull or refresh affordances.

# Change Log

- 2026-04-03: Bootstrapped from current project and chat UI inspection plus p2p planning decisions.
- 2026-04-03: Approved BA requirements after recording local-by-default exposure, snapshot pull semantics, same-room discovery, and immutable git provenance.
- 2026-04-03: Refined approved requirements to keep share or pull vocabulary separate from visibility controls and to require explicit re-pull or refresh affordances for pulled snapshots.
- 2026-04-08: Added the canonical human-readable remote identity contract `userId/nodeName/resourceName` for remote project, chat, and agent discovery plus searchability requirements for pull flows.