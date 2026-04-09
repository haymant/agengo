---
title: Feature - Hub Agent Bootstrap
feature_id: FEAT-007
artifact: design
status: draft
version: 1.0
owner_agent: architect
parent_feature: kb/features/hub-agent-bootstrap
related_artifacts:
  - kb/features/hub-agent-bootstrap/requirements.md
  - kb/features/hub-agent-bootstrap/implementation-plan.md
  - kb/features/hub-agent-bootstrap/testing-plan.md
phase_gate: design-draft
last_updated: 2026-04-09
---

# Design Summary

Tracohub should adapt the durable part of OpenClaw bootstrapping, not the whole onboarding ritual. The adaptation is: every isolated workspace gets a versioned `.traco` seed with a starter agent and starter skills, and catalog reads for chat or project workspaces become self-healing by ensuring bootstrap before discovery runs.

# Current State And Target State

Current state:

- `ensureTracoWorkspaceBootstrap` creates `.traco` directories, imports template catalogs once, and writes a placeholder orchestrator agent.
- Existing isolated workspaces only receive bootstrap when explicit workspace-creation helpers are called.
- Route discovery can read directly from an existing project or chat workspace path without first ensuring that the bootstrap state is present.

Target state:

- Every isolated workspace has a durable starter `.traco` catalog containing an orchestrator agent and starter skills.
- Catalog discovery for project or chat workspaces ensures bootstrap before walking `.traco`.
- Bootstrap state is versioned so missing new defaults can be added later without overwriting user-created content.

# Architecture

## Components

- Bootstrap seeder: creates the `.traco` directory structure and writes default agent and skill files when absent.
- Template importer: copies compatible agent, skill, and rule content from known source folders into `.traco` without overwriting existing files.
- Bootstrap manifest: a versioned JSON record under `.traco` that records imported sources and the applied bootstrap version.
- Workspace catalog resolver: an async helper that resolves the correct isolated project or chat root and ensures bootstrap before catalog discovery.
- Catalog discovery reader: existing route-option and remote-candidate code that walks `.traco` after the workspace root has been ensured.

## Data Flow

1. A project or chat workspace root is resolved from immutable project or chat IDs.
2. Before catalog discovery, Tracohub ensures the workspace root exists and runs the `.traco` bootstrap seeder.
3. The seeder creates required catalog directories, imports compatible template content, writes starter agent and skill files if they are missing, and updates the bootstrap manifest.
4. Local route discovery and remote candidate publication walk the resulting `.traco` catalog and expose the seeded entries.
5. On later boots or upgrades, the same flow re-runs safely and only adds missing starter defaults.

## Failure Modes

- Catalog discovery runs against an isolated workspace that predates `.traco` bootstrapping.
- A user deletes the default starter files and expects discovery to recover automatically.
- Bootstrap upgrades accidentally overwrite user-authored files.
- Template imports collide with starter defaults or use nonstandard filenames.

# Tradeoffs

- Ensuring bootstrap during catalog reads adds a small amount of filesystem work, but it removes dependence on prior workspace-creation timing and fixes reboot or upgrade drift.
- A minimal starter catalog is less expressive than OpenClaw's richer workspace-file map, but it aligns with Tracohub's existing route-discovery model and avoids introducing unused pseudo-files.
- Versioned manifests add one more persistent file, but they give Tracohub a safe path for forward bootstrap upgrades.

# Decisions

- Adapt only the durable workspace-seeding part of OpenClaw bootstrapping for this slice.
- Keep the bootstrap rooted inside `.traco` because Tracohub route discovery already treats that as the canonical local catalog.
- Seed a default orchestrator agent and starter skills into every isolated workspace.
- Ensure bootstrap during project and chat catalog resolution rather than only during explicit workspace creation.
- Never overwrite existing user-authored files during default seeding or template import.

# Open Risks

- A later provider-specific bootstrap policy may want different starter agents or skill sets than the minimal provider-agnostic defaults introduced here.
- If future catalog discovery paths bypass the new ensured workspace resolver, the self-healing guarantee can regress.
- If users expect an interactive onboarding ritual like OpenClaw, this slice may still feel incomplete until a later UX-oriented onboarding feature lands.

# Change Log

- 2026-04-09: Bootstrapped from current `.traco` runtime behavior and OpenClaw bootstrap documentation.