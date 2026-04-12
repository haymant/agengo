---
title: Hub Router Design
feature_id: hub-router
artifact: design
status: draft
version: 0.1
owner_agent: Architect
parent_feature: kb/features/hub-router
related_artifacts:
  - kb/features/hub-router/requirements.md
  - kb/features/hub-router/implementation-plan.md
  - kb/features/hub-router/testing-plan.md
  - kb/features/hub-channel/design.md
  - kb/features/hub-chat/design.md
  - kb/features/hub-isolated-workspaces/design.md
  - kb/features/hub-unified-memory-artifacts/design.md
  - kb/features/hub-sharing-remote-discovery/design.md
  - kb/features/hub-room-scoped-handoff/design.md
phase_gate: design-draft
last_updated: 2026-04-12
change_log:
  - Initial routing architecture for project-chat-thread-sub-room orchestration on 2026-04-12
---

# Design Summary

Hub-router should become the orchestration feature that ties together normalized channel envelopes, conversation binding, scope resolution, policy evaluation, local and remote route selection, and durable audit propagation. It should not redefine isolation, memory, discovery, or handoff contracts. Instead, it should coordinate FEAT-003, FEAT-004, FEAT-005, and FEAT-006 through one deterministic routing decision graph.

# Current State And Target State

Current state:

- Channel runtime contracts are DM-first and carry only conversation id, user id, and text.
- Route parsing already supports local provider mentions and same-room remote agent candidates.
- Remote handoff already models same-room remote execution for agent targets.
- Durable memory and artifact state are chat-scoped, with no first-class thread or sub-room metadata.

Target state:

- Every inbound channel payload is normalized into one canonical envelope.
- Chat routing resolves against project -> chat -> thread -> sub-room.
- Humans and agents can both participate in the same routable scope.
- Same-room remote targets remain constrained by discovery and handoff policy.
- Thread and sub-room metadata propagate into route selection, audit, memory, and artifact provenance.

# Architecture

## Canonical Inbound Envelope

The channel adapter layer should normalize provider payloads into one additive envelope with at least the following fields:

- `channelConfigId`
- `channelKind`
- `conversationType` as `dm` or `group`
- `externalConversationId`
- `externalConversationIds`
- `externalUserId`
- `externalUserIds`
- `externalGroupId` when distinct from conversation id
- `externalThreadId` when the provider supports topics or threads
- `displayName`
- `text`
- `mentions`
- `isMentioned`
- `isReplyToBridge`
- `replyToExternalMessageId`
- `replyToExternalUserId`
- trace metadata carried from the worker or route surface

Adapters remain responsible only for normalization. Routing decisions belong to hub-router.

## Scope Model

- `project`: durable ownership and broad policy boundary.
- `chat`: durable conversation boundary and share or pull unit.
- `thread`: lightweight partition under a chat for context separation and provider topic mapping.
- `sub-room`: participant-routing scope under a chat or thread, reserved for fine-grained membership and future meeting transport.

The default v1 resolution should create a deterministic `main` sub-room when no finer participant scope is required.

## Routing Decision Graph

1. Normalize inbound provider payload into the canonical envelope.
2. Resolve channel policy for DM versus group behavior.
3. Resolve or create the conversation binding.
4. Resolve thread from explicit provider topic or default thread.
5. Resolve sub-room from explicit binding or deterministic `main`.
6. Parse or resolve the addressed entity target.
7. Decide local versus remote route.
8. Deliver to a human target or execute for an agent target.
9. Persist durable audit and FEAT-006-compatible metadata.

## Entity Routing Semantics

- Local agent: route through the existing provider and agent selection path.
- Remote agent: route through FEAT-005 handoff after same-room validation.
- Local human: produce delivery, assignment, or notification semantics inside the current hub context.
- Remote human: produce remote delivery or notification semantics without invoking autonomous execution.

Deterministic precedence:

1. Explicit `@entity`
2. Explicit API override
3. Configured topic or sub-room binding
4. Default route for the current chat or thread

## Storage And Metadata Implications

- Additive persistence should introduce conversation-thread and sub-room records keyed to chat and optionally thread.
- Channel conversation bindings should extend to optional thread and sub-room references rather than forcing one external conversation to map to one flat chat only.
- FEAT-006 memory and artifact metadata should grow additive optional `threadId` and `subRoomId` fields rather than forking the schema.
- FEAT-003 workspace boundaries remain unchanged: thread and sub-room stay within the owning chat root.

## Provider Mapping Rules

- Telegram DM -> default thread + main sub-room.
- Telegram group -> default thread unless `message_thread_id` exists, then deterministic thread binding.
- WhatsApp DM -> default thread + main sub-room.
- WhatsApp group -> default thread + main sub-room in v1.

## Failure Modes

- Group traffic is auto-linked or executed as if it were a DM.
- Cross-room remote targets leak into route suggestions.
- Human targets are treated as autonomous agents.
- Thread and sub-room metadata diverge from the active route and corrupt FEAT-006 audit provenance.
- Provider normalization encodes routing policy assumptions and becomes non-portable across adapters.

# Decisions

- Keep thread and sub-room distinct in v1.
- Default every chat or thread to a deterministic `main` sub-room when no meeting-specific scope exists.
- Reuse FEAT-004 same-room discovery and FEAT-005 remote handoff for remote agent execution.
- Treat human routing as delivery or notification, not autonomous execution.
- Keep group support additive and fail-safe until channel-level policy explicitly enables it.

# Open Risks

- Current user-owned chat access patterns may need additive participant membership records before multi-entity routing becomes complete.
- Telegram and WhatsApp have different topic semantics, so normalization and fallback behavior must be explicit to avoid hidden divergence.
- UI complexity may rise if target grouping does not clearly separate local, remote, human, and agent targets.

# Change Log

- 2026-04-12: Created initial router architecture centered on a canonical inbound envelope, deterministic scope resolution, and same-room remote execution reuse.