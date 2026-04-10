---
title: Handoff Journey
feature_id: hub-handoff
artifact: journey
status: draft
version: 1.0
owner_agent: Guide
parent_feature: hub-room-scoped-handoff
last_updated: 2026-04-10
---

This journey is the first guided demo flow owned by `Guide`.

Purpose:
- show the full `handoff` user journey across two isolated Hub nodes
- capture a Playwright-driven screencast with narration-paced pauses
- stage generated artifacts only inside a user-designated subdirectory under `kb/journeys/`

Inputs:
- step template: `steps.json` in this folder
- runtime workflow: `hub/tests/e2e/handoff-journey.demo.test.ts`
- local voice clone: `.github/skills/tts/tts_clone.py`

Expected generated artifacts per run:
- `journey-manifest.json`
- `narration.txt`
- `subtitles.srt`
- `raw-video/node-1.webm`
- `raw-video/node-2.webm`
- `audio/*.wav` when audio generation is enabled
- `audio-manifest.json` when audio generation is enabled

Execution entry point:

```bash
cd hub
node bin/journey-demo.mjs --journey handoff --output-dir kb/journeys/handoff/demo-run --generate-audio
```

Constraint:
- `--output-dir` must always resolve to a subdirectory under `kb/journeys/`.

Running with existing nodes (bypass cold start):

- This journey can skip cold-starting Node 1 and Node 2 which can be slow. To use two already-running nodes, ensure:
	- `node1` (source) is reachable at: http://localhost:3001
	- `node00` (target) is reachable at: http://localhost:3000

- The `steps.json` in this folder has been updated to connect to these running nodes instead of starting isolated instances. Start both services before running the `journey-demo` command above.