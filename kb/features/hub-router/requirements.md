---
title: Hub Router Requirements
feature_id: hub-router
artifact: requirements
status: draft
version: 0.1
owner_agent: BA
parent_feature: kb/features/hub-router
related_artifacts:
  - kb/features/hub-router/design.md
  - kb/features/hub-router/implementation-plan.md
  - kb/features/hub-router/testing-plan.md
  - kb/features/hub-router/testing-report.md
phase_gate: requirements-draft
last_updated: 2026-04-12
change_log:
  - Initial BA requirements for hierarchical multi-channel routing on 2026-04-12
---

# Context

Tracohub already supports local chat routing, same-room remote candidate discovery, and remote handoff foundations, but it does not yet define one canonical router feature that governs how channel traffic, local and remote entities, policy checks, and hierarchical conversation scopes resolve together. The current channel runtime is effectively DM-first. Group chat semantics, thread isolation, sub-room routing, and routable human participants are not yet first-class.

This feature defines the canonical routing model for project -> chat -> thread -> sub-room and prepares the hub to support Telegram and WhatsApp DM and group chat in a way that remains compatible with isolated workspaces, unified memory and artifacts, same-room discovery, and room-scoped handoff.

# Goals

- Define one canonical routing feature that owns inbound channel normalization, conversation binding, target resolution, and local versus remote execution decisions.
- Preserve the existing hierarchy of project -> chat while adding thread and sub-room as first-class routing scopes.
- Support Telegram and WhatsApp DM and group chat flows under one policy model.
- Allow both humans and agents to join and be addressed inside the same conversation scope.
- Keep remote routing restricted to same-room candidates discovered through existing share and handoff features.
- Preserve future extensibility for sub-room level meeting integrations such as LiveKit and Teams.

# Non-goals

- This feature does not implement LiveKit and Teams or any real-time meeting transport in v1.
- This feature does not broaden routing beyond same-room boundaries.
- This feature does not replace FEAT-003, FEAT-004, FEAT-005, or FEAT-006 contracts.
- This feature does not introduce live synchronization across pulled chats.

# Assumptions And Constraints

- Project and chat remain the primary durable workspace boundaries from FEAT-003.
- Thread is a lightweight context partition inside a chat.
- Sub-room is a participant-routing scope under a chat or thread and must remain distinct from thread in v1.
  - Same-room discovery and remote execution must reuse a room-scoped identity tuple: `roomId + nodeId + agentId` (binds a specific agent instance within the active room for handoff and remote execution).
  - Addressing and durable participant identity use the canonical participant tuple: `userId/nodeId/agentId`, which identifies an actor independent of room context and is used for mentions, participant records, and long-lived membership.
- Humans and agents are both addressable targets in v1, but only agents trigger autonomous execution.
- Provider-specific adapter logic must normalize payloads into a canonical envelope rather than owning routing policy.

# Requirements

## Functional

- Tracohub must define four routing scopes with stable meanings: `project`, `chat`, `thread`, and `sub-room`.
- Tracohub must define first-class participant kinds for local human, local agent, remote human, remote agent, and channel identity.
- Typing `@` in a routable context must support local and same-room remote targets and distinguish humans from agents.
- The router must apply deterministic precedence in this order: explicit `@entity`, explicit API override, configured topic or sub-room binding, then default chat route.
- Telegram DM messages must bind to a chat-level default thread and default sub-room.
- Telegram group messages must bind to a chat-level default thread unless Telegram topic metadata is present, in which case the router must resolve a deterministic thread binding from the provider topic identifier.
- WhatsApp DM messages must bind to a chat-level default thread and default sub-room.
- WhatsApp group messages must bind to a chat-level default thread in v1 unless Tracohub policy defines a finer local partition.
- Telegram and WhatsApp group messages must support mention-gated activation and reply-to-bot activation where the provider payload supports those signals.
- Channel policy must support DM allowlists, group allowlists, sender allowlists, group mention requirements, and optional topic bindings.
- The router must allow agents defined in different isolated workspaces to join the same conversation only when policy permits and the target remains in the same room as the active conversation.
- Human participants must be routable targets for delivery or notification semantics without being treated as autonomous execution agents.
- Agent-targeted remote routing must reuse FEAT-005 handoff rather than creating a second remote execution protocol.
- Durable memory, artifact provenance, and audit records must be able to carry `threadId` and `subRoomId` metadata without breaking FEAT-006 compatibility.

## Non-functional

- Group routing must fail safely and must not silently auto-link group conversations as if they were DMs.
- The routing model must remain backward-compatible for existing DM-only integrations until group support is enabled per channel.
- The UI must clearly distinguish local versus remote and human versus agent targets in route suggestions.
- The design must keep transport normalization, routing policy, and execution orchestration in separate module boundaries.
- The implementation must produce testable behavior for Telegram and WhatsApp DM and group chat without requiring LiveKit and Teams or meeting transport.

# Acceptance Criteria

- [ ] The hub-router feature folder contains complete requirements, design, implementation-plan, testing-plan, and testing-report artifacts with coherent frontmatter.
- [ ] The router defines and documents stable project, chat, thread, and sub-room semantics.
- [ ] Telegram and WhatsApp DM and group routing requirements are explicitly captured, including mention gating and topic mapping behavior.
- [ ] Both humans and agents are documented as routable entities, with autonomous execution restricted to agent targets.
- [ ] Same-room remote routing reuses existing FEAT-004 discovery and FEAT-005 handoff identity contracts.
- [ ] The implementation plan defines additive schema, runtime-contract, policy, and test slices that are feasible to ship incrementally.

## Open Questions (decided)

- Which minimal participant membership record should own sub-room membership in v1: a dedicated participant table, or additive fields on existing share and route records?

  - Decision: Use a dedicated `sub_room_participants` table to own sub-room membership in v1.
  - Rationale: Sub-rooms are an independent routing scope with many-to-many membership, role and policy semantics; a normalized table simplifies queries, indexing, role/expiry metadata, auditing, and future extensions (invites, moderation).

- Should Telegram and WhatsApp group routing remain feature-flagged independently during rollout, or should channel-level enablement be atomic per provider?

  - Decision: Channel-level enablement will be atomic per provider (enable group routing per provider independently).
  - Rationale: Providers differ in topic/thread semantics, permission and policy models, and operational risk. Making group routing atomic per provider enables independent testing, safer rollouts, and clearer policy tuning while keeping group semantics stable.


# Change Log

- 2026-04-12: Created initial BA requirements for hierarchical router orchestration, DM and group channel support, and thread versus sub-room separation.