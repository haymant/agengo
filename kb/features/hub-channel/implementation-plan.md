---
title: Hub Channel - Implementation Plan
feature_id: hub-channel
artifact: implementation-plan
status: draft
version: 0.1
owner_agent: Developer
parent_feature: kb/features/hub-channel
related_artifacts:
  - kb/features/hub-channel/requirements.md
  - kb/features/hub-channel/design.md
  - kb/features/hub-chat/implementation-plan.md
last_updated: 2026-04-11
change_log:
  - Implementation plan created 2026-04-11
---

Plan (priority order)
---------------------

1. Add `hub/lib/channels/hub-channel.spec.ts` adapter interface and a minimal `WebAdapter` shim under `hub/lib/channels/`.
2. Document DB mapping strategy for `chatId → piSessionId` and add minimal migration (separate PR) to create `ChatProviderSession` table.
3. Wire `upsertChatProviderSession` call in `hub/lib/ai/pi.ts` where sessions are created to persist mapping when `chatId` is available.
4. Add adapter-conformance unit tests for `WebAdapter` and an integration smoke test that normalizes identical payloads through web and whatsapp adapters.

Rollout
-------

- Create small PR with adapter spec + WebAdapter shim and tests. Keep changes additive and non-blocking.
- After review, add DB migration and small runtime wiring in a second PR.
