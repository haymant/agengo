---
title: Hub Meeting - Design
feature_id: hub-meeting
artifact: design
status: approved
version: 0.2
owner_agent: Architect
parent_feature: kb/features/hub-meeting
related_artifacts:
  - kb/features/hub-meeting/requirements.md
  - kb/features/hub-meeting/implementation-plan.md
  - kb/features/hub-meeting/testing-plan.md
  - kb/features/hub-router/design.md
last_updated: 2026-04-17
change_log:
  - Created approved v1 design from repository structure and LiveKit study on 2026-04-13
  - Updated the web rendering path to use the artifact panel and added outbound Telegram announcement handling for web-created meetings on 2026-04-13
  - Added the local Whisper transcriber service boundary and room-chat persistence direction on 2026-04-14
  - Clarified the direct room-join transcriber runtime used by the HTTP transcriber service on 2026-04-17
---

# Design Summary

Hub Meeting is an additive extension of the existing chat-thread-sub-room model. A meeting is stored as a specialized sub-room with LiveKit metadata, server-side token issuance, local Whisper transcriber orchestration through `TRANSCRIBER_URL`, transcript and room-chat normalization into existing message records, artifact-panel rendering inside the current Hub chat layout, and outbound announcement support for linked Telegram groups.

# Architecture

- Persistence layer:
  Extend `SubRoom` with meeting-specific metadata such as type, provider, external meeting identifier, lifecycle timestamps, and provider metadata. Reuse `Message_v2.subRoomId` for transcript persistence.
- Server meeting module:
  Add a `hub/lib/meetings` boundary with a narrow `MeetingProvider` interface and a `LiveKitProvider` implementation for room creation, token generation, and event normalization.
- Transcriber service boundary:
  Add a server-only transcriber client module that validates `TRANSCRIBER_URL`, checks transcriber health, starts a room session over HTTP, and stores transcriber attachment metadata on the meeting sub-room. The transcriber service owns speech-to-text, joins the LiveKit room with the server-minted transcriber token, publishes `lk.transcription` back into the room, and posts final transcript segments into Hub persistence routes.
- API layer:
  Add authenticated meeting routes under the existing chat API tree for create, read, join-token, and transcript ingestion operations.
- Meeting message normalization:
  Persist both transcript events and typed room-chat events as scoped Hub messages so the meeting record is visible in the parent chat and remains part of later prompt history.
- Channel bridge:
  Reuse the worker plus runtime ingress path to support Telegram `/meeting` creation and join-link delivery without moving transport logic into Next.js.
- UI layer:
  Render the meeting inside the current chat layout, opening it in the artifact panel on web creation and using a bottom-stacked room-chat plus transcript area to keep the embedded layout readable.
- Outbound channel announcement:
  After a web-created meeting is persisted, resolve linked Telegram group conversations for the chat and post the canonical meeting join URL back into those groups using the stored bot token.

# Interfaces

- `MeetingProvider.createMeeting(args)` returns provider room identity, display metadata, and lifecycle defaults.
- `MeetingProvider.generateJoinToken(args)` returns a short-lived participant token plus provider URL metadata.
- `MeetingProvider.normalizeTranscriptEvent(args)` returns zero or more normalized transcript message payloads with segment identity and finality metadata.
- `MeetingProvider.normalizeRoomEvent(args)` returns lifecycle updates for meeting status and participant presence.
- `TranscriberClient.attachMeeting(args)` validates the local transcriber service and creates a room session using an HTTP contract rooted at `TRANSCRIBER_URL`.
- `MeetingMessageNormalizer.normalizeRoomChat(args)` persists typed room-chat records with explicit meeting metadata so they can be rendered and sent back into the next parent-chat prompt.

# Current State And Target State

- Current state:
  Tracohub persists sub-rooms, participants, and scoped messages already, but it has no meeting-specific persistence, no LiveKit integration module, no meeting routes, and no meeting-specific UI surface.
- Target state:
  Tracohub treats a meeting as a first-class sub-room specialization with a joinable LiveKit room, persisted provider metadata, join-token endpoint, Telegram creation path, and transcript messages rendered in the same scoped chat environment.

# Data Flow

1. User creates a meeting from web UI or Telegram-linked conversation.
2. Server resolves the chat and sub-room context, creates provider room metadata through `LiveKitProvider`, persists the meeting sub-room state, and asks the local transcriber service to attach to the room.
3. Web UI opens the meeting in the artifact panel while Telegram-linked conversations receive the canonical meeting link in-channel.
4. Authorized participants request join tokens from the server.
5. Browser connects directly to LiveKit Cloud with the token while the transcriber service joins separately with its own token.
6. The transcriber service joins the room directly, publishes `lk.transcription` events into the room for live UI updates, and posts final transcript segments into Hub persistence routes. The web client can revalidate on those room events, but Hub persistence remains server-authoritative.
7. Typed room-chat events are normalized into scoped Hub messages tied to the meeting sub-room.
8. The Hub UI renders the meeting surface, transcript thread, and parent-chat carry-forward from the same chat and sub-room context.

# Failure Modes

- LiveKit env vars missing or malformed.
- Provider room creation succeeds but persistence fails.
- Provider room creation succeeds but the transcriber service cannot be reached or rejects the room attach request.
- Token issuance requested by an unauthorized user or worker path.
- Transcript events arrive without stable segment metadata, forcing append-only behavior.
- Typed room-chat is visible in LiveKit but not persisted into Hub, causing prompt-history gaps.
- Telegram command path creates the meeting but fails to post the join link back to the conversation.
- Web meeting creation succeeds but the outbound Telegram announcement path fails for the linked group.

# Decisions

- Use LiveKit as the only provider in v1 and keep the provider interface intentionally narrow.
- Use a local Whisper transcriber service as the only supported transcription backend in v1 and treat it as a separate HTTP-managed dependency.
- Persist transcript events as normal scoped Hub messages instead of a dedicated transcript store in v1.
- Persist typed room-chat events as normal scoped Hub messages instead of leaving them inside ephemeral LiveKit UI state.
- Defer standalone LiveKit agent-worker dispatch because it implies a separate Hub-managed lifecycle that is out of scope for this slice. The v1 implementation keeps the transcriber behind the existing HTTP service boundary and allows that service to join rooms directly.
- Prefer deterministic mocked-provider tests in CI and keep real LiveKit verification manual.

# Open Risks

- Local Whisper runtime performance and packaging now become an operational dependency for meeting creation success.
- UI placement may require a dedicated meeting panel if the artifact panel proves too restrictive during implementation.
- Embedded artifact-panel layout still depends on LiveKit component behavior and needs verification for dense multi-participant rooms.

# Change Log

- 2026-04-13: Created approved v1 design grounded in current Tracohub routing, persistence, and worker boundaries.
- 2026-04-13: Updated the design to make the artifact panel the canonical web meeting surface and to add outbound Telegram announcements for web-created meetings.
- 2026-04-14: Added the local Whisper transcriber service boundary, room attach flow, and typed room-chat persistence expectations.
- 2026-04-17: Clarified that the current transcriber runtime joins the room directly from the HTTP transcriber service rather than relying on standalone LiveKit worker dispatch.