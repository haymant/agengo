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


def parse_feature_ids_from_frontmatter(text: str) -> list[str] | None:
    """Extract feature_id(s) from frontmatter supporting several formats:
    - single-line: feature_id: "a, b"
    - YAML list:
      feature_id:
        - a
        - b
    Returns list of feature ids or None if not present.
    """
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        return None
    block = match.group(1)
    lines = block.splitlines()
    for idx, raw in enumerate(lines):
        line = raw.strip()
        if line.startswith("feature_id:"):
            # check inline value
            parts = line.split(":", 1)
            if len(parts) > 1 and parts[1].strip():
                val = parts[1].strip()
                # remove surrounding [] or quotes
                val = val.strip().strip('"').strip("'")
                if val.startswith("[") and val.endswith("]"):
                    inner = val[1:-1]
                    return [s.strip().strip('"').strip("'") for s in inner.split(",") if s.strip()]
                if "," in val:
                    return [s.strip().strip('"').strip("'") for s in val.split(",") if s.strip()]
                return [val]
            # otherwise collect following list items
            ids: list[str] = []
            for following in lines[idx + 1 :]:
                s = following.strip()
                if not s:
                    break
                if s.startswith("-"):
                    ids.append(s.lstrip("-").strip().strip('"').strip("'"))
                else:
                    break
            return ids if ids else None
    return None


def validate_feature_dir(feature_dir: Path) -> int:
    problems: list[str] = []

    if not feature_dir.exists() or not feature_dir.is_dir():
        print(f"ERROR: feature directory not found: {feature_dir}")
        return 2

    # If this directory is a learning-paths entry (under kb/05-learning-paths),
    # we don't require the canonical feature artifacts. Instead, each markdown
    # file must include `feature_id` in its frontmatter and that id must map to
    # an existing folder under kb/features.
    parts = str(feature_dir).replace("\\", "/").split("/")
    if "05-learning-paths" in parts or "learning-paths" in parts:
        # Resolve the learning-paths root directory to validate feature subfolders only.
        lp_root = None
        if feature_dir.name == "05-learning-paths":
            candidate = feature_dir / "learning-paths"
            if candidate.exists():
                lp_root = candidate
        elif feature_dir.name == "learning-paths":
            lp_root = feature_dir
        else:
            # If the provided path is itself a feature folder under learning-paths,
            # validate that single folder.
            if feature_dir.parent.name == "learning-paths":
                lp_root = feature_dir

        if lp_root is None:
            problems.append(f"learning-paths root not found under: {feature_dir}")
            print("KB validation failed:")
            for problem in problems:
                print(f"- {problem}")
            return 1

        # If lp_root is the parent 'learning-paths' directory, validate each child folder.
        targets = [d for d in lp_root.iterdir() if d.is_dir()] if lp_root.name == "learning-paths" else [lp_root]
        for child in targets:
            for md in child.rglob("*.md"):
                text = md.read_text(encoding="utf-8")
                frontmatter, errors = extract_frontmatter(text)
                # try to parse feature ids supporting YAML list and inline formats
                feat_list = parse_feature_ids_from_frontmatter(text)
                if not feat_list:
                    # fallback to old frontmatter parsing for single-line strings
                    feat = frontmatter.get("feature_id")
                    if not feat:
                        problems.append(f"{md}: missing key: feature_id")
                        continue
                    feat = feat.strip().strip('"').strip("'")
                    feat_list = [f.strip().strip('"').strip("'") for f in feat.split(",") if f.strip()]
                if not feat_list:
                    problems.append(f"{md}: feature_id does not specify any feature ids")
                    continue
                # verify each mapping exists under kb/features/<feature_id>
                for f in feat_list:
                    candidate = Path("kb") / "features" / f
                    if not candidate.exists():
                        problems.append(f"{md}: feature_id does not map to kb/features/<{f}>")

        if problems:
            print("KB validation failed:")
            for problem in problems:
                print(f"- {problem}")
            return 1
        print(f"KB validation passed for learning-paths at {lp_root}")
        return 0

    # Default behavior: enforce canonical feature artifacts under kb/features
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
