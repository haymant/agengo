---
title: Hub Chat Design
feature_id: hub-chat
artifact: design
status: draft
version: 1.0-legacy
owner_agent: Architect
parent_feature: kb/features/hub-chat
related_artifacts:
  - kb/features/hub-chat/requirements.md
  - kb/features/hub-chat/implementation-plan.md
  - kb/features/hub-chat/testing-plan.md
  - kb/features/hub-chat/testing-report.md
  - kb/features/hub-isolated-workspaces/design.md
last_updated: 2026-04-11
change_log:
  - Bootstrapped from code and team notes on 2026-04-11
---

Overview
--------

This design captures chat organization, isolation, channel abstraction, PI session mapping, dynamic skill loading, and observability.

1) Organize chats by project
--------------------------------

- Chats are associated with a `projectId` metadata field. UI and persistence layer index messages by `projectId` to enable project-scoped views and search.
- Project-scoped permissions and storage isolation follow `hub-isolated-workspaces` patterns where long-running artifacts are persisted per-project.

2) Isolation & sandboxing
-------------------------

- Use `hub-isolated-workspaces` artifact for design of per-project ephemeral storage and execution sandboxes.
- Chat sessions run in ephemeral session contexts (in-memory or pglite-backed) with TTL and explicit eviction; heavy artifacts persisted to project-scoped storage.
- Sandbox gate: any skill or tool that can execute side-effects must run through a guarded executor with policy checks (whitelist, auth, rate limits).

3) Mapping chats → `pi` session
--------------------------------

- Deterministic key: `piSessionId = sha256(channel || ':' || chatId || ':' || projectId)` or explicit `sessionId` when present.
- Lifecycle: create on first message that requires PI, attach session metadata (user, project, channel), and evict after idle TTL.
- Session capabilities (tooling allowed, thinking level) are derived from project policy + user permissions.

4) Channel abstraction (WhatsApp, Telegram, Web)
----------------------------------------------

- Adapter layer: implement `ChannelAdapter` interface with methods: `normalizeIncoming(message)`, `sendOutgoing(message)`, `createSession(meta)`, `closeSession(sessionId)`.
- Built adapters: `WhatsAppAdapter`, `TelegramAdapter`, `WebAdapter` (web may be backed by Vercel AI SDK but should implement the same interface for parity).
- Channel adapters translate channel-specific metadata (senderId, media, attachments) into hub's canonical `Message` model.

5) Web chat vs external channels
--------------------------------

- The web chat currently uses Vercel AI SDK for client-side convenience, but the server-side handlers still implement the `ChannelAdapter` interface to normalize behavior and reuse PI session mapping.
- Recommendation: keep server-side `WebAdapter` that proxies Vercel SDK events into the same channel interface so monitoring, session management, and policy enforcement remain uniform.

6) Dynamic loading of agents/skills
----------------------------------

- Agent/skill registry stores metadata (id, version, entrypoints, required permissions). Registry supports lazy-loading modules on-demand.
- Use a resource-loader (observed in pi-coding-agent utils) to fetch skill bundles; cache validated bundles in project-scoped storage.

7) Skill execution and sandboxing
--------------------------------

- Execution occurs in guarded runtimes:
  - In-process safe handlers (pure transforms) run directly.
  - Any skill that requires OS, network, or shell runs in an isolated executor (containerized, or restricted worker) with explicit allowlist.
- Gate policies include: allowed skills list per-project, maximum runtime, and external network access control.

8) Skill generation and orchestration
------------------------------------

- Skill generation (creating new skills programmatically) is done via a controlled workflow: generation request → review/approval → signed/validated bundle → registry publish.
- Untrusted generation must never be auto-registered without human review.

9) Observability & remediation
------------------------------

- Instrumentation: skill execution emits structured traces and logs (start, args, allowed gates, result, errors). Correlate traces with `piSessionId` and `projectId`.
- If skill generation or execution fails, hub can surface PI diagnostic logs into a special system chat message (only visible to admins) and optionally prompt a `pi`-assisted remediation flow.
- Alerts: rate of failures, high-latency executions, unauthorized execution attempts.

10) Surfacing observability to chat UI
-------------------------------------

- Provide system messages in chat for major events (skill failed, remediation started). For end-users, show friendly summary; for admins, include diagnostic id and link to logs.
- Allow users to request `view diagnostics` (admin only) which opens a structured trace viewer keyed by `piSessionId`.

Checklist answers (practical)
----------------------------
1) Organize chats by project

- Chats are persisted with a `projectId` and created/linked in [hub/app/(chat)/api/channels/runtime/inbound/route.ts](hub/app/(chat)/api/channels/runtime/inbound/route.ts) when auto-linking (`saveChat`/`upsertChannelConversation`). See that route for inbound linking behavior.

2) Isolation & sandboxing

- The `hub-isolated-workspaces` artifact contains the design for per-project sandboxes; long-running artifacts persist per-project. Runtime execution (heavy tasks, tool-using skills) is gated in `hub/lib/chat/runtime-execution.ts` which decides provider and routes PI executions into `@/lib/ai/pi`. Refer to the hub-isolated-workspaces design artifact for sandboxing details.

3) Chats → `pi` session mapping

- Session creation is deterministic: inbound routes and `executeRuntimeChatTurn` create or reuse sessions keyed by `(channel, externalConversationId)` and chat `id`. `hub/lib/ai/pi.ts` implements PI runtime resolution and `mapChatMessagesToPiConversation` in `hub/lib/ai/pi-shared.ts` translates chat messages into PI conversation frames.

4) WhatsApp & Telegram channel design

- Channel receivers normalize external identifiers and map to internal chats in [hub/app/(chat)/api/channels/runtime/inbound/route.ts](hub/app/(chat)/api/channels/runtime/inbound/route.ts). Platform-specific normalization (WhatsApp identity resolution) lives in `hub/lib/channels/whatsapp-identities` and adapter patterns are discussed in `hub/.drafts/channels.md`.

5) Web chat parity with other channels

- The web chat uses Vercel AI SDK for client delivery, but server-side handlers normalize web events into the same canonical model used by other channels. Keep a server-side `WebAdapter` that proxies Vercel SDK events into the channel interface so monitoring, session mapping, and policy enforcement are uniform (see `hub/.drafts/channels.md`).

6) Dynamic loading of agents/skills

- The PI integration uses `ModelRegistry` and `SessionManager` from `@mariozechner/pi-coding-agent` (see `hub/lib/ai/pi.ts`). Skill bundles and registry patterns are implemented by the PI packages; the hub configures `ModelRegistry` instances per session/runtime.

7) Skill execution & sandboxing

- `executeRuntimeChatTurn` delegates to `streamPiChatResponse` for PI-backed routes; any skill that performs side-effects should be run through guarded executors and project-scoped policies (enforced by the hub). See `hub/lib/chat/runtime-execution.ts` and `hub/lib/ai/pi.ts` for where runtime capabilities and authStorage are prepared.

8) Skill generation workflow

- Generated skills must follow a publish workflow: generation request → review/approval → signed/validated bundle → registry publish. The hub currently treats generated assets as high-risk; the KB recommends a manual review step before registry publishing (see the implementation plan artifact).

9) Observability for skill execution

- Execution emits structured traces correlated to `piSessionId`/`projectId`. The PI runtime (`hub/lib/ai/pi.ts`) sets up `AuthStorage`, `ModelRegistry`, and emits usage/diagnostics; failures are logged and surfaced via admin system messages.

10) Surfacing observability to chat UI

- System messages and admin-only diagnostic links are the primary surfacing mechanism. The chat UI can show a friendly summary for users and a diagnostic id/link for admins which maps to traces keyed by `piSessionId`.

11) Other notes

- Configuration and model selection behavior live in `hub/lib/ai/pi.ts` (env-backed providers, provider-config parsing). Review env-vars and provider-config entries before enabling remote execution.
