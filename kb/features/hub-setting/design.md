---
title: Feature - Hub Setting
feature_id: hub-setting
artifact: design
status: approved
version: 0.1
owner_agent: architect
parent_feature: kb/features/hub-setting
related_artifacts:
  - kb/features/hub-setting/requirements.md
  - kb/features/hub-setting/implementation-plan.md
  - kb/features/hub-setting/testing-plan.md
  - kb/features/hub-setting/testing-report.md
phase_gate: design-approved
last_updated: 2026-04-08
---

# Design Summary

Hub settings should grow from provider and channel configuration into a broader node-identity surface. The first identity slice adds a profile section where the node owner can configure the public remote `userId` and `nodeName` labels used by FEAT-004 sharing and discovery.

# Current State

- Settings currently expose only `Agent Providers` and `Channels`.
- Runtime node identity persists `nodeId` and `nodeName` in a file under the Tracohub data home.
- FEAT-004 share and discovery flows primarily surface raw `nodeId` plus resource titles rather than the canonical public identity path.

# Target State

- Settings expose a new `Identity` section beside providers and channels.
- The identity section lets the owner configure a public remote `userId` and `nodeName`.
- The values persist in the node-identity file and are reused by FEAT-004 share summaries, remote pull dialogs, and `@` suggestion labels.
- Internal auth user ids and internal node UUIDs remain unchanged and continue to back authorization decisions.

# Components And Interfaces

- Settings page UI: add an `Identity` tab and an editable form.
- Identity API: add `GET` and `PATCH` routes under `/api/settings/identity`.
- Runtime identity store: extend the node identity file with a public remote user id field and update helpers for validation and persistence.
- FEAT-004 consumers: project share summaries, chat share summaries, and remote agent candidate payloads should include canonical label fields derived from the identity store.

# Data Contract

Recommended settings response:

```ts
type IdentitySettingsView = {
  nodeId: string;
  nodeName: string;
  remoteUserId: string;
  canonicalPrefix: `${string}/${string}`;
};
```

The UI should label `remoteUserId` as `User ID` and explain that it is the public remote identity segment rather than the internal auth user id.

# Validation Rules

- `remoteUserId` and `nodeName` must be lowercase slug-like identifiers using `[a-z0-9_-]`.
- Empty values should be normalized to safe generated defaults rather than persisted as blank strings.
- The node owner may change labels without rotating internal `nodeId`.

# Risks

- Users may confuse the public remote `userId` with their login email or internal auth user id if the UI copy is vague.
- Existing FEAT-004 labels may stay stale unless all share/discovery payload builders are updated consistently.
- Session-backed display names may lag until refresh; settings should not rely on NextAuth session mutation to persist the canonical identity.

# Change Log

- 2026-04-08: Bootstrapped design for node identity settings and FEAT-004 canonical identity labels.
