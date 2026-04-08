---
title: Feature - Hub Sharing And Remote Discovery
feature_id: FEAT-004
artifact: design
status: approved
version: 1.1
owner_agent: architect
parent_feature: kb/features/hub-sharing-remote-discovery
related_artifacts:
  - kb/features/hub-sharing-remote-discovery/requirements.md
  - kb/features/hub-sharing-remote-discovery/implementation-plan.md
  - kb/features/hub-sharing-remote-discovery/testing-plan.md
phase_gate: design-approved
last_updated: 2026-04-03
---

# Design Summary

Sharing and discovery should sit on top of the isolated-workspace model and the FEAT-006 canonical memory or artifact model. The design introduces additive exposure metadata for projects and chats, explicit share and pull UI actions, room-scoped discovery boundaries, and an additive remote-agent discovery feed that augments the existing route-options API without breaking local routing behavior.

# Scope Mapping

- Project-level share and pull controls map to the sidebar project UI and related API routes.
- Chat-level share and pull controls map to the active chat header or menus.
- Remote route discovery maps to the existing route options API and mention suggestion builder.
- Exposure state maps to new schema and query helpers rather than replacing the current visibility model immediately.
- Pulled snapshot provenance maps to FEAT-006 memory and artifact metadata rather than ad hoc free-form fields.

# Architecture

## Components

- Exposure metadata model: additive project and chat share records that track `local`, `shared`, or `pulled` state plus immutable provenance references.
- Share and pull APIs: route handlers that publish metadata, fetch remote metadata, and create local copies.
- Remote agent registry or cache: a server-side discovery layer keyed by node UUID, agent ID, room ID, and capability summary.
- Route option merger: logic that combines local provider options with same-room remote agent candidates.
- UI affordances: project-share buttons, project-pull button, chat-share button, pulled-chat actions, and explicit local or shared badges.

## Recommended Interface Additions

The existing [hub/lib/chat-routing.ts](/home/data/git/haymant/traco/hub/lib/chat-routing.ts) response shape should remain backward-compatible for local-only users. Additive remote discovery fields should be introduced instead of overloading the current `providers` list.

Recommended response contract:

```ts
type ChatRouteOptionsResponse = {
  context: {
    projectId: string | null;
    chatId: string | null;
    roomId: string | null;
    discoveryState: "local" | "shared" | "pulled";
  };
  providers: ChatRouteProviderOption[];
  remoteCandidates: RemoteAgentCandidate[];
  warnings: RouteDiscoveryWarning[];
};

type RemoteAgentCandidate = {
  nodeId: string;
  nodeName: string;
  userId: string;
  agentId: string;
  title: string;
  canonicalPath: string;
  roomId: string;
  capabilitySummary: string[];
  locality: "remote";
  scopeState: "shared" | "pulled";
  handoffSupported: boolean;
  lastSeenAt: string;
};

type RouteDiscoveryWarning = {
  code: "ROOM_UNAVAILABLE" | "REGISTRY_STALE" | "REMOTE_DISCOVERY_DISABLED";
  message: string;
};
```

This keeps the current `providers` contract intact and gives the UI a separate, explicitly labeled remote list to merge into `@` suggestions.

Recommended public identity contract:

```ts
type RemoteIdentityLabel = {
  userId: string;
  nodeName: string;
  resourceName: string;
  canonicalPath: `${string}/${string}/${string}`;
};
```

The canonical path is for discovery, search, and UX labels only. Authorization and transport must continue to use internal `roomId`, `nodeId`, `shareId`, and `agentId` tuples.

## Share And Pull Surface

Recommended route-handler surface:

- `POST /api/projects/{projectId}/share`
- `GET /api/projects/remote?roomId={roomId}`
- `POST /api/projects/remote/{shareId}/pull`
- `POST /api/chats/{chatId}/share`
- `GET /api/chats/remote?projectShareId={shareId}`
- `POST /api/chats/remote/{chatShareId}/pull`

Recommended request or response conventions:

- Share responses should return immutable `shareId`, `roomId`, `publishedAt`, `expiresAt`, and a minimal `provenance` block.
- Share responses should also return canonical public identity labels so the pull UI can list and search resources by `userId/nodeName/resourceName`.
- Pull responses should return the new local `projectId` or `chatId`, the source `shareId`, and FEAT-006 provenance references written into the local copy.
- Project share metadata must not imply chat execution eligibility. Chat share metadata must be explicit and separate.

## Data Flow

1. A user explicitly shares a local project or chat.
2. Tracohub records exposure metadata and publishes discoverable room information for that scope.
3. Another node lists shared projects or chats and searches those lists using canonical `userId/nodeName/resourceName` labels before pulling one into a local isolated copy.
4. When the pulled or shared chat is active, the route-options API merges same-room remote agent candidates into the `@` mention suggestion set and labels them with canonical `userId/nodeName/resourceName` paths.
5. FEAT-005 later reuses the same `roomId`, `nodeId`, and `agentId` identity tuple for actual remote handoff authorization.

## Persistence Expectations

- Project and chat exposure state should live in additive share tables rather than by overloading the existing chat `visibility` enum in [hub/lib/db/schema.ts](/home/data/git/haymant/traco/hub/lib/db/schema.ts).
- Pulled local copies should record immutable provenance using FEAT-006 memory metadata for source share ID, source node ID, git URL, and git revision when present.
- Remote-agent discovery cache entries should be soft-state records with `lastSeenAt`, `expiresAt`, and room-scoped uniqueness on `roomId + nodeId + agentId`.
- Remote share records and candidate records should also persist the current public `userId` and `nodeName` labels so the UI can render stable, searchable canonical paths without exposing raw internal ids.
- Discovery cache expiry must hide stale candidates from the UI rather than showing them as live peers.

## Failure Modes

- A supposedly local project becomes discoverable due to incorrect default exposure state.
- A pulled project accidentally reuses the remote node’s mutable storage rather than creating a local copy.
- Route discovery leaks agents from other rooms or other unshared scopes.
- UI state does not clearly distinguish local-owned, shared, and pulled resources.
- The route-options API blocks or regresses local provider discovery when remote discovery is unavailable.
- Stale registry entries produce handoff-eligible-looking agents that are no longer reachable.

# Tradeoffs

- Snapshot pull is safer and simpler than live synchronization, but it pushes explicit refresh or re-pull flows to later phases.
- Project-level discovery without immediate chat-level execution keeps scope leakage smaller, but adds one more concept for users to learn.
- Reusing the current route-options pipeline minimizes UI churn, but remote-discovery latency must be handled carefully.

# Decisions

- Keep all projects and chats local and undiscoverable until the user shares them.
- Treat pulled projects and chats as local copies with provenance rather than remote mounts.
- Use project rooms for discovery and chat rooms for actual execution and `@` candidate filtering.
- Extend current route discovery rather than inventing a separate remote mention UI.
- Reuse FEAT-006 provenance and artifact semantics so git URL and revision stay immutable metadata while concrete pulled content remains artifact-backed local state.
- Keep the route-options response backward-compatible by adding `remoteCandidates` rather than mutating the existing `providers` contract.
- Treat `userId/nodeName/resourceName` as the canonical human-readable remote address, while internal `nodeId`, `roomId`, `shareId`, and `agentId` remain the stable protocol identifiers.

### Architect-selected defaults (recommended for v1)

- **Mention resolution:** Local + same-room remote candidates exposed in `@` suggestions, grouped under `Remote (room)`.
- **Exposure model:** Opt-in per-project/chat share action; support optional time-limited shares for ad-hoc scenarios.
- **UI grouping:** Show `Local` providers first, then a `Remote (room)` group with capability badges and clear `shared`/`pulled` labels.
- **Presence & privacy:** Default to not advertising continuous presence; advertise presence only for explicitly shared rooms; nodes may opt-out.
- **Filtering:** Apply capability-based filtering at route-options time and surface permission indicators; provide a request-to-access flow for restricted candidates.
- **Snapshot semantics:** Snapshot-only v1 — pulls create immutable local copies with explicit re-pull affordance.

These defaults reduce privacy risk, keep UX simple, and limit accidental scope leakage while enabling common cross-node discovery scenarios.

## Optional P2P / Society Protocol Integration

There are internal non-canonical draft notes proposing Society Protocol (libp2p-based) as a low-effort P2P option for agent registration and discovery. FEAT-004 should record an optional integration point:

- **Discovery backend:** Support pluggable discovery backends: (1) centralized registry/cache (server-side), and (2) optional P2P discovery (Society/libp2p). The route-options `remoteCandidates` feed should be able to be populated from either source.
- **Stable tuple mapping:** Define how Society node tuples (`nodeId`, `agentId`, `roomId`) map to `RemoteAgentCandidate` entries and TTL/lastSeen semantics.
- **Security model:** Define how P2P-provided candidate claims are validated (signed node assertions, signed capability manifests, or authoritative registry reconciliation) before appearing in the mention UI.

Architects should decide whether Society Protocol is an experimental opt-in discovery backend for v1, or deferred to a later release after a central registry bootstrap.

## Embedded Society Protocol — in-process options and rollout

Embedding the Society protocol into the Hub process is a viable incremental enhancement for serverful deployments (VM, container, k8s). The following guidance describes safe integration patterns, constraints, and an incremental rollout plan that preserves the existing external sidecar and HTTP adapter compatibility.

### Integration variants

- **Child-process managed sidecar (low-risk first increment):** Hub spawns a supervised sidecar binary or node script. Provides strong process isolation while enabling single-deploy UX. Use this as the initial prototype and CI test target.
- **Node Worker (moderate-risk):** Run libp2p inside a Node `Worker` thread to reduce IPC overhead while keeping stronger isolation than the main loop.
- **Full in-process (high-risk):** Initialize libp2p directly on the main event loop. Only recommended for single-tenant or carefully monitored deployments.

### Compatibility shim

When embedded, Hub must continue to honor `TRACOHUB_SOCIETY_BASE_URL` semantics by exposing the same HTTP adapter endpoints internally (eg `/v1/shares/*`, `/v1/discovery/candidates`) so existing code paths and tests remain unchanged. This adapter is the compatibility surface that allows incremental adoption.

### Configuration & flags

- `TRACOHUB_SOCIETY_EMBEDDED=true|false` — opt-in flag to enable embedded behavior.
- `TRACOHUB_SOCIETY_CHILD_PROCESS` — if present, spawn the configured binary/command instead of attempting in-process initialization.
- Preserve current precedence: `TRACOHUB_SHARE_ROOT` and `TRACOHUB_REMOTE_CANDIDATES_FILE` keep priority over any society mode.

### Identity & persistence

- Persist node keys and DID material under `${TRACOHUB_DATA_HOME}/node-identity` with strict permissions.
- Provide admin endpoints to export, inspect, and rotate identity material.

### Health, metrics & observability

- Add `society` subsection to the Hub health JSON (eg `/healthz?society=1`) showing peer count, relay status, and lastStartedAt.
- Export Prometheus metrics: `tracohub_society_peer_count`, `tracohub_society_connections`, `tracohub_society_relay_events`.

### Safety & operational guidance

- Prefer child-process mode for production to avoid embedding untrusted native dependencies directly in the main process.
- Document supported hosting targets; by default disallow embedded mode on serverless platforms and surface explicit errors when started there.
- Add resource limits and watchdogs to auto-restart society worker on severe errors.

### Rollout plan

1. Prototype child-process spawn and compatibility adapter; run unit and mock-sidecar tests with the child-process manager.
2. Add CI job that runs Hub in child-process embedded mode and executes the society-transport test suite.
3. Pilot Node Worker mode in staging; gather telemetry and resource profile.
4. If stability proven, optionally implement a full in-process mode and document constraints.

### Acceptance criteria

- Embedded mode must not regress existing external sidecar tests.
- Health checks must report society readiness independent of Hub readiness.
- Playwright E2E using embedded mode must be marked stable in CI or explicitly gated behind a long-running job runner.

### Open decisions

- Which hosting targets will be explicitly supported for embedded mode (Docker/k8s/VM only vs. also single-host systemd)?
- Default for local dev: enable embedded mode by default or keep explicit opt-in?

Architects and DevOps should review the above and update `implementation-plan.md` with the chosen integration variant and rollout slice definitions.

# Open Risks

- The current visibility selector may confuse users if sharing is added as a parallel concept without clear labeling.
- Cached remote-agent metadata can go stale unless discovery freshness is explicit.
- Snapshot pull semantics may need a later refresh or diff model for users who expect live collaboration.

# Change Log

- 2026-04-03: Bootstrapped sharing and remote-discovery design from hub UI and route-option behavior.
- 2026-04-03: Approved design after defining additive `remoteCandidates` contract, share or pull surfaces, and FEAT-006 provenance alignment.
- 2026-04-08: Added canonical `userId/nodeName/resourceName` labeling requirements for remote candidates and pull/search surfaces while keeping internal ids authoritative for authorization.

## Architect Acceptance Checklist

The architect should validate the following before marking FEAT-004 as implementation-ready:

- **Serialization:** Agree on the `MemoryBundle` and `ArtifactMeta` serialization examples that FEAT-005 will consume (JSON schema or protobuf examples), and document them in FEAT-005 design.
- **Mention UX:** Confirm `@` mention behavior shows local provider options first and a separate `Remote (same room)` group for remote candidates; ensure UI labels for `local`, `shared`, `pulled`, and `stale` are consistent with the testing-plan.
- **ACL & Session Policy:** Define how `SessionHandle.policy` and per-entry ACLs filter remoteCandidates at route-options time; document the explicit ACL filter steps and fallbacks.
- **Discovery Freshness:** Define discovery cache expiry and how stale candidates are surfaced (hidden vs labeled `stale`).
- **Provenance:** Confirm pulled snapshots record FEAT-006 provenance fields (`sourceShareId`, `nodeId`, `gitUrl`, `gitRevision`) and that these fields are immutable on local edits.
- **Transport Contract Hints:** Provide a minimal transport contract for FEAT-005 that references `roomId`, `nodeId`, `agentId`, and `shareId` tuples used for authorization during handoff.
- **UI Toggle:** Decide if a user-facing filter (e.g., `Local only`) is required and where it should appear in the mention UI.

When all items above are accepted, update the FEAT-004 frontmatter `phase_gate` to `design-approved` and add a cross-reference to the FEAT-005 design document where serialization examples are stored.