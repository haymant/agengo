---
title: FEAT-004 Developer Tasks
feature_id: FEAT-004
artifact: developer_tasks
status: draft
version: 0.1
owner_agent: Developer
parent_feature: kb/features/hub-sharing-remote-discovery
last_updated: 2026-04-03
---

# Developer Implementation Tasks (FEAT-004)

Summary

Implement grouped `@` mention UI, route-options `remoteCandidates` API merge, share/pull route handlers, and snapshot provenance wiring to FEAT-006 artifacts.

Tasks

- UI: Implement `MentionDropdown` changes
  - Add grouped sections: `Local` and `Remote (room: {roomId})`.
  - Render capability badges and `Shared`/`Pulled` labels for remote candidates.
  - Add keyboard navigation and screen-reader announcements per UX mock.

- Backend: Route-options API
  - Add `remoteCandidates` field to `hub/lib/chat-routing.ts` response as defined in design.
  - Populate from discovery cache; keep backward-compatible `providers` array unchanged when remote discovery disabled.

- Share/Pull handlers
  - Implement `POST /api/projects/{projectId}/share` and `POST /api/projects/remote/{shareId}/pull` (and chat equivalents).
  - On pull, record FEAT-006 provenance fields (`sourceShareId`, `nodeId`, `gitUrl`, `gitRevision`).

- Tests
  - Unit tests for route-options merging and capability filtering.
  - Integration test that typing `@` shows grouped remote candidates (use test double for discovery cache).

Acceptance

- UI: `@` suggestion dropdown shows `Local` then `Remote (room)` group matching mock copy.
- Backend: `remoteCandidates` present when discovery enabled; tests pass.
