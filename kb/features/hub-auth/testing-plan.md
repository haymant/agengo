---
title: Hub Auth Testing Plan
feature_id: hub-auth
artifact: testing-plan
status: draft
version: 0.1
owner_agent: QA
parent_feature: kb/features/hub-auth
related_artifacts:
	- kb/features/hub-auth/requirements.md
	- kb/features/hub-auth/design.md
	- kb/features/hub-auth/implementation-plan.md
	- kb/features/hub-auth/testing-report.md
phase_gate: testing-planned
last_updated: 2026-04-08
---

Scope
- Validate existing auth coverage already exercised by `pnpm test` in the hub workspace.
- Add targeted unit and e2e coverage for the updated node-owner, node-session, and discovery/resource naming behavior.

Existing coverage in `pnpm test`
- `hub/tests/e2e/auth.test.ts`
  - login page renders correctly
  - register page renders correctly
  - login/register navigation works
  - failed login shows an error toast
- `hub/tests/e2e/local-runtime.test.ts`
  - isolated same-host hub instances can share and pull chats/projects
  - same-host nodes can stay isolated when no shared room is configured
- `hub/tests/e2e/hub-features.test.ts`
  - authenticated route workflows already cover selected hub runtime auth surfaces

New tests to add or expand
1. Node owner auth policy
	- unit: only the first non-anonymous user can register or use credential login on a node
	- unit: guest sessions remain allowed after owner lock
	- e2e: login page shows the node owner account identifier
2. Session isolation across local nodes
	- unit: node-scoped session cookie names differ for different runtime namespaces
	- e2e: authenticating against one local node does not create a usable auth session on a second local node running on a different port
3. Node identity metadata
	- unit: first boot generates a 10-letter node name and persists it across restarts
	- unit: same-host runtime namespace changes move the default workspace/data-home root apart
4. Resource authorization and discovery
	- unit: chat and agent authorization resolve through `(userId, nodeId, resourceId)`
	- unit/e2e: agent discovery exposes public ids in `userHandle.nodeName.resourceName` form
	- planned: extend the same naming and authorization checks to shared chats and projects once public naming is implemented for those resource types
5. Regression coverage
	- e2e: same user email across two nodes does not cause resource clashes during share/pull flows
	- e2e: existing auth pages and guest auth route continue to work after session-cookie namespacing

Execution plan
1. Run focused unit tests for pure helpers and runtime identity functions during development.
2. Run focused Playwright auth/local-runtime tests after each auth/session slice.
3. Run `python3 scripts/validate_kb.py kb/features/hub-auth` before updating the testing report.

Open gaps
- `userHandle` persistence, rename flows, and public discovery ids are not implemented yet in the current code slice; tests for those behaviors remain planned until the schema and discovery payload changes land.
