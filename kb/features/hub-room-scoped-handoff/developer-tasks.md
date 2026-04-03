---
title: FEAT-005 Developer Tasks
feature_id: FEAT-005
artifact: developer_tasks
status: draft
version: 0.1
owner_agent: Developer
parent_feature: kb/features/hub-room-scoped-handoff
last_updated: 2026-04-03
---

# Developer Implementation Tasks (FEAT-005)

Summary

Implement WorkSecret issuance (signed JWT), server-side revocation map, JWKS endpoint, hybrid verification on serving peers, and P2P handshake integration with Society streams and HTTP fetch fallback.

Tasks

- Token issuance
  - Implement `POST /api/handoff/v1/sessions` to create `SessionHandle` and issue `WorkSecret` as signed JWT.
  - JWT claims: `workSecretId`, `sessionId`, `scopes`, optional `allowedNodeIds`, `exp`, `iat`, `iss`. Include `kid` header.

- Key management
  - Add JWKS endpoint (`GET /.well-known/jwks.json`) for public keys; add key rotation plan skeleton.

- Revocation map
  - Persist `workSecretId -> sessionId` mapping and a `revoked` flag; implement a lightweight revocation lookup API used by peers.

- Serving peer verification
  - Integrate `jose` (or chosen lib) to verify JWT signature and expiry offline.
  - Implement hybrid lookup: on first-use check revocation API (cache result for X seconds), and on verification failure re-check hub.

- P2P handshake
  - On libp2p stream open, expect initial auth frame `{ type: 'auth', workSecret: '<jwt>' }` and validate per above.
  - On valid auth, allow `fetch` frames for artifact ids and stream binary payload.

- HTTP fallback
  - Generate signed `fetchUrl` for artifacts when necessary; support presenting `Authorization: Bearer <WorkSecret>` for fetch.

- Tests
  - Unit tests for token issuance and verification.
  - Integration tests using `tests/p2p/docker-compose.yml` to validate handshake and revocation scenarios.

Acceptance

- WorkSecret issuance endpoint creates verifiable JWTs and persists mapping.
- Serving peers accept valid JWTs offline and reject expired/revoked tokens.
- QA tests for revoked/expired/scope-mismatch pass.
