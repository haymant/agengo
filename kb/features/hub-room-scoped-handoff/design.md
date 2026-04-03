---
title: Feature - Hub Room-Scoped Agent Handoff
feature_id: FEAT-005
artifact: design
status: draft
version: 1.1
owner_agent: architect
parent_feature: kb/features/hub-room-scoped-handoff
related_artifacts:
  - kb/features/hub-room-scoped-handoff/requirements.md
  - kb/features/hub-room-scoped-handoff/implementation-plan.md
  - kb/features/hub-room-scoped-handoff/testing-plan.md
phase_gate: design-draft
last_updated: 2026-04-03
---

# Design Summary

The handoff layer should adapt the studied Claude-style patterns into Tracohub’s room-scoped model and expose them through one canonical HTTP or JSON surface that Next.js route handlers own and Python workers can consume. A remote handoff starts from a shared chat, resolves a same-room remote target, creates a short-lived authorized session, packages a bounded FEAT-006 memory bundle plus artifact metadata, allows lazy fetch for large artifacts, and records append-only audit state for reconciliation. Local handoff follows the same payload model but uses local references inside the same isolated workspace.

# Scope Mapping

- Contract definition maps to new types, schema, and route-handler surfaces.
- Same-room gating maps to the remote discovery model and active chat room state.
- Memory and artifact scoping maps to isolated workspaces, upload metadata, and audit persistence.
- Safety and retry concerns map to approval hooks, TTLs, and reconciliation records.

# Current State And Target State

Current state:

- The repo has route-selection and artifact concepts, but no room-scoped handoff contract, no short-lived remote session primitive, and no durable audit model for exported memory or artifacts.
- The current TypeScript app owns user auth, chat metadata, and route resolution, so it is the correct control-plane owner for v1 handoff authorization and persistence.

Target state:

- Next.js route handlers expose a typed handoff control plane.
- A Python worker or remote TypeScript peer consumes that same contract over HTTP or JSON and never writes directly into Tracohub databases or isolated roots.
- FEAT-006 remains the only source of serializable state that may leave the local node.

# Architecture

## Components

- Handoff contract types: `WorkSecret`, `SessionHandle`, `MemoryBundle`, `ArtifactMeta`, `HandoffRecord`, and `HandoffEvent`.
- Handoff orchestrator service: server-side logic that validates room membership, prepares payloads, persists audit state, and manages finalize or retry flow.
- Remote session endpoints: `start-session`, `attach-memory`, `register-artifacts`, `fetch-memory`, `fetch-artifact`, `finalize`, and `abort`.
- Memory and artifact scoping layer: logic that packages only the allowed FEAT-006 memory entries and artifact references for the active chat.
- Safety gate: classifier or approval hook that can block, redact, or require manual approval for high-risk bundles.
- Reconciliation applier: logic that maps remote outputs back through the FEAT-006 commit API instead of writing directly into chat state.

## Recommended Hybrid Service Surface

V1 should standardize on one route namespace owned by the hub app:

- `POST /api/handoff/v1/sessions`
- `POST /api/handoff/v1/sessions/{sessionId}/memory`
- `POST /api/handoff/v1/sessions/{sessionId}/artifacts`
- `GET /api/handoff/v1/sessions/{sessionId}/memory/{attachmentId}`
- `GET /api/handoff/v1/sessions/{sessionId}/artifacts/{artifactId}`
- `POST /api/handoff/v1/sessions/{sessionId}/finalize`
- `POST /api/handoff/v1/sessions/{sessionId}/abort`

This is the canonical contract for both TypeScript and Python runtimes. If a Python worker is introduced later, it should call these endpoints and use signed fetch URLs or bearer tokens rather than reading files or database rows directly.

### Optional P2P Transport Integration

An internal non-canonical draft recommends Society Protocol (libp2p) as a P2P layer for discovery and direct transports. FEAT-005 should record an optional support path for direct P2P handoff alongside the HTTP/JSON control plane:

- **Direct transport mode:** allow a P2P-enabled target to fetch memory/artifact payloads directly from the source node over libp2p streams using a short-lived WorkSecret token or peer-signed claim.
- **Relay fallback:** where direct connectivity is not possible, provide an authenticated relay URL (signed fetchUrl) for the target to retrieve bundles/artifacts.
- **Authorization mapping:** define how WorkSecret/SessionHandle tokens map to P2P session claims (signed by the source node) and how the source validates the recipient peer identity before granting access.
- **Audit and deduplication:** ensure metadata-only artifact registration and handoff audit records remain central (database-backed) so P2P transfers do not bypass canonical audit and idempotency checks.

Architects should decide if P2P transport is opt-in (feature-flagged) and provide explicit test harnesses for direct libp2p flows before enabling it broadly.

### Contract Shapes

Recommended `POST /api/handoff/v1/sessions` request:

```json
{
  "target": {
    "nodeId": "node_123",
    "agentId": "reviewer",
    "roomId": "room_chat_456"
  },
  "sourceContext": {
    "projectId": "proj_123",
    "chatId": "chat_456",
    "routeLabel": "@remote/reviewer"
  },
  "intent": {
    "task": "Review the generated patch and propose fixes",
    "decisionMode": "manual"
  },
  "ttlSeconds": 900,
  "idempotencyKey": "2f346944-c2d8-4fe2-a81d-6fd3e4e9d5d4"
}
```

Recommended response:

```json
{
  "session": {
    "sessionId": "hs_123",
    "mode": "remote-source",
    "projectId": "proj_123",
    "chatId": "chat_456",
    "roomId": "room_chat_456",
    "target": {
      "nodeId": "node_123",
      "agentId": "reviewer"
    },
    "expiresAt": "2026-04-03T12:00:00Z"
  },
  "workSecret": {
    "token": "opaque-or-jwt",
    "expiresAt": "2026-04-03T12:00:00Z",
    "scopes": ["memory.attach", "artifact.fetch", "handoff.finalize"]
  },
  "handoffRecord": {
    "handoffId": "ho_123",
    "status": "authorized"
  }
}
```

Recommended `POST /api/handoff/v1/sessions/{sessionId}/memory` request:

```json
{
  "memoryBundle": {
    "bundleId": "mb_123",
    "checksum": "sha256:...",
    "entries": [],
    "meta": {
      "sourceProjectId": "proj_123",
      "sourceChatId": "chat_456",
      "ttlSeconds": 900,
      "acl": {
        "roomId": "room_chat_456",
        "allowedAgentIds": ["reviewer"]
      }
    }
  },
  "allowLazyFetch": true
}
```

Recommended response:

```json
{
  "attachmentId": "ma_123",
  "acceptedEntries": ["summary", "decisions", "provenance"],
  "warnings": []
}
```

Recommended `POST /api/handoff/v1/sessions/{sessionId}/artifacts` request:

```json
{
  "artifacts": [
    {
      "artifactId": "art_123",
      "filename": "patch.diff",
      "mimeType": "text/x-diff",
      "sizeBytes": 2048,
      "checksum": "sha256:...",
      "acl": {
        "roomId": "room_chat_456",
        "allowedAgentIds": ["reviewer"]
      }
    }
  ],
  "allowLazyFetch": true
}
```

Recommended response:

```json
{
  "accepted": [
    {
      "artifactId": "art_123",
      "alreadyPresent": false,
      "fetchUrl": "/api/handoff/v1/sessions/hs_123/artifacts/art_123"
    }
  ],
  "rejected": []
}
```

Recommended `POST /api/handoff/v1/sessions/{sessionId}/finalize` request:

```json
{
  "outcome": {
    "status": "succeeded",
    "summary": "Review complete"
  },
  "returnedMemory": [],
  "returnedArtifacts": [],
  "reconciliation": {
    "sourceBundleChecksum": "sha256:...",
    "producedArtifactChecksums": []
  },
  "idempotencyKey": "5ad5bf25-1907-4ff6-9d16-14f0ca4e3540"
}
```

Recommended response:

```json
{
  "handoffId": "ho_123",
  "status": "reconciled",
  "appliedCommitIds": ["commit_123"],
  "warnings": []
}
```

### Lifecycle

1. The source hub validates that the chosen target is in the same `roomId` as the active chat and that the chat is actually share-enabled.
2. The source hub creates `SessionHandle`, `WorkSecret`, and an initial `HandoffRecord(status=authorized)`.
3. The source hub serializes FEAT-006 memory into a bounded `MemoryBundle` and registers large artifacts as metadata only.
4. The remote target fetches memory or artifacts lazily using the issued token.
5. The remote target calls `finalize` with summary, produced state, and reconciliation checksums.
6. The source hub revalidates ACL, checksum, and session state, then commits accepted outputs through the FEAT-006 commit API.
7. The source hub appends terminal audit events and exposes final state back to the originating chat.

## Persistence And Audit Expectations

- Persist one authoritative `HandoffRecord` per handoff ID with immutable source or target identity, room, TTL, and policy fields.
- Persist append-only `HandoffEvent` rows for `authorized`, `memory-attached`, `artifacts-registered`, `fetch-served`, `finalize-requested`, `reconciled`, `aborted`, and `expired`.
- Persist artifact and bundle attachment metadata separately from the canonical FEAT-006 chat state so retries can deduplicate without mutating chat memory.
- Keep local payload manifests under the active isolated chat root for replay or audit, but treat database audit rows as the authoritative cross-runtime ledger.
- Every mutating POST should accept an `idempotencyKey`; duplicates must return the existing result instead of replaying side effects.

## Failure Modes And Expected Responses

- `400 Bad Request`: schema invalid, checksum mismatch, or bundle references disallowed entry types.
- `401 Unauthorized`: token missing or invalid.
- `403 Forbidden`: room mismatch, ACL mismatch, or source chat not shared for remote handoff.
- `404 Not Found`: session or attachment unknown.
- `409 Conflict`: duplicate finalize with different checksums, invalid state transition, or stale base version during reconciliation.
- `410 Gone`: session or attachment expired by TTL.
- `422 Unprocessable Entity`: classifier or manual approval denied the bundle.
- `507 Insufficient Storage`: artifact quota or retention limit exceeded.

## Data Flow

1. A user selects a same-room remote agent through the `@` mention flow in a shared chat.
2. Tracohub validates that the target belongs to the active shared room.
3. Tracohub creates a short-lived authorized remote session and records an initial handoff record.
4. Tracohub serializes a bounded `MemoryBundle` and registers any large artifacts as `ArtifactMeta` references.
5. The remote target lazily fetches memory or artifacts as needed and performs the delegated work.
6. The remote target finalizes the handoff, returning result metadata and any produced artifacts.
7. Tracohub reconciles checksums, updates audit state, and exposes status back to the local chat.

## Failure Modes

- The target agent is no longer present in the same room when handoff starts.
- A memory bundle includes artifacts or references from another chat or unshared project scope.
- Token expiry or network interruption occurs mid-transfer.
- Duplicate finalize or retry requests create duplicate artifact uploads or duplicate audit state.
- Sensitive memory is exported without approval or redaction.
- A Python worker bypasses the handoff API and attempts direct filesystem or database mutation.

# Tradeoffs

- Reusing the Claude-style contract shape improves rigor and auditability, but adds more types and persistence work than a raw ad hoc payload.
- Metadata-only large artifact transfer reduces bandwidth and supports deduplication, but requires an additional fetch path and reconciliation step.
- Same-room-only gating keeps the first release safe, but intentionally limits broader collaboration patterns.

# Decisions

- Use same-room gating as a hard prerequisite for remote handoff.
- Separate local handoff references from remote-exported payloads even if the contract shapes are similar.
- Default to metadata-only transfer and lazy fetch for large artifacts.
- Persist handoff audit state so retries and reconciliation are explicit rather than implicit.
- Reuse the FEAT-006 unified memory/artifact model as the only supported source of serializable local state for remote export.
- Make Next.js route handlers the control-plane owner for v1; Python workers or remote runtimes must consume the same HTTP or JSON contract instead of introducing a second control plane.

# Open Risks

- Approval or classifier requirements could slow the first release if they are scoped too broadly.
- Artifact fetch and finalize flows must avoid leaking sibling chat or project data through weak ACLs.
- Cross-runtime time skew can cause premature TTL expiry unless token validation tolerances are explicit.

# Change Log

- 2026-04-03: Bootstrapped room-scoped handoff design from studied handoff documents and current hub architecture.
- 2026-04-03: Refined design with a concrete hybrid HTTP or JSON handoff contract, route surface, persistence model, and failure semantics.