---
title: Feature - Hub Sharing And Remote Discovery
feature_id: FEAT-004
artifact: testing-plan
status: draft
version: 1.1
owner_agent: qa
parent_feature: kb/features/hub-sharing-remote-discovery
related_artifacts:
  - kb/features/hub-sharing-remote-discovery/requirements.md
  - kb/features/hub-sharing-remote-discovery/design.md
  - kb/features/hub-sharing-remote-discovery/implementation-plan.md
phase_gate: testing-planned
last_updated: 2026-04-03
---

# Test Strategy

Validate that share and pull behaviors are explicit, safe, and correctly scoped, and that remote route discovery shows only same-room candidates with clear freshness, locality, and provenance labeling.

# Coverage Matrix

| Acceptance Criterion | Test Layers | Planned Checks | Evidence Expectation |
| --- | --- | --- |
| A new project stays local by default and can be explicitly shared from the project list UI. | UI, integration | Default hidden state, explicit share publish, revoke or hide state checks | Sidebar evidence plus remote-list evidence showing no discoverability before share |
| A user can pull a remote project into a local isolated copy. | Integration, end-to-end | Snapshot pull, immutable provenance capture, no remote mount reuse, re-pull divergence labeling | Local filesystem or metadata evidence proving new isolated copy creation and provenance fields |
| A new chat stays local by default and can be explicitly shared from the chat UI. | UI, integration | Default hidden state, explicit share action, visibility-model separation, unshared chat exclusion | Header or menu evidence plus remote discovery evidence showing only shared chats become discoverable |
| A pulled project can expose a pull-chat workflow for remote chats. | Integration, end-to-end | Pulled-project chat list, remote chat pull, immutable snapshot behavior, pulled-chat labeling | Pulled chat metadata and local copy evidence with origin linkage |
| Typing `@` in a shared chat lists only remote agents that are registered in the same room. | Unit, route integration, UI | Route-options merge filtering, stale registry suppression, local-only fallback, cross-room rejection | Route payload capture and mention-menu evidence showing only same-room candidates with stable room ID filtering |
| Remote discovery state is clearly labeled as local, shared, or pulled and does not expose unrelated scopes. | UI, integration | Candidate labels, project state labels, stale indicator, unrelated-scope suppression | Screens or DOM assertions plus route payload evidence proving label accuracy and non-exposure |

# Targeted Refinements

1. Add route-options contract checks that prove remote candidates preserve current local-provider behavior when no remote peers are available.
2. Add stale-registry and missing-peer recovery tests so stale same-room candidates disappear or are marked stale rather than leaking into actionable routing.
3. Add negative tests confirming that sharing a project does not implicitly share its chats or remote execution eligibility.
4. Add provenance checks confirming pulled projects and chats record immutable git URL and revision when available and do not mutate that metadata on local edits.
5. Add label-clarity checks that distinguish local, shared, pulled, and stale discovery states in both project and mention surfaces.
6. Add a same-room filtering test that uses stable internal room IDs rather than display labels to prevent false-positive matches.

# Data and Environment

- Requires at least two hub instances or a controlled test double for remote metadata and discovery.
- Requires the isolated-workspace feature for safe local-copy creation.
- Should include stale-registry and missing-peer test cases.
- Should include same-label and different-ID room fixtures to verify filtering uses stable internal room identity.
- Should include pulled copies linked and not linked to git so provenance expectations are tested directly.

# Exit Criteria

- All share and pull defaults are explicit and proven.
- Same-room filtering for remote route discovery is directly evidenced.
- No unrelated local or remote project or chat becomes visible through discovery.
- Evidence distinguishes discovery freshness and labeling behavior from actual remote execution, which remains FEAT-005 scope.

# Change Log

- 2026-04-03: Bootstrapped testing plan for sharing state and remote candidate discovery.
- 2026-04-03: Added route-options contract, stale-registry, provenance, stable-room-ID, and label-clarity refinements needed to support FEAT-005 safely.

## QA Acceptance Checklist (mention UX tests)

The QA owner should add automated and manual tests that verify `@` mention behavior for shared chats:

- **Local + Remote Grouping:** Assert that the mention menu lists local provider options first and a separate `Remote (same room)` group containing remote candidates when the chat is shared.
- **Same-room Filtering:** Verify remote candidates come only from the same internal `roomId` and that cross-room candidates are not listed.
- **Labeling & Provenance:** Verify remote entries expose `nodeId` and a concise `capabilitySummary` label and that pulled snapshots show immutable provenance fields in local metadata.
- **ACL & Session Policy Enforcement:** Test that `SessionHandle.policy` and per-entry ACLs prevent unauthorized remote candidates from appearing in the mention list.
- **Stale Candidate Suppression:** Simulate registry staleness and confirm stale remote candidates are hidden or labeled `stale` as defined by the architect.
- **User Filter:** If the UI implements a `Local only` toggle, test that toggling hides remote candidate group from mentions.
- **Negative Tests:** Confirm that sharing a project does not automatically expose unshared chats as remote candidates.

Add these checks to the existing route integration and UI automation suites, and include minimal fixtures that create two hub instances (or a test double) to exercise same-room and cross-room cases.