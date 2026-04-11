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

## KB Update Procedure (automation guidance)

When an agent discovers that repository evidence (code, tests, CI output) differs from the canonical KB, follow this deterministic update procedure:

1. Capture evidence: record file paths, snippets, and a short rationale for the change.
2. Draft patch: create or modify the minimal KB artifact (requirements/design/implementation) with updated frontmatter (`last_updated`, `change_log`) and a short explanatory note.
3. Validate: run `python3 scripts/validate_kb.py kb/features/<feature-slug>` and resolve validator issues until the patch passes.
4. Publish: if change is non-policy and validator-passing, apply the patch to the KB; if the change affects security/sandboxing/policy, mark `status: review-required` and create a PR for Architect review.
5. Record trace: append the evidence and validator output to the feature's `testing-report.md` or `change_log` so the decision trail is auditable.

Agents using this skill should prefer small, well-formed KB updates that keep documentation truthful. For policy-sensitive changes, require explicit Architect sign-off before promotion to `status: stable`.
