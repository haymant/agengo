---
title: Request: Approval for FEAT-004 and FEAT-005
created_by: Developer
created_at: 2026-04-03
---

Team,

Please review the FEAT-004 (Sharing & Remote Discovery) and FEAT-005 (P2P WorkSecret) designs and acceptance checklists. Below are the key artifacts to review and the specific asks for BA and QA.

FEAT-004 artifacts
- Design: [kb/features/hub-sharing-remote-discovery/design.md](kb/features/hub-sharing-remote-discovery/design.md)
- Acceptance checklist: [kb/features/hub-sharing-remote-discovery/acceptance-checklist.md](kb/features/hub-sharing-remote-discovery/acceptance-checklist.md)
- BA UX mock: [kb/features/hub-sharing-remote-discovery/ux-mock.md](kb/features/hub-sharing-remote-discovery/ux-mock.md)
- Developer tasks: [kb/features/hub-sharing-remote-discovery/developer-tasks.md](kb/features/hub-sharing-remote-discovery/developer-tasks.md)

FEAT-005 artifacts
- Design & spec: [kb/features/hub-room-scoped-handoff/p2p-token-exchange.md](kb/features/hub-room-scoped-handoff/p2p-token-exchange.md)
- Acceptance checklist: [kb/features/hub-room-scoped-handoff/acceptance-checklist.md](kb/features/hub-room-scoped-handoff/acceptance-checklist.md)
- Developer tasks: [kb/features/hub-room-scoped-handoff/developer-tasks.md](kb/features/hub-room-scoped-handoff/developer-tasks.md)

BA asks
- Review FEAT-004 UX mock and copy; confirm labels and modal wording are acceptable.
- Confirm whether the proposed `Local` vs `Remote (room)` grouping is acceptable and if a `Local only` toggle is required in v1.
- Mark FEAT-004 as `BA: approved` or provide edits/comments in the checklist file.

QA asks
- Review FEAT-005 acceptance checklist and testing-plan; confirm test coverage expectations for token expiry, revocation, scope enforcement, and allowedNodeId checks.
- Stand up the P2P harness using `tests/p2p/docker-compose.yml` and validate the example harness at `tests/p2p/harness.js` to reproduce handshake flows.
- Mark FEAT-005 tests as `QA: ready` when fixtures are added and passing.

Notes
- Architect has chosen Signed JWT (EdDSA preferred) for WorkSecret and hybrid verification (offline verify + revocation map). See FEAT-005 design for details.
- A minimal `POST /api/commit` route has been scaffolded at `hub/app/(chat)/api/commit/route.ts` with placeholder verification; developer tasks remain to persist bundles and wire real JWT verification.

Please add your approval or requested edits as comments in the respective acceptance-checklist.md files or reply here with confirmation.

Thanks.
