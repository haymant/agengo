---
title: Feature - Tracohub Runtime Baseline
feature_id: FEAT-002
artifact: testing-plan
status: draft
version: 1.0-legacy
owner_agent: qa
parent_feature: kb/features/hub-runtime-bootstrap
related_artifacts:
  - kb/features/hub-runtime-bootstrap/requirements.md
  - kb/features/hub-runtime-bootstrap/design.md
  - kb/features/hub-runtime-bootstrap/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-02
---

# Test Strategy

Validate that the bootstrapped KB reflects the current `hub/` runtime, preserves uncertainty correctly, and points QA toward executable evidence already present in the repository.

# Coverage Matrix

| Acceptance Criterion | Test Type | Evidence |
| --- | --- | --- |
| Baseline feature groups the main hub runtime surfaces | Artifact review | Requirements and design content tied to `hub/README.md`, `bin/tracohub.mjs`, and `lib/channels/worker.ts` |
| Verified workflows are separated from draft-doc assumptions | Traceability review | BA synthesis of internal non-canonical draft notes plus open-question sections across the artifact set |
| Existing evidence sources are recorded | Evidence inventory | References to unit tests, Playwright entrypoints, and manual skill test plans in `hub/docs/` |
| Open questions capture unresolved assumptions and gaps | QA review | Open question sections plus testing-report follow-ups |
| Feature folder is valid for handoff | Structural validation | `scripts/validate_kb.py` result |

# Test Cases

1. Review the new feature folder for required artifacts, coherent frontmatter, and correct cross-links.
2. Cross-check the documented runtime surfaces against `hub/README.md`, `hub/package.json`, `hub/bin/tracohub.mjs`, `hub/lib/chat-route-options.ts`, and `hub/lib/channels/worker.ts`.
3. Verify that draft-doc concepts from internal non-canonical draft notes that lack clear code proof remain in open questions rather than acceptance claims.
4. Confirm that current repo evidence sources are captured, including `hub/tests/unit/chat-routing.test.ts`, `hub/tests/unit/channel-pi-handoff.test.ts`, `hub/docs/pi-evolutionary-skill-test-plan.md`, and `hub/docs/copilot-skill-handoff-test-plan.md`.
5. Run KB validation for the new feature folder.

# Data and Environment

- No live runtime is required for the initial bootstrap review.
- Future evidence collection should use the existing hub commands for automated and manual checks.
- Provider-authenticated scenarios for Copilot and Pi remain environment-dependent and should stay pending until executed.

# Exit Criteria

- All acceptance criteria are either backed by direct artifact evidence or explicitly marked as pending follow-up.
- No unverified `haymant` draft claim is presented as established runtime behavior.
- KB validation passes for the new feature folder.

# Change Log

- 2026-04-02: Bootstrapped testing plan from current hub evidence sources and draft-doc review.