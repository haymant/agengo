---
title: Hub Router Implementation Plan
feature_id: hub-router
artifact: implementation-plan
status: draft
version: 0.1
owner_agent: Developer
parent_feature: kb/features/hub-router
related_artifacts:
  - kb/features/hub-router/requirements.md
  - kb/features/hub-router/design.md
  - kb/features/hub-router/testing-plan.md
phase_gate: implementation-planned
last_updated: 2026-04-12
change_log:
  - Initial implementation slices for hierarchical multi-channel routing on 2026-04-12
  - Recorded implemented progress for persistence, worker envelopes, UI policy wiring, and FEAT-006 scope metadata on 2026-04-12
  - Recorded route-options refresh hardening and passing remote route-discovery verification on 2026-04-12
  - Added channel-identity mention suggestions and protected unknown prompt mentions from being misread as provider routes on 2026-04-12
  - Added Telegram privacy-mode diagnostics after confirming ordinary group messages were blocked before reaching Tracohub on 2026-04-12
---

# Plan Summary

Implement hub-router in five additive slices: KB and contracts, persistence and policy, inbound channel routing, route-option and execution integration, and audit plus verification hardening.

# Work Breakdown

1. Create the missing hub-router KB artifact set and validate it.
2. Extend runtime channel contracts so inbound envelopes can carry DM versus group, thread, reply, and mention metadata.
3. Add additive persistence for thread, sub-room, participant, and richer channel binding state.
4. Extend inbound Telegram and WhatsApp routing to produce normalized group and topic-aware envelopes.
5. Expand route resolution and route-option suggestions for human and agent targets across local and same-room remote scopes.
6. Reuse FEAT-005 for remote agent execution and preserve human delivery semantics as non-autonomous routing.
7. Propagate thread and sub-room metadata into FEAT-006-compatible audit and provenance paths.

# Slice Details

## Slice 1: KB And Runtime Contracts

- Create the hub-router KB files.
- Extend `hub/lib/channels/runtime-types.ts` with optional conversation, group, thread, mention, and reply metadata.
- Extend `hub/lib/channels/runtime-routing.ts` so group traffic fails safely and never auto-links as DM traffic.
- Add unit coverage for DM and group guard behavior.

## Slice 2: Persistence And Policy

- Add additive schema for thread, sub-room, participant, and richer channel conversation bindings in `hub/lib/db/schema.ts`.
- Add query helpers for deterministic thread and sub-room resolution.
- Extend channel configuration to carry group-policy and mention-policy inputs.

Current status:

- Implemented additive schema and migration support for `ChatThread`, `SubRoom`, `Participant`, `SubRoomParticipant`, richer `ChannelConversation`, and `Message_v2` scope metadata.
- Implemented query helpers for deterministic thread, sub-room, participant, and sub-room membership resolution.
- Implemented channel policy parsing and settings UI support for group-routing enablement, allowed-group lists, mention gating, and topic bindings.
 
### Sub-room membership decision and migration (v1)

- Decision: Use a small dedicated `sub_room_participants` table to own sub-room membership in v1.

- Rationale: Sub-rooms are an independent routing scope with many-to-many membership, role, and policy semantics. A normalized table simplifies queries, indexing, role/expiry metadata, auditing, and later extensions (invites, moderation, analytics).

- Minimal schema (suggestion):

  - `sub_room_participants`:
    - `id` (pk)
    - `sub_room_id` (fk -> `sub_rooms`)
    - `participant_id` (fk -> `participants` or canonical `userId/nodeId/agentId` tuple)
    - `role` (enum: `member|owner|moderator`)
    - `source` (string: `provider|auto|backfill`)
    - `joined_at` (timestamp)
    - `expires_at` (nullable timestamp)
    - `metadata` (jsonb)

  - Indexes: `(sub_room_id, participant_id)` and `(participant_id)`.

- Migration and backfill approach:

  1. Create `sub_room_participants` table in a non-blocking migration with constraints and indexes.
  2. Backfill defaults: for each existing `chat` create (if missing) a default `sub_room` and insert members from current `share`/`participants` as `member` rows with `source=backfill`.
  3. Update write paths: on join/leave, share updates, and channel binding changes write to `sub_room_participants` (ensure idempotent upserts).
  4. Switch read paths in routing/policy code to consult `sub_room_participants` for mention and delivery resolution.
  5. Deprecate any ad-hoc sub-room fields after verification and rollout.

- Tests and acceptance criteria for this slice:

  - Unit tests for join/leave, idempotent upserts, and role checks.
  - Integration tests validating mention-scoped delivery uses `sub_room_participants` for resolution.
  - Backfill correctness test comparing pre/backfill participant counts for a sample dataset.


## Slice 3: Inbound Telegram And WhatsApp Routing

- Update `hub/lib/channels/worker.ts` to emit the richer envelope for DM and group payloads.
- Start with Telegram group and topic metadata, then add WhatsApp group metadata.
- Update `hub/app/(chat)/api/channels/runtime/inbound/route.ts` to resolve richer bindings and safe group behavior.

Current status:

- Implemented Telegram and WhatsApp worker payload enrichment for DM versus group routing, including reply and mention metadata.
- Implemented inbound route policy checks for group allowlists and mention gating.
- Implemented deterministic thread and sub-room binding for grouped traffic in the runtime inbound route.
- Confirmed against the live `~/Documents/w0` runtime that the active Telegram channel had `enableGroupRouting=true`, `requireGroupMention=false`, an open group allowlist, and a valid default project, so the missing group chat was not caused by Tracohub policy gating.
- Confirmed the configured bot reported `canReadAllGroupMessages=false` from Telegram Bot API `getMe`, which means BotFather privacy mode was still blocking ordinary group messages before they reached the worker.
- Telegram startup and polling status now preserve a connected-state warning for that privacy-mode condition so the settings page can explain why ordinary group traffic is not creating chats.

## Slice 4: Route Options And Execution

- Extend `hub/lib/chat-routing.ts` and `hub/lib/chat-route-options.ts` for target grouping by locality and entity kind.
- Update `hub/app/(chat)/api/chat/route.ts` and supporting hooks or UI so `@` suggestions can route to local humans, local agents, remote humans, and remote agents.
- Keep remote agent execution on the FEAT-005 path.

Current status:

- Remote agent suggestions remain available through the existing same-room discovery path.
- Compact route-selector UI now exposes remote handoff agents directly in addition to the `@` mention flow.
- Route options now revalidate when the compact selector opens and when `@` mention discovery begins, preventing stale remote-candidate caches after project-scoped discovery changes.
- Route options now return mentionable channel identities discovered from enabled channel configs, and the composer prioritizes those identities in the local `@` suggestions.
- Unknown leading `@mentions` now remain plain prompt text unless they match a known local provider route, which prevents Telegram-style handles from being misrouted as provider targets.
- Human-target routing semantics remain unfinished and still need a dedicated delivery or notification implementation slice.

## Slice 5: Audit, Memory, And Verification

- Add optional `threadId` and `subRoomId` propagation in `hub/lib/state/commit-store.ts` and related FEAT-006-compatible flows.
- Expand end-to-end evidence for Telegram and WhatsApp DM and group flows.
- Record QA evidence and residual risk in the hub-router testing report.

Current status:

- Implemented optional `threadId` and `subRoomId` persistence in committed memory-bundle metadata and audit records.
- Added focused unit coverage and targeted Playwright evidence for persisted channel policy and commit-scope metadata.
- Added passing browser evidence for canonical remote route discovery in both the compact selector and the `@` mention flow.

# Dependencies

- FEAT-003 remains the workspace-boundary foundation.
- FEAT-004 remains the same-room remote-candidate source of truth.
- FEAT-005 remains the remote-agent execution path.
- FEAT-006 remains the durable memory and artifact contract.

# Validation Strategy

Run the repository KB validator against the hub-router feature folder before closing each artifact update.
- Run channel unit tests after Slice 1.
- Run routing and remote-discovery unit tests after Slices 3 and 4.
- Run integration and end-to-end tests after Slice 5 using two hub instances or the existing discovery harness.

# Rollback Notes

- Keep group routing behind additive channel-level policy switches until adapter parity is proven.
- If route-option UX becomes unstable, fall back to the existing local-only suggestion path while preserving the richer backend contracts.

# Change Log

- 2026-04-12: Created initial implementation plan covering KB, contracts, persistence, channel routing, route options, and verification.