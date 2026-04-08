---
title: Hub Auth Testing Report
feature_id: hub-auth
artifact: testing-report
status: draft
version: 0.2
owner_agent: QA
parent_feature: kb/features/hub-auth
related_artifacts:
	- kb/features/hub-auth/requirements.md
	- kb/features/hub-auth/design.md
	- kb/features/hub-auth/implementation-plan.md
	- kb/features/hub-auth/testing-plan.md
phase_gate: testing-in-progress
last_updated: 2026-04-08
---

Status
- In progress. The verified implementation slice covers node owner lock, node-scoped auth cookies, node name persistence, guest-auth redirect handling across middleware and auth routes, and default-expanded sidebar behavior when no sidebar cookie exists.

Evidence recorded so far
- `pnpm exec tsx tests/unit/node-access-policy.test.ts` passed on 2026-04-08.
- `pnpm exec tsx tests/unit/session-namespace.test.ts` passed on 2026-04-08.
- `pnpm exec tsx tests/unit/workspace-isolation.test.ts` passed on 2026-04-08.
- `PORT=3100 pnpm exec playwright test tests/e2e/auth.test.ts` passed on 2026-04-08.
- `PORT=3101 pnpm exec playwright test tests/e2e/local-runtime.test.ts` passed on 2026-04-08.
- `PORT=3111 pnpm test` passed on 2026-04-08, covering the full Hub Playwright suite after aligning middleware and guest-route session cookie handling.
- Regression coverage added in `hub/tests/e2e/auth.test.ts` for node-owner login messaging and for the expanded sidebar default after guest sign-in.

Open risks
- `userHandle` and public discovery ids are still a planned follow-up slice.
- Session isolation currently uses runtime namespace / port rather than persisted `nodeId`.