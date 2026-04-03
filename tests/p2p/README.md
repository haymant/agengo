P2P Test Harness

This folder contains scaffolding and notes for running P2P integration tests using Society (libp2p).

Quickstart

1. Install: `npm install society-protocol`
2. Run two nodes: `npx society --name node-1 --room traco-test-room --relay` and `npx society --name node-2 --room traco-test-room --relay`.
3. Use `tests/p2p/harness.js` as an example driver.

Notes

- CI should run the harness in a container with network namespace isolation and optionally a relay service.
P2P Test Harness (Society / libp2p)
=================================

This scaffold provides a minimal harness and example scripts to validate Society-based P2P discovery, WorkSecret exchange, and lazy-fetch flows for FEAT-005/FEAT-006.

Prerequisites
- Node.js (>=18)
- `npx` available
- `society` CLI or `society-protocol` package installed (`npm install -g society-protocol` or use `npx society`)

Quick manual flow
1. Start two Society nodes (in different terminals):

```bash
npx society --name traco-node-1 --room traco-test-room --relay
npx society --name traco-node-2 --room traco-test-room --relay
```

2. Create a handoff session on the hub (example):

```bash
curl -X POST http://localhost:3000/api/handoff/v1/sessions -d '{"target": {"nodeId":"node_traco-node-2","agentId":"reviewer","roomId":"traco-test-room"},"sourceContext":{...}}'
```

3. Use `harness.js` to simulate a target peer presenting a WorkSecret and requesting an artifact over libp2p (or use HTTP fetch with signed `fetchUrl`).

Files
- `harness.js` — minimal Node example that uses `society-protocol` if present; prints instructions and performs a lightweight discovery/test handshake.
- `example_integration.sh` — example commands showing how to run nodes and call the hub endpoints.

Notes
- This harness is intentionally minimal. For CI integration, the harness should be extended to programmatically spawn Society nodes (or test doubles), spin up the hub test server, and verify end-to-end artifact fetch and finalize flows.
