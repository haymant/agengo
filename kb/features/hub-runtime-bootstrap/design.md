---
title: Feature - Tracohub Runtime Baseline
feature_id: FEAT-002
artifact: design
status: draft
version: 1.0-legacy
owner_agent: architect
parent_feature: kb/features/hub-runtime-bootstrap
related_artifacts:
  - kb/features/hub-runtime-bootstrap/requirements.md
  - kb/features/hub-runtime-bootstrap/implementation-plan.md
  - kb/features/hub-runtime-bootstrap/testing-plan.md
phase_gate: design-draft
last_updated: 2026-04-02
---

# Design Summary

The bootstrapped design treats Tracohub as a TypeScript-first runtime centered on a Next.js application shell plus a separate channel worker. The structure mirrors the capability grouping style seen in the `haymant` drafts, but normalizes it into KB sections that distinguish verified code paths from inferred subsystem language.

# Scope Mapping

- Main user surfaces map to the CLI entrypoint, chat UI, settings UI, and channel configuration flows.
- Runtime workflow coverage maps to route selection, chat execution, artifact persistence, and channel bridging.
- Evidence capture maps to README assertions, checked-in tests, manual test plans, and validation scripts.

# Architecture

## Components

- CLI bootstrap: `bin/tracohub.mjs` launches a managed local app, scaffolds editable projects, installs dependencies, and seeds local env state.
- Web runtime: the Next.js `app/` surface owns chat UI, settings UI, auth, API routes, and artifact rendering.
- Chat routing and execution: `lib/chat-routing.ts`, `lib/chat-route-options.ts`, and `lib/chat/runtime-execution*` resolve `@provider/agent` targeting, discover provider capabilities, and stream assistant responses.
- Provider adapters: `lib/ai/` contains Pi, Claude, Copilot, and OpenAI-compatible runtime integrations plus model and secret management.
- Artifact subsystem: `artifacts/`, `components/chat`, and document tools support text, code, image, and sheet workflows with persisted versions.
- Channel worker: `lib/channels/worker.ts` runs long-lived Telegram and WhatsApp listeners outside the Next.js dev lifecycle and talks back to runtime APIs for link and inbound handling.
- Persistence layer: `lib/db/` supports embedded PGlite by default and remote Postgres when configured, with uploads stored locally or in Vercel Blob.

## Data Flow

Primary chat flow:

1. A user opens the web workspace or starts a managed local app from the CLI.
2. The chat runtime resolves provider and agent routing from explicit mentions, saved settings, and discovered capabilities.
3. The selected provider adapter streams assistant output and tool events.
4. Messages, artifacts, votes, and resumable stream state are persisted through the database layer.

Channel flow:

1. A Telegram or WhatsApp worker instance loads enabled channel configs.
2. The worker receives inbound messages or link commands through transport-specific listeners.
3. The worker authenticates against the Tracohub runtime APIs and delegates link redemption or chat execution.
4. The runtime returns assistant replies while the worker remains responsible for polling, QR state, and reconnect behavior.

## Failure Modes

- Copilot or other configured providers cannot be inspected because local auth or provider connectivity is missing.
- Telegram polling conflicts when multiple workers consume the same bot token.
- Worker runtime authentication fails if `TRACOHUB_WORKER_SECRET` or `AUTH_SECRET` does not match the running app.
- Artifact or tool execution can fail mid-stream, leaving incomplete state that depends on resumable stream recovery.
- README and draft-doc expectations can diverge from current implementation if they are not revalidated against code.

# Tradeoffs

- A single umbrella bootstrap feature captures the runtime faster than creating many narrow features, but it preserves some breadth and ambiguity until a later decomposition pass.
- Keeping channel listeners in a separate worker avoids coupling long-lived transport state to Next.js hot reload, but it adds an authentication and process-management boundary.
- The `haymant` drafts provide useful capability and task framing, but they must remain secondary to code-backed evidence.

# Decisions

- Use one `hub-runtime-bootstrap` feature folder as the initial canonical summary for the `hub/` directory.
- Treat README statements, code entrypoints, and checked-in tests as higher-confidence evidence than `haymant` draft narratives.
- Record draft-doc concepts such as coordinator, bridge, or memory bundle only when a clear code analogue exists or as an explicit open question.
- Keep any future Next.js to Python boundary work out of scope for this feature until a verified contract is located.
- Use follow-on feature folders to carry implementation detail for isolated workspaces, sharing and remote discovery, and room-scoped handoff.

# Open Risks

- The current bootstrap does not yet prove runtime behavior by executing the full unit, Playwright, or skill-handoff flows.
- Provider-specific slash commands and skill discovery may remain partially static or environment-dependent.
- Operational runbooks for deployment, rollback, and observability are still missing from the KB.

# Change Log

- 2026-04-02: Bootstrapped from `hub/` runtime evidence and internal non-canonical draft notes design framing.
- 2026-04-03: Recorded the chosen decomposition for follow-on implementation planning.