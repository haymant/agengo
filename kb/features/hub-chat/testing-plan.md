---
title: Hub Chat Testing Plan
feature_id: hub-chat
artifact: testing-plan
status: draft
version: 1.0-legacy
owner_agent: QA
parent_feature: kb/features/hub-chat
related_artifacts:
  - kb/features/hub-chat/requirements.md
  - kb/features/hub-chat/design.md
  - kb/features/hub-chat/implementation-plan.md
  - kb/features/hub-chat/testing-report.md
last_updated: 2026-04-11
change_log:
  - Bootstrapped from code on 2026-04-11
---

Test matrix
-----------

- Unit: `ChannelAdapter` normalization logic for WhatsApp, Telegram, Web.
- Integration: end-to-end message flow from channel adapter → pi session → response.
- Security: attempt to invoke tool-execution skill from unprivileged project and expect gating.
- Observability: validate traces include `piSessionId` and `projectId`; admin `view diagnostics` resolves trace link.
- Load: simulate concurrent PI sessions across projects to test memory/TTL eviction.

Acceptance Criteria
-------------------
- Adapters normalize messages consistently.
- Unauthorized skill execution is blocked.
- Traces and logs correlate to chat UI events.
