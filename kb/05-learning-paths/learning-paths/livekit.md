---
title: Traco meeting and LiveKit flow
last_updated: 2026-04-17
owner_agent: Developer
---

This diagram uses Traco terms for the current meeting implementation. The meeting is a `meeting` sub-room under an existing Hub chat. The browser stays on the chat route, the meeting renders in the artifact panel, and the local transcriber service is attached by Hub over HTTP.

```mermaid
flowchart TB
    HubChat[Hub Chat Route\n/chat/{chatId}]
    ArtifactPanel[Artifact Panel\nupper: media\nlower: room chat + transcript]
    ParentChat[Parent Chat Message History\nscoped Hub messages]
    Telegram[Telegram-linked Conversation\noptional create + announcement path]

    HubServer[Traco Hub Server\nmeeting provider + token minting + persistence]
    MeetingSubRoom[Meeting Sub-room\nSubRoom kind=meeting]
    LiveKitCloud[LiveKit Cloud Room\nprovider media plane]
    BrowserRoom[Browser LiveKit Room UI\nmicrophone + speakers + room chat]
    LocalTranscriber[Local Transcriber Service\nTRANSCRIBER_URL HTTP service]

    TranscriptStore[(Message_v2 scoped by subRoomId)]
    MeetingMetadata[(SubRoom metadata\nroomName + transcriber status)]

    HubChat --> ArtifactPanel
    ArtifactPanel --> BrowserRoom

    HubServer --> MeetingSubRoom
    MeetingSubRoom --> MeetingMetadata

    HubServer -->|create room + mint tokens| LiveKitCloud
    HubServer -->|POST /sessions attach| LocalTranscriber
    BrowserRoom -->|join with server-minted token| LiveKitCloud
    LocalTranscriber -->|join with transcriber token| LiveKitCloud

    BrowserRoom -->|microphone audio| LiveKitCloud
    LiveKitCloud -->|remote participant audio| LocalTranscriber
    LocalTranscriber -->|final transcript POST| HubServer
    LocalTranscriber -->|lk.transcription room events| LiveKitCloud
    LiveKitCloud -->|room transcript stream| BrowserRoom

    BrowserRoom -->|final transcript + room chat revalidation| HubServer
    HubServer --> TranscriptStore
    TranscriptStore --> ParentChat
    ParentChat --> HubChat

    Telegram -->|/meeting create or announcement| HubServer
```

Current-state notes

- Hub is responsible for creating the LiveKit room, minting short-lived join tokens, attaching the transcriber, and persisting transcript and room-chat records into scoped Hub messages.
- The local transcriber service is an HTTP dependency rooted at `TRANSCRIBER_URL`. In the current implementation it can join the LiveKit room directly using the server-minted transcriber token.
- The browser uses LiveKit for media transport, but Traco remains the system of record for meeting metadata, transcripts, room-chat persistence, and later prompt-history carry-forward.
- The transcript panel is driven by `lk.transcription` room events for live updates and by scoped Hub message persistence for reload-safe history.

Deferred pattern

- A standalone LiveKit agent-worker dispatch model was evaluated during discovery, but it is not the canonical v1 Traco meeting architecture. The approved v1 path keeps transcription behind the Hub-managed HTTP transcriber service boundary.---
title: Traco meeting and LiveKit flow
last_updated: 2026-04-17
owner_agent: Developer
---

This diagram uses Traco terms for the current meeting implementation. The meeting is a `meeting` sub-room under an existing Hub chat. The browser stays on the chat route, the meeting renders in the artifact panel, and the local transcriber service is attached by Hub over HTTP.

```mermaid
flowchart TB
    HubChat[Hub Chat Route\n/chat/{chatId}]
    ArtifactPanel[Artifact Panel\nupper: media\nlower: room chat + transcript]
    ParentChat[Parent Chat Message History\nscoped Hub messages]
    Telegram[Telegram-linked Conversation\noptional create + announcement path]

    HubServer[Traco Hub Server\nmeeting provider + token minting + persistence]
    MeetingSubRoom[Meeting Sub-room\nSubRoom kind=meeting]
    LiveKitCloud[LiveKit Cloud Room\nprovider media plane]
    BrowserRoom[Browser LiveKit Room UI\nmicrophone + speakers + room chat]
    LocalTranscriber[Local Transcriber Service\nTRANSCRIBER_URL HTTP service]

    TranscriptStore[(Message_v2 scoped by subRoomId)]
    MeetingMetadata[(SubRoom metadata\nroomName + transcriber status)]

    HubChat --> ArtifactPanel
    ArtifactPanel --> BrowserRoom

    HubServer --> MeetingSubRoom
    MeetingSubRoom --> MeetingMetadata

    HubServer -->|create room + mint tokens| LiveKitCloud
    HubServer -->|POST /sessions attach| LocalTranscriber
    BrowserRoom -->|join with server-minted token| LiveKitCloud
    LocalTranscriber -->|join with transcriber token| LiveKitCloud

    BrowserRoom -->|microphone audio| LiveKitCloud
    LiveKitCloud -->|remote participant audio| LocalTranscriber
    LocalTranscriber -->|final transcript POST| HubServer
    LocalTranscriber -->|lk.transcription room events| LiveKitCloud
    LiveKitCloud -->|room transcript stream| BrowserRoom

    BrowserRoom -->|final transcript + room chat revalidation| HubServer
    HubServer --> TranscriptStore
    TranscriptStore --> ParentChat
    ParentChat --> HubChat

    Telegram -->|/meeting create or announcement| HubServer
```

Current-state notes

- Hub is responsible for creating the LiveKit room, minting short-lived join tokens, attaching the transcriber, and persisting transcript and room-chat records into scoped Hub messages.
- The local transcriber service is an HTTP dependency rooted at `TRANSCRIBER_URL`. In the current implementation it can join the LiveKit room directly using the server-minted transcriber token.
- The browser uses LiveKit for media transport, but Traco remains the system of record for meeting metadata, transcripts, room-chat persistence, and later prompt-history carry-forward.
- The transcript panel is driven by `lk.transcription` room events for live updates and by scoped Hub message persistence for reload-safe history.

Deferred pattern

- A standalone LiveKit agent-worker dispatch model was evaluated during discovery, but it is not the canonical v1 Traco meeting architecture. The approved v1 path keeps transcription behind the Hub-managed HTTP transcriber service boundary.