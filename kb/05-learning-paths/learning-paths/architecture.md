---
title: Hub architecture overview
last_updated: 2026-04-11
owner_agent: Guide
---

**Overview**

This diagram shows the Hub's high-level architecture and how the components described in the KB (channel adapters, runtime execution, PI integration, registries, and persistence) interact to satisfy the requirements for deterministic session mapping, adapter parity, sandboxed execution, and observability.



    This file now presents a compact, runnable-service view of the Hub implementation (what runs locally or in staging). Experimental analytics components that live in the repo are noted but not shown as active runtime boxes.

    ```mermaid
    flowchart LR
      subgraph V2["Runnable Services — v2"]
        direction LR

        subgraph S1["1 — Hub"]
          direction TB
          WebClient["Web UI / Server routes (hub)"]
          Ingress["Channel Gateway / API routes"]
          Router["Runtime Router / Normalizer"]
          ChatRuntime["Chat runtime / executeRuntime"]
        end

        subgraph S2["2 — Transcriber"]
          direction TB
          TranscriberApp["FastAPI transcriber (hub/transcriber-service) — port 3003"]
        end

        subgraph S3["3 — LiveKit Server (external)"]
          direction TB
          LiveKitServer["LiveKit media server (rooms, tracks) — external"]
        end

        subgraph S4["4 — LiveKit Agent Runtime"]
          direction TB
          AgentServer["Agent runtime / run_agent.py (optional)"]
        end

        subgraph S6["6 — Channels Worker"]
          direction TB
          ChannelsWorker["Background worker (lib/channels/worker.ts)"]
        end

        subgraph S7["7 — Peertrust (OIDC)"]
          direction TB
          PeertrustApp["Peertrust (peertrust/) — OIDC provider"]
        end

        subgraph S8["8 — Society Sidecar"]
          direction TB
          Sidecar["Society sidecar (mock or real) — scripts/mock-society-sidecar.js"]
        end

      end

      WebClient -->|"http/ws"| S1
      S1 -->|"mint tokens / signal"| S3
      S1 -->|"attach transcriber"| S2
      S4 -->|"agent jobs"| S2
      S2 -->|"post transcripts"| S1
      S6 -->|"background jobs / webhooks"| S1
      S1 -->|"society discovery / publish"| S8
      S7 -->|"auth / token issuance"| S1
      S7 -->|"auth / token issuance"| S8

      subgraph Infra["Shared Infra"]
        DB["Postgres / Drizzle (ChatProviderSession)"]
        ObjectStore["Blob storage (attachments)"]
        Observability["OpenTelemetry / Audit Logs"]
      end

      S1 --> DB
      S1 --> ObjectStore
      ChannelsWorker --> Observability
    ```

    Service index (concise)

    - 1 — Hub: [hub/package.json](hub/package.json)
      - Dev: `cd hub && pnpm install && pnpm dev` (or `pnpm run dev:all`)

    - 2 — Transcriber: [hub/transcriber-service/transcriber.py](hub/transcriber-service/transcriber.py)
      - Local: `cd hub/transcriber-service && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python transcriber.py`
      - Health: `GET /health` (default port 3003)

    - 3 — LiveKit server: external (use Docker for local testing)
      - Example: `docker run --name livekit -p 7880:7880 -p 7881:7881 -e LIVEKIT_API_KEY=<key> -e LIVEKIT_API_SECRET=<secret> livekit/livekit-server:stable`

    - 4 — LiveKit Agent runtime (optional): [hub/transcriber-service/run_agent.py](hub/transcriber-service/run_agent.py)
      - `cd hub/transcriber-service && source .venv/bin/activate && python run_agent.py`

    - 6 — Channels worker: `pnpm exec tsx lib/channels/worker.ts` (run from `hub`)

    - 7 — Peertrust (OIDC): [peertrust/package.json](peertrust/package.json)
      - Dev: `cd peertrust && pnpm install && pnpm dev`

    - 8 — Society sidecar: `scripts/mock-society-sidecar.js` (mock); run with `node` or use the Hub integration for local testing.

    Note: the `lake/` DuckDB FastAPI exists in the repo as an experimental analytics/query service (see `lake/main.py`) but is not modelled as an active runtime dependency for the Hub; keep in repo for local analytics and experiments.

    If you'd like, I can (a) export this V2 mermaid diagram to PNG/SVG, or (b) add a small `docker-compose.yml` that wires Hub, Postgres, Transcriber and a local LiveKit for local development.
  style PIRegistry fill:#444,stroke:#333,stroke-width:1px
