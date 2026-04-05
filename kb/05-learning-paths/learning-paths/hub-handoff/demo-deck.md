---
marp: true
theme: gaia
paginate: true
header: "Traco — P2P Society Demo"
footer: "April 2026"
style: |
  section { font-size: 26px; line-height: 1.45 }
  h1 { font-size: 40px }
  h2 { font-size: 32px }

---

<!-- Title -->
# Traco — Lightweight P2P Society Demo

Quick, runnable demo showing how a lightweight sidecar + two Hub nodes form an inclusive agent society and share projects/chats.

---

## Goals

- Start a mock society sidecar (discovery + shares)
- Run two Hub nodes pointing at the sidecar with separate sandbox data dirs
- Create & publish a project and chat from Node 1
- Discover & pull the project/chat on Node 2, including memory bundles
- Demonstrate agent registration, `@` discovery, and two-step accept flow

---

## 1) Start the lightweight sidecar

What it is: a minimal HTTP coordinator that stores published shares and discovery candidates.

Run (local dev):

```bash
# from repo root
node scripts/mock-society-sidecar.js -p 3002
```

This exposes:
- `GET /v1/discovery/candidates` — list remote agents
- `POST /v1/discovery/candidates` — register candidates from a node
- `POST /v1/shares/chat` and `GET /v1/shares/chat` — publish/discover snapshots

---

## 2) Start Agent Node 1 (Hub) — sandboxed data dir

Start a Hub instance that uses the sidecar for discovery and sharing. Use a clean data home so Node 1 is isolated.

```bash
# Node 1: runs on port 3000
export TRACOHUB_SOCIETY_BASE_URL="http://127.0.0.1:3002"
export TRACOHUB_DATA_HOME="/tmp/traco-node1"
export PORT=3000
cd hub
pnpm dev
```

Notes: `TRACOHUB_SOCIETY_BASE_URL` enables society transport; `TRACOHUB_DATA_HOME` isolates node storage.

---

## 3) Start Agent Node 2 (Hub) — another sandbox

Repeat with different data dir and port.

```bash
export TRACOHUB_SOCIETY_BASE_URL="http://127.0.0.1:3002"
export TRACOHUB_DATA_HOME="/tmp/traco-node2"
export PORT=3001
cd hub
pnpm dev
```

Now Node 1 (3000) and Node 2 (3001) talk to the same sidecar (3002) but keep separate state.

---

## 4) Create & publish a new project on Node 1

Create project via Hub UI or API; then publish the project snapshot so it appears in the society.

Example API (Node 1):

```bash
# create project (UI or API)
curl -sS -X POST http://localhost:3000/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"demo-project"}' | jq

# publish project snapshot to the society
curl -sS -X POST http://localhost:3000/api/projects/<PROJECT_ID>/share | jq
```

Publishing triggers two things in the Hub server:
- write a local share JSON (backup)
- POST to sidecar `/v1/shares/project` and `/v1/discovery/candidates` to register agents for the room

---

## 5) Create a chat and publish its memory to the society

In Node 1: open the project, create a chat, interact with agents, then publish the chat snapshot.

API (publish):

```bash
curl -sS -X POST http://localhost:3000/api/chats/<CHAT_ID>/share | jq
```

The Hub will also call `publishSocietyRemoteCandidatesForRoom` which advertises available agents (e.g., `pi`) for that `roomId` to the sidecar.

---

## 6) Discover & pull project/chat on Node 2 (with memory)

On Node 2, open the Pull UI or call the Hub proxy endpoint that queries the sidecar:

```bash
# Hub proxy: lists remote shares for a room
curl -sS "http://localhost:3001/api/chats/remote?roomId=<ROOM_ID>" | jq

# Or call sidecar directly to inspect candidates/shares
curl -sS "http://127.0.0.1:3002/v1/shares/chat?roomId=<ROOM_ID>" | jq
```

Then pull the selected share (Node 2 will save chat and memory bundles locally):

```bash
curl -sS -X POST http://localhost:3001/api/chats/remote/<SHARE_ID>/pull \
  -H 'Content-Type: application/json' \
  -d '{"targetProjectId":null, "title":"pulled demo"}' | jq
```

Expected result: Node 2 has the chat content and the memory bundle(s) attached.

---

## 7) Agent registration when publishing/pulling

When a node publishes or pulls, the Hub registers local agents to the sidecar via `/v1/discovery/candidates`.

These candidates include `nodeId`, `agentId`, `roomId`, `title`, and `capabilitySummary`.

Example check:

```bash
curl -sS "http://127.0.0.1:3002/v1/discovery/candidates?roomId=<ROOM_ID>" | jq
```

If candidates are empty, ensure:
- the Hub was able to POST candidates (check server logs)
- local `.pi/agents` exists (or fallback `orchestrator` will be advertised)

---

## 8) `@` discovery across nodes

Typing `@` in the composer queries the Hub proxy that calls the sidecar candidate API. After a publish the other node's agents appear as suggestions.

Behavior:
- `@` shows local + remote agents grouped
- remote entries look like `@<nodeId>/<agentId>` or a friendly alias when available

---

## 9) `@otherNode/agent` triggers snapshot & pull handshake

When a user types `@otherNode/agent` and sends:

1. The Hub will ensure the chat snapshot is published (auto-publish if needed).
2. The sidecar signals presence; the target node sees the share and can pull.

This creates a pending FEAT-005 handoff session — a control-plane record that includes the memory bundle and snapshot metadata.

---

## 10) Two-step accept & double-confirm on target node

On the receiving node the workflow is intentionally manual:

1. Reviewer sees an incoming prompt and preview (latest prompt + memory summary).
2. Reviewer clicks **Accept (Review)** — this records the review decision.
3. Reviewer clicks **Confirm Execute** — final acceptance that allows the node to run the prompt locally.

This prevents unintended remote execution and preserves human-in-the-loop control.

---

## Live demo commands (copy/paste)

```bash
# 1) sidecar
node scripts/mock-society-sidecar.js -p 3002 &

# 2) node1
TRACOHUB_SOCIETY_BASE_URL="http://127.0.0.1:3002" TRACOHUB_DATA_HOME="/tmp/traco-node1" PORT=3000 pnpm --filter hub dev &

# 3) node2
TRACOHUB_SOCIETY_BASE_URL="http://127.0.0.1:3002" TRACOHUB_DATA_HOME="/tmp/traco-node2" PORT=3001 pnpm --filter hub dev &

# 4) create project/chat via UI or APIs, then publish
# 5) inspect sidecar candidates/shares
curl -sS "http://127.0.0.1:3002/v1/discovery/candidates?roomId=<ROOM_ID>" | jq
curl -sS "http://127.0.0.1:3002/v1/shares/chat?roomId=<ROOM_ID>" | jq
```

---

## Notes & Next steps

- Add security: short-lived tokens, signed attestations for handoff acceptance
- Add UI screens for inbound review queue and audit trail
- Extend sidecar to support groups/campaigns and richer capability advertising

---

Thank you — ready to run this demo with you and adapt the commands to your local environment.
