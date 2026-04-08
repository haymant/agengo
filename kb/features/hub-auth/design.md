---
title: Hub Auth Design
feature_id: hub-auth
artifact: design
status: draft
version: 0.1
owner_agent: Architect
parent_feature: kb/features/hub-auth
related_artifacts:
  - kb/features/hub-auth/requirements.md
  - kb/features/hub-auth/implementation-plan.md
  - kb/features/hub-auth/testing-plan.md
  - kb/features/hub-auth/testing-report.md
phase_gate: design-draft
last_updated: 2026-04-08
---

Design summary
- Canonical identifiers:
  - `userId`: stable string id used as primary key for internal authorization (JWT `sub` or NextAuth `token.id`).
  - `userHandle`: unique, renameable, human-readable user identifier used in discovery and shared-resource naming.
  - `email`: preserved as a globally unique network identifier across the P2P agent network; the DB schema MUST enforce uniqueness.
  - `nodeId`: runtime node UUID persisted at `getNodeIdentityPath()` (see `hub/lib/runtime/node-identity.ts`).
  - `nodeName`: unique, renameable, human-readable node identifier scoped to a single owner.

Node identity and metadata
- Persist `nodeId` and `nodeName` in the existing local node identity record to minimize migration churn in the embedded runtime.
- On first-run generate `nodeId` (UUID) and `nodeName` (10-letter random a-z string) and persist both. Allow renaming via API/UI which updates the same persisted record.

User and node naming model
- `userHandle` is the public identifier shown to users and used in registration/discovery. It must be unique across the P2P agent network and renameable.
- `userId` remains the immutable internal key for authorization, foreign keys, and ownership checks.
- `nodeName` is unique within a single `userHandle` namespace and renameable.
- Shared resource identifiers are derived as `userHandle.nodeName.resourceName`.

Multi-node rules for the same user
- A single `userId` / `email` MAY manage multiple nodes. Each node MUST have a unique `nodeId` and isolated runtime artifacts.
- Workspace isolation: each node's `getTracohubDataHome()` derived workspace must include a node runtime namespace so multiple nodes on the same machine do not share state by default. The current implementation slice uses the instance id / port namespace when `TRACOHUB_DATA_HOME` is not explicitly set.
- Networking: each node MUST be configured to listen on its own port; tooling that launches nodes should set a distinct default port per node instance.
- Node naming: nodeName must be unique per node for user-friendly display. Default: 10-letter random string generated at first start. User may rename; server must validate new name uniqueness among local nodes if enforced.
- Node ownership: the first non-anonymous local user becomes the node owner. Credential login and registration are locked to that owner thereafter. Guest accounts remain available for anonymous sessions.

Session segregation (Web UI)
- Sessions must be scoped to a node so that a browser session authenticated against `http://localhost:3000` does not automatically authenticate `http://localhost:3001`.
- Implementation options:
  - Current slice: include a node runtime namespace in the session cookie name (for example `authjs.session-token.instance-a` or `authjs.session-token.3000`) so cookies are distinct per node process.
  - Target state: include persisted `nodeId` in the session cookie namespace once auth initialization can consume node identity without bootstrapping side effects.
  - Alternative: use path/host scoping (`Path=/; Domain=localhost;` is insufficient across ports), so cookie-name namespacing is the reliable approach.
- NextAuth and any client-side storage must use node-scoped cookie/localStorage keys. Audit and update `hub/app/(auth)/auth.ts` callbacks to ensure token/session serialization contains `session.user.id` and that cookie names are generated using the node runtime namespace.

Discovery and shared resource directory
- Agent registration and discovery move to a public namespace: `userHandle.nodeName.resourceName`.
- Internal ownership still resolves through `(userId, nodeId, resourceLocalId)`.
- The same pattern must extend to project and chat shares, for example `haymant.node1.p1` and `haymant.node1.c1`.
- Discovery responses should return both the public resource id and the internal ownership tuple so authorization stays stable across rename operations.

Discovery and ownership
- Remote candidate discovery and share/pull records must include `sourceNodeId` and `sourceUserId` (already present); discovery responses must never conflate candidates from different nodes even if the `email` is identical.

Migration and compatibility
- Provide a migration script to move legacy share/pull records into node-scoped directories or to add a best-effort `sourceUserId` mapping using the `users` table. Unmapped records should be written to a quarantine area for manual review.


Ownership tuple
- Persisted artifacts and shares MUST include `sourceUserId` and `sourceNodeId` (already present for shares). All access checks should validate `session.user.id === sourceUserId` rather than comparing `email`.

Auth flow changes
- Update NextAuth/oidc sign-in callbacks to ensure `token.id` maps to provider `sub` when available; avoid treating `email` as identity.
- Replace code paths that fall back to `email` for DB lookups with explicit `resolveUserId()` helper that performs a deterministic lookup and logs any fallback usage.

Compatibility and migration
- Implement a migration script that scans existing share/pull records referencing email-only ownership and attempts to resolve to `userId` via users table; write unmapped records to `sharing/quarantine` with an audit log.

Security considerations
- Ensure token issuers do not set `sub` to an email address for long-lived tokens; if present, map to canonical user record on ingestion and issue warnings.
