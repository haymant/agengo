---
title: Hub Handoff - Prerequisites
feature_id: hub-handoff
artifact: prerequisites
status: draft
version: 1.0
owner_agent: Developer
parent_feature: hub-sharing-remote-discovery
last_updated: 2026-04-05
---

Minimal environment and conventions to run the E2E handoff verification locally:

- Repository root: run commands from `traco/hub` when starting Hub servers.
- Node & package manager: Node 20+ and `pnpm` (use `pnpm i` to install).
- Ports: pick distinct ports (example uses `3000` and `3001`).
- Data roots: use `TRACOHUB_DATA_HOME` per-node (absolute paths recommended).
- Next build outputs: set `TRACOHUB_NEXT_DIST_DIR` per-node to avoid `.next` collisions.
- Shared share registry: set `TRACOHUB_SHARE_ROOT` to a common directory if you want shares visible across nodes.
- Filesystem discovery: `TRACOHUB_REMOTE_CANDIDATES_FILE` can be set to a JSON file listing remote candidates for discovery.

Example tools used in the guide:
- `curl` for quick HTTP API calls
- Playwright for automated E2E tests (optional)
