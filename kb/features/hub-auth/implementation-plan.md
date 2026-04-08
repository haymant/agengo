---
title: Hub Auth Implementation Plan
feature_id: hub-auth
artifact: implementation-plan
status: draft
version: 0.1
owner_agent: Developer
parent_feature: kb/features/hub-auth
related_artifacts:
	- kb/features/hub-auth/requirements.md
	- kb/features/hub-auth/design.md
	- kb/features/hub-auth/testing-plan.md
	- kb/features/hub-auth/testing-report.md
phase_gate: implementation-draft
last_updated: 2026-04-08
---

Phases
1. BA alignment
	- Formalize the target naming model: immutable internal `userId`, public `userHandle`, immutable internal `nodeId`, public `nodeName`.
	- Confirm that only the first registered non-guest user owns a node and that later credential auth is owner-locked.
2. Architect slice
	- Define the public resource namespace `userHandle.nodeName.resourceName` and the internal ownership tuple `(userId, nodeId, resourceLocalId)`.
	- Define migration rules for renames and for legacy records that only have `email` ownership.
3. Developer slice A
	- Inventory all code paths that use `session.user.email` for authorization or ownership decisions.
	- Replace route-level checks to require `session.user.id` (partially done for share routes).
	- Add node-scoped session cookie names and node owner restrictions for credential auth.
	- Persist default `nodeName` in node identity.
4. Developer slice B
	- Introduce `userHandle` storage, uniqueness enforcement, rename flow, and registration/discovery payload changes for agents.
	- Extend share and discovery records to expose public ids like `haymant.node1.pi` while preserving internal ids.
5. QA slice
	- Add unit and e2e coverage for node owner lock, session isolation, and public resource naming.
6. Validation
	- Run the KB validator for the hub-auth feature folder.
	- Run targeted `pnpm` unit and Playwright tests, then capture evidence in `testing-report.md`.

Files to modify
- `hub/lib/db/schema.ts` — future `userHandle` field and uniqueness index.
- `peertrust/lib/auth.ts` — reduce email fallback usage and add `resolveUserId` helper.
- `hub/lib/share-store.ts` — ensure persisted `sourceUserId` always uses `session.user.id` and verify callers.
- `hub/lib/remote-discovery.ts` — ensure candidate filtering uses `nodeId` + `userId` if applicable.
- `hub/app/(auth)/*` — owner lock, node-scoped session cookies, login UI node-owner display.
- `hub/app/(chat)/api/*` — audit routes for email fallback and require `session.user.id`.
- `hub/lib/runtime/*` — node name persistence and same-host workspace namespace handling.
