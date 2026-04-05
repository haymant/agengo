---
title: Feature - Hub Room-Scoped Agent Handoff
feature_id: FEAT-005
artifact: testing-report
status: draft
version: 1.6
owner_agent: qa
parent_feature: kb/features/hub-room-scoped-handoff
related_artifacts:
  - kb/features/hub-room-scoped-handoff/requirements.md
  - kb/features/hub-room-scoped-handoff/testing-plan.md
phase_gate: testing-in-progress
last_updated: 2026-04-05
---

# Result Summary

The FEAT-005 auth slice is implemented and the handoff control plane now has authenticated route-level evidence in addition to focused store tests. Tracohub can create room-gated handoff sessions, reject cross-room targets, attach scoped memory, register metadata-only artifacts, serve remote fetch endpoints with scoped bearer-token checks, stage finalize results, and then commit accepted returned outputs back through the FEAT-006 commit path with explicit apply-back reconciliation. The chat composer now preserves node-aware remote route intent through a `targetNodeId` request field and the `/api/chat` route can bootstrap a first source-side remote handoff dispatch by auto-sharing the source chat, creating a same-room session, and attaching current chat-history memory. Receiving-node review, double-confirm acceptance, and actual remote execution remain pending.

# Coverage Matrix

| Acceptance Criterion | Planned Evidence Shape | Current Disposition | Notes |
| --- | --- | --- | --- |
| Tracohub defines and documents contracts for `WorkSecret`, `SessionHandle`, `MemoryBundle`, `ArtifactMeta`, and `HandoffRecord` or clearly equivalent types. | Type or schema references, contract fixtures, unit results | Partial | `WorkSecret` JWT issuance and verification are implemented; remaining handoff session and reconciliation endpoints are still pending. |
| Remote handoff is rejected when the target agent is not in the same shared room as the active chat. | Route or API payload capture, denied audit row, end-to-end rejection result | Passed | Route-level Playwright coverage now proves the `/api/handoff/v1/sessions` endpoint rejects a cross-room target before a usable remote session is established. |
| Remote handoff payloads are restricted to scoped memory and artifacts from the active isolated context. | Payload inspection, excluded-member rejection evidence, audit payload references | Partial | Route-level coverage now proves explicitly attached memory and artifact metadata flow through both the dedicated handoff APIs and the new `/api/chat` source-side dispatch path, but broader out-of-scope and sibling-context rejection coverage is still pending. |
| Large artifacts use metadata plus lazy fetch or signed retrieval instead of unconditional inline transfer. | Attach payload capture, `ArtifactMeta` persistence, lazy-fetch request and checksum evidence | Partial | Artifact registration is metadata-only and remote fetch reads the metadata record; byte-stream transport is still pending. |
| Handoff audit and reconciliation state is persisted and supports retry without duplicate artifact uploads. | Audit timeline, artifact counts before and after replay, retry logs | Partial | Route-level coverage now proves explicit apply-back replay returns the persisted reconcile result, but network interruption, token-expiry retry, and duplicate artifact-upload failure injection are still pending. |
| Safety and approval handling is defined for sensitive bundles. | Policy decision records, redacted payload evidence, denial and approval traces | Partial | Inline export-policy classification now records `allow`/`approve`/`redact`/`deny`; no human review workflow exists yet. |

# Evidence Table

| Check | Result | Notes |
| --- | --- | --- |
| Claude-style handoff study reviewed | Observed | Short-lived authorization, memory bundles, artifact metadata, lazy fetch, and audit records were captured as design inputs. |
| Current hub route and execution model reviewed | Observed | Hub currently has provider routing but no remote handoff control plane. |
| FEAT-004 dependency reviewed | Observed | Current discovery model is still local-only, so same-room remote target selection is not implemented yet. |
| FEAT-006 dependency reviewed | Observed | Canonical memory and artifact transport types remain planned rather than implemented. |
| WorkSecret JWT issuance and verification | Passed | `hub/lib/worksecret.ts` now issues signed JWTs, verifies them offline, exports JWKS, and supports revocation checks. |
| JWKS publication | Passed | `hub/app/.well-known/jwks.json/route.ts` returns the current public verification key set. |
| Automated handoff evidence | Partial | `pnpm exec tsx tests/unit/worksecret.test.ts` passed on 2026-04-03 for issue/verify, expiry, revocation, and JWKS export. Full stream/auth integration is still pending. |
| Browser-level JWKS verification | Passed | `pnpm -C /home/data/git/haymant/traco/hub exec playwright test tests/e2e/hub-features.test.ts --project=e2e` passed on 2026-04-03 and verified the published JWKS exposes the configured `playwright-worksecret` key. |
| Session control-plane persistence | Passed (store slice) | `hub/lib/handoff-store.ts` now persists session records, memory attachments, artifact registrations, staged finalize payloads, and idempotency markers under the Tracohub data home. |
| Same-room gating at session creation | Passed (store slice) | Session creation now requires both an active shared-chat record and a matching same-room remote candidate tuple (`roomId`, `nodeId`, `agentId`), and the focused test now covers a cross-room rejection path. |
| Explicit staged apply-back reconciliation | Passed (store slice) | `hub/lib/handoff-store.ts` now exposes an authenticated apply-back path that commits accepted returned outputs through FEAT-006 and marks the session `reconciled`. |
| Focused automated handoff evidence | Passed | `pnpm exec tsx tests/unit/handoff-store.test.ts` passed on 2026-04-04 for session creation, same-room rejection, memory attach, staged finalize behavior, and apply-back reconciliation. |
| Authenticated handoff route integration | Passed | `PORT=3101 pnpm exec playwright test tests/e2e/hub-features.test.ts --project=e2e` passed on 2026-04-05 for chat share prerequisite, cross-room session rejection, session creation, bearer-auth memory fetch, bearer-auth artifact fetch, staged finalize, explicit apply-back, apply replay, and persisted FEAT-006 commit evidence. |
| Node-aware remote composer routing scaffold | Passed (unit) | `pnpm exec tsx tests/unit/chat-routing.test.ts` passed on 2026-04-05 for `targetNodeId` route resolution, node-first remote mention suggestions, and remote-agent route selection. |
| Source-side remote chat dispatch through `/api/chat` | Passed (route slice) | `PORT=3101 pnpm exec playwright test tests/e2e/hub-features.test.ts -g "dispatches a remote handoff from the chat API and persists a pending session"` passed on 2026-04-05 and verified remote composer dispatch auto-created a chat share, persisted a same-room FEAT-005 session, attached current chat-history memory, and emitted a queued-handoff assistant acknowledgement. |

# Defects

- No open product defect is recorded for the core FEAT-005 control plane after the current route-level coverage pass.
- Large-artifact transfer, failure-injection retry coverage, and approval UX remain incomplete slices rather than regressions in the implemented control plane.
- Receiving-node review, double-confirm acceptance, and actual remote execution remain open slices for the newly added `/api/chat` source-dispatch path.

# Acceptance Criteria Disposition

- [x] Tracohub defines and documents contracts for `WorkSecret`, `SessionHandle`, `MemoryBundle`, `ArtifactMeta`, and `HandoffRecord` or clearly equivalent types.
- [x] Remote handoff is rejected when the target agent is not in the same shared room as the active chat.
- [ ] Remote handoff payloads are restricted to scoped memory and artifacts from the active isolated context.
- [ ] Large artifacts use metadata plus lazy fetch or signed retrieval instead of unconditional inline transfer.
- [ ] Handoff audit and reconciliation state is persisted and supports retry without duplicate artifact uploads.
- [ ] Safety and approval handling is defined for sensitive bundles.

Notes:
The core handoff routes now have authenticated happy-path and same-room rejection evidence. The remaining open criteria are held open by missing failure-injection, large-artifact transfer, and approval-workflow evidence rather than by missing base control-plane routes.

# Residual Risk Statement

Residual risk remains medium. The auth, session-control, apply-back, and first source-side dispatch slices are now proven through focused store tests and route-level coverage, but the largest remaining gaps are receiving-node acceptance, actual remote execution, same-host Society handoff SIT, large-artifact lazy fetch, and the missing user-facing approval workflow for sensitive exports.

# Follow-ups

- Add integration and failure-injection evidence for same-room gating, artifact transfer, finalize, retry, reconciliation, and approval/redaction behavior.
- Wire the same-host Society harness into automated SIT so the room-gated control plane is exercised across two nodes.
- Add a user-facing review workflow for staged finalize outputs and sensitive export-policy decisions.
- Add large-artifact lazy-fetch or signed-retrieval evidence once the artifact-blob path is implemented or explicitly scoped.

# Change Log

- 2026-04-03: Bootstrapped testing report from handoff study and architecture review.
- 2026-04-03: Expanded the report structure so later QA evidence can capture coverage matrix, evidence table, defects, and residual risk at acceptance-criterion depth.
- 2026-04-03: Updated with implemented WorkSecret JWT auth, JWKS publication, and passing unit-test evidence.
- 2026-04-03: Added Playwright JWKS verification evidence for the implemented FEAT-005 auth slice.
- 2026-04-04: Added evidence for the handoff session store/control-plane slice, same-room gating, staged finalize behavior, and the focused handoff-store unit test.
- 2026-04-04: Added evidence for explicit apply-back reconciliation, persisted reconcile results, and expanded focused handoff-store coverage for same-room rejection and commit-path apply-back.
- 2026-04-05: Added authenticated Playwright route evidence for cross-room rejection, bearer fetches, finalize, explicit apply-back, replay behavior, and persisted FEAT-006 reconciliation output.
- 2026-04-05: Added unit evidence for node-aware remote composer routing scaffolding while keeping remote chat-route execution explicitly guarded until handoff session dispatch is implemented.
- 2026-04-05: Added route-level evidence that `/api/chat` now bootstraps a pending FEAT-005 remote handoff session for remote composer requests by auto-sharing the chat, attaching current chat-history memory, and returning a queued-handoff acknowledgement.