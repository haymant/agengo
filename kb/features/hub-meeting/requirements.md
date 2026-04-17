---
title: Hub Meeting - Requirements
feature_id: hub-meeting
artifact: requirements
status: approved
version: 0.2
owner_agent: BA
parent_feature: kb/features/hub-meeting
related_artifacts:
  - kb/features/hub-meeting/design.md
  - kb/features/hub-meeting/implementation-plan.md
  - kb/features/hub-meeting/testing-plan.md
  - kb/features/hub-meeting/testing-report.md
  - kb/features/hub-router/requirements.md
  - kb/features/hub-channel/requirements.md
phase_gate: requirements-approved
last_updated: 2026-04-14
change_log:
  - Created approved v1 requirements from LiveKit study and repository verification on 2026-04-13
  - Updated the canonical web UX to use the artifact panel and added linked Telegram announcement expectations on 2026-04-13
  - Rebased v1 transcription requirements around a required local Whisper transcriber service on 2026-04-14
---

# Context

Tracohub already has canonical routing scopes for chat, thread, and sub-room, a worker-mediated Telegram bridge, and scoped message persistence. The hub-meeting feature adds a LiveKit-backed meeting sub-room that reuses those primitives instead of introducing a separate meeting conversation model.

# Goals

- Add a first-class `meeting` sub-room type under the existing chat and sub-room hierarchy.
- Allow authenticated users to create and join a LiveKit meeting from the web UI without leaving the active chat route.
- Allow Telegram-linked conversations to create a meeting and receive a join link through the existing worker-runtime path.
- Show meeting transcripts inside the Hub sub-room through a local Whisper transcriber service that publishes normalized transcript events into the room.
- Keep the implementation additive to hub-router and hub-channel contracts.

# Non-goals

- This v1 does not implement Zoom, Teams, or any provider other than LiveKit.
- This v1 does not add headless LiveKit agent participants or agent-server dispatch.
- This v1 does not support transcription providers other than the local Whisper transcriber service.
- This v1 does not fall back to provider-native transcription when the local transcriber service is unavailable.
- This v1 does not require CI to connect to a real LiveKit Cloud room.

# Assumptions And Constraints

- Meeting state must reuse `SubRoom`, `SubRoomParticipant`, and `Message_v2` scope metadata instead of inventing a second message store.
- Telegram creation and join-link posting must reuse the current worker plus runtime API split.
- LiveKit secrets remain server-only and must never be exposed to browser code.
- Transcript support in v1 depends on a reachable local transcriber service configured through `TRANSCRIBER_URL` and publishing `lk.transcription` events for meeting rooms.
- `TRANSCRIBER_URL` must point to an HTTP service that exposes a health check and a room-session attach endpoint for Hub-managed meetings.
- Meeting creation must fail safely when LiveKit configuration is missing or invalid.
- Meeting creation must fail with actionable transcription guidance when the local transcriber service is missing or unavailable.

# Requirements

## Functional

- Tracohub must support a `meeting` sub-room specialization using LiveKit as the only provider in v1.
- The web chat UI must allow an authenticated user to create a meeting sub-room under an existing chat.
- The web chat UI must open a newly created meeting inside the existing artifact side panel instead of navigating away from the chat route.
- Telegram-linked conversations must be able to create a meeting through the existing channel worker and runtime ingress path.
- The system must mint short-lived LiveKit participant tokens on the server for authorized meeting participants.
- The meeting UI must render inside the existing Hub layout without breaking the current chat and artifact workflows.
- When rendered inside the artifact panel, meeting media must stay in the upper area and room chat plus transcript surfaces must move into the lower area so the embedded experience stays readable.
- The meeting sub-room must store provider metadata needed to reconnect and render the meeting.
- The system must attach a local Whisper transcriber service to each created meeting before reporting meeting creation success.
- Transcript events emitted through `lk.transcription` must be normalized into scoped Hub messages tied to the meeting sub-room.
- Typed room-chat messages entered during the meeting must be normalized into scoped Hub messages tied to the meeting sub-room and parent chat.
- The meeting transcript view must support collapsed and expanded rendering, and final transcript segments must replace matching interim segments when segment metadata is available.
- The system must post a meeting join link back into the originating Telegram-linked conversation after successful creation.
- The system must post a meeting join link back into the originating Telegram-linked conversation even when the meeting was started from the web chat UI.
- The system must expose enough room and participant lifecycle metadata for the UI to show meeting state and participant presence.
- The next parent-chat prompt history must include persisted meeting transcript records and persisted typed room-chat records.

## Non-functional

- Missing or invalid LiveKit configuration must produce actionable user-visible errors instead of silent failure.
- Missing or invalid transcriber configuration must produce actionable user-visible errors instead of silent fallback.
- Authorization rules for meeting creation and token minting must reuse existing chat ownership or membership checks.
- The implementation must remain compatible with existing sub-room routing and FEAT-006-compatible scope metadata.
- Meeting transport concerns, token issuance, transcriber orchestration, transcript normalization, and UI rendering must remain in separate module boundaries.
- Test coverage must favor deterministic mocked provider behavior in CI and keep real-provider verification as an explicit manual smoke path.

# Acceptance Criteria

- [ ] The hub-meeting feature folder contains complete and coherent KB artifacts.
- [ ] An authenticated web user can create a meeting sub-room and retrieve a server-minted LiveKit join token.
- [ ] An authenticated web user can create a meeting sub-room, keep the current chat route open, and see the meeting rendered in the artifact panel with a server-minted LiveKit join token.
- [ ] A Telegram-linked conversation can trigger meeting creation and receive a join link through the existing worker-runtime flow.
- [ ] Meeting metadata persists on the sub-room model and can be loaded by the Hub UI.
- [ ] Local Whisper transcript events can be persisted into scoped Hub messages for the meeting sub-room.
- [ ] Typed room-chat messages can be persisted into scoped Hub messages for the meeting sub-room and parent chat.
- [ ] The UI can render the meeting surface and an expandable transcript section without requiring a separate meeting application shell.
- [ ] The next parent-chat prompt includes persisted meeting transcripts and typed room-chat records in history.
- [ ] Missing configuration and provider failures degrade with explicit error responses and test evidence.

# Open Questions

- Which specific HTTP payload shape the local transcriber service will standardize on for room-session attach responses beyond the required `sessionId` field.

# Change Log

- 2026-04-13: Created approved v1 requirements aligned to current Tracohub routing, worker boundaries, and LiveKit token and transcript constraints.
- 2026-04-13: Updated the approved UX so web-created meetings open in the artifact panel and linked Telegram conversations receive outbound meeting announcements.
- 2026-04-14: Updated the approved scope so meeting transcription requires a local Whisper transcriber service via `TRANSCRIBER_URL`, and added typed room-chat persistence plus prompt-history carry-forward expectations.