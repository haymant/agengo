---
title: Traco User Guide
status: live
version: "1.0"
last_updated: 2026-03-29
level: 5
user_role:
  - business-user
  - analyst
  - developer
prerequisites:
  - README.md
next_steps:
  - kb/05-learning-paths/learning-paths/business-user.md
  - kb/05-learning-paths/learning-paths/developer.md
difficulty: beginner
tags:
  - onboarding
  - agents
  - kb
  - legacy-modernization
---

# Traco User Guide

This guide is the shared starting point for people who need to learn Traco before they can ask for changes, validate behavior, or work inside a code surface.

Traco has two layers of navigation:

- the root workspace for coordination, KB, agents, prompts, and shared debug setup
- one or more implementation surfaces such as Python services, Next.js apps, Node services, or imported legacy slices

## Pick Your Path

- Business users, analysts, and stakeholders: go to `kb/05-learning-paths/learning-paths/business-user.md`
- Developers and technical contributors: go to `kb/05-learning-paths/learning-paths/developer.md`

## Which Agent To Use First

- `Guide`: use for orientation, learning paths, and finding the right documentation or subrepo
- `Orchestrator`: use when the request spans requirements, design, implementation, QA, or release readiness
- `BA`: use when you need a business request turned into explicit requirements
- `Developer`: use when the work is already approved and ready for implementation

## Agent guidance for learning paths

- Purpose: help BA and Guide agents classify usage knowledge and organise main features as learning paths so users can dive deeper per feature.
- BA agent responsibilities:
  - Use the `kb-bootstrapper` skill to create missing feature artifacts when only usage notes or code exist.
  - Map observed usage or ticket descriptions to feature folders under `kb/features/` and add `feature_id` frontmatter.
  - Create a short learning-path stub under `kb/05-learning-paths/learning-paths/` for each main feature with `overview.md` and `prerequisites.md`.
  - Validate artifacts using the `knowledge-base` skill and `python3 scripts/validate_kb.py`.
- Guide agent responsibilities:
  - Use the `knowledge-base` skill to discover canonical artifacts and present them as an ordered learning path.
  - Expand learning-path stubs into `steps.md` and `deep-dive.md` using code links and manual-verification docs.
  - Ask BA to bootstrap or clarify missing requirements before teaching deep-dive topics.

Notes:
- Learning-path pages should be runnable and example-driven (include clipboard-ready commands: `pnpm`, `curl`, `pnpm playwright test`).
- Organize learning paths by `feature_id` and link back to the feature KB folder and any `manual-verification` artifacts.


## Core Rules

- The KB under `kb/` is the canonical source of feature state.
- Chat is not canonical unless the KB is updated.
- Each implementation surface should keep its own `README.md` for runtime and code-local setup.
- Legacy code should be reconstructed into KB artifacts before major rewrites are attempted.

## Prompt Starters

Copy and adapt one of these:

- "Guide me through Traco as a business user. I need to understand what the system does and where to ask for a change."
- "Guide me through Traco as a developer. I need to know which repo surface owns my change and how to start debugging it."
- "Orchestrator, I imported a legacy service into this workspace. Which KB artifact should be created first and which role should act next?"

## Current Workspace Example

At the moment, the main imported implementation surface is `lake/`, a Python service with its own local README and runtime setup. Use the root workspace for shared navigation, but read the local README before editing that code.