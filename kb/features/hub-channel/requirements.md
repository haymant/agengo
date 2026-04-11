---
title: Hub Channel - Requirements
feature_id: hub-channel
artifact: requirements
status: draft
version: 0.1
owner_agent: BA
parent_feature: kb/features/hub-channel
related_artifacts:
  - kb/features/hub-chat/design.md
  - kb/features/hub-pi/design.md
  - kb/features/hub-isolated-workspaces/design.md
last_updated: 2026-04-11
change_log:
  - Created to specify channel adapter contract on 2026-04-11
---

Summary
-------

Define the channel-adapter contract and ensure parity between external channels (WhatsApp, Telegram) and the web chat. Provide identity normalization, deterministic session mapping guidance, and onboarding checklist for adding new channels.

Requirements (high level)
------------------------

- Provide a stable `HubChannelAdapter` interface with `handleInbound`, `handleLink`, and `status` behaviors.
- Normalize incoming identifiers so `externalConversationId` and `externalUserId` map deterministically to internal `chatId` and `userId`.
- Ensure web chat implements the same adapter contract server-side (a `WebAdapter` shim) so session mapping and policy enforcement are uniform.
- Persist deterministic chat → piSession mapping via a lightweight `ChatProviderSession` record (chatId + providerName → sessionId).
- Provide tests and an onboarding checklist for adding new adapters.

Acceptance Criteria
-------------------

- Adapter interface spec exists and is referenced by `hub-chat` and `hub-pi`.
- A `WebAdapter` shim exists and passes adapter-conformance unit tests.
- The DB mapping schema (or an agreed storage plan) for chat→pi session mapping is documented in the design and implementation plan.
- Integration test validates parity: identical normalized payload delivered via web adapter and WhatsApp adapter routes to the same `executeRuntimeChatTurn` flow and yields consistent routing decisions.

Open Questions
--------------

- Do we add `web` to `ChannelConfig.kind` now or keep `WebAdapter` in-process only?
- Which providerName convention should we persist for env-backed models vs configured providers?
