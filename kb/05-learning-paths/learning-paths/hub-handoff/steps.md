---
title: Hub Handoff - Quick Steps
feature_id: hub-handoff
artifact: steps
status: draft
version: 1.0
owner_agent: Developer
parent_feature: hub-sharing-remote-discovery
last_updated: 2026-04-05
---

Step-by-step checklist for an E2E manual verification run.

1) Start two Hub nodes (source and target) with distinct `TRACOHUB_DATA_HOME` and `TRACOHUB_NEXT_DIST_DIR`.
2) On source, create a new chat and add at least one message (this simulates a live task).
3) On source, POST to `/api/chats/{chatId}/share` to publish a share snapshot.
4) On target, GET `/api/chats/remote?roomId={roomId}` to discover available shares for that room.
5) On target, POST to `/api/chats/remote/{shareId}/pull` to pull the snapshot into the local store.
6) Confirm messages appear on the pulled chat via `/api/messages?chatId={pulledChatId}`.
7) Discover remote agents by keeping a shared `TRACOHUB_REMOTE_CANDIDATES_FILE` with candidate entries and verifying node discovery endpoints read it.
8) Start a local agent task (via UI or API); when ready to handoff, share the chat and have the remote node pull and resume the agent task.

Accept criteria:
- Pulled chat on target contains same persisted messages as source snapshot.
- Remote agent discovery shows candidate(s) from the other node when `TRACOHUB_REMOTE_CANDIDATES_FILE` is shared.
