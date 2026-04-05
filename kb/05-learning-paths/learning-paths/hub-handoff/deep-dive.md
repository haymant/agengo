---
title: Hub Handoff - Deep Dive
feature_id: hub-handoff
artifact: deep-dive
status: draft
version: 1.0
owner_agent: Developer
parent_feature: hub-sharing-remote-discovery
last_updated: 2026-04-05
---

Background and internals useful for debugging and automating E2E verification.

Discovery
- Current local discovery is filesystem-backed. The Hub reads `TRACOHUB_REMOTE_CANDIDATES_FILE` (JSON) for remote candidate entries.
- Candidate JSON example:

```json
[
  {
    "id": "node-a",
    "url": "http://localhost:3000",
    "meta": {"region":"dev"}
  },
  {
    "id": "node-b",
    "url": "http://localhost:3001",
    "meta": {"region":"dev"}
  }
]
```

Share registry
- Shares are stored under the Hub data home by default. To make shares visible across two local nodes, set `TRACOHUB_SHARE_ROOT` to a shared path that both nodes can read/write.

APIs used in the guide
- `POST /api/chats/{chatId}/share` — publish a share snapshot
- `GET /api/chats/remote?roomId={roomId}` — list shares visible for a room
- `POST /api/chats/remote/{shareId}/pull` — pull a share snapshot into local node

Auth in automation
- Tests or scripts can authenticate using the guest auth route (`/api/auth/guest`) and inject cookies into the browser context, or call server APIs directly if they run with credentials.

Automation tips
- Use `TRACOHUB_NEXT_DIST_DIR` per-node to run multiple `next dev` servers concurrently from the same repo.
- Clear `.next` and runtime caches between runs when changing app code.
- For automated discovery, scripts may update `TRACOHUB_REMOTE_CANDIDATES_FILE` before running tests.
