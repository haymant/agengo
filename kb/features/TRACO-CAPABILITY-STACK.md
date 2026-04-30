---
title: Traco Capability Stack
status: draft
version: 0.1
last_updated: 2026-04-26
owner_agent: BA
tags:
  - positioning
  - capability-map
  - taxonomy
---

# Traco Capability Stack

## Purpose

This document answers the question: if Traco needs to be described as 50 to 100 features, what is the cleanest way to classify them without losing the product story?

The answer is to classify Traco as a stack of compounding capabilities, not a flat list of unrelated features.

## 64-capability taxonomy

### Pillar 1: Work orchestration and operating model

1. KB-first source of truth for feature intent.
2. Role-based SDLC agents for BA, Architect, Developer, QA, DevOps, Guide, and Orchestrator.
3. Prompt and skill entry points for repeatable workflows.
4. Explicit phase routing instead of phase-skipping.
5. Feature-folder artifact discipline for requirements, design, implementation, testing plan, and testing evidence.
6. Deterministic validation scripts for KB integrity and release gates.
7. Workspace-level coordination across multiple code surfaces.
8. Human-readable operating model for onboarding new contributors.

### Pillar 2: AI execution and model routing

9. Multi-provider model support.
10. OpenAI-compatible endpoint support.
11. Claude provider integration path.
12. Copilot provider integration path.
13. OpenClaw routing hooks.
14. Pi runtime integration path.
15. Explicit provider selection through settings.
16. Route-based provider or agent targeting with mention syntax.

### Pillar 3: Chat and conversational workspace control

17. Project-scoped chat organization.
18. Persistent chat history.
19. Resumable chat streams.
20. Deterministic session mapping between chat state and runtime state.
21. Web chat as a first-class channel surface.
22. Chat isolation per project.
23. Chat isolation per session.
24. Runtime gating for tool and skill execution.

### Pillar 4: Channels and external ingress

25. Telegram channel configuration and credential storage.
26. WhatsApp channel configuration and credential storage.
27. Encrypted secrets for channel credentials.
28. Allowlists for controlled external access.
29. Link-token based conversation linking.
30. Conversation mapping between external identities and internal chats.
31. Long-lived worker runtime for channel polling and session management.
32. Assistant reply flow for linked external conversations.

### Pillar 5: Meetings, live collaboration, and transcription

33. LiveKit-backed meeting room creation.
34. Server-minted participant join tokens.
35. Meeting sub-rooms inside the existing chat model.
36. Embedded meeting rendering inside the Hub experience.
37. Meeting join-link delivery back to linked conversations.
38. Local transcriber service integration via `TRANSCRIBER_URL`.
39. Normalized transcript events stored as scoped messages.
40. Combined room chat and transcript history carried into later prompts.

### Pillar 6: Memory, artifacts, and durable work products

41. Artifact surfaces for code, image, sheet, text, meeting, and other outputs.
42. Chat-scoped memory as a reusable context layer.
43. Durable artifact persistence rather than transient generation only.
44. Provenance-aware storage of runtime outputs.
45. Separation of temporary execution writes from durable approved outputs.
46. Memory and artifact handoff concepts across agent workflows.
47. Structured accumulation of implementation evidence in the KB.
48. Reuse of meeting transcripts and channel history as future work context.

### Pillar 7: Isolation, sharing, and remote collaboration control

49. Deterministic project and chat workspace roots.
50. Stable internal IDs for storage and room identity.
51. Default local-first runtime data home.
52. Path confinement and escape prevention for execution directories.
53. Persisted node identity for multi-node scenarios.
54. Snapshot-based sharing and remote discovery foundations.
55. Room-scoped remote handoff design for agent collaboration.
56. Export-policy concepts for approving, redacting, or denying outbound context.

### Pillar 8: Trust, governance, and operational readiness

57. Authenticated user accounts.
58. Encrypted secret storage.
59. Explicit server-only handling of provider secrets.
60. Actionable failure handling for misconfiguration.
61. Testing plans and testing reports linked to acceptance criteria.
62. Release-gate and validation automation.
63. Separation of web UI lifecycle from long-lived worker lifecycle.
64. Evidence-oriented documentation that makes the system inspectable and governable.

## Product-layer compression

If the 64 capabilities need to be turned into a simpler commercial story, compress them into five product layers:

| Product layer | What the buyer gets | Capability range |
| --- | --- | --- |
| AI workbench | Multi-model chat, routing, and sessions for serious operators | 9-24 |
| Omnichannel AI hub | Web, Telegram, WhatsApp, and meeting-linked collaboration | 25-40 |
| Durable AI memory system | Artifacts, transcripts, KB evidence, and reusable context | 41-48 |
| Controlled agent network | Isolation, sharing, discovery, and room-scoped handoff | 49-56 |
| Governed delivery platform | Security, validation, release discipline, and auditability | 1-8 and 57-64 |

## What this classification does well

- It avoids random feature sprawl.
- It makes the product easier to explain to investors and buyers.
- It shows why Traco compounds over time instead of remaining a pile of experiments.
- It highlights that the moat is in integration, memory, control, and trust rather than raw generation.

## Recommended next step

The next useful layer would be a proof matrix that marks each capability as `current`, `in-progress`, or `strategic`, then links each claim to repo evidence or a missing gap.