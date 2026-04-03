---
title: FEAT-005 Acceptance Checklist
feature_id: FEAT-005
artifact: acceptance_checklist
status: draft
version: 0.1
owner_agent: Architect
parent_feature: kb/features/hub-room-scoped-handoff
last_updated: 2026-04-03
---

# FEAT-005 Acceptance Checklist (P2P Registration & WorkSecret)

Architect tasks

- [x] Choose token format and verification mode: Signed JWT (EdDSA preferred) + hybrid verification (offline verify + revocation map).
- [ ] Publish JWKS endpoint or public key distribution plan.

Developer tasks

- [ ] Implement WorkSecret issuance as signed JWTs with `workSecretId`, `sessionId`, `scopes`, `allowedNodeIds` (optional), `exp`, `iat`, and `kid` header.
- [ ] Add server-side `workSecretId -> sessionId` mapping and revocation API.
- [ ] Implement hybrid verification on serving peers: offline JWT verify + consult revocation map on first use.

QA tasks

- [ ] Add tests for expired token rejection, revoked token rejection, insufficient scope, allowedNodeId mismatch, and replay protection.
- [ ] Validate P2P handshake flows using the P2P harness and docker-compose relay.

DevOps tasks

- [ ] Approve relay provider(s) for production and document operational guidance (ports, monitoring, SLI targets).

Acceptance

- [ ] All checklist items completed and test evidence attached to `testing-report.md`.

QA approval

- [x] QA reviewed and accepted FEAT-005 testing-plan coverage on 2026-04-03 (approved by QA).

