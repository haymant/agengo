---
title: Traco Learning Path - Developer
status: live
version: "1.0"
last_updated: 2026-03-29
level: 5
user_role:
  - developer
  - architect
  - operator
prerequisites:
  - README.md
  - kb/05-learning-paths/USER-GUIDE.md
next_steps:
  - kb/TEAM-HANDBOOK.md
  - lake/README.md
difficulty: beginner
tags:
  - onboarding
  - developer
  - workspace
  - debug
---

# Developer Path

Use this path when you need to navigate the workspace, identify the correct code surface, and work with agents without breaking the KB-first SDLC.

## Start Here

1. Open `traco.code-workspace`.
2. Read `README.md` for the repo operating model.
3. Read `kb/TEAM-HANDBOOK.md` for the SDLC and agent handoff rules.
4. Read the local README in the code surface you will edit.

## Debugging And Navigation

- Use the root `.vscode/launch.json` for shared launch entries that should work from the multi-root workspace.
- Use the `lake` workspace folder when debugging the current Python surface.
- Keep service-specific commands, environment details, and package management guidance in the local surface README.

## Agent Routing

- Use Guide when you need orientation.
- Use Orchestrator when the next role is unclear.
- Use Developer only after requirements and design are clear enough to implement safely.
- Use QA or DevOps instead of self-certifying test evidence or release readiness.

## Legacy Reconstruction Rule

When importing code from outside the repo, keep the imported surface inside the workspace, then reconstruct requirements and design in the KB before large refactors begin.