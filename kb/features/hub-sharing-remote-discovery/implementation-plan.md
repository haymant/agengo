---
title: Feature - Hub Sharing And Remote Discovery
feature_id: FEAT-004
artifact: implementation-plan
status: draft
version: 1.5
owner_agent: developer
parent_feature: kb/features/hub-sharing-remote-discovery
related_artifacts:
  - kb/features/hub-sharing-remote-discovery/requirements.md
  - kb/features/hub-sharing-remote-discovery/design.md
  - kb/features/hub-sharing-remote-discovery/testing-plan.md
phase_gate: implementation-in-progress
last_updated: 2026-04-05
---

# Plan Summary

Implement sharing and remote discovery in three slices: additive metadata and APIs, share and pull UI, and route-option integration for same-room remote candidates.

# Work Breakdown

1. Add schema and query support for project or chat exposure state, pulled provenance, and remote-agent cache or registry data.
2. Add project share and pull APIs plus project-level UI controls in the sidebar.
3. Add chat share and pull APIs plus chat-level UI controls.
4. Implement snapshot pull behavior that creates local copies inside isolated workspaces.
5. Extend route-options discovery to include same-room remote agent candidates through the additive `remoteCandidates` response field.
6. Update `@` mention suggestions to surface and label remote candidates cleanly.
7. Add node-scoped identity settings and propagate canonical `userId/nodeName/resourceName` labels into remote share summaries, route-options responses, and pull dialogs.

# Current Implementation State

- Route-option discovery and grouped `@` suggestions are already implemented and validated from the earlier FEAT-004 slice.
- The current mention and pull UX still exposes remote resources primarily through `nodeId`-oriented metadata instead of the approved canonical `userId/nodeName/resourceName` labels.
- Chat snapshot share and pull APIs are now implemented through additive file-backed metadata and snapshot persistence under the Tracohub data home.
- Pulled chat snapshots now create local chat copies and write immutable provenance into FEAT-006 memory metadata during pull.
- Project snapshot share and pull APIs are now implemented through additive file-backed project share records and pull provenance records.
- Sidebar project actions now expose explicit project publish and pull controls, and chat surfaces now expose explicit publish and pull controls without overloading the existing visibility selector vocabulary.
- Pulled projects now retain the originating project-share identifier so remote chat listing can scope to the shared project lineage instead of only the local project id.
- Same-host runtime validation now has explicit support for multi-instance execution by allowing distinct Next dev dist directories (`TRACOHUB_NEXT_DIST_DIR`) and an optional shared filesystem share root (`TRACOHUB_SHARE_ROOT`) for cross-instance share or pull tests.
- A first hybrid-transport foundation now exists: when `TRACOHUB_SHARE_ROOT` is unset and `TRACOHUB_SOCIETY_BASE_URL` is configured, remote candidate discovery and chat or project share publication, listing, and record fetch can flow through a Society sidecar adapter while the existing filesystem mode remains unchanged.
- Route-option discovery and snapshot transport still need same-host Society SIT, remote candidate publication, and UI-level remote `@` execution wiring before Society-backed delivery can be considered complete.
- Identity settings for the public remote `userId` and `nodeName`, canonical-path search in pull surfaces, and UI-level `@` rendering with canonical labels are the next FEAT-004 completion slice.

# Dependencies

- The isolated-workspace feature should land first so pulled resources have safe local roots.
- The unified memory and artifact model should land before final share or pull implementation so provenance and pulled-copy state use one canonical representation.
- Final room ID and node UUID conventions must be stable enough for registry and cache modeling.
- FEAT-005 must reuse the same `roomId + nodeId + agentId` identity tuple defined here for handoff authorization; do not fork a parallel identity model.
- Later handoff execution can reuse the discovery layer but is not required for this feature to ship.

# Validation Strategy

- Test default non-exposure for newly created projects and chats.
- Test snapshot share and pull flows for both projects and chats.
- Test route-options output and `@` mention suggestions to confirm same-room filtering.
- Test canonical-path labeling and search behavior in remote project, chat, and `@` suggestion surfaces.
- Confirm that local-only users still see existing local provider routing behavior.

# Rollback Notes

- Keep sharing and pull UI feature-flagged if metadata or discovery behavior is unstable.
- If remote-agent discovery causes confusion or stale results, disable only the remote merge while preserving local route options.

# Change Log

- 2026-04-03: Bootstrapped implementation plan for exposure state, share or pull UI, and remote discovery.
- 2026-04-03: Refined implementation plan to align remote discovery with the additive `remoteCandidates` contract and FEAT-006 provenance metadata.
- 2026-04-04: Marked implementation in progress after landing chat share/pull route handlers, snapshot-pull provenance wiring, and focused store tests.
- 2026-04-04: Added project share/pull APIs, local project-pull provenance, project-aware remote chat listing, and first-pass sidebar or chat share-pull controls.
- 2026-04-05: Added same-host multi-instance runtime support for FEAT-004 verification through shared filesystem share state and distinct Next dev dist directories; Society-backed transport remains a follow-on.
- 2026-04-05: Added a hybrid Society sidecar foundation for remote candidate discovery and chat or project share publication, listing, and fetch when `TRACOHUB_SHARE_ROOT` is unset.
- 2026-04-08: Added the remaining FEAT-004 identity-label slice for node/user settings, canonical-path pull search, and `@` suggestion rendering.