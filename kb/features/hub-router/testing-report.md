---
title: Hub Router Testing Report
feature_id: hub-router
artifact: testing-report
status: draft
version: 0.1
owner_agent: QA
parent_feature: kb/features/hub-router
related_artifacts:
  - kb/features/hub-router/requirements.md
  - kb/features/hub-router/design.md
  - kb/features/hub-router/implementation-plan.md
  - kb/features/hub-router/testing-plan.md
phase_gate: evidence-pending
last_updated: 2026-04-12
change_log:
  - Created initial testing report scaffold for implementation evidence on 2026-04-12
  - Added Slice 2 through Slice 4 implementation evidence for policy wiring, worker payloads, and settings UI on 2026-04-12
  - Added FEAT-006 scope metadata evidence and targeted commit-route browser verification on 2026-04-12
  - Added passing remote route-discovery browser evidence after route-options refresh hardening on 2026-04-12
  - Added unit evidence for channel-identity mention suggestions and re-ran Telegram group-trigger guard coverage on 2026-04-12
  - Added live Telegram capability evidence and privacy-mode diagnostics for ordinary group delivery on 2026-04-12
---

# Summary

Implementation has started. Evidence collection is pending.

# Evidence Log

## 2026-04-12

- Created the missing hub-router KB artifact set.
- Started the first implementation slice by extending channel runtime contracts and guard logic for future DM versus group handling.
- Ran the repository KB validator successfully against the hub-router feature folder.
- Ran `pnpm exec tsx tests/unit/channel-runtime-routing.test.ts` successfully after adding DM-versus-group guard coverage.

## 2026-04-12 (post-update)

- Updated implementation plan to record the decision to use a dedicated `sub_room_participants` table for sub-room membership and added migration/backfill steps.
- Ran KB validator after the implementation-plan update.

```
KB validation passed for /home/data/git/haymant/traco/kb/features/hub-router
```

## 2026-04-12 (requirements cleanup)

- Cleaned and clarified `Open Questions` in `requirements.md`: recorded the decision to use a dedicated `sub_room_participants` table and the decision to make channel-level enablement atomic per provider.
- Ran KB validator after the requirements cleanup.

```
KB validation passed for /home/data/git/haymant/traco/kb/features/hub-router
```

## 2026-04-12 (policy, worker, and UI slice)

- Added additive persistence and query helpers for `ChatThread`, `SubRoom`, `Participant`, and `SubRoomParticipant` in the hub database layer.
- Extended channel settings parsing, API responses, runtime worker config payloads, and the settings UI to carry group-routing policy, allowed-group lists, mention gating, and topic binding inputs.
- Updated Telegram and WhatsApp workers to emit DM versus group envelopes with reply and mention metadata, and updated inbound routing to resolve deterministic thread and sub-room bindings for grouped traffic.
- Exposed remote handoff agents in the compact route selector UI.
- Ran the channel unit suite successfully.

```
pnpm test:unit:channels

channel settings tests passed
channel link token tests passed
channel runtime config tests passed
channel runtime routing tests passed
channel runtime auth tests passed
channel pi handoff tests passed
local origin tests passed
telegram polling tests passed
whatsapp connection tests passed
whatsapp identity tests passed
```

- Ran the targeted Playwright settings check successfully against the existing dev server.

```
TRACOHUB_SKIP_PLAYWRIGHT_WEBSERVER=1 pnpm exec playwright test tests/e2e/auth.test.ts --grep "settings page persists channel group routing policy"

1 passed (6.7s)
```

## 2026-04-12 (commit-scope metadata slice)

- Extended FEAT-006-compatible commit metadata persistence so committed memory bundles and audit records can carry optional `threadId` and `subRoomId` fields.
- Ran focused commit-store unit coverage successfully.

```
pnpm exec tsx tests/unit/commit-store.test.ts

commit store tests passed
```

- Ran the targeted Playwright commit-route case successfully against the live dev server after updating the test helper to search the namespaced runtime data-home path used by the local app instance.

```
TRACOHUB_SKIP_PLAYWRIGHT_WEBSERVER=1 pnpm exec playwright test tests/e2e/hub-features.test.ts --grep "persists idempotent commit bundles through the authenticated commit route"

1 passed (3.9s)
```

## 2026-04-12 (remote route-discovery verification)

- Hardened the chat composer route-options refresh path so out-of-band remote-candidate changes are revalidated when the compact route selector opens and when `@` mention discovery begins.
- Verified the stale-cache scenario manually against the local app: after creating and auto-selecting a project, seeding the remote candidate registry, opening the route selector surfaced `@owner-alpha/studio-east/reviewer`, and typing `@` surfaced the `Remote (room)` suggestion group.
- Ran the targeted Playwright remote route-discovery case successfully.

```
pnpm exec playwright test tests/e2e/hub-features.test.ts --project=e2e --grep "typing @ in a shared chat shows canonical remote room suggestions"

1 passed
```

## 2026-04-12 (channel-identity composer slice)

- Extended route options to return mentionable channel identities discovered from enabled channel configs when the identity data contains a usable `@handle`.
- Updated the composer suggestion builder to prioritize channel identities in the local `@` list and to preserve unknown leading `@mentions` as prompt text unless they match a configured provider route.
- Verified the new local mention behavior with focused unit tests and re-ran the existing Telegram group-trigger guard unit coverage.

```
pnpm exec tsx tests/unit/chat-routing.test.ts
chat routing tests passed

pnpm exec tsx tests/unit/chat-route-options.test.ts
chat route options tests passed

pnpm exec tsx tests/unit/channel-runtime-routing.test.ts
channel runtime routing tests passed
```

## 2026-04-12 (Telegram group-delivery root cause)

- Inspected the active `~/Documents/w0` runtime data via an offline PGlite snapshot and confirmed the Telegram channel was configured with `enableGroupRouting=true`, `requireGroupMention=false`, an open `allowedGroupIds` list, and a valid `defaultProjectId`.
- Confirmed the only persisted channel conversation was a DM binding, not a group binding, which matched the reported reproduction.
- Queried Telegram Bot API `getMe` for the configured bot and confirmed `canJoinGroups=true` but `canReadAllGroupMessages=false` for `@maketraderbot`.
- Added Telegram worker diagnostics so a connected channel now preserves a warning when BotFather privacy mode blocks ordinary group traffic even though Tracohub group routing is enabled.
- Re-ran focused Telegram worker and group-routing unit coverage after the diagnostic change.

```
Live snapshot evidence: enableGroupRouting=true, requireGroupMention=false, allowedGroupIds=[], defaultProjectId=Traco, and no persisted group conversation rows.
Telegram getMe capability probe: canJoinGroups=true, canReadAllGroupMessages=false, username=@maketraderbot.

pnpm exec tsx tests/unit/telegram-polling.test.ts
telegram polling tests passed

pnpm exec tsx tests/unit/channel-runtime-routing.test.ts
channel runtime routing tests passed
```

# Acceptance Criteria Status

| Acceptance Criterion | Status | Evidence |
| --- | --- | --- |
| Complete hub-router artifact set exists and validates. | Passed | The repository KB validator passed for the hub-router feature folder on 2026-04-12. |
| Router requirements cover Telegram and WhatsApp DM and group behavior. | In Progress | Requirements and design now capture Telegram and WhatsApp DM plus group expectations; execution evidence still pending. |
| Group traffic fails safely and does not auto-link as a DM. | Passed | `pnpm exec tsx tests/unit/channel-runtime-routing.test.ts` covers group-safe reply and no-auto-link behavior. |
| Channel settings expose atomic per-provider group routing policy. | Passed | `pnpm test:unit:channels` includes the expanded `channel-settings` coverage, and the targeted Playwright settings case passed for persisted group-routing fields. |
| FEAT-006-compatible memory and audit metadata can carry thread and sub-room scope. | Passed | `pnpm exec tsx tests/unit/commit-store.test.ts` and the targeted commit-route Playwright case both verified persisted `threadId` and `subRoomId` metadata. |
| Same-room routing reuse remains explicit. | Passed | The targeted Playwright route-discovery case passed and confirmed canonical remote room suggestions in both the compact selector and the `@` mention flow. |
| Composer `@` suggestions can surface discovered channel identities without treating them as provider routes. | Passed | `pnpm exec tsx tests/unit/chat-routing.test.ts` and `pnpm exec tsx tests/unit/chat-route-options.test.ts` now cover channel-identity mention ranking and route-options exposure. |

# Residual Risks

- The current codebase remains DM-first until richer channel payloads are emitted by the workers.
- Human-target delivery semantics still require a concrete implementation slice beyond the initial contract groundwork.
- Human-target delivery semantics still need a dedicated delivery or notification implementation slice beyond the current remote-agent and route-discovery support.
- Telegram group behavior remains validated at the unit-policy layer; an end-to-end run against a real Telegram group mention or reply trigger is still pending.
- Ordinary Telegram group messages will continue to fail until Group Privacy is disabled for the configured bot in BotFather and the worker is restarted; this is now diagnosed in-product but cannot be overridden by Tracohub code alone.

# Change Log

- 2026-04-12: Created initial testing report scaffold and recorded the first implementation slice.
- 2026-04-12: Added validator and unit-test evidence for the first safe group-aware runtime slice.
- 2026-04-12: Added channel policy, worker-envelope, and settings UI evidence plus the targeted Playwright settings result.
- 2026-04-12: Added commit-store scope-metadata evidence and the targeted Playwright commit-route result.
- 2026-04-12: Added passing route-discovery browser evidence after hardening composer route-option revalidation.
- 2026-04-12: Added unit evidence for channel-identity composer suggestions and re-ran Telegram group guard coverage.
- 2026-04-12: Added live Telegram capability evidence showing BotFather privacy mode blocked ordinary group messages and added startup diagnostics for that case.