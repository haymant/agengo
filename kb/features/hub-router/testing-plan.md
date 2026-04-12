---
title: Hub Router Testing Plan
feature_id: hub-router
artifact: testing-plan
status: draft
version: 0.1
owner_agent: QA
parent_feature: kb/features/hub-router
related_artifacts:
  - kb/features/hub-router/requirements.md
  - kb/features/hub-router/design.md
  - kb/features/hub-router/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-12
change_log:
  - Initial QA coverage matrix for hierarchical multi-channel routing on 2026-04-12
---

# Test Strategy

Validate that hub-router preserves existing DM behavior, introduces safe and deterministic group handling, and can evolve into project -> chat -> thread -> sub-room routing without breaking FEAT-003, FEAT-004, FEAT-005, or FEAT-006 contracts.

# Coverage Matrix

| Acceptance Criterion | Test Layers | Planned Checks | Evidence Expectation |
| --- | --- | --- | --- |
| Complete hub-router artifact set exists and validates. | KB validation | Run KB validator and inspect frontmatter coherence. | Validator output with zero errors. |
| Telegram and WhatsApp DM and group behaviors are explicitly covered. | Unit, integration | DM path regression, group guard behavior, mention gating, topic mapping. | Test logs and route payload captures. |
| Group traffic fails safely and does not auto-link as a DM. | Unit, integration | Group inbound rejects or defers until policy and binding exist. | Assertions over runtime-routing and inbound-route behavior. |
| Thread and sub-room semantics stay distinct. | Unit, integration | Default thread plus `main` sub-room, explicit provider-topic mapping, additive metadata propagation. | Schema and route assertions plus persisted metadata evidence. |
| Same-room remote routing reuses existing identity contracts. | Unit, integration, end-to-end | Remote candidate filtering, cross-room rejection, remote agent handoff path. | Route payloads, handoff records, and UI evidence. |
| Human targets remain non-autonomous. | Unit, integration | Human mention routes create delivery or notification semantics and do not trigger agent execution. | Assertions over route selection and resulting side effects. |

# Targeted Checks

1. Add channel runtime unit tests for DM defaults, group-safe rejection, and future mention-gated activation hooks.
2. Add route-selection unit tests covering human versus agent target categories and local versus remote grouping.
3. Add integration tests for Telegram DM, Telegram group, Telegram topic, WhatsApp DM, and WhatsApp group payload normalization.
4. Add same-room and cross-room remote-target tests using the existing discovery and handoff harness.
5. Add FEAT-006 metadata assertions for `threadId` and `subRoomId` once persistence lands.

# Data And Environment

- Requires at least two hub instances or a controlled remote-discovery and handoff test harness.
- Requires Telegram and WhatsApp payload fixtures for DM and group traffic.
- Requires fixtures that distinguish provider thread support from default-thread fallback.

# Exit Criteria

- No regression in existing DM-only behavior.
- Safe group fallback behavior is proven before full group execution is enabled.
- Same-room constraints remain enforced across remote suggestions and remote execution.
- QA evidence maps directly to the hub-router acceptance criteria.

# Change Log

- 2026-04-12: Created initial testing plan for DM and group routing safety, hierarchical scope metadata, and same-room execution reuse.