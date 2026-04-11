---
title: Hub Channel - Design
feature_id: hub-channel
artifact: design
status: draft
version: 0.1
owner_agent: Architect
parent_feature: kb/features/hub-channel
related_artifacts:
  - kb/features/hub-channel/requirements.md
  - kb/features/hub-channel/implementation-plan.md
  - kb/features/hub-channel/testing-plan.md
  - kb/features/hub-chat/design.md
  - kb/features/hub-pi/design.md
last_updated: 2026-04-11
change_log:
  - Initial design for adapter contract on 2026-04-11
---

Overview
--------

This design defines the `HubChannelAdapter` contract and canonical message shape used by the hub to integrate external channels (WhatsApp, Telegram) and the web UI. The goal is deterministic identity normalization, consistent session mapping, and adapter parity so the web UI and external channels behave the same from the hub/runtime perspective.

Adapter contract (minimal)
--------------------------

The adapter must implement this minimal interface (TypeScript spec in codebase):

- `handleInbound(req: WorkerInboundRequest): Promise<WorkerReply>` — normalize incoming payload into canonical identifiers and forward to the runtime.
- `handleLink(req: WorkerLinkRequest): Promise<WorkerReply>` — handle any channel-specific link/authorization flows.
- `status(): Promise<{ connected: boolean }>` — optional health check.

Canonical message normalization
-----------------------------

Adapters normalize platform-specific fields into the canonical form used by the hub runtime:

- `channel`: string (e.g., "whatsapp", "telegram", "web")
- `externalConversationId`: string — stable per external conversation
- `externalUserId`: string — stable per external user
- `projectId`: optional default from channel config
- `text`, `media`, `attachments` — normalized parts array

Identity mapping rules
----------------------

- WhatsApp requires special normalization via `hub/lib/channels/whatsapp-identities` to derive a `primaryIdentifier` for multi-device cases.
- The inbound route `hub/app/(chat)/api/channels/runtime/inbound/route.ts` performs DB upsert to map `externalConversationId` → internal `chatId` via `upsertChannelConversation`.

Session mapping
---------------

- Persist `ChatProviderSession` records (chatId + providerName → sessionId) to enable deterministic reuse of PI sessions. If mapping is absent, create a new PI session and upsert the mapping.

Observability & Safety
----------------------

- Adapters must preserve trace context and attach `piSessionId` and `projectId` to emitted traces.
- Adapters must perform allowlist checks and early rejects for banned external identifiers where configured.
