---
name: knowledge-base
description: Use when working with the project knowledge base, feature folders, requirements.md, design.md, implementation-plan.md, testing-plan.md, testing-report.md, or KB frontmatter validation.
---

# Knowledge Base

Use this skill whenever the task depends on the state of a feature or when a result should be written back to the KB.

## Responsibilities

- locate the correct feature folder
- check that required artifacts exist
- verify frontmatter fields and status coherence
- update the KB when the task changes canonical project state

## Required artifact set

- `requirements.md`
- `design.md`
- `implementation-plan.md`
- `testing-plan.md`
- `testing-report.md`

## Deterministic check

When validating KB structure, run:

```bash
python3 scripts/validate_kb.py kb/features/<feature-slug>
```

Use the script output to identify missing artifacts, missing frontmatter keys, or broken related artifact references.
