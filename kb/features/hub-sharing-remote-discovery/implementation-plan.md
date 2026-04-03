---
title: Feature - Hub Sharing And Remote Discovery
feature_id: FEAT-004
artifact: implementation-plan
status: draft
version: 1.1
owner_agent: developer
parent_feature: kb/features/hub-sharing-remote-discovery
related_artifacts:
  - kb/features/hub-sharing-remote-discovery/requirements.md
  - kb/features/hub-sharing-remote-discovery/design.md
  - kb/features/hub-sharing-remote-discovery/testing-plan.md
phase_gate: implementation-not-started
last_updated: 2026-04-03
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
- Confirm that local-only users still see existing local provider routing behavior.

# Rollback Notes

- Keep sharing and pull UI feature-flagged if metadata or discovery behavior is unstable.
- If remote-agent discovery causes confusion or stale results, disable only the remote merge while preserving local route options.

# Change Log

- 2026-04-03: Bootstrapped implementation plan for exposure state, share or pull UI, and remote discovery.
- 2026-04-03: Refined implementation plan to align remote discovery with the additive `remoteCandidates` contract and FEAT-006 provenance metadata.