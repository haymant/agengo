---
title: Hub Authentication and Authorization
feature_id: hub-auth
artifact: requirements
status: draft
version: 0.1
owner_agent: Developer
parent_feature: kb/features/hub-auth
related_artifacts:
  - kb/features/hub-auth/design.md
  - kb/features/hub-auth/implementation-plan.md
  - kb/features/hub-auth/testing-plan.md
  - kb/features/hub-auth/testing-report.md
phase_gate: requirements-draft
last_updated: 2026-04-08
---

Problem: current hub auth and discovery flows rely too heavily on `email` and opaque ids. That creates clashes when the same user runs multiple local nodes, makes discovery labels unfriendly, and leaves Web UI sessions insufficiently isolated between nodes.

Requirements:
- Canonical user primary key for internal authorization flows MUST be `userId` (JWT `sub` / NextAuth `token.id`).
- The product MUST introduce a user-facing, renameable network identifier (`userHandle`) that is unique across the P2P agent network.
- `userHandle` is the identifier shown in registration, discovery, and handoff UIs so users do not need to work with opaque UUIDs.
- `userHandle` may change over time, but each change MUST preserve uniqueness and update discovery/registration records atomically.
- At the same time, `email` is a globally unique identifier across the P2P agent network and MUST be preserved as a stable, unique user identifier for cross-node discovery and admin tooling. Implementations MUST enforce uniqueness of `email` in the users table (current DB schema already enforces this).
- `email` is still a unique network identifier, but it MUST NOT be used alone to make node-local authorization or resource ownership decisions; those decisions require `userId` and `nodeId` in the ownership tuple.
- Resource ownership MUST be namespaced by `(userId, nodeId)` for persisted artifacts created on a node (shares, snapshots, candidate registrations).
- A single `userId`/`email` MAY manage multiple nodes. Each node MUST have a unique `nodeId` persisted locally.
- Each node MUST also expose a renameable, user-facing `nodeName` that is unique within the owning user scope.
- When multiple nodes run on the same machine:
  - Each node MUST use its own isolated workspace directory (no shared workspace paths by default).
  - Each node MUST listen on its own configurable port to avoid HTTP/WS conflicts.
  - Each node MUST have a unique `nodeName`. On first start generate a 10-letter random name (a-z) and persist it with the node identity; allow the user to rename later via the UI or config.
  - Web UI sessions MUST be segregated per-node. Session cookies or local storage keys MUST be namespaced by `nodeId` or node runtime namespace so logging into `http://localhost:3000` does not automatically grant access to `http://localhost:3001` for the same browser session.
- A node only allows one non-guest owner account. The first non-anonymous user registered on the node becomes the node owner. Later credential-based logins and registrations MUST be limited to that owner account; auto-created guest accounts remain allowed.
- The login UI MUST show the current node owner identifier so users know which account is allowed on that node.
- Shared resource identifiers MUST be human-readable and globally unique in the form `userHandle.nodeName.resourceName`, for example `haymant.node1.pi`.
- Discovery and registration for agents MUST use the `userHandle.nodeName.resourceName` namespace immediately. The same namespace format must be reserved for future shared resource types such as chats and projects.
- All API routes that currently accept `session.user.email` as an identity fallback must require `session.user.id` or use an explicit `resolveUserId(userId, email)` helper that performs a deterministic lookup, logs the fallback, and returns a canonical `userId`.
- Token issuance (dev grants / OIDC) must set `sub` to a stable provider subject (not an email) and include `email` only as a claim. If providers issue `sub` as an email, the ingestion path must map it to a canonical `userId` and log a warning.
- Backwards-compatible mapping layer: for legacy records that used `email` as owner, provide a migration path to map them to `userId` when possible; leave unmapped records in a quarantined namespace and surface to ops.

Acceptance criteria:
- Automated tests assert that share creation, listing, and pull flows use `session.user.id` (not `email`) for permission checks, and that `nodeId` is recorded on shares and pulls.
- Automated tests assert that only the node owner can use credential login/registration on that node, while guest sessions remain available.
- End-to-end repro where two local nodes use the same email must not produce resource ownership collisions when pulling/publishing shares; each node's shares and candidates remain isolated by `nodeId`.
- When running two nodes on the same machine and using the same browser, logging into one node's Web UI must not automatically authenticate the other node's Web UI (session isolation by `nodeId` must be enforced).
- Agent discovery and registration use human-readable ids in the form `userHandle.nodeName.resourceName`.
- The feature folder passes KB validation with the required artifact set.
