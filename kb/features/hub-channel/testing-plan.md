---
title: Hub Channel - Testing Plan
feature_id: hub-channel
artifact: testing-plan
status: draft
version: 0.1
owner_agent: QA
parent_feature: kb/features/hub-channel
related_artifacts:
  - kb/features/hub-channel/requirements.md
  - kb/features/hub-channel/design.md
  - kb/features/hub-channel/implementation-plan.md
last_updated: 2026-04-11
change_log:
  - Testing plan created 2026-04-11
---

Tests
-----

- Unit: Adapter interface conformance for `WebAdapter` (returns `WorkerReply` shape).
- Unit: `hub/lib/channels/whatsapp-identities` normalization behavior (existing tests).
- Integration: Parity test — send normalized payload through WebAdapter and WhatsApp adapter and assert the same resolved `chatRoute` and that `executeRuntimeChatTurn` receives identical normalized messages.
- DB: Upsert/get tests for `ChatProviderSession` (requires local DB/migration).

Test commands
-------------

Run unit tests (example):

pnpm --filter hub test -- tests/unit/web-adapter.test.ts

Run integration/parity test (requires runtime or test harness):

pnpm --filter hub test -- tests/integration/adapter-parity.test.ts
