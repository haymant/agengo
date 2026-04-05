---
title: Unified Memory & Artifacts
feature_id: FEAT-006
artifact: requirements
status: approved
version: 1.0
owner_agent: BA
parent_feature: kb/features/hub-unified-memory-artifacts
last_updated: 2026-04-03
---

# Requirements

Goal: Provide a stable, auditable commit surface for chat-scoped memory bundles and associated artifacts that can be transferred via HTTP or P2P.

Acceptance criteria

- `MemoryBundle` JSON Schema exists and is validated on commit.
- `ArtifactMeta` JSON Schema exists and artifacts are checksum-verified.
- Commit API implemented and supports idempotency and authentication.
- P2P handoff via Society/libp2p using `WorkSecret` tokens is supported for v1.
- Audit records created for every issuance and consumption of a `WorkSecret` and commit operations.
---
title: Feature - Hub Unified Memory And Artifacts
feature_id: FEAT-006
artifact: requirements
status: approved
version: 1.1
owner_agent: ba
parent_feature: kb/features/hub-unified-memory-artifacts
related_artifacts:
  - kb/features/hub-unified-memory-artifacts/design.md
  - kb/features/hub-unified-memory-artifacts/implementation-plan.md
  - kb/features/hub-unified-memory-artifacts/testing-plan.md
  - kb/features/hub-unified-memory-artifacts/testing-report.md
jira_keys: []
phase_gate: requirements-approved
last_updated: 2026-04-03
---

# Context

Tracohub needs a conceptual unified state model for agent work that sits between isolated chat workspaces and later remote sharing or handoff. The memdir and handoff studies provide strong patterns: a canonical `MemoryBundle` format, `ArtifactMeta` sidecars, checksums, TTL-based cleanup, snapshot rehydration, and metadata-only transfer for large files. In Tracohub, that model should constrain local and remote agent work so an agent behaves like a lambda function operating inside a bounded chat context rather than as an unconstrained process with arbitrary side effects.

This feature defines the local-first memory and artifact model that other features should depend on. FEAT-003 establishes isolated roots; this feature defines what must live inside those roots and how agents are allowed to read, write, and export state.

# Goals

- Define one canonical chat-scoped memory and artifact model for local and later remote agent execution.
- Constrain agent tasks so they can only introduce durable side effects through approved memory and artifact APIs within the active chat context.
- Reuse the strongest ideas from the memdir and handoff designs: bundles, artifact metadata, checksums, TTL, snapshot rehydration, and lazy-fetch readiness.
- Treat immutable project provenance such as git URL and revision as memory or provenance metadata rather than as free-form remote state.

# Non-goals

- This feature does not implement the full remote handoff control plane.
- This feature does not introduce live synchronization between nodes.
- This feature does not allow default cross-chat mutation or shared mutable project state.

# Assumptions And Constraints

- FEAT-003 isolated workspaces provide the outer filesystem boundary for this feature.
- The active chat is the default durable mutation boundary.
- Agent runs may use temporary scratch space, but durable writes must go through the unified memory or artifact model.
- Same-room remote handoff in FEAT-005 should serialize this model rather than invent a separate payload structure.

# Requirements

## Functional

- Each chat workspace must contain a canonical state area for memory bundles, artifact blobs plus metadata, and agent-run bookkeeping.
- Tracohub must define explicit runtime types for at least `SessionHandle`, `MemoryBundle`, `MemoryEntry`, and `ArtifactMeta`, with checksumed serialization and rehydration rules.
- A `MemoryBundle` must support entries with typed values or URLs, metadata including producer, provenance, TTL, and ACL, and an overall checksum.
- An `ArtifactMeta` record must describe filename, MIME type, size, checksum, producer, ACL, and optional fetch URL without requiring the blob to be inlined.
- Local agent execution must receive a session-scoped handle plus chat-scoped memory and artifact references rather than unrestricted access to arbitrary sibling paths.
- Durable outputs from an agent run must be committed only as in-place memory-bundle updates with audit records, artifact registrations, or explicitly approved metadata updates.
- Temporary scratch files created during an agent run must remain confined to the active run sandbox and must not become durable state unless promoted through the memory or artifact APIs.
- The runtime must retain one bounded run-sandbox state per agent run for debugging, replay, or audit purposes, while treating remaining scratch output as ephemeral unless explicitly promoted.
- Immutable project provenance such as git origin URL and revision must be represented as memory or provenance metadata in the first release.
- Concrete repo snapshots, manifests, diffs, logs, exports, or binaries may be represented as artifacts with `ArtifactMeta` sidecars.
- The model must support metadata-only references and lazy-fetch readiness for large artifacts so FEAT-005 can reuse it for remote handoff.
- The model must support TTL-driven cleanup of expired memory bundles and artifacts that are no longer retained.
- Prompt-oriented materializations such as a generated `MEMORY.md` must be treated as ephemeral derived views regenerated from canonical memory state rather than as durable source-of-truth artifacts by default.

## Non-functional

- Checksums must be used for integrity verification and deduplication at both memory-entry and artifact levels where applicable.
- The serialization format must be stable enough to support local snapshot rehydration and later remote transport.
- The model must be explicit enough that Developer can enforce side-effect confinement and QA can test it directly.
- The design must distinguish immutable provenance from mutable chat state so project-sharing semantics remain safe.
- In-place bundle updates must preserve auditability through durable audit records rather than relying on append-only bundle snapshots as the default history mechanism.

# Acceptance Criteria

- [ ] Tracohub defines a canonical chat-scoped memory and artifact layout inside isolated chat workspaces.
- [ ] Agent tasks can introduce durable side effects only through approved memory and artifact commit paths.
- [ ] `MemoryBundle` and `ArtifactMeta` semantics are documented with checksum, ACL, provenance, and TTL behavior.
- [ ] Durable memory updates use in-place bundle updates with audit records.
- [ ] Run-state retention is limited to one bounded retained sandbox state per run unless outputs are explicitly promoted.
- [ ] Git origin URL and revision are modeled as immutable provenance metadata rather than as ad hoc mutable artifacts.
- [ ] Prompt-ready materializations such as `MEMORY.md` are regenerated from canonical state and are not the durable source of truth by default.
- [ ] The model is explicitly reusable by FEAT-004 and FEAT-005 for sharing, pulling, and remote handoff.

# Open Questions

- None at BA requirements level after adopting in-place updates with audit records, one retained run-sandbox state per run, and regenerated ephemeral `MEMORY.md` views.

# Change Log

- 2026-04-03: Bootstrapped from memdir study, memory-bundle and artifact schemas, and handoff design inputs.
- 2026-04-03: Approved BA requirements after confirming in-place audited updates, retained run-sandbox limits, derived `MEMORY.md` regeneration, immutable git provenance memory, and artifact treatment for concrete outputs.