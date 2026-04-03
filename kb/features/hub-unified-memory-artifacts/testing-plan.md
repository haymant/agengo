---
title: Testing Plan
feature_id: hub-unified-memory-artifacts
artifact: testing_plan
status: draft
version: 0.1
owner_agent: QA
parent_feature: hub
last_updated: 2026-04-03
---

# Testing Plan

Test cases

- Schema validation: submit valid and invalid `MemoryBundle` payloads to `/api/commit` and assert correct responses.
- Artifact checksum: upload artifact, then fetch via signed `fetchUrl` and verify checksum.
- P2P WorkSecret flow: issue a `WorkSecret` and validate that a requester presenting the token can stream artifacts.
- Idempotency: repeat commit with same `X-Idempotency-Key` and assert idempotent behavior.

Integration

- CI will run P2P harness (tests/p2p) that can spin up minimal Society peers or use test doubles.

Acceptance

- All tests pass in CI; QA attaches logs and recorded artifacts to `testing-report.md`.
---
title: Feature - Hub Unified Memory And Artifacts
feature_id: FEAT-006
artifact: testing-plan
status: draft
version: 1.1
owner_agent: qa
parent_feature: kb/features/hub-unified-memory-artifacts
related_artifacts:
  - kb/features/hub-unified-memory-artifacts/requirements.md
  - kb/features/hub-unified-memory-artifacts/design.md
  - kb/features/hub-unified-memory-artifacts/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-03
---

# Test Strategy

Validate that the unified model creates one durable side-effect boundary for local agent tasks and produces portable, checksum-stable, policy-aware state for later share and handoff features.

# Coverage Matrix

| Acceptance Criterion | Test Layers | Planned Checks | Evidence Expectation |
| --- | --- | --- |
| Tracohub defines a canonical chat-scoped memory and artifact layout inside isolated chat workspaces. | Integration | Layout creation, naming stability, bundle and artifact placement, run-manifest placement | Filesystem evidence from isolated fixtures showing durable versus temporary boundaries |
| Agent tasks can introduce durable side effects only through approved memory and artifact commit paths. | Integration, negative | Scratch confinement, rejected direct writes, explicit promotion, post-run durability checks | Before and after filesystem evidence proving only promoted outputs persist |
| `MemoryBundle` and `ArtifactMeta` semantics are documented with checksum, ACL, provenance, and TTL behavior. | Unit, contract | Stable serialization, checksum mismatch rejection, ACL policy checks, TTL expiry, blob and metadata mismatch rejection | Contract fixtures and unit evidence for valid and invalid states |
| Git origin URL and revision are modeled as immutable provenance metadata rather than as ad hoc mutable artifacts. | Unit, integration | Provenance capture, attempted mutation rejection, retrieval for FEAT-004 pull flows | Metadata evidence showing provenance stored in canonical memory fields and not as mutable artifact blobs |
| The model is explicitly reusable by FEAT-004 and FEAT-005 for sharing, pulling, and remote handoff. | Contract, integration | Shared serialization fixtures, metadata-only artifact references, handoff packaging compatibility, pull provenance compatibility | Cross-feature fixture set consumed without reinterpretation by share and handoff adapters |

# Targeted Refinements

1. Add negative contract cases for checksum-divergent bundle files, blob and `ArtifactMeta` mismatch, missing ACL fields, and unsupported entry types.
2. Add side-effect-boundary tests that verify legacy direct-write paths cannot bypass the commit API once the model is introduced.
3. Add TTL and retention interaction checks covering expired bundles that are still referenced by active sessions or retained audit records.
4. Add provenance mutation tests so FEAT-004 cannot accidentally rewrite immutable git metadata during local edits or re-pulls.
5. Add metadata-only serialization checks that FEAT-005 can reuse directly for lazy fetch without blob inlining.
6. Add contract fixtures shared with FEAT-004 and FEAT-005 so cross-feature compatibility is proven by the same canonical sample payloads.

# Data and Environment

- Use temporary isolated chat roots provided by FEAT-003-compatible test fixtures.
- Include small text entries, JSON metadata entries, and binary artifact fixtures.
- Include short TTL fixtures to exercise cleanup behavior.
- Include corrupted checksum fixtures, orphaned run-sandbox fixtures, and retained-provenance fixtures.
- Include a metadata-only large artifact fixture and a provenance-only project snapshot fixture for FEAT-004 and FEAT-005 reuse checks.

## CI & P2P Test Requirements

The QA owner must ensure tests are automated and gated in CI before marking implementation complete. Required items:

- Unit tests for serialization, checksum verification, ACL handling, and TTL expiry.
- Integration tests for commit API atomicity, optimistic concurrency (baseVersion/nextVersion), and audit record creation.
- End-to-end tests that exercise run-sandbox confinement and promotion of outputs.
- P2P Society integration harness: include test fixtures that spin up Society-enabled peers (or test doubles) to verify discovery, WorkSecret authorization, relay fallback, and lazy-fetch flows.
- Contract fixtures shared with FEAT-004/FEAT-005 proving round-trip compatibility for MemoryBundle and ArtifactMeta payloads.

Exit Criteria requires passing CI for the above test classes, including P2P integration harness results.

# Exit Criteria

- Memory and artifact round-trip behavior is directly evidenced.
- Side-effect confinement for agent runs is directly evidenced.
- Provenance modeling is explicit enough for later sharing and handoff features to consume without reinterpretation.
- Cross-feature compatibility is demonstrated by shared contract fixtures, not only by narrative design alignment.

# Change Log

- 2026-04-03: Bootstrapped testing plan from memdir and handoff design inputs.
- 2026-04-03: Added negative contract, commit-boundary, TTL-retention, provenance-immutability, and shared-fixture refinements to support FEAT-004 and FEAT-005.