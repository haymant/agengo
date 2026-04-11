---
title: Hub PI Integration Design
feature_id: hub-pi
artifact: design
status: draft
version: 1.0-legacy
owner_agent: Orchestrator
parent_feature: kb/features/hub-pi
related_artifacts:
  - kb/features/hub-pi/requirements.md
  - kb/features/hub-pi/implementation-plan.md
  - kb/features/hub-pi/testing-plan.md
  - kb/features/hub-pi/testing-report.md
  - kb/features/hub-chat/design.md
  - kb/features/hub-isolated-workspaces/design.md
last_updated: 2026-04-11
change_log:
  - Bootstrapped from code on 2026-04-11
---

Overview
--------

This document captures the observed architecture and integration points where the hub uses the PI packages.

Key Components
--------------

- `pi-coding-agent` (UI and runtime helpers): used by the hub for embedding interactive coding sessions and UI components.
- `pi-agent-core` (agent runtime primitives): used to model thinking levels and session lifecycles.
- Hub runtime pieces that interface with PI: API routes and `lib/ai/*` helpers.

Observed Integration Points (evidence)
------------------------------------

- [hub/lib/ai/pi.ts](hub/lib/ai/pi.ts#L1) — imports pi-coding-agent and pi-agent-core.
- [hub/lib/ai/pi-shared.ts](hub/lib/ai/pi-shared.ts#L1) — shared helpers.
- [hub/app/(chat)/api/channels/runtime](app/(chat)/api/channels/runtime) — inbound/link/status routes reference PI session handling.
- [hub/.drafts/channels.md](hub/.drafts/channels.md#L24) — operational notes indicating PI session lifecycle.
- [hub/package.json](hub/package.json#L1) — dependency `@mariozechner/pi-coding-agent` present.

Data Flow (observed)
--------------------

1. Incoming chat message arrives at channels runtime routes.
2. Hub normalizes message and looks up/creates a PI session keyed by channel+chatId.
3. Session inputs are forwarded to an embedded `pi-coding-agent` instance (in-process UI/runtime glue).
4. `pi-agent-core` is used to model thinking levels and session behavior; outputs are returned to the hub to format as messages.

Operational Concerns
--------------------

- Sessions are stateful and keyed by channel+chatId — ensure eviction and memory limits are defined.
- Evaluate security of arbitrary tool execution: pi-coding-agent exposes components that could run shell or tooling (evidence: components for bash-execution in dist files). Treat as high-risk until validated.
- Dependency versions should be recorded and reviewed for licensing.

Open Questions
--------------

- Are PI sessions sandboxed from user-supplied code (esp. tools that execute shell commands)?
- Which env vars control remote/rpc modes for pi-coding-agent?
- Are user inputs sanitized before being sent to PI runtimes?

Mapping to chat and channels
----------------------------

- Chat-to-PI mapping: hub uses a deterministic keying strategy (channel + chatId + optional projectId) to create `piSessionId`. See the `hub-chat` design artifact for the channel adapter and session lifecycle proposal.
- Channel abstraction: the hub introduces a `ChannelAdapter` interface so WhatsApp, Telegram, and Web can normalize messages into the same canonical model; web chat currently uses Vercel AI SDK for client delivery but should implement a server-side `WebAdapter` to maintain parity.

Dynamic agents, skills, and safety
---------------------------------

- Dynamic loading: registry + resource-loader pattern (observed in `pi-coding-agent` utils) — registry stores validated bundles and metadata.
- Execution safety: recommend executor gating that enforces allowlists and runtime caps; any skill that performs side-effects must be explicitly allowed per project and recorded in audit logs.

Observability and remediation
----------------------------

- Skill execution emits structured traces correlated to `piSessionId` and `projectId`.
- On failure, pi diagnostics can be surfaced into an admin-only chat message with a diagnostic id, and a `pi`-assisted remediation flow can be initiated to propose fixes.

Checklist answers (practical)
----------------------------
1) Organize chats by project

- The hub persists chats with `projectId` and will auto-link inbound channel messages to a project when configured. See inbound linking and `saveChat` calls in [hub/app/(chat)/api/channels/runtime/inbound/route.ts](hub/app/(chat)/api/channels/runtime/inbound/route.ts).

2) Isolation & sandboxing

- Use the `hub-isolated-workspaces` design artifact as the canonical per-project sandbox design. Heavy execution or side-effecting skills should use project-scoped executors and restricted workers; the runtime decision point is in `hub/lib/chat/runtime-execution.ts` which delegates PI executions into `hub/lib/ai/pi.ts`.

3) Chat → `pi` session mapping

- The hub keys PI sessions deterministically (channel + chatId [+ projectId]) and maps messages via `mapChatMessagesToPiConversation` in `hub/lib/ai/pi-shared.ts`. The PI runtime is resolved and started in `hub/lib/ai/pi.ts` (`resolvePiRuntime`).

4) Channel abstraction

- Incoming routes normalize platform identifiers and create or look up channel conversations (see `hub/app/(chat)/api/channels/runtime/inbound/route.ts`). Draft guidance for adapters is in `hub/.drafts/channels.md` and the hub follows an adapter-style pattern for platform plugins.

5) Web chat parity

- Web UI uses Vercel AI SDK for client delivery, but server-side handlers normalize web events into the same canonical model so a server-side `WebAdapter` can reuse session management and policy enforcement (see `hub/.drafts/channels.md`).

6) Dynamic agent/skill loading

- `pi-coding-agent` provides `ModelRegistry` / `SessionManager` primitives used by the hub (`hub/lib/ai/pi.ts`) to register models/providers and to cache validated bundles. The hub configures registries per runtime and can lazy-load bundles via the registry.

7) Skill execution safeguarding

- `executeRuntimeChatTurn` and `streamPiChatResponse` are the runtime execution paths. Any skill that requires external effects must be run through guarded executors with allowlists and runtime caps (policy enforcement points live in `hub/lib/chat/runtime-execution.ts` and `hub/lib/ai/pi.ts`).

8) Skill generation lifecycle

- Generation → review → sign/validate → publish to registry. The hub should require human review and signing before auto-registering generated skill bundles. See the implementation plan artifact for recommended workflow steps.

9) Execution observability

- PI runtime setups (authStorage, modelRegistry) emit structured usage and diagnostic traces. Capture these in observability backends and correlate by `piSessionId` and `projectId` for triage (see `hub/lib/ai/pi.ts`).

10) Surfacing observability in chat UI

- Surface friendly system messages for end-users and richly linked diagnostics for admins (diagnostic id → trace viewer keyed by `piSessionId`). The chat UI should expose an admin-only `view diagnostics` action.

11) Next immediate actions

- Add a `WebAdapter` shim to normalize Vercel SDK events server-side, add an allowlist policy UI per-project, and add audit logging for registry publishes. These are listed in the implementation plan artifact.
