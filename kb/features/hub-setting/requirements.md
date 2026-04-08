---
title: Feature - Hub Setting
feature_id: hub-setting
artifact: requirements
status: approved
version: 0.1
owner_agent: ba
parent_feature: kb/features/hub-setting
related_artifacts:
	- kb/features/hub-setting/design.md
	- kb/features/hub-setting/implementation-plan.md
	- kb/features/hub-setting/testing-plan.md
	- kb/features/hub-setting/testing-report.md
phase_gate: requirements-approved
last_updated: 2026-04-08
---

# Context

Hub settings already manage agent providers and messaging channels, but they do not expose node-level identity controls. FEAT-004 now needs a human-readable remote identity contract, so settings must let the node owner configure the public `userId` and `nodeName` used in remote share and discovery labels.

# Goals

- Add a dedicated identity section in settings.
- Let the node owner configure the public remote `userId` and `nodeName`.
- Reuse saved identity values in FEAT-004 remote share, pull, and `@` suggestion labels.

# Non-goals

- This feature does not rename internal auth primary keys.
- This feature does not rotate the internal `nodeId` UUID.
- This feature does not redesign provider or channel settings beyond adding the new identity section.

# Requirements

## Functional

- The settings screen must expose a dedicated identity section alongside provider and channel settings.
- The identity section must allow the node owner to configure a public remote `userId` and `nodeName`.
- Identity values must persist across restarts without changing the internal `nodeId`.
- Saved identity values must be reused by FEAT-004 remote project, chat, and agent labels.
- The UI must clearly explain that the configured `userId` is the public remote identity segment, not the internal auth user id.

## Non-functional

- Identity validation must reject unsupported characters and normalize values to a stable lowercase slug format.
- Existing provider and channel settings behavior must remain unchanged for users who do not edit identity settings.

# Acceptance Criteria

- [ ] The settings screen shows an `Identity` section.
- [ ] A node owner can update the public remote `userId` and `nodeName`.
- [ ] Updated identity values persist across reloads.
- [ ] FEAT-004 remote labels use the saved identity values.

# Open Questions

- None for the first identity-settings slice.

# Change Log

- 2026-04-08: Bootstrapped requirements for node identity settings and FEAT-004 canonical label support.
