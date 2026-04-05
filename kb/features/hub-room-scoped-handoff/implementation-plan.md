---
title: Feature - Hub Room-Scoped Agent Handoff
feature_id: FEAT-005
artifact: implementation-plan
status: draft
version: 1.7
owner_agent: developer
parent_feature: kb/features/hub-room-scoped-handoff
related_artifacts:
  - kb/features/hub-room-scoped-handoff/requirements.md
  - kb/features/hub-room-scoped-handoff/design.md
  - kb/features/hub-room-scoped-handoff/testing-plan.md
phase_gate: implementation-in-progress
last_updated: 2026-04-05
---

# Plan Summary

Implement remote handoff after isolation and discovery are in place: define contracts, persist audit state, add room-gated handoff services, then add finalize and reconciliation behavior.

# Work Breakdown

1. Define Tracohub handoff types and persistence models for memory, artifact, and audit metadata.
2. Add same-room validation for any remote handoff request.
3. Implement `POST /api/handoff/v1/sessions` and `POST /api/handoff/v1/sessions/{sessionId}/memory` with short-lived authorization.
4. Implement `POST /api/handoff/v1/sessions/{sessionId}/artifacts` plus metadata-only or lazy-fetch transfer behavior.
5. Implement `POST /api/handoff/v1/sessions/{sessionId}/finalize` and `abort` flows with checksum-based deduplication.
6. Add approval or classifier hooks for sensitive memory and artifact exports.
7. Ensure returned outputs apply through the FEAT-006 commit API rather than direct writes.

# Current Implementation State

- The PeerTrust-backed auth slice is implemented and remains the canonical token path for FEAT-005.
- The first control-plane slice is now implemented with additive `/api/handoff/v1/sessions` route handlers for create, memory attach, artifact registration, remote fetch, finalize, abort, and local status inspection.
- Same-room target validation is now enforced at session creation by matching the selected remote candidate against the active chat room and requiring the source chat to be explicitly shared.
- Finalize still stages remote outputs first, but Tracohub now exposes an explicit authenticated apply-back route that commits accepted returned memory and artifact metadata through the FEAT-006 commit API and marks the session reconciled.
- Authenticated Playwright coverage now exercises the route layer for create, same-room rejection, memory fetch, artifact fetch, finalize, explicit apply-back, and apply replay on the implemented control plane.
- Approval policy is currently heuristic and inline (`allow`, `approve`, `redact`, `deny`) rather than backed by a user-facing review workflow.
- FEAT-004 now has an initial Society sidecar transport foundation for remote candidate discovery and snapshot publication or fetch when `TRACOHUB_SHARE_ROOT` is unset, which is the intended transport substrate for later remote `@` execution and cross-node handoff delivery.
- The chat route-selection model and composer state now carry `targetNodeId` for node-first remote `@` selection, and the chat POST route now uses that request contract to bootstrap a first FEAT-005 dispatch slice instead of rejecting remote execution outright.
- The first remote composer UX slice is now implemented: selecting a remote node or agent leaves a visible `@nodeId/agentId` route marker in the composer, remote selection is no longer hidden entirely in local component state, and prompt submission strips the stored route marker before sending the user prompt body.
- The first source-side remote dispatch slice is now implemented: `/api/chat` auto-shares the source chat when needed, creates a same-room FEAT-005 handoff session, attaches current chat-history memory to that session, and returns a queued handoff acknowledgement in the chat stream while execution remains pending receiving-node review and acceptance.

# Dependencies

- The isolated-workspace feature must land first so memory and artifact packaging can enforce local boundaries.
- The unified memory and artifact model must land before remote handoff so payload serialization, provenance handling, and commit semantics are canonical.
- The sharing and remote-discovery feature must land first so room membership and remote target selection are defined.
- The FEAT-004 `roomId + nodeId + agentId` identity tuple and remote-discovery cache rules must be treated as canonical.
- Route-handler placement is now defined in design; do not introduce a separate Python-only control plane.

# Validation Strategy

- Unit-test serialization, checksuming, TTL behavior, and same-room validation.
- Integration-test attach-memory, metadata-only artifact transfer, finalize, retry, and deduplication behavior.
- Exercise failure injection for token expiry, network interruption, and duplicate finalize calls.
- Verify that no payload includes files or references outside the active isolated context.

# Rollback Notes

- Feature-flag remote handoff independently from sharing and remote discovery so discovery can ship earlier if needed.
- If finalize or reconciliation behavior is unstable, keep remote handoff disabled while preserving the discovery model and local-only chat execution.

# Change Log

- 2026-04-03: Bootstrapped implementation plan for room-scoped remote handoff.
- 2026-04-03: Refined implementation plan to match the concrete `/api/handoff/v1` surface and FEAT-006 commit-path integration.
- 2026-04-04: Marked implementation in progress after landing session APIs, same-room gating, staged finalize behavior, and focused handoff-store tests.
- 2026-04-04: Added explicit staged apply-back reconciliation, persisted reconcile results for idempotent replays, and expanded focused handoff-store coverage for same-room rejection and commit-path apply-back.
- 2026-04-05: Added route-level Playwright coverage for the FEAT-005 control plane and narrowed the remaining work to Society SIT, large-artifact transfer, and approval workflow evidence.
- 2026-04-05: Recorded the FEAT-004 Society sidecar foundation as the intended substrate for later remote `@` execution and handoff delivery.
- 2026-04-05: Added node-aware remote composer routing scaffolding (`targetNodeId`, node-first `@` selection, and an explicit server guard) so the next slice can attach the composer to the FEAT-005 handoff session flow without changing the request contract again.
- 2026-04-05: Implemented the first durable remote composer UX slice so remote node and agent selections render as visible `@nodeId/agentId` markers, remote node suggestions no longer render malformed labels, and focused unit coverage now locks the route-marker formatting and prompt-stripping behavior.
- 2026-04-05: Replaced the `/api/chat` remote-execution rejection with a first dispatch path that auto-publishes the source chat, bootstraps a FEAT-005 handoff session, attaches current chat-history memory, and persists a pending remote handoff while receiving-node acceptance remains the next implementation slice.