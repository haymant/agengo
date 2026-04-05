---
title: Commit API
feature_id: FEAT-006
artifact: commit_api
status: draft
version: 0.1
owner_agent: Developer
parent_feature: hub-unified-memory-artifacts
last_updated: 2026-04-03
---

# Commit API

Overview

The Commit API accepts a `MemoryBundle` and persists the current-state plus an append-only audit record. The API is authenticated and may be called by authorized clients or internal services.

Security

- Short-lived `fetchUrl` links are used for HTTP artifact fetches.
- For P2P flows, the hub issues a scoped `WorkSecret` which the peer presents over the libp2p stream to validate authorization to fetch a specific artifact or MemoryBundle.

API shape (HTTP)

- POST /api/commit

Request body: `MemoryBundle` (see schema)

Responses

- 200 OK — commit accepted, returns `{ "commitId": "...", "auditEventId": "..." }`.
- 4xx — validation or auth errors.
- 5xx — server errors.

Idempotency

Clients SHOULD provide a client-generated idempotency key header `X-Idempotency-Key` to ensure duplicate submissions are handled safely.

Operational notes

- Commits are validated against JSON Schemas before persisting.
- Artifact uploads are stored separately; commit references `ArtifactMeta` entries by `id`.
- Retention TTLs applied at the artifact level.
## FEAT-006 Minimal Commit API (v1)

Purpose: provide an explicit, atomic path to promote run outputs into durable memory bundles and artifact registrations. Implementations should validate checksums, enforce ACL/session policy, and write an immutable audit record per commit.

POST /api/commit/v1/commits

Request (application/json):

{
  "idempotencyKey": "uuid-v4",
  "sessionHandle": { /* see FEAT-006 SessionHandle contract */ },
  "changes": {
    "bundles": [ /* array of MemoryBundle objects (schema in schemas/memory-bundle.schema.json) */ ],
    "artifacts": [ /* array of ArtifactMeta objects (schema in schemas/artifact-meta.schema.json) */ ]
  },
  "baseVersions": { /* optional map bundleId -> baseVersion for optimistic concurrency */ }
}

Response 200 (application/json):

{
  "commitId": "commit_123",
  "applied": {
    "bundles": [ { "bundleId": "mb_1", "nextVersion": 2 } ],
    "artifacts": [ { "artifactId": "art_1", "stored": true } ]
  },
  "auditRecord": { "path": "state/audit/commits/commit_123.json" },
  "warnings": [],
  "errors": []
}

Errors and semantics:
- 400: schema invalid, checksum failure, missing required ACL fields.
- 401/403: sessionHandle denies durable commit (policy.allowDurableCommit=false) or ACL mismatch.
- 409: optimistic concurrency failure when baseVersion mismatches.

Audit record shape (written per commit):

{
  "commitId": "commit_123",
  "sessionId": "hs_123",
  "runId": "run_456",
  "actor": { "kind":"agent","id":"reviewer" },
  "timestamp": "2026-04-03T10:12:00Z",
  "baseVersions": { "mb_example_001": 1 },
  "nextVersions": { "mb_example_001": 2 },
  "changedBundles": ["mb_example_001"],
  "changedArtifacts": ["art_example_001"],
  "checksums": { "mb_example_001": "sha256:..." }
}

Notes:
- Implementations should write the audit record atomically with current-state updates or use a transactional/sequenced approach to avoid split-brain.
- Preserve idempotency by storing idempotencyKey -> commitId mapping for duplicate requests.
- Provide an endpoint to fetch audit records: `GET /api/commit/v1/commits/{commitId}`.

Security & Fetch Notes:

- `fetchUrl` values returned in artifact registration responses must be short-lived signed URLs or require a present `WorkSecret` to fetch.
- When used with P2P (Society), a `WorkSecret` token must be issued and scoped; P2P peers authenticate via libp2p and present the token on stream setup.
- Implementations must audit every fetch and verify artifact checksums on receipt; mismatches must be rejected and logged as audit events.
