---
title: Hub Handoff - Manual Usage
feature_id: hub-handoff
artifact: manual-usage
status: draft
version: 1.0
owner_agent: Developer
parent_feature: hub-sharing-remote-discovery
last_updated: 2026-04-05
---

Quick copy-paste commands and example API calls to exercise the handoff flow.

1) Create a shared directory (optional, used for share visibility):

```bash
mkdir -p /tmp/tracohub-share
```

2) Start node A (source):

```bash
cd hub
TRACOHUB_DATA_HOME=/tmp/tracohub-data-1 \
TRACOHUB_NEXT_DIST_DIR=.next-1 \
TRACOHUB_SHARE_ROOT=/tmp/tracohub-share \
PORT=3000 pnpm dev
```

3) Start node B (target):

```bash
cd hub
TRACOHUB_DATA_HOME=/tmp/tracohub-data-2 \
TRACOHUB_NEXT_DIST_DIR=.next-2 \
TRACOHUB_SHARE_ROOT=/tmp/tracohub-share \
PORT=3001 pnpm dev
```

4) Create a chat on node A using the UI or API. Example API to create a new chat (replace auth as needed):

```bash
curl -X POST "http://localhost:3000/api/chats" -H "Content-Type: application/json" \
  -d '{"title":"handoff-test"}'
# Response includes created chat `id` (use as CHAT_ID)
```

5) Share the chat on node A:

```bash
curl -X POST "http://localhost:3000/api/chats/$CHAT_ID/share" -H "Content-Type: application/json"
# Response contains share metadata with `shareId` and `roomId`
```

6) Discover remote shares on node B (by roomId):

```bash
curl "http://localhost:3001/api/chats/remote?roomId=$ROOM_ID"
# Response lists available shares for that room
```

7) Pull the share on node B:

```bash
curl -X POST "http://localhost:3001/api/chats/remote/$SHARE_ID/pull" -H "Content-Type: application/json"
# Pulled chat will appear in node B's chat list
```

8) Verify messages exist on node B (replace CHAT_ID with pulled chat id):

```bash
curl "http://localhost:3001/api/messages?chatId=$PULLED_CHAT_ID"
```

9) Discover agents across nodes (see `deep-dive` for candidate file format). Example: set shared candidates file and inspect on a node:

```bash
export TRACOHUB_REMOTE_CANDIDATES_FILE=/tmp/remote-candidates.json
cat /tmp/remote-candidates.json
```

10) Start a task locally by posting a task message or invoking your local agent UI. Then handoff by sharing the chat (repeat steps 5–7) so the remote node can pull and resume work.

UI Guide — how to perform the same steps from the web UI

1) Sign into both nodes in separate browser windows (or separate profiles) using the guest auth flow:
- Open `http://localhost:3000` (source) and `http://localhost:3001` (target).
- Click the guest sign-in control ("Continue as guest") on each node and complete any prompts.

2) On the source node, create or open the project and chat you want to hand off:
- Use the left sidebar > Projects to create a project (or open an existing one).
- Open the chat you want to publish inside that project.

3) Publish / Share from the source node UI:
- In the chat header or the chat actions menu, click "Publish" or "Share" (the share/publish button used by FEAT-004).
- In the publish dialog choose the visibility (room) and confirm. The UI should show a successful publish toast and a share entry in the project's Shares list.

4) Verify the share was written to the shared registry:
- If you set `TRACOHUB_SHARE_ROOT`, inspect the directory for a new share file (JSON) named by `shareId` or a `shares` index.

5) On the target node, open the Pull dialog for remote chats:
- In the target node UI open the project or room where you want the pulled chat to land.
- Open the remote/pull dialog (often under sidebar remote menu or the project's share/pull control).
- Select the same Room filter (the room you used when publishing) — the UI filters remote snapshots by `roomId`.

6) If the dialog shows "No remote chat snapshots are currently available for this room":
- Confirm both nodes use the same `TRACOHUB_SHARE_ROOT` (or the share file is reachable by the target node).
- Confirm the published share's `roomId` matches the Room filter selected in the target UI.
- Open browser DevTools Network tab on the target node and watch the request to `/api/chats/remote?roomId=...` — inspect the JSON response. If it's an empty array, the share wasn't visible to discovery.
- Check `TRACOHUB_REMOTE_CANDIDATES_FILE` is set and includes the source node URL (if your discovery flow uses that file).

7) Pull the snapshot from the target UI:
- When snapshots appear in the dialog, click the Pull/Import action for the desired snapshot.
- The UI will show progress; after completion the pulled chat appears in the target project's chat list.

8) Verify messages and task state in the target UI:
- Open the pulled chat in the target UI and verify messages, attachments, and project context are present.
- If you published a running agent task, check the Agent/Tasks view to see resumed state or the newly created task entry.

Automation / Playwright testing notes
- I added targeted Playwright tests earlier for same-host chat share/pull flows (filesystem-backed). Those tests use cookie-based guest auth injection to avoid brittle redirect flows.
- There is currently no fully automated UI Playwright test for the project-level publish → remote pull dialog path in the repo; I can add one. For stable UI E2E tests I recommend:
  - Use separate `TRACOHUB_NEXT_DIST_DIR` for each node in Playwright `webServer` configs.
  - Use a shared `TRACOHUB_SHARE_ROOT` and a prepared `TRACOHUB_REMOTE_CANDIDATES_FILE` during test setup.
  - Authenticate by fetching `/api/auth/guest` programmatically and injecting cookies into the Playwright browser context.

Troubleshooting checklist (quick):
- If Pull dialog shows none, run the target node's `/api/chats/remote?roomId=...` manually to see returned shares.
- Inspect the share files under `TRACOHUB_SHARE_ROOT` — if missing on the target machine, the share won't be discoverable.
- Ensure Room selection/filter on the target UI matches the published share's `roomId`.

Starting the Society sidecar (local dev)

If you want to exercise Society-mode (HTTP sidecar discovery/transport) instead of filesystem sharing, run a Society sidecar and point the Hub at it with `TRACOHUB_SOCIETY_BASE_URL`.

Option A — quick local mock (included):

1. Start the included mock sidecar server (binds to 127.0.0.1 by default):

```bash
node scripts/mock-society-sidecar.js --port 3002
```

2. Point a Hub node at the mock sidecar and start it (do NOT set `TRACOHUB_SHARE_ROOT`):

```bash
export TRACOHUB_SOCIETY_BASE_URL="http://127.0.0.1:3002"
TRACOHUB_DATA_HOME=/tmp/tracohub-data-1 \
TRACOHUB_NEXT_DIST_DIR=.next-1 \
PORT=3000 pnpm dev
```

3. Start a second Hub node (target) and set the same `TRACOHUB_SOCIETY_BASE_URL`:

```bash
export TRACOHUB_SOCIETY_BASE_URL="http://127.0.0.1:3002"
TRACOHUB_DATA_HOME=/tmp/tracohub-data-2 \
TRACOHUB_NEXT_DIST_DIR=.next-2 \
PORT=3001 pnpm dev
```

Option B — real sidecar (if you have one):

1. Start the real sidecar according to its documentation (example):

```bash
# if you have a sidecar binary
./society-sidecar --port 8080
export TRACOHUB_SOCIETY_BASE_URL="http://localhost:8080"
```

2. Start Hub nodes with `TRACOHUB_SOCIETY_BASE_URL` set (see commands above) and verify discovery via:

```bash
curl "$TRACOHUB_SOCIETY_BASE_URL/v1/shares/chat?roomId=$ROOM_ID"
# or probe the hub proxy: curl "http://localhost:3001/api/chats/remote?roomId=$ROOM_ID"
```

Notes:
- If `TRACOHUB_SHARE_ROOT` or `TRACOHUB_REMOTE_CANDIDATES_FILE` are set the Hub will prefer those filesystem/static discovery modes — unset them to use the sidecar.
- For Playwright or CI runs, ensure the test runner process receives `TRACOHUB_SOCIETY_BASE_URL` (set it in the test `env` or export before launching Playwright).
- The included mock sidecar implements the minimal endpoints used by tests: `/v1/discovery/candidates`, `/v1/shares/chat`, and `/v1/shares/project`.


