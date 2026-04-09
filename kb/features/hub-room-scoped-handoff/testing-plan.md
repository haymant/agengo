---
title: Feature - Hub Room-Scoped Agent Handoff
feature_id: FEAT-005
artifact: testing-plan
status: draft
version: 1.4
owner_agent: qa
parent_feature: kb/features/hub-room-scoped-handoff
related_artifacts:
  - kb/features/hub-room-scoped-handoff/requirements.md
  - kb/features/hub-room-scoped-handoff/design.md
  - kb/features/hub-room-scoped-handoff/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-09
---

# Test Strategy

Validate that remote handoff uses explicit contracts, enforces same-room targeting, preserves local isolation, applies approval or redaction policy before export, and reconciles retries safely without duplicate durable effects.

# Coverage Matrix

| Acceptance Criterion | Test Layers | Planned Checks | Evidence Expectation |
| --- | --- | --- |
| Tracohub defines and documents contracts for `WorkSecret`, `SessionHandle`, `MemoryBundle`, `ArtifactMeta`, and `HandoffRecord` or clearly equivalent types. | Artifact review, unit, contract | Schema validation, field completeness, checksum and TTL semantics, backward-compatible serialization fixtures | Checked-in type or schema references, contract fixture set, and unit output proving accept or reject behavior for malformed payloads |
| Remote handoff is rejected when the target agent is not in the same shared room as the active chat. | Unit, route integration, end-to-end | Room-key comparison, stale registry handling, cross-room rejection, unshared-chat rejection, target-disappeared rejection | Request and response capture showing stable room ID mismatch rejection plus audit record showing denied decision state without remote session creation |
| Remote handoff payloads are restricted to scoped memory and artifacts from the active isolated context. | Unit, integration, end-to-end | Scope packaging, sibling-chat exclusion, project provenance allowlist, ACL enforcement, checksum binding to scoped payload members | Payload inspection, isolated fixture roots, audit record payload references, and negative tests proving out-of-scope entries are rejected or redacted |
| Large artifacts use metadata plus lazy fetch or signed retrieval instead of unconditional inline transfer. | Contract, integration, end-to-end | Inline threshold enforcement, metadata-only registration, authenticated lazy fetch, checksum verification, expired-fetch denial | Captured attach payloads, artifact metadata records, fetch request or response evidence, and proof that large blobs are not embedded in initial transfer |
| Handoff audit and reconciliation state is persisted and supports retry without duplicate artifact uploads. | Integration, failure injection, end-to-end | Start-session persistence, finalize idempotency, retry after token expiry, retry after network interruption, duplicate callback suppression | Audit state timeline, durable artifact counts before and after replay, reconciliation status transitions, and logs or DB evidence keyed by handoff ID and checksum |
| Safety and approval handling is defined for sensitive bundles. | Unit, integration, policy workflow | Classifier hook contract, auto-deny, auto-redact, manual approval required, approval expiry, denial audit path | Policy decision records, payload diffs before and after redaction, approval prompts or callbacks, and audit evidence showing blocked export when approval is absent |
| The receiving node can review and accept pending handoffs from a discoverable app UI. | End-to-end, UI integration | Sidebar inbox discoverability, canonical target labeling, pending-session rendering, explicit accept action, accept-time chat pull, auto-send bootstrap, accepted-state refresh | Playwright evidence showing a dispatched handoff appearing in the target inbox UI, being accepted from the UI, redirecting into a pulled chat, auto-submitting the task prompt there, and reflecting accepted state back to the source node |

# Contract Test Matrix

| Contract Area | Checks |
| --- | --- |
| `WorkSecret` | Verify short-lived expiry, room and session scope binding, rejection after expiry, rejection on room mismatch, and non-reusability across unrelated handoff IDs. |
| `SessionHandle` | Verify session identifier uniqueness, source-node and target-node binding, allowed operations, and denial when a handle is reused after finalize or cancel. |
| `MemoryBundle` | Verify stable serialization, entry-level and bundle-level checksum behavior, ACL and provenance fields, inline-size threshold behavior, and explicit rejection of unsupported entry types. |
| `ArtifactMeta` | Verify filename, MIME, size, checksum, producer, ACL, optional fetch URL, metadata-only transfer, and rejection of blob and metadata mismatches. |
| `HandoffRecord` | Verify immutable or append-only audit fields for handoff ID, room, source, target, decision mode, payload references, retries, reconciliation state, and produced-artifact linkage. |

# Scenario Inventory

## Positive Path

1. Start a same-room handoff from a shared chat and verify a short-lived authorized session is created with the expected room-bound scope.
2. Verify the receiver node sees the dispatched session in its inbox over the configured shared-root or Society-backed transport and can accept it explicitly.
3. Verify the receiver can open the app inbox UI, identify the handoff by canonical target label and task text, accept it without calling the API directly, and land in the pulled chat with the task prompt auto-submitted.
4. Attach a small `MemoryBundle` inline and verify the receiver can consume it without requiring secondary fetches.
5. Register a large artifact as `ArtifactMeta` only, perform lazy fetch with the authorized session, and verify checksum validation before use.
6. Finalize a successful handoff and verify audit state transitions from initiated to attached to accepted to finalized to reconciled.
7. Return produced artifacts from the remote side and verify they are registered once and linked back to the originating handoff record.

## Negative And Abuse Cases

1. Attempt a handoff to a target in another room and verify rejection before any remote session is minted.
2. Attempt a handoff from a local-only or unshared chat and verify rejection.
3. Attempt to package memory or artifacts from a sibling chat, sibling project, or mutable project-level file and verify rejection.
4. Attempt to transfer project-level provenance beyond the approved allowlist and verify rejection.
5. Attempt to attach a `MemoryBundle` with checksum mismatch and verify contract failure.
6. Attempt to fetch a large artifact with an expired or wrong-scope `WorkSecret` and verify denial.
7. Attempt to replay an attach-memory, register-artifact, or finalize request under a different handoff ID and verify denial.
8. Attempt to finalize after the handoff is cancelled or denied and verify no durable state is changed.

## Retry And Reconciliation Cases

1. Expire the authorization token after session creation but before artifact fetch and verify the retry path issues a fresh scoped authorization without duplicating audit rows.
2. Interrupt the network after artifact registration but before finalize and verify resume behavior preserves prior artifact metadata and does not re-upload the same blob.
3. Replay finalize with the same handoff ID and checksums and verify idempotent success or an explicit duplicate-noop response.
4. Replay finalize with the same handoff ID but different produced-artifact checksum and verify reconciliation failure is recorded.
5. Retry after the target disappears from the room and verify the handoff remains failed or pending reconciliation rather than silently re-targeting another agent.
6. Verify reconciliation remains safe when the local pulled snapshot diverges from the original remote source between start and finalize.

## Approval And Redaction Cases

1. Mark a bundle as low risk and verify it can transfer without manual approval while still producing a policy decision record.
2. Mark a bundle as approval-required and verify transfer is blocked until approval is granted.
3. Deny approval and verify no remote session attachments are persisted beyond denied audit metadata.
4. Apply redaction to a sensitive bundle and verify only the approved redacted fields are exported while the original local state remains unchanged.
5. Let approval expire before finalize and verify the handoff is blocked or cancelled according to policy.
6. Verify remote-produced artifacts inherit the expected safety disposition and are not auto-applied locally without the approved decision path if that remains gated in v1.

# Data and Environment

- Requires at least two hub nodes or a controlled remote-handoff test double.
- Shared-root or Society sidecar transport must be configurable so the receiver inbox can be exercised across nodes, not only through local store calls.
- Requires isolated workspaces and sharing or discovery features to be present.
- Should include fixture rooms for same-room, cross-room, stale-room, and unshared-chat conditions.
- Should include memory fixtures with active-chat entries, sibling-chat entries, approved immutable git provenance, disallowed mutable project files, and sensitivity labels.
- Should include artifact fixtures below and above the inline threshold plus checksum-corrupted variants.
- Should include approval-policy fixtures for allow, redact, manual-approval, deny, and approval-expired outcomes.
- Should support failure injection for token expiry, network interruption, duplicate callbacks, and divergent local snapshots.

# Evidence Expectations

- Each acceptance criterion must map to at least one automated check and one concrete evidence row in `testing-report.md`.
- Evidence for room gating must capture the stable room ID or key used for the allow or deny decision rather than only UI labels.
- Evidence for scope control must show the exact payload members exported and confirm excluded out-of-scope members were rejected or redacted.
- Evidence for lazy fetch must include proof that the initial handoff payload omitted the large blob body.
- Evidence for retry and reconciliation must include before and after durable artifact counts or equivalent audit-state evidence keyed by handoff ID.
- Evidence for approval or redaction must include the policy decision, resulting payload shape, and resulting audit state.
- Evidence for the receiver inbox must show the user-facing queue entry, canonical remote identity, accept action, and accepted-state reflection rather than only API payloads.

# Exit Criteria

- All six acceptance criteria have direct evidence with pass, fail, or partial disposition.
- Remote handoff succeeds only for same-room targets and is denied for cross-room, stale-registry, and unshared-chat scenarios.
- Payloads are provably scoped to the active isolated context, with explicit evidence for both allowlisted provenance and rejected out-of-scope content.
- Retry, reconciliation, and approval or redaction behaviors are evidenced with artifact-count and audit-state outcomes.
- Residual risk calls out any policy ambiguity that remains unresolved for automatic local apply-back of remote-produced artifacts.

# Change Log

- 2026-04-03: Bootstrapped testing plan for room-scoped remote handoff.
- 2026-04-03: Expanded coverage depth with contract, negative, retry, reconciliation, approval, redaction, and evidence-expectation planning for FEAT-005.
- 2026-04-09: Added explicit receiver-inbox and accept coverage expectations for the implemented shared-transport handoff slice.
- 2026-04-09: Added explicit app-level inbox discoverability and canonical remote-label coverage for the receiver acceptance UX.
- 2026-04-09: Added accept-time pull and auto-send bootstrap coverage expectations for the receiver acceptance flow.