---
title: Implementation Plan
feature_id: hub-unified-memory-artifacts
artifact: implementation_plan
status: draft
version: 0.2
owner_agent: Developer
parent_feature: hub
last_updated: 2026-04-03
---

# Implementation Plan

1. Add JSON Schemas and examples (done).
2. Implement Commit API endpoint (`/api/commit`) with request validation and idempotency.
3. Implement artifact upload flow and `ArtifactMeta` storage.
4. Implement signed `fetchUrl` generation for HTTP downloads.
5. Implement P2P WorkSecret issuance and verification flow.
6. Add CI P2P harness tests.
7. Add integration tests and QA evidence.

Notes

- Token format decision (JWT vs encrypted blob) required from Architect.
- DevOps to select relay providers and set monitoring SLIs.
---
title: Feature - Hub Unified Memory And Artifacts
feature_id: FEAT-006
artifact: implementation-plan
status: draft
version: 1.1
owner_agent: developer
parent_feature: kb/features/hub-unified-memory-artifacts
related_artifacts:
  - kb/features/hub-unified-memory-artifacts/requirements.md
  - kb/features/hub-unified-memory-artifacts/design.md
  - kb/features/hub-unified-memory-artifacts/testing-plan.md
phase_gate: implementation-not-started
last_updated: 2026-04-03
---

# Plan Summary

Implement the unified model in four slices: canonical types and layout, local persistence helpers, run-sandbox commit boundaries, and integration hooks for sharing and handoff.

# Work Breakdown

1. Define TypeScript runtime types and validators for `SessionHandle`, `MemoryBundle`, `MemoryEntry`, and `ArtifactMeta`, informed by the studied JSON schemas.
2. Implement chat-scoped memory and artifact path helpers and durable read/write APIs under isolated chat roots.
3. Implement checksum verification, TTL metadata handling, cleanup primitives, and append-only audit commit records.
4. Add run sandbox creation and manifest tracking for local agent tasks, including a single retained sandbox slot.
5. Introduce explicit commit APIs that promote run outputs into memory bundles or artifact records while updating current state in place.
6. Integrate immutable git provenance capture for shared or pulled project snapshots.
7. Add prompt-materialization helpers that generate ephemeral `MEMORY.md` output from canonical state without persisting it as durable memory.
8. Add compatibility hooks so FEAT-004 can expose provenance cleanly and FEAT-005 can serialize the same model for transport.

# Dependencies

- FEAT-003 isolated workspaces must land first so this feature has stable chat roots.
- Current tool and artifact flows must be reviewed for any direct-write behavior that bypasses a commit boundary.
- FEAT-004 and FEAT-005 should consume the canonical bundle, artifact, and audit vocabulary defined here rather than redefining transport-specific variants.


# Validation Strategy

- Unit-test bundle and artifact serialization round trips.
- Unit-test checksum mismatches and TTL expiry behavior.
- Integration-test run sandbox confinement and explicit promotion of outputs into durable state.
- Integration-test immutable git provenance capture and retrieval.

# Migration / Rollback Notes

FEAT-006 enforces a strict commit boundary from initial rollout: tools and agent integrations must use the commit API for durable writes. Migration strategy:

- Refuse direct-write paths in the core runtime: add server-side guards that reject attempts to mutate `state/memory/` or `state/artifacts/` outside of the commit API.
- Provide a one-release compatibility shim for non-critical legacy integrations that can be converted to commit-API calls by maintainers; however, the shim is optional and scoped by feature-flag and time-limited.
- If immediate compatibility is required for a component, update that component to call the commit API before GA; do not permit indefinite direct-write fallbacks.

If the strict boundary proves too disruptive, revisit the shim plan, but treat the commit API as the long-term canonical path.

# Change Log

- 2026-04-03: Bootstrapped implementation plan for the unified memory and artifact model.
- 2026-04-03: Refined implementation plan to reflect in-place durable updates with audit records, one retained sandbox, and ephemeral `MEMORY.md` generation.