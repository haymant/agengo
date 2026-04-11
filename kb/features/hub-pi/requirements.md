---
title: Hub PI Integration
feature_id: hub-pi
artifact: requirements
status: draft
version: 1.0-legacy
owner_agent: Orchestrator
parent_feature: kb/features/hub-pi
related_artifacts:
  - kb/features/hub-pi/design.md
  - kb/features/hub-pi/implementation-plan.md
  - kb/features/hub-pi/testing-plan.md
  - kb/features/hub-pi/testing-report.md
  - kb/features/hub-chat/design.md
  - kb/features/hub-channel/design.md
  - kb/features/hub-channel/implementation-plan.md
last_updated: 2026-04-11
change_log:
  - Bootstrapped from code on 2026-04-11
---

Summary
-------

This feature documents how the hub integrates the PI stack (pi-agent-core, pi-coding-agent, pi-ai) to provide embedded coding assistant sessions inside the hub runtime.

Goals
-----

- Identify all code paths that instantiate or call into PI components.
- Document session lifecycle, inputs, outputs, and invariants.
- Define acceptance criteria for safe operation and review points for Architect/BA.

Acceptance Criteria
-------------------

- A complete list of integration points (files and routes) is recorded.
- Architecture diagram and component responsibilities are drafted in `design.md`.
- Implementation plan enumerates changes, tests and rollbacks.
- Open questions and security concerns are listed for Architect/BA review.

Scope
-----

In-scope: reverse-engineering how `@mariozechner/pi-coding-agent` and `@mariozechner/pi-agent-core` are used by the hub app.

Out-of-scope: making runtime changes, dependency upgrades, or modifying PI packages.


Assumptions
-----------

- Source code in `hub/` is the canonical integration surface.
- The feature is bootstrapped from observed code and requires human validation.

Resolved Questions

- **Env vars:** The hub supports env-backed built-in providers (examples: `OPENAI_COMPATIBLE_BASE_URL`, `OPENAI_COMPATIBLE_API_KEY`, `GROQ_BASE_URL`, `GROQ_API_KEY`, `CLAW_BASE_URL`, `CLAW_API_KEY`) which are detected and surfaced by the provider discovery code. See [hub/lib/ai/provider-config.server.ts](hub/lib/ai/provider-config.server.ts#L1) for the detection logic. Operational tokens used elsewhere include `BLOB_READ_WRITE_TOKEN`, `VERCEL_OIDC_TOKEN`, `DATABASE_URL`, and `REDIS_URL` (see [hub/README.md](hub/README.md#L131)).

- **Rate limits / quotas:** The hub enforces IP- and user-level quotas: `checkIpRateLimit` and a per-user daily chat quota are enforced in the chat API handler (see [hub/app/(chat)/api/chat/route.ts](hub/app/(chat)/api/chat/route.ts#L423)). These functions implement the current gating behavior (daily message counts, IP checks); any additional per-session caps should be added to the runtime path in `executeRuntimeChatTurn`.

- **Licensing / redistribution:** The PI packages are declared as runtime dependencies in [hub/package.json](hub/package.json#L1) and resolved in the lockfile. The repository does not implement a license override — review the upstream `@mariozechner/pi-*` package licenses before redistribution or embedding in redistributed binaries (legal review recommended).

- **Chat → PI session mapping:** The hub maps conversations deterministically (channel + `chatId`, and `projectId` when present) and converts chat history into PI conversation frames using `mapChatMessagesToPiConversation` (see [hub/lib/ai/pi-shared.ts](hub/lib/ai/pi-shared.ts#L1)). The design/implementation plan recommends persisting a `ChatProviderSession` record (chatId + providerName → sessionId) to guarantee reuse of PI sessions; see the `hub-channel` feature artifacts for the persistence plan.

- **Channel adapters & web parity:** Existing adapter work targets WhatsApp/Telegram and a server-side `WebAdapter` shim to keep parity. A minimal `WebAdapter` exists at [hub/lib/channels/web-adapter.ts](hub/lib/channels/web-adapter.ts#L1) and the KB documents that the web UI uses the Vercel AI SDK client-side while server-side handlers normalize events into the `ChannelAdapter` model (see the `hub-chat` design artifact).

- **Sandboxing / gating enforcement:** Policy enforcement points are implemented in the runtime execution and PI wiring: see [hub/lib/chat/runtime-execution.ts](hub/lib/chat/runtime-execution.ts#L1) and [hub/lib/ai/pi.ts](hub/lib/ai/pi.ts#L1). The code prepares guarded executors and registries; the KB recommendation is to apply allowlists and execution caps at the executor level and audit registry publishes.
