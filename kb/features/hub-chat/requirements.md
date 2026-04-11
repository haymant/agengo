---
title: Hub Chat - Requirements
feature_id: hub-chat
artifact: requirements
status: draft
version: 1.0-legacy
owner_agent: Orchestrator
parent_feature: kb/features/hub-chat
related_artifacts:
  - kb/features/hub-chat/design.md
  - kb/features/hub-chat/implementation-plan.md
  - kb/features/hub-chat/testing-plan.md
  - kb/features/hub-chat/testing-report.md
  - kb/features/hub-isolated-workspaces/design.md
last_updated: 2026-04-11
change_log:
  - Bootstrapped from code and team notes on 2026-04-11
---

Summary
-------

Documents how the hub organizes chat sessions, isolates workspaces, maps chats to PI sessions, and integrates external channels (WhatsApp, Telegram) and web chat.

Requirements (high level)
------------------------

- Organize chats by `project` so users can scope conversations and artifacts to a project context.
- Ensure chat isolation and sandboxing per project and per-session; reuse `hub-isolated-workspaces` guidance when applicable.
- Provide an abstraction layer for channel adapters to support WhatsApp, Telegram, future channels, and the web UI.
- Map chat sessions to `pi` sessions deterministically (keying strategy and lifecycle rules).
- Ensure skill loading and dynamic agent/skill resolution are pluggable and observable.
- Protect tool/skill execution with sandboxing, gating, and observability.

Open Questions
--------------

- Confirm required SLAs and observability metrics for skill execution failures to surface into chat UI.

Confirmed findings (agent update)
---------------------------------

- **Web chat parity:** The web UI uses the Vercel AI SDK client-side for message streaming and delivery, but server-side handlers normalize web events into the hub's canonical `ChannelAdapter` model so a server-side `WebAdapter` can provide parity with external channels.
- **Relevant files/evidence:** inbound runtime route ([hub/app/(chat)/api/channels/runtime/inbound/route.ts](hub/app/(chat)/api/channels/runtime/inbound/route.ts)), PI runtime integration ([hub/lib/ai/pi.ts](hub/lib/ai/pi.ts)), and e2e tests that exercise Vercel headers ([hub/tests/e2e/chat.test.ts](hub/tests/e2e/chat.test.ts)).
- **Runtime env vars of interest:** `BLOB_READ_WRITE_TOKEN` (Vercel Blob uploads), `VERCEL_OIDC_TOKEN` (Vercel OIDC integration), `DATABASE_URL` / `POSTGRES_URL` (remote DB toggle; fallback to embedded PGlite), and `REDIS_URL` (optional Redis for rate-limiting).

Action: Per updated agent guidance, this KB entry was augmented by the agents to capture the confirmation and suggested flag names; validate with `python3 scripts/validate_kb.py kb/features/hub-chat` and route to Architect for review if flags affect runtime policy.
