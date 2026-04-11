---
title: Hub Chat Implementation Plan
feature_id: hub-chat
artifact: implementation-plan
status: draft
version: 1.0-legacy
owner_agent: Developer
parent_feature: kb/features/hub-chat
related_artifacts:
  - kb/features/hub-chat/requirements.md
  - kb/features/hub-chat/design.md
  - kb/features/hub-chat/testing-plan.md
  - kb/features/hub-chat/testing-report.md
last_updated: 2026-04-11
change_log:
  - Bootstrapped from code on 2026-04-11
---

Implementation Steps
--------------------

1. Implement `ChannelAdapter` interface and concrete adapters for WhatsApp and Telegram.
2. Create `WebAdapter` wrapper that normalizes Vercel AI SDK events to `ChannelAdapter` model.
3. Wire `piSessionId` deterministic keying into channels runtime routes and `lib/ai/pi.ts` helpers.
4. Integrate per-project sandbox policy checks using `hub-isolated-workspaces` patterns.
5. Add guarded skill executor and policy layer; add unit tests to validate gating.
6. Add tracing and logs for skill execution; connect traces to chat UI via `piSessionId`.

Milestones
----------
- Adapter parity: WhatsApp+Telegram+Web normalized (MVP)
- Sandbox gating and policy enforcement
- Observability integrated and surfaced to admin UI
