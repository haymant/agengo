---
title: Feature - Hub Sharing And Remote Discovery
feature_id: FEAT-004
artifact: testing-report
status: draft
version: 1.0-legacy
owner_agent: qa
parent_feature: kb/features/hub-sharing-remote-discovery
related_artifacts:
  - kb/features/hub-sharing-remote-discovery/requirements.md
  - kb/features/hub-sharing-remote-discovery/testing-plan.md
phase_gate: testing-in-progress
last_updated: 2026-04-03
---

# Result Summary

This feature is planned but not yet implemented. Current evidence is limited to code inspection of project and chat UI, route options, and visibility behavior.

# Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Current project UI reviewed | Observed | Sidebar currently supports new, rename, and delete project flows but no share or pull controls. |
| Current chat share state reviewed | Observed | Chats currently expose only public or private visibility. |
| Current route discovery reviewed | Observed | `@` mention suggestions currently include local providers and local agents only. |
| Automated sharing and discovery evidence | Pending | Implementation and tests not yet executed. |

# Defects

- None recorded yet; implementation has not started.

# Acceptance Criteria Disposition

- [ ] A new project stays local by default and can be explicitly shared from the project list UI.
- [ ] A user can pull a remote project into a local isolated copy.
- [ ] A new chat stays local by default and can be explicitly shared from the chat UI.
- [ ] A pulled project can expose a pull-chat workflow for remote chats.
- [ ] Typing `@` in a shared chat lists only remote agents that are registered in the same room.
- [ ] Remote discovery state is clearly labeled as local, shared, or pulled and does not expose unrelated scopes.

# Follow-ups

- Implement the exposure model and route-option merge logic.
- Add UI and integration evidence for share and pull flows.

# Change Log

- 2026-04-03: Bootstrapped testing report from UI and routing inspection.