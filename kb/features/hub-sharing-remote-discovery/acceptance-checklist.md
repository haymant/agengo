---
title: FEAT-004 Acceptance Checklist
feature_id: FEAT-004
artifact: acceptance_checklist
status: draft
version: 0.1
owner_agent: BA
parent_feature: kb/features/hub-sharing-remote-discovery
last_updated: 2026-04-03
---

# FEAT-004 Acceptance Checklist (Sharing & Remote Discovery)

BA tasks

- [ ] Approve UX copy and mock showing grouped `@` suggestions with `Local` and `Remote (room)` sections.
- [ ] Confirm share/pull labeling and wording avoids confusion with existing visibility controls.

Architect tasks

- [ ] Confirm ACL/filter semantics for route-options time filtering and document fallback behavior.
- [ ] Confirm discovery cache expiry policy and `stale` handling.

Developer tasks

- [ ] Implement `remoteCandidates` response shape and merge into `@` suggestion builder with grouped UI.
- [ ] Ensure pulled snapshot provenance uses FEAT-006 fields (`sourceShareId`, `nodeId`, `gitUrl`, `gitRevision`).

QA tasks

- [ ] Add tests asserting typing `@` shows grouped `Local` and `Remote (room)` suggestions.
- [ ] Add tests for capability-based filtering and opt-out behavior.

Acceptance

- [ ] All checklist items completed and evidence attached to `testing-report.md`.

BA approval

- [x] BA reviewed and approved UX copy and mock on 2026-04-03 (approved by BA).

