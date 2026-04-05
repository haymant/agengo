---
title: Testing Report
feature_id: FEAT-006
artifact: testing_report
status: draft
version: 0.1
owner_agent: QA
parent_feature: kb/features/hub-unified-memory-artifacts
last_updated: 2026-04-03
---

# Testing Report

Current status: the FEAT-006 local commit persistence slice is implemented and unit-tested. P2P harness scaffolding remains present at `tests/p2p/README.md`, `tests/p2p/harness.js`, and `tests/p2p/docker-compose.yml` for later integration coverage.
---
title: Feature - Hub Unified Memory And Artifacts
feature_id: FEAT-006
artifact: testing-report
status: draft
version: 1.0-legacy
owner_agent: qa
parent_feature: kb/features/hub-unified-memory-artifacts
related_artifacts:
  - kb/features/hub-unified-memory-artifacts/requirements.md
  - kb/features/hub-unified-memory-artifacts/testing-plan.md
phase_gate: testing-in-progress
last_updated: 2026-04-03
---

# Result Summary

The FEAT-006 local persistence slice is implemented and now has browser-level route evidence in addition to unit coverage. Tracohub persists current `MemoryBundle` state and append-only audit records under the FEAT-003 chat workspace root, stores `ArtifactMeta` sidecars, supports idempotent commits, and enforces authenticated commit requests through either session auth or verified WorkSecret tokens. Full remote fetch and P2P commit flows remain pending.

# Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Memory and audit layout | Passed | `hub/lib/state/commit-store.ts` writes current bundle state under `state/memory/bundles/current` and append-only audit records under `state/audit/commits`. |
| Artifact metadata persistence | Passed | Commit handling stores `ArtifactMeta` sidecars under `state/artifacts/<artifactId>/meta.json`. |
| Idempotent commit behavior | Passed | The commit store hashes `X-Idempotency-Key` values and returns the same commit on replay. |
| Authenticated commit API | Passed | `hub/app/(chat)/api/commit/route.ts` requires either session auth or a verified WorkSecret token and enforces the `memory.attach` scope. |
| Automated unified-model evidence | Passed (current slice) | `pnpm exec tsx tests/unit/commit-store.test.ts` passed on 2026-04-03 for persistence, audit, artifact metadata, and idempotency. |
| Browser-level commit route and persistence evidence | Passed | `pnpm -C /home/data/git/haymant/traco/hub exec playwright test tests/e2e/hub-features.test.ts --project=e2e` passed on 2026-04-03 and verified session-authenticated `POST /api/commit`, idempotent replay, and persisted bundle or audit files under `.playwright/data-home/workspace/root-chats/<chatId>/state`. |

# Defects

- None recorded yet; implementation has not started.

# Acceptance Criteria Disposition

- [x] Tracohub defines a canonical chat-scoped memory and artifact layout inside isolated chat workspaces.
- [x] Agent tasks can introduce durable side effects only through approved memory and artifact commit paths.
- [x] `MemoryBundle` and `ArtifactMeta` semantics are documented with checksum, ACL, provenance, and TTL behavior.
- [x] Git origin URL and revision are modeled as immutable provenance metadata rather than as ad hoc mutable artifacts.
- [x] The model is explicitly reusable by FEAT-004 and FEAT-005 for sharing, pulling, and remote handoff.

# Follow-ups

- Add route-level integration tests for `POST /api/commit` covering session auth, WorkSecret auth, and invalid payloads.
- Extend persistence coverage to retained run sandboxes and derived `MEMORY.md` regeneration.

# Change Log

- 2026-04-03: Bootstrapped testing report from memdir, schema, and handoff design studies.
- 2026-04-03: Updated with implemented FEAT-006 commit-store persistence, audit/idempotency behavior, and passing unit evidence.
- 2026-04-03: Added Playwright route-level commit and filesystem persistence evidence for the implemented FEAT-006 slice.