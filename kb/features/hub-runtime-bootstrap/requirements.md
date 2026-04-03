---
title: Feature - Tracohub Runtime Baseline
feature_id: FEAT-002
artifact: requirements
status: draft
version: 1.0-legacy
owner_agent: ba
parent_feature: kb/features/hub-runtime-bootstrap
related_artifacts:
  - kb/features/hub-runtime-bootstrap/design.md
  - kb/features/hub-runtime-bootstrap/implementation-plan.md
  - kb/features/hub-runtime-bootstrap/testing-plan.md
  - kb/features/hub-runtime-bootstrap/testing-report.md
jira_keys: []
phase_gate: requirements-draft
last_updated: 2026-04-02
---

# Context

The `hub/` directory implements Tracohub, a local-first multi-provider chat workspace with project-scoped conversations, artifact generation, configurable AI providers, and a separate long-lived channel worker. Internal non-canonical draft notes provide a useful capability map, but they mix current-state observations with aspirational subsystem language and should not be treated as canonical truth. This feature bootstraps a KB baseline from the actual `hub/` implementation while preserving unresolved draft claims as open questions.

# Goals

- Establish one canonical KB feature folder that summarizes the current Tracohub runtime surface in repo conventions.
- Capture the major capability groups, workflow boundaries, and contracts that are verified by the `hub/` codebase and checked-in docs.
- Make evidence gaps explicit so Architect and QA can refine the feature without re-scanning the entire runtime.

# Non-goals

- This feature does not approve every workflow or contract described in internal non-canonical draft notes.
- This feature does not redesign the runtime or split the runtime into final child features yet.
- This feature does not claim release readiness, rollback completeness, or production SLO compliance.

# Requirements

## Functional

- The KB must describe the main hub user surfaces: CLI launch and scaffold, web chat workspace, settings, provider routing, artifact generation, and channel setup.
- The KB must describe the major runtime workflow groups observed in code: project-scoped chat execution, provider and agent routing, artifact creation and persistence, channel link and reply handling, and local skill creation or reuse experiments.
- The KB must record the core contracts and boundaries that are visible in code, including route option discovery, local-first storage modes, worker runtime APIs, and artifact state handling.
- The KB must reconcile the `haymant` draft vocabulary with the actual `hub/` implementation by separating verified behavior, inferred behavior, and unresolved claims.
- The KB must map existing evidence sources already present in the repo, including README statements, unit tests, Playwright coverage entrypoints, and the manual Pi and Copilot skill test plans.

## Non-functional

- Current-state facts and target-state proposals must be distinguishable throughout the artifact set.
- The design must keep the Next.js web runtime and the separate channel worker boundary explicit.
- No direct Next.js to Python contract may be claimed for `hub/` unless a specific cross-repo interface is verified in code.
- All five required KB artifacts must exist with coherent frontmatter and cross-links.

# Acceptance Criteria

- [x] The artifact set identifies the primary hub runtime surfaces and groups them into a single baseline feature.
- [x] Verified runtime workflows are summarized without promoting unverified draft-doc claims to fact.
- [x] The artifact set records concrete evidence sources already present in `hub/`.
- [x] Open questions explicitly capture unresolved draft-doc terminology, API assumptions, and operational gaps.
- [x] The feature folder is valid for handoff to Architect and QA follow-on review.

# Open Questions

- Which `haymant` draft task flows map to implemented `hub/` routes or worker APIs, and which are still conceptual scaffolding?
- Should future KB decomposition split `hub-runtime-bootstrap` into child features such as chat routing, artifact lifecycle, Telegram runtime, WhatsApp runtime, and provider registry?
- What release and observability thresholds should eventually be treated as non-functional requirements rather than implementation notes?
- Are there hidden contracts between `hub/` and any external services or sibling repos that are not discoverable from the current scan?

# Change Log

- 2026-04-02: Bootstrapped from legacy code and internal non-canonical draft notes.