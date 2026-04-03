---
title: Feature - Hub Room-Scoped Agent Handoff
feature_id: FEAT-005
artifact: requirements
status: draft
version: 1.2
owner_agent: ba
parent_feature: kb/features/hub-room-scoped-handoff
related_artifacts:
  - kb/features/hub-room-scoped-handoff/design.md
  - kb/features/hub-room-scoped-handoff/implementation-plan.md
  - kb/features/hub-room-scoped-handoff/testing-plan.md
  - kb/features/hub-room-scoped-handoff/testing-report.md
jira_keys: []
phase_gate: requirements-draft
last_updated: 2026-04-03
---

# Context

The handoff drafts studied for this repo outline a robust coordination model built around short-lived remote session authorization, explicit memory and artifact payloads, lazy fetch for large files, audit records, TTLs, and idempotent reconciliation. Tracohub can adopt those ideas, but only inside its own project and chat isolation model and only for remote agents that are registered in the same shared room as the active chat.

This feature defines the actual remote handoff contract and control plane after isolation and discovery are in place.

# Goals

- Define a Tracohub-native remote handoff contract that carries scoped memory and artifacts to a remote agent.
- Restrict remote handoff so it can only target agents registered in the same shared room as the active chat.
- Preserve local chat-root and project-root isolation even when memory or artifacts are exported remotely.
- Record audit, TTL, ACL, and reconciliation state so remote handoff is safe and debuggable.

# Non-goals

- This feature does not create open-ended cross-room collaboration.
- This feature does not bypass local workspace isolation.
- This feature does not require live synchronized project state between nodes.

# Assumptions And Constraints

- Remote handoff depends on the isolated-workspace and sharing or discovery features landing first.
- Same-room eligibility is defined by stable internal room keys or IDs rather than mutable labels.
- Shared projects and chats are snapshot-based, so handoff cannot assume live synchronized state.

# Requirements

## Functional

- Tracohub must define explicit contracts for short-lived remote session authorization, local or remote session handles, memory bundles, artifact metadata, and handoff audit records.
- Remote handoff must be allowed only when the selected target agent is registered in the same shared room, identified by a stable internal room key or ID, as the active chat context.
- Local handoff must remain constrained to the current chat workspace or explicitly approved local references.
- Remote handoff payloads must include only scoped memory and artifacts from the active shared chat or explicitly allowed immutable project-level provenance.
- Immutable project-level provenance eligible for remote transfer in the first release must be limited to source descriptors such as git URL and revision when that metadata exists.
- Every candidate memory entry and artifact included in a remote handoff must be evaluated against an export policy category of `allow`, `approve`, `redact`, or `deny` before transfer begins.
- Small memory entries may be sent inline, while large artifacts must support metadata-only transfer with lazy fetch.
- Artifact and memory payloads must carry checksums for integrity and deduplication.
- Remote sessions must use short-lived authorization with explicit TTL and scope.
- Tracohub must record immutable or append-only handoff audit state including source node, target node, room, payload references, decision mode, and reconciliation status.
- Remote completion must support finalize, retry, and deduplication semantics keyed by handoff ID and checksum.
- Remote-produced artifacts or other durable outputs must not be applied back into the local chat workspace automatically; they must remain staged until the user explicitly confirms apply-back.

## Non-functional

- High-risk memory or artifact bundles must support classifier or approval gates before remote transfer.
- The protocol must make ACL scope explicit enough to prevent accidental reuse across unrelated sessions or rooms.
- Large artifact transfer should default to lazy fetch or signed retrieval rather than eager inline transfer.
- The service surface must preserve a responsive control plane for start, status, approval, and finalize actions while allowing long-running transfer, fetch, and retry work to continue outside a single request lifecycle.
- The design must remain usable with the Next.js runtime surfaces already in hub and must not assume an unrelated centralized coordinator service.
- The protocol must remain safe when local pulled copies diverge from the original shared snapshot between handoff start and finalize.

# Acceptance Criteria

- [ ] Tracohub defines and documents contracts for `WorkSecret`, `SessionHandle`, `MemoryBundle`, `ArtifactMeta`, and `HandoffRecord` or clearly equivalent types.
- [ ] Remote handoff is rejected when the target agent is not in the same shared room as the active chat.
- [ ] Remote handoff payloads are restricted to scoped memory and artifacts from the active isolated context.
- [ ] Export-policy handling classifies every outbound memory or artifact candidate as `allow`, `approve`, `redact`, or `deny` before transfer.
- [ ] Large artifacts use metadata plus lazy fetch or signed retrieval instead of unconditional inline transfer.
- [ ] Handoff audit and reconciliation state is persisted and supports retry without duplicate artifact uploads.
- [ ] Remote-produced artifacts remain staged until the user explicitly confirms apply-back into the local chat workspace.
- [ ] Safety and approval handling is defined for sensitive bundles, including the export-policy categories that trigger approval or redaction.

# Open Questions

- Architect should confirm the exact hybrid service boundary, but the implementation must separate low-latency control-plane actions from long-running transfer and retry work.
- Beyond immutable git provenance, are any additional project-level memory or artifact classes allowed to leave the local node in the first release?
- Which concrete memory and artifact sensitivity classes map by default to `allow`, `approve`, `redact`, or `deny` in the first release?

# Change Log

- 2026-04-03: Bootstrapped from Claude-style handoff study, Tracohub p2p planning, and current hub architecture.
- 2026-04-03: Refined BA requirements to align room identity and provenance scope with prior p2p decisions while keeping policy gaps open.
- 2026-04-03: Added export-policy categories, explicit user confirmation before apply-back, and a requirement that long-running transfer and retry work not depend on a single request lifecycle.