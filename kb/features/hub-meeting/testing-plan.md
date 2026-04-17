---
title: Hub Meeting - Testing Plan
feature_id: hub-meeting
artifact: testing-plan
status: draft
version: 0.2
owner_agent: QA
parent_feature: kb/features/hub-meeting
related_artifacts:
  - kb/features/hub-meeting/requirements.md
  - kb/features/hub-meeting/design.md
  - kb/features/hub-meeting/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-17
change_log:
  - Created v1 testing plan favoring mocked LiveKit coverage plus manual smoke verification on 2026-04-13
  - Updated the plan for artifact-panel rendering and web-triggered Telegram announcement evidence on 2026-04-13
  - Added local transcriber, room-chat persistence, and prompt-history carry-forward coverage on 2026-04-14
  - Added a deterministic mock-transcriber startup path for local and CI-oriented verification on 2026-04-14
  - Clarified that manual real-mic verification should exercise the direct room-join HTTP transcriber path on 2026-04-17
---

# Test Strategy

Verify meeting creation, secure join-token issuance, local transcriber attachment, artifact-panel rendering, Telegram-triggered creation, web-triggered Telegram announcements, transcript normalization, typed room-chat persistence, and next-prompt history carry-forward using deterministic unit and Playwright coverage. Keep real LiveKit plus local Whisper verification as a manual smoke path.

# Coverage Matrix

| Acceptance Criterion | Test Type | Evidence |
| --- | --- | --- |
| Web user can create meeting, keep the chat route, and mint join token | Playwright + route tests | Pending |
| Web user can create meeting and attach the local transcriber service | Unit + integration | Pending |
| Telegram-linked conversation can create meeting and receive link | Unit + integration | Pending |
| Web-triggered meeting announces into linked Telegram group | Unit + integration | Pending |
| Meeting metadata persists on sub-room model | Unit | Pending |
| Local transcriber stream normalizes into scoped messages | Unit | Pending |
| Typed meeting room chat persists into parent chat | Playwright + integration | Pending |
| Next prompt history includes persisted meeting records | Playwright + route assertion | Pending |
| Meeting UI renders transcript section and provider errors | Playwright | Pending |
| Missing configuration fails safely | Unit + Playwright | Pending |

# Test Cases

1. Create a meeting from the web chat UI, verify the chat route stays active, the artifact panel renders the meeting, and the token endpoint behaves correctly.
2. Reject token issuance for unauthorized access.
3. Create a meeting from a Telegram-linked inbound `/meeting` command and verify reply text includes the join link.
4. Normalize interim and final transcript segments and ensure final segments replace earlier interim content when segment identifiers match.
5. Render meeting UI with mocked provider state and show transcript entries plus configuration-failure states.
6. Send a web-triggered meeting announcement through the Telegram helper and verify target conversation and topic identifiers are forwarded correctly.
7. Create a meeting from a local chat, verify the local transcriber is attached, and confirm transcript text becomes visible in the meeting transcript panel.
  Use the non-simulated HTTP transcriber service path and verify real microphone audio reaches Hub persistence without relying on `/inject_transcript`.
8. Type a room-chat message inside the meeting and verify both the transcript message and the typed room-chat message appear in the parent chat containing the meeting.
9. Send a subsequent parent-chat prompt and verify the request history includes the persisted transcript text and typed room-chat text.

# Data And Environment

- Mock LiveKit provider and transcriber responses for CI.
- Allow local development to use the mock transcriber service on `http://localhost:3003` when validating attach orchestration without real Whisper.
- Use existing Tracohub auth and channel-runtime test helpers where possible.
- Reserve one manual local smoke run with real `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and the HTTP transcriber service at `TRANSCRIBER_URL` joining the room directly for non-simulated microphone capture.

# Exit Criteria

- All acceptance criteria have direct test evidence.
- Testing report distinguishes mocked CI evidence from manual real-provider smoke evidence.
- Deferred items for alternate transcription providers and headless agents remain explicitly marked deferred.

# Change Log

- 2026-04-13: Created v1 testing plan for mocked-provider CI and manual LiveKit smoke validation.
- 2026-04-13: Updated the testing plan for artifact-panel meeting rendering and web-triggered Telegram announcements.
- 2026-04-14: Added local transcriber attach, room-chat persistence, and next-prompt carry-forward coverage requirements.
- 2026-04-17: Clarified that the manual real-mic smoke path should validate the direct room-join HTTP transcriber runtime rather than transcript injection.