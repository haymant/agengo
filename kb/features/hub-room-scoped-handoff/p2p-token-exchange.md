---
title: P2P Token Exchange (WorkSecret)
feature_id: hub-room-scoped-handoff
artifact: p2p_token_exchange
status: approved
version: 0.1
owner_agent: Architect
parent_feature: hub-room-scoped-handoff
phase_gate: design-approved
last_updated: 2026-04-03
---

# P2P Token Exchange (WorkSecret)

Overview

Hub issues a short-lived, scoped `WorkSecret` to a requesting client when a peer-to-peer handoff is approved. The `WorkSecret` is presented by the requesting peer on a libp2p stream to the serving peer to authorize fetching of artifacts.

Properties

- `workSecret`: opaque string (recommended: signed JWT or encrypted blob).
- `scope`: artifact ids or MemoryBundle id the token grants access to.
- `expiresAt`: ISO 8601 timestamp.
- `issuedBy`: hub service id.

Exchange Flow

1. Requester asks hub for handoff, specifying target peer id and requested artifacts.
2. Hub validates access and issues `WorkSecret` to requester with `scope` and `expiresAt`.
3. Requester connects to serving peer via Society/libp2p and opens a stream.
4. Requester sends `WorkSecret` in the initial handshake message.
5. Serving peer validates `WorkSecret` with the hub (optional online check) or verifies signature locally.
6. If valid, serving peer streams the requested artifacts over the libp2p stream.

Security considerations

- Prefer signing `WorkSecret` with an asymmetric key (hub private key) and verifying with hub public key to avoid online checks.
- Limit `scope` to the minimal set of artifacts.
- Use short expiration (minutes).
- Log audit events for issuance and consumption.

Development notes

- Token format decision: **Signed JWT (asymmetric)** chosen for v1 (prefer EdDSA, fallback RS256). JWTs enable offline verification by serving peers and scale well; combine with a server-side revocation map for immediate revoke semantics.
- Validation mode: **Hybrid** — serving peers perform offline JWT signature and expiry checks locally; peers consult the hub revocation map on first use or on verification failure (short cache with periodic reconciliation).
- Scope model: Action-level scopes (e.g., `artifact.fetch`, `memory.attach`, `handoff.finalize`) plus optional `artifactIds` for fine-grained access.
- Allowed node binding: Support optional `allowedNodeIds` in tokens; default behavior allows any verified node in the same room.
- Proof: Use bearer JWT in the initial libp2p auth frame; support optional proof-of-possession (signature-over-nonce) for higher-assurance scenarios.
- Key management: Use asymmetric signing with `kid` header; publish a public key set (JWKS) for verification and document rotation/rollover procedures.

These choices balance low-latency offline verification (important for P2P streams) with the ability to revoke tokens quickly when needed.
---
title: P2P Registration and WorkSecret Token-Exchange Spec
feature_id: FEAT-005
artifact: design-extension
status: approved
version: 1.0
owner_agent: architect
parent_feature: kb/features/hub-room-scoped-handoff
phase_gate: design-approved
last_updated: 2026-04-03
---

# Purpose

Define the required P2P registration, discovery mapping, and short-lived WorkSecret token-exchange flows for FEAT-005 when Society Protocol (libp2p) is used as the mandatory v1 backbone. This spec complements the FEAT-005 HTTP handoff contract by describing how peers authenticate, request scoped access, and perform lazy-fetch or stream-based artifact transfers over libp2p.

# Concepts

- `nodeId`: libp2p peer id / DID for a Tracohub node (persistent keypair)
- `agentId`: logical agent or worker identity hosted on a node (e.g., `reviewer`)
- `roomId`: stable internal chat/project room identifier (GossipSub topic)
- `WorkSecret`: short-lived token issued by source hub granting scoped access to memory/artifact fetch and finalize operations for a specific `sessionId`
- `SessionHandle`: as defined in FEAT-006; extended with `mode: remote-target|remote-source` during P2P handoff

# Goals

- Allow a remote target (agent peer) to fetch MemoryBundle metadata and artifact blobs over libp2p streams or via signed HTTP fetchUrls while preserving hub-controlled authorization and audit.
- Enable operation behind NATs without inbound ports via relays; do not require operators to open firewall ports.
- Keep the handoff control-plane authoritative (Next.js hub issues WorkSecrets and audit records).

# Registration & Discovery Mapping

1. Node registers local agents with the hub control plane when the Tracohub instance starts or when an agent process is registered.
   - Registration payload: `{ nodeId, agentId, capabilities, roomIds[], lastSeenAt }` sent to hub internal registry.
2. Hub republishes discovery entries into the Society/GossipSub/Kad-DHT space (if enabled) as signed capability assertions or uses the local discovery cache to map `nodeId+agentId+roomId` → `RemoteAgentCandidate`.
3. Discovery entries must include a short-lived `lastSeenAt` and `expiresAt` and be soft-state to avoid stale candidates.

# WorkSecret Token: Shape and Claims

WorkSecret is an opaque bearer token (JWT-like or encrypted JSON) signed by the hub and scoped to a `sessionId`. Minimal claims:

```
{
  "workSecretId": "ws_...",
  "sessionId": "hs_...",
  "issuedAt": "2026-04-03T10:00:00Z",
  "expiresAt": "2026-04-03T10:15:00Z",
  "scopes": ["memory.attach","artifact.fetch","handoff.finalize"],
  "allowedNodeIds": ["node_123"],    // optional constraint
  "nonce": "random-opaque",
  "signature": "sig(...)"
}
```

- Implementation details: use signed JWT (RS256/EdDSA) or encrypted token format. The hub must keep a short-lived mapping `workSecretId -> sessionId` for revocation and idempotency.

# Token Issuance Flow (source hub)

1. User initiates handoff via `POST /api/handoff/v1/sessions` to create `SessionHandle` (FEAT-005).
2. Hub validates same-room gating and creates `HandoffRecord(status=authorized)`.
3. Hub issues `WorkSecret` scoped to the session and the chosen target `nodeId` (or leaves `allowedNodeIds` empty to accept any verified target in the room).
4. Hub returns `workSecret` and `handoffRecord` to the source UI; it also records the issuance in audit (`HandoffEvent: worksecret-issued`).

# Token Presentation & Libp2p Stream Handshake (target)

1. Target peer discovers the source via Society discovery and initiates a libp2p stream to the source node for the specific `sessionId` (or the source advertises a stream endpoint for `sessionId`).
2. On stream open, the target sends an auth frame containing `{ workSecretId, proof: signatureOverNonce }` where `proof` proves possession of the WorkSecret if using an encrypted format, or simply supplies the WorkSecret in bearer form when TLS-like channel protects the exchange.
3. Source hub validates the WorkSecret against `workSecretId -> sessionId` mapping, checks `expiresAt`, verifies `allowedNodeIds` and `scopes`, and validates the libp2p peer id matches expected `nodeId` if constrained.
4. If valid, the source responds with `200 OK` and begins streaming requested artifacts or permits the target to request artifact attachments (by artifactId) over the authenticated stream.
5. Source records `HandoffEvent: stream-authenticated` in audit with peer id and workSecretId.

# HTTP FetchUrl Mode (fallback or mixed)

- For environments where a libp2p stream is not used, the source hub can register artifact metadata with `fetchUrl` values that are short-lived signed URLs. The target authenticates the fetch either by presenting the WorkSecret in an `Authorization: Bearer` header or by the signed URL itself.
- Signed `fetchUrl` must encode the `artifactId`, `sessionId`, expiry, and a signature; fetch attempts are audited.

# Revocation and Replay Protection

- WorkSecrets are single-session, short-lived, and include `nonce` and `signature`. Hubs must support immediate revocation (`workSecretId -> revoked`) and record `HandoffEvent: worksecret-revoked`.
- Nonces and idempotency keys prevent replay of finalize calls; finalize must accept `idempotencyKey` and hub must reject conflicting finalizes.

# Relay & NAT Considerations

- Do not require inbound port openings for home nodes. Target peers may connect via relays when direct connections fail. Relay usage does not change authorization (WorkSecret verification still performed by source).
- Hub should provide recommended relay flags and a default public relay list (documented); DevOps must approve any production relay providers.

# Audit Events

Emit the following `HandoffEvent` audit types at minimum:
- `worksecret-issued`, `stream-authenticated`, `artifact-fetch-served`, `finalize-requested`, `finalize-reconciled`, `worksecret-revoked`, `session-expired`.

# Error Semantics (summary)

- 401 Unauthorized: missing/invalid WorkSecret or libp2p peer id mismatch.
- 403 Forbidden: WorkSecret lacks required scope (`artifact.fetch` or `handoff.finalize`).
- 410 Gone: WorkSecret expired or session expired.
- 409 Conflict: finalize checksum mismatch or idempotency conflict.

# Example: Minimal P2P artifact fetch handshake (pseudo-JSON frames)

Target -> Source (open stream, send auth frame):

```
{ "type": "auth", "workSecretId": "ws_1", "proof": "..." }
```

Source -> Target (auth ok):

```
{ "type": "auth_ok", "sessionId": "hs_1", "allowedArtifacts": ["art_1","art_2"] }
```

Target -> Source (request artifact):

```
{ "type": "fetch", "artifactId": "art_1" }
```

Source -> Target (streaming binary frames) ...

# Next steps & Acceptance Checklist

The following items must be completed before FEAT-005 is considered implementation-ready:

- **Architect:** Confirm and record the chosen signing algorithm (EdDSA preferred; RS256 acceptable as fallback) and publish JWKS endpoint for verification.
- **Developer:** Implement WorkSecret issuance as signed JWTs, include `workSecretId`, `sessionId`, `scopes`, `allowedNodeIds` (optional), `exp`, `iat`, and `kid` in the token header; add server-side `workSecretId -> sessionId` mapping for revocation.
- **Developer:** Implement hybrid verification on serving peers: offline signature + expiry check; consult hub revocation map on first use or on verification failure; cache revocation checks for a short TTL.
- **QA:** Add tests for expired token rejection, revoked token rejection, missing/insufficient scope, allowedNodeId mismatch, and replay protection (nonce/idempotency) using the P2P harness.
- **DevOps:** Approve relay provider(s) for production use and document recommended relay flags, port mappings, and monitoring SLI targets.

When all items above are done and test evidence is checked in, update FEAT-005 KB frontmatter `phase_gate` to `design-approved` and attach QA evidence to `testing-report.md`.
