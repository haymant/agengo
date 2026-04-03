---
title: Unified Memory & Artifacts Design
feature_id: hub-unified-memory-artifacts
artifact: design
status: approved
version: 1.2
owner_agent: Architect
parent_feature: hub
last_updated: 2026-04-03
---

# Design

Summary

The hub stores `MemoryBundle` current-state and `ArtifactMeta` references. Artifacts are stored in blob storage and served via signed fetch URLs for HTTP or via P2P streams (Society/libp2p) using `WorkSecret` tokens.

Storage model

- `state/` folder per chat session containing `bundles/`, `artifacts/`, and `audit/`.
- In-place current-state file + append-only audit log for changes.

Protocols

- HTTP: signed `fetchUrl` for artifacts.
- P2P: Society (libp2p) mandated for v1; use GossipSub rooms + direct peer streams and Circuit Relay fallback.

Schemas

- See `schemas/memory-bundle.schema.json` and `schemas/artifact-meta.schema.json`.

Security

- Hub signs `WorkSecret` tokens; prefer asymmetric signing.
- Validate checksums on artifact fetch.

Operational

- Default retention: sandbox 7d, artifacts 30d, audit 90d.
---
title: Feature - Hub Unified Memory And Artifacts
feature_id: FEAT-006
artifact: design
parent_feature: kb/features/hub-unified-memory-artifacts
related_artifacts:
  - kb/features/hub-unified-memory-artifacts/requirements.md
  - kb/features/hub-unified-memory-artifacts/implementation-plan.md
  - kb/features/hub-unified-memory-artifacts/testing-plan.md
status: approved
version: 1.2
owner_agent: architect
phase_gate: design-approved
last_updated: 2026-04-03
---

# Design Summary

The unified model should make each agent task behave like a constrained lambda invocation over chat-scoped inputs and outputs. The outer boundary comes from FEAT-003 workspace isolation. Inside that boundary, Tracohub should expose a memdir-like state model with three durable concerns and one ephemeral concern:

- canonical memory bundles and entries,
- canonical artifact metadata plus blobs,
- immutable audit records for every durable commit,
- ephemeral prompt materialization such as `MEMORY.md` generated on demand.

The core design decisions are:

- durable state uses in-place current records plus append-only audit records,
- each chat retains at most one completed run sandbox for debugging or replay,
- immutable project provenance belongs in memory metadata,
- concrete files and exports belong in artifacts,
- generated `MEMORY.md` views are derived, ephemeral, and not canonical state.

# Scope Mapping

- MemoryBundle and ArtifactMeta semantics map to a new local state API and future FEAT-005 handoff serialization.
- Run sandbox constraints map to local agent execution and side-effect confinement.
- Provenance modeling maps to FEAT-004 snapshot sharing and pulled-copy metadata.

# Canonical Contracts

Recommended runtime contracts:

```ts
type SessionHandle = {
  sessionId: string;
  projectId: string;
  chatId: string;
  runId: string;
  mode: "local" | "remote-source" | "remote-target";
  actor: { kind: "user" | "agent" | "remote-peer"; id: string };
  createdAt: string;
  expiresAt: string | null;
  policy: {
    allowMemoryRead: boolean;
    allowArtifactRead: boolean;
    allowDurableCommit: boolean;
  };
};

  Refer to the concrete JSON Schema and examples in `kb/features/hub-unified-memory-artifacts/schemas/` and `kb/features/hub-unified-memory-artifacts/examples/` for stable serialization and contract fixtures.

  ### Commit API

type MemoryEntry = {
  entryId: string;
  key: string;
  kind: "text" | "json" | "url" | "provenance";
  value: unknown;
  checksum: string;
  producer: string;
  createdAt: string;
  ttlSeconds: number | null;
  acl: { scope: "chat" | "handoff"; roomId?: string; allowedAgentIds?: string[] };
};

type MemoryBundle = {
  bundleId: string;
  version: number;
  checksum: string;
  entries: MemoryEntry[];
  meta: {
    projectId: string;
    chatId: string;
    sourceRunId?: string;
    provenance?: { gitUrl?: string; gitRevision?: string; sourceShareId?: string };
  };
};

type ArtifactMeta = {
  artifactId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  producer: string;
  createdAt: string;
  ttlSeconds: number | null;
  acl: { scope: "chat" | "handoff"; roomId?: string; allowedAgentIds?: string[] };
  blobRef?: string;
  fetchUrl?: string | null;
};
```

# Architecture

## Components

- Chat state root: a reserved area under each isolated chat workspace for memory, artifacts, and run state.
- Memory store: bundle and entry serialization with checksum verification, TTL metadata, ACL metadata, and rehydration helpers.
- Artifact store: blob storage plus `ArtifactMeta` sidecars, checksum verification, and optional lazy-fetch URL fields.
- Run sandbox: a per-run temporary workspace where agent tasks may execute before durable outputs are committed.
- Commit API: the only approved path that promotes run outputs into durable memory bundles or artifacts.
- Audit store: append-only durable commit records that explain every mutation to the current-state view.
- Prompt materializer: a helper that produces a truncated MEMORY.md-style view or equivalent prompt section from the canonical memory store.

## Proposed Local Layout

Under each chat workspace root:

- `state/memory/bundles/current/<bundle-key>.json`
- `state/memory/entries/<entry-id>.json`
- `state/artifacts/<artifact-id>/blob`
- `state/artifacts/<artifact-id>/meta.json`
- `state/audit/commits/<commit-id>.json`
- `state/runs/active/<run-id>/scratch/`
- `state/runs/active/<run-id>/manifest.json`
- `state/runs/retained/latest/`

Exact filenames may vary, but the structure should preserve four concerns: durable memory, durable artifacts, append-only audit, and temporary execution state.

## Durable Update Model

The recommended v1 model is in-place current-state updates with append-only audit records.

- Every successful commit atomically updates the current bundle or artifact metadata.
- Every successful commit also writes a new immutable audit record that captures `commitId`, `sessionId`, `runId`, `actor`, `baseVersion`, `nextVersion`, changed entry or artifact IDs, and resulting checksums.
- The system should not retain a full append-only snapshot of every bundle version by default. Audit plus current-state records are the primary v1 durability model.
- If a future replay feature is needed, selected bundle snapshots can be materialized from audit checkpoints, but that is not a v1 requirement.

## Run Sandbox Retention

- Each run gets an isolated active sandbox under `state/runs/active/<run-id>/`.
- When a run completes, Tracohub may retain exactly one completed sandbox copy under `state/runs/retained/latest/` for debugging, replay, or operator inspection.
- Starting a newer completed run replaces the older retained sandbox after the older one has been safely discarded.
- Uncommitted scratch files inside the retained sandbox remain non-canonical and must not be treated as durable memory or artifacts unless later promoted through the commit API.

## Mandatory P2P Backbone (Society / libp2p)

FEAT-006 v1 requires Society Protocol (libp2p-based) as the mandatory discovery and transport backbone. The unified memory/artifact model and the handoff control plane (FEAT-005) must integrate with Society for node registration, same-room discovery, and direct P2P streams.

- Node identity: each node presents a cryptographic identity (keypair/DID) used for discovery and authorization.
- Discovery: use GossipSub topics scoped per project/chat and Kad-DHT for capability lookups.
- Transport: prefer direct libp2p streams (QUIC/TCP/WebSocket); use Circuit Relay fallback for NAT-restricted peers.
- Operational note: typical home networks do not require opening inbound ports if relay usage (`--relay`) is enabled; document relay guidance for operators.

Architects must finalize the Society bootstrap and relay recommendations prior to implementation.

## MEMORY.md Materialization

- `MEMORY.md` is a derived prompt view generated from canonical memory bundles.
- If materialized on disk, it should live only inside the active run sandbox or retained sandbox.
- `MEMORY.md` must not be committed into `state/memory/` and must not have its own lifecycle separate from the underlying entries.
- Tests should assert that deleting derived `MEMORY.md` files does not lose canonical memory state.

## Security & Lazy-Fetch Policy (v1)

FEAT-006 v1 requires a layered fetch and auth model designed for home/relay-friendly networks:

- Signed fetch URLs: Hub-issued `fetchUrl` values must be short-lived, scope-limited, and cryptographically signed so HTTP fetches enforce expiry and scoped access.
- WorkSecret for P2P: For P2P handoffs, the source hub issues a `WorkSecret` scoped to `sessionId` and explicit scopes (e.g., `memory.attach`, `artifact.fetch`, `handoff.finalize`). Targets authenticate via libp2p peer identity and present the `WorkSecret` on stream open.
- Relay fallback: Peers behind restrictive NATs must use Circuit Relay; relays only forward transport, authorization and audit remain hub-controlled.
- No inbound port requirement: Typical home nodes should operate without opening inbound ports when `--relay` is used; implementers must document relay usage and flags for reliable connectivity.

Security expectations:

- Validate libp2p peer identity and WorkSecret scope before serving artifact blobs or allowing commit actions.
- Verify checksums on fetched blobs and emit audit events on mismatch.
- Record all fetches, handoffs, and commit events including peer identifiers and timestamps in audit records.

## Data Flow

Local invocation:

1. Tracohub creates a `SessionHandle` and a run sandbox inside the active chat root.
2. The agent receives a bounded set of memory bundles and artifact references as input.
3. The agent may read those inputs and write temporary files only inside the run sandbox.
4. At completion, Tracohub validates outputs and promotes only approved results into memory bundles, artifact records, or immutable provenance updates.
5. Tracohub updates current durable state in place and appends an immutable audit commit record.
6. Temporary run state is discarded except for the single retained sandbox slot.

Future remote invocation compatibility:

1. FEAT-005 serializes the same memory bundles and artifact metadata for transport.
2. Large artifacts stay metadata-only until lazy fetch is requested.
3. Returned outputs are reconciled back through the same commit API.

## Provenance Rules

- Git origin URL and revision are immutable provenance metadata and should live in `MemoryBundle.meta.provenance` or explicit provenance entries.
- Repo archives, manifests, diffs, logs, screenshots, and exported datasets are artifacts described by `ArtifactMeta`.
- Prompt-ready summaries derived from memory should be regenerable from canonical state; persistence as artifacts is optional and should be justified by replay or audit needs.
- Prompt-ready summaries such as `MEMORY.md` should be regenerated from canonical state and are not durable artifacts by default.

## Failure Modes

- An agent writes directly into sibling chat or project paths instead of the run sandbox.
- Durable state is updated outside the commit API, making audit and TTL enforcement unreliable.
- Memory and artifact checksums diverge during rehydration or promotion.
- Git provenance is treated as mutable content instead of immutable metadata, creating ambiguity during sharing and pull.
- Excess run-state retention creates storage bloat or accidental leakage of ephemeral data.
- Derived `MEMORY.md` output is mistaken for canonical memory and drifts from underlying entries.

# Tradeoffs

- Append-only snapshots improve auditability and replay, but create more cleanup and compaction work.
- In-place bundle updates are simpler, but weaken full-state replay unless audit records are sufficiently rich.
- Persisting prompt materializations speeds some workflows, but risks stale derived state.
- Strict lambda-style commit rules improve safety, but may require refactoring current tool flows that assume direct file mutation.

# Decisions

- Use `MemoryBundle` and `ArtifactMeta` as the conceptual canonical transport and local persistence types.
- Treat git URL and revision as immutable provenance metadata, not as free-form artifacts.
- Treat run sandboxes as temporary and non-durable unless outputs are explicitly promoted.
- Make the commit API the only supported durable side-effect boundary for agent tasks.
- Keep the model lazy-fetch ready for FEAT-005 even before remote transport ships.
- Use in-place current-state updates plus append-only audit records as the v1 storage model.
- Retain at most one completed sandbox per chat.
- Keep `MEMORY.md` ephemeral and derived from canonical memory entries.

## Retention Defaults (v1)

FEAT-006 recommends conservative operational defaults to start:

- Retained sandbox TTL: 7 days
- Artifact default TTL: 30 days
- Audit retention: 90 days

DevOps must finalize and document these before GA; values may be tuned per deployment.

# Open Risks

- Current Tracohub tool and artifact flows may need meaningful refactoring to respect a strict commit boundary.
- The cleanup policy for expired bundles and abandoned run sandboxes could become operationally noisy without clear retention defaults.
- FEAT-004 and FEAT-005 may need a shared provenance vocabulary sooner than currently planned.

# Change Log

- 2026-04-03: Bootstrapped unified memory and artifact design from memdir and handoff studies.
- 2026-04-03: Refined design to recommend in-place current-state updates with audit records, one retained sandbox, and ephemeral `MEMORY.md` materialization.