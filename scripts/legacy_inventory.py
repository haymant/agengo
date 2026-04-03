#!/usr/bin/env python3

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path


NODE_MARKERS = {"package.json", "next.config.js", "next.config.mjs", "next.config.ts", "tsconfig.json"}
PYTHON_MARKERS = {"pyproject.toml", "requirements.txt", "setup.py", "manage.py"}


def scan(root: Path) -> int:
    if not root.exists() or not root.is_dir():
        print(f"ERROR: target directory not found: {root}")
        return 2

    counters = Counter()
    notable: list[str] = []

    for path in root.rglob("*"):
        if path.is_dir():
            continue
        name = path.name
        suffix = path.suffix.lower()
        rel = path.relative_to(root).as_posix()

        if name in NODE_MARKERS:
            counters["node_markers"] += 1
            notable.append(rel)
        if name in PYTHON_MARKERS:
            counters["python_markers"] += 1
            notable.append(rel)
        if rel.startswith("app/") or rel.startswith("pages/"):
            counters["next_routes"] += 1
        if "/api/" in rel or rel.startswith("app/api/"):
            counters["api_routes"] += 1
        if suffix in {".ts", ".tsx", ".js", ".jsx"}:
            counters["node_files"] += 1
        if suffix == ".py":
            counters["python_files"] += 1
        if name.startswith("test_") or name.endswith(".test.ts") or name.endswith(".spec.ts") or name.endswith("_test.py"):
            counters["test_files"] += 1
        if "docker" in name.lower():
            counters["docker_files"] += 1

    print(f"# Legacy Inventory for {root}")
    print()
    print("## Summary")
    for key in [
        "node_markers",
        "python_markers",
        "node_files",
        "python_files",
        "next_routes",
        "api_routes",
        "test_files",
        "docker_files",
    ]:
        print(f"- {key}: {counters.get(key, 0)}")

    if notable:
        print()
        print("## Notable Files")
        for item in sorted(set(notable))[:40]:
            print(f"- {item}")

    return 0


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: legacy_inventory.py <target-dir>")
        return 2
    return scan(Path(sys.argv[1]).resolve())


if __name__ == "__main__":
    raise SystemExit(main())