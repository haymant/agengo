---
title: FEAT-004 UX Mock and Copy
feature_id: FEAT-004
artifact: ux_mock
status: draft
version: 0.1
owner_agent: BA
parent_feature: kb/features/hub-sharing-remote-discovery
last_updated: 2026-04-03
---

# BA-facing UX mock: `@` mention + share/pull flows

Purpose

Provide BA and reviewers with copy and a minimal visual mock describing how `@` suggestions will present Local and Remote (same room) candidates, and how Share / Pull actions are worded and confirmed.

Key behaviors to validate

- Typing `@` in a shared chat shows Local providers first, then a `Remote (room)` group.
- Remote candidates include capability badges (e.g., `review`, `run`, `fetch`) and a `shared` or `pulled` label.
- Sharing a project/chat is explicit and labeled `Share to room` and requires confirmation.
- Pulling a remote project/chat shows provenance and an explicit `Create Local Copy` button.

Mock: Mention suggestions (text)

When user types `@` the suggestion dropdown shows:

- Local
  - Alice (Local) — Provider: `assistant` — `run`, `review`
  - Workspace Bot (Local)

- Remote (room: traco-test-room)
  - node-42 / reviewer — Shared — `review` badge — Last seen: 2m
  - node-99 / summarizer — Pulled (read-only) — `fetch` badge — Last seen: 10m

UX copy examples

- Share button (project): `Share to room` (tooltip: "Publish a snapshot of this project to the selected room for others to pull")
- Share confirmation modal title: `Share project to room` — Body: "You're about to publish a snapshot of this project to room 'traco-test-room'. This will make the project's metadata discoverable to other nodes in the room. The shared snapshot is read-only for remote nodes. Proceed?" Buttons: `Cancel`, `Share and publish`
- Pull action (project): `Create Local Copy` — Confirmation shows provenance: `From node: node-42 / shareId: sh_1234` and `Imported as local project 'project-copy-2026-04-03'`.
- Mention UI labels: Local candidates show `Local` badge; remote candidates show `Remote (room)` header and either `Shared` or `Pulled` badge per candidate.

Accessibility & microcopy

- Announce dropdown grouping via screen reader: "Mention suggestions: Local providers, Remote (room: traco-test-room)".
- Provide keyboard-only affordances: arrow keys to navigate groups; Enter to select.

Acceptance checks for BA review

- [ ] Wording approved for `Share to room`, `Share and publish`, and `Create Local Copy` labels.
- [ ] Mock dropdown copy approved for `Remote (room)` header and `Shared`/`Pulled` badges.
- [ ] BA confirms the confirmation modal wording sufficiently explains privacy/visibility implications.

Attachments / Next steps

- After BA approval, developers will implement the grouped `remoteCandidates` UI per [kb/features/hub-sharing-remote-discovery/design.md](kb/features/hub-sharing-remote-discovery/design.md#recommended-interface-additions).
- QA will add acceptance tests based on the mock and checklist.
