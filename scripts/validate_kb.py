#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path


REQUIRED_FILES = [
    "requirements.md",
    "design.md",
    "implementation-plan.md",
    "testing-plan.md",
    "testing-report.md",
]

REQUIRED_KEYS = {
    "title",
    "feature_id",
    "artifact",
    "status",
    "version",
    "owner_agent",
    "parent_feature",
    "last_updated",
}


def extract_frontmatter(text: str) -> tuple[dict[str, str], list[str]]:
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        return {}, ["missing frontmatter"]
    frontmatter = {}
    errors: list[str] = []
    for raw_line in match.group(1).splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        frontmatter[key.strip()] = value.strip()
    missing = sorted(REQUIRED_KEYS - set(frontmatter))
    for key in missing:
        errors.append(f"missing key: {key}")
    return frontmatter, errors


def validate_feature_dir(feature_dir: Path) -> int:
    problems: list[str] = []

    if not feature_dir.exists() or not feature_dir.is_dir():
        print(f"ERROR: feature directory not found: {feature_dir}")
        return 2

    for filename in REQUIRED_FILES:
        file_path = feature_dir / filename
        if not file_path.exists():
            problems.append(f"missing artifact: {filename}")
            continue
        text = file_path.read_text(encoding="utf-8")
        frontmatter, errors = extract_frontmatter(text)
        for error in errors:
            problems.append(f"{filename}: {error}")

        related_lines = [
            line.strip().lstrip("-").strip()
            for line in text.splitlines()
            if line.strip().startswith("-") and "kb/features/" in line
        ]
        for related in related_lines:
            candidate = feature_dir.parents[1] / related.replace("kb/", "")
            if not candidate.exists():
                problems.append(f"{filename}: missing related artifact target: {related}")

        if frontmatter.get("parent_feature"):
            expected_suffix = str(feature_dir).replace("\\", "/").split("/kb/")[-1]
            if not frontmatter["parent_feature"].endswith(expected_suffix):
                problems.append(
                    f"{filename}: parent_feature does not match feature directory: {frontmatter['parent_feature']}"
                )

    if problems:
        print("KB validation failed:")
        for problem in problems:
            print(f"- {problem}")
        return 1

    print(f"KB validation passed for {feature_dir}")
    return 0


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: validate_kb.py kb/features/<feature-slug>")
        return 2
    return validate_feature_dir(Path(sys.argv[1]).resolve())


if __name__ == "__main__":
    raise SystemExit(main())
