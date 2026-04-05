---
title: Feature - Hub Sharing And Remote Discovery
feature_id: FEAT-004
artifact: testing-report
status: draft
version: 1.5
owner_agent: qa
parent_feature: kb/features/hub-sharing-remote-discovery
related_artifacts:
  - kb/features/hub-sharing-remote-discovery/requirements.md
  - kb/features/hub-sharing-remote-discovery/testing-plan.md
phase_gate: testing-in-progress
last_updated: 2026-04-05
---

# Result Summary

FEAT-004 remains in testing-in-progress status. The backend now covers both chat and project snapshot share or pull, the route-options API returns additive `remoteCandidates`, the composer groups `@` suggestions into `Local` and `Remote (room)` sections, and Tracohub now exposes explicit project and chat publish or pull controls in the sidebar and chat header. Authenticated same-host multi-instance chat share or pull evidence now exists through a shared filesystem share registry, and the pulled-project chat pull path now has explicit Playwright coverage that verifies lineage-aware discovery and persisted memory provenance. A first Society sidecar foundation now exists for discovery and snapshot transport when `TRACOHUB_SHARE_ROOT` is unset, but same-host Society SIT and UI-level remote execution are still pending.

# Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Route-options additive contract | Passed | `hub/lib/chat-route-options.ts` and `hub/app/(chat)/api/chat/routes/route.ts` now return `remoteCandidates`, `warnings`, and optional context without mutating the existing provider contract. |
| Grouped mention suggestions | Passed | `hub/components/chat/multimodal-input.tsx` renders `Local` and `Remote (room)` sections in the mention dropdown. |
| Same-room candidate filtering | Passed (current slice) | `hub/lib/remote-discovery.ts` filters discovered remote candidates by an internal room key derived from stable chat/project ids and a local registry file. |
| Automated sharing and discovery evidence | Passed (current slice) | `pnpm exec tsx tests/unit/chat-routing.test.ts` passed on 2026-04-03 for local/remote grouped suggestion behavior. |
| Chat share snapshot persistence | Passed | `hub/app/(chat)/api/chats/[chatId]/share/route.ts` and `hub/lib/share-store.ts` now persist room-scoped chat share records with snapshot messages, memory bundles, and artifact metadata. |
| Chat pull snapshot provenance | Passed | `hub/app/(chat)/api/chats/remote/[shareId]/pull/route.ts` now creates a local pulled chat copy and writes immutable provenance into FEAT-006 memory metadata. |
| Project share snapshot persistence | Passed | `hub/app/(chat)/api/projects/[id]/share/route.ts` and `hub/lib/share-store.ts` now persist room-scoped project share records with chat-count snapshot metadata. |
| Project pull provenance | Passed | `hub/app/(chat)/api/projects/remote/[shareId]/pull/route.ts` now creates a local pulled project copy and persists the source project-share identifier for later remote chat pulls. |
| Project-aware remote chat listing | Passed | `hub/app/(chat)/api/chats/remote/route.ts` accepts `projectShareId` and scopes remote chat snapshots to the shared project lineage. |
| First-pass project or chat share-pull UI | Implemented, automated verification pending | `hub/components/chat/app-sidebar.tsx`, `hub/components/chat/chat-header.tsx`, and `hub/components/chat/sidebar-history-item.tsx` now expose explicit publish or pull controls and separate those controls from chat visibility wording. |
| Pulled-project chat pull workflow | Passed | `pnpm exec playwright test tests/e2e/local-runtime.test.ts --project=e2e -g "pulls a chat from a pulled project and preserves memory provenance"` passed on 2026-04-05 and verified a chat opened inside a pulled project can discover remote snapshots through the project-pull lineage, pull the remote chat, and preserve memory bundle provenance on the target node. |
| Focused automated share/pull evidence | Passed | `pnpm exec tsx tests/unit/share-store.test.ts` passed on 2026-04-04 for chat share creation, project share creation, project pull persistence, and local pull creation. |
| Same-host multi-instance chat share or pull | Passed | `PORT=3102 pnpm exec playwright test tests/e2e/local-runtime.test.ts --project=e2e -g "shares and pulls a chat across two isolated same-host hub instances"` passed on 2026-04-05 and verified two isolated hub instances can share a chat from one node, list it remotely from the other node, and pull it into a local copy when both nodes point at the same shared filesystem share root. |
| Society sidecar discovery and snapshot transport foundation | Passed (unit slice) | `pnpm exec tsx tests/unit/society-transport.test.ts` passed on 2026-04-05 and verified remote candidate discovery plus chat and project share publication, listing, record fetch, and pull behavior through `TRACOHUB_SOCIETY_BASE_URL` without `TRACOHUB_SHARE_ROOT`. |

# Defects

- Workspace-wide `pnpm exec tsc --noEmit --pretty false` still fails because the current repo has broad Next.js and dependency typing mismatches unrelated to FEAT-004; this blocks using a clean whole-workspace compile as release evidence for this slice.

# Acceptance Criteria Disposition

- [ ] A new project stays local by default and can be explicitly shared from the project list UI.
- [ ] A user can pull a remote project into a local isolated copy.
- [ ] A new chat stays local by default and can be explicitly shared from the chat UI.
- [ ] A pulled project can expose a pull-chat workflow for remote chats.
- [x] Typing `@` in a shared chat lists local agents and remote agents that are registered in the same room, grouped and clearly labeled.
- [x] Remote discovery state is clearly labeled as local, shared, or pulled and does not expose unrelated scopes.

Notes:
The checked discovery criteria have direct automated evidence. The first four criteria are now implemented in code, and chat-level same-host route evidence is now recorded. A Society-backed transport foundation now exists at the unit level, but the remaining open criteria are still held open by missing project-level route evidence, missing explicit UI-flow evidence, and the absence of same-host Society SIT and remote `@` execution coverage.

# Follow-ups

- Add project-level same-host route evidence so project share or pull is proven the same way as chat share or pull.
- Replace the shared-filesystem registry path with Society-backed same-host discovery and transport coverage once the transport harness is wired into automated SIT.
- Extend the Society sidecar foundation with remote candidate publication, same-host Society SIT, and UI-level remote `@` execution coverage.

# Change Log

- 2026-04-03: Bootstrapped testing report from UI and routing inspection.
- 2026-04-03: Updated with implemented FEAT-004 route-options contract, grouped mention UI, and routing-helper unit evidence.
- 2026-04-04: Added evidence for backend chat share/pull APIs, snapshot provenance import, and the focused share-store unit test.
- 2026-04-04: Added evidence for project share-pull APIs, project-aware remote chat filtering, and first-pass project or chat share-pull UI controls.
- 2026-04-05: Added authenticated same-host multi-instance chat share or pull evidence using a shared filesystem share root; Society-backed transport remains pending.
- 2026-04-05: Added Playwright evidence for pulled-project chat discovery, remote chat pull, and persisted memory provenance within the pulled-project workflow.
- 2026-04-05: Added unit evidence for the Society sidecar discovery and snapshot-transport foundation when `TRACOHUB_SHARE_ROOT` is unset.