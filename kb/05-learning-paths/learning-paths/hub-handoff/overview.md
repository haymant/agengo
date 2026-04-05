---
title: Hub Handoff - Overview
feature_id: hub-handoff
artifact: overview
status: draft
version: 1.0
owner_agent: Developer
parent_feature: hub-sharing-remote-discovery
last_updated: 2026-04-05
---

This document describes the intent and scope of the `hub-handoff` KB: end-to-end verification steps for sharing a chat and handing off agent tasks across two local Hub instances.

Goal
- Provide reproducible commands and verification steps for same-host, multi-instance handoff flows using the Hub's filesystem-backed discovery and share registry.

Scope
- Covers: starting two isolated Hub nodes, creating a chat, publishing a share, discovering remote shares, pulling a share into a target node, discovering remote agents via the candidates file, starting a local agent task, and handing the task off to another node.
- Not covered: full Society-backed transport (future work).
