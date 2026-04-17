---
title: Hub Meeting - Implementation Plan
feature_id: hub-meeting
artifact: implementation-plan
status: in-progress
version: 0.2
owner_agent: Developer
parent_feature: kb/features/hub-meeting
related_artifacts:
  - kb/features/hub-meeting/requirements.md
  - kb/features/hub-meeting/design.md
  - kb/features/hub-meeting/testing-plan.md
phase_gate: implementation-in-progress
last_updated: 2026-04-17
change_log:
  - Created plan and started implementation slices for LiveKit-backed meeting sub-rooms on 2026-04-13
  - Shipped the initial web, API, persistence, and Telegram meeting slices with passing focused validation on 2026-04-13
  - Reworked the web meeting UX into the artifact panel and added outbound Telegram announcement handling for web-created meetings on 2026-04-13
  - Added transcriber-first execution slices and prompt-history persistence scope on 2026-04-14
  - Started the typed room-chat persistence slice and added a mock transcriber startup path on 2026-04-14
  - Started the direct room-join transcriber implementation path for local non-simulated speech-to-text on 2026-04-17
---

# Plan Summary

Implement hub-meeting in additive slices: KB completion, meeting provider primitives, transcriber orchestration, persistence, API routes, Telegram creation path, UI surfaces, room-chat persistence, and deterministic test coverage.

# Work Breakdown

1. Create and validate the missing hub-meeting KB artifact set.
2. Add LiveKit dependencies and a server-only `hub/lib/meetings` module boundary.
3. Extend sub-room persistence with meeting-specific fields and query helpers.
4. Add authenticated API routes for create, read, join-token, and transcript ingestion.
5. Add Telegram meeting creation through the existing worker-runtime flow.
6. Render a meeting surface and collapsible transcript UI in the Hub chat experience.
7. Add unit coverage for provider logic, auth, normalization, and query helpers.
8. Add Playwright coverage for web creation, token minting, and transcript rendering with mocked provider edges.
9. Add a local transcriber client, typed room-chat persistence, and prompt-history verification.

# Slice Details

## Slice 1: KB and Provider Plumbing

- Create the hub-meeting KB artifacts.
- Add `livekit-server-sdk` and client dependencies.
- Add env validation helpers and a narrow `MeetingProvider` contract.

## Slice 2: Persistence

- Extend `SubRoom` with meeting-specific type and provider metadata.
- Add query helpers for create, load, and update meeting sub-room state.
- Keep transcript persistence on existing message tables.

## Slice 3: API Routes

- Add route handlers for create meeting, read meeting, mint join token, and ingest transcript events.
- Reuse existing auth and worker-runtime authorization patterns.

## Slice 3A: Transcriber Orchestration

- Add server-only env parsing and validation for `TRANSCRIBER_URL`.
- Add a transcriber client that health-checks the local service and starts a room session over HTTP.
- Attach the local transcriber during meeting creation and persist transcriber status metadata on the meeting sub-room.
- Current implementation path: when the HTTP transcriber service is running without a LiveKit JobContext, it joins the LiveKit room directly using the server-minted transcriber token from the `/sessions` request and emits `lk.transcription` plus server-side transcript persistence from that process.

## Slice 4: Telegram Path

- Extend the runtime inbound path to recognize a `/meeting` command in linked conversations.
- Create the meeting sub-room and reply with the canonical join link.

## Slice 5: UI

- Add a meeting launcher in the web chat UI that opens the meeting inside the artifact panel.
- Add meeting room rendering with media on top and room chat plus transcript stacked in the lower area for embedded readability.
- Show actionable errors for missing provider configuration or invalid join state.
- Post a canonical meeting announcement back into linked Telegram groups after web-created meetings succeed.

## Slice 6: Verification

- Add focused unit tests for token generation, transcript normalization, and authorization.
- Add focused unit tests for transcriber config and room-session attach requests.
- Add Playwright tests with mocked provider and mocked transcriber behavior for create and join flows.
- Record one manual real-provider smoke run in the testing report.

## Slice 7: Room Chat And Prompt History

- Persist typed LiveKit room-chat events into scoped Hub messages.
- Revalidate the parent chat feed after transcript and room-chat persistence.
- Verify the next `/api/chat` prompt history includes persisted meeting transcripts and typed room-chat records.

## Slice 8: Team Setup Guidance

- Document `TRANSCRIBER_URL` as an HTTP base URL such as `http://localhost:3003`.
- Add startup guidance for the local Whisper transcriber service and the expected `/health` plus `/sessions` contract.
- Provide a local mock transcriber process for deterministic development of attach orchestration before the real Whisper runtime is wired end to end.

# Dependencies

- `hub-router` sub-room semantics and scoped message persistence.
- Existing channel worker plus runtime ingress for Telegram-linked conversations.
- LiveKit Cloud credentials configured in the application environment.

# Validation Strategy

- Run the repository KB validator after KB creation.
- Run targeted unit tests after each backend slice.
- Run focused Playwright tests after UI and API slices land.

# Rollback Notes

- Keep meeting UI and API behind an additive feature flag until the create and join paths are stable.
- If room-chat persistence or prompt-history inclusion proves unstable, preserve meeting creation and transcript rendering while hiding typed room-chat carry-forward behind a separate flag.

# Change Log

- 2026-04-13: Created implementation plan and marked initial implementation start.
- 2026-04-13: Completed KB, provider, persistence, API, Telegram command, web launcher, meeting page, and focused automated verification slices; manual real-provider smoke evidence remains open.
- 2026-04-13: Shifted the canonical web meeting surface into the artifact panel and added outbound Telegram announcement delivery for web-created meetings.
- 2026-04-14: Added explicit implementation slices for local transcriber orchestration, team startup guidance, typed room-chat persistence, and prompt-history verification.
- 2026-04-17: Added the direct room-join transcriber implementation path as the primary local runtime for real microphone transcription.