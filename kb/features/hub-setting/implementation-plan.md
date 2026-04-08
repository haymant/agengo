---
title: Feature - Hub Setting
feature_id: hub-setting
artifact: implementation-plan
status: draft
version: 0.1
owner_agent: developer
parent_feature: kb/features/hub-setting
related_artifacts:
  - kb/features/hub-setting/requirements.md
  - kb/features/hub-setting/design.md
  - kb/features/hub-setting/testing-plan.md
  - kb/features/hub-setting/testing-report.md
phase_gate: implementation-in-progress
last_updated: 2026-04-08
---

# Plan Summary

Implement a first identity-settings slice that adds a dedicated settings section, persists the public remote `userId` and `nodeName`, and feeds those values into FEAT-004 share/discovery labels.

# Work Breakdown

1. Extend runtime node identity persistence with a configurable public remote user id.
2. Add `/api/settings/identity` routes for loading and saving node identity settings.
3. Add an `Identity` section to the settings page UI.
4. Thread identity labels into FEAT-004 remote share summaries, pull dialogs, and `@` suggestion payloads.
5. Add unit and e2e coverage for settings persistence and canonical-label propagation.

# Validation Strategy

- Verify identity settings load and persist correctly.
- Verify canonical labels update in remote project and chat pull dialogs after an identity change.
- Verify shared-chat `@` suggestions render remote entries using the canonical `userId/nodeName/resourceName` path.

# Rollback Notes

- If the identity settings UI proves unstable, keep the persistence helpers and API routes but hide the settings tab.
- If FEAT-004 label propagation regresses discovery, fall back to raw title rendering while preserving the stored identity values.

# Change Log

- 2026-04-08: Created initial implementation plan for identity settings and FEAT-004 identity-label propagation.
