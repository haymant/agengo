#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "requirements.md",
  "design.md",
  "implementation-plan.md",
  "testing-plan.md",
  "testing-report.md",
];

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    return { data: {}, errors: ["missing frontmatter"] };
  }

  const data = {};
  const errors = [];

  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes(":")) {
      continue;
    }
    const [key, ...rest] = line.split(":");
    data[key.trim()] = rest.join(":").trim();
  }

  for (const key of ["status", "artifact", "owner_agent", "last_updated"]) {
    if (!data[key]) {
      errors.push(`missing key: ${key}`);
    }
  }

  return { data, errors };
}

function evaluateFeature(featureDir) {
  const findings = [];

  for (const name of requiredFiles) {
    const filePath = path.join(featureDir, name);
    if (!fs.existsSync(filePath)) {
      findings.push(`missing artifact: ${name}`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const { data, errors } = parseFrontmatter(content);
    for (const error of errors) {
      findings.push(`${name}: ${error}`);
    }

    if (name !== "testing-report.md" && ["draft", "blocked"].includes(data.status || "")) {
      findings.push(`${name}: status is not release-ready: ${data.status}`);
    }

    if (name === "testing-report.md") {
      if ((data.status || "") === "draft") {
        findings.push("testing-report.md: still draft");
      }
      if (!content.includes("Acceptance Criteria Disposition")) {
        findings.push("testing-report.md: missing acceptance criteria evidence section");
      }
    }
  }

  return findings;
}

function main() {
  const featureDir = process.argv[2];
  if (!featureDir) {
    console.error("Usage: node scripts/release_gate.mjs kb/features/<feature-slug>");
    process.exit(2);
  }

  const resolved = path.resolve(featureDir);
  if (!fs.existsSync(resolved)) {
    console.error(`Feature directory not found: ${resolved}`);
    process.exit(2);
  }

  const findings = evaluateFeature(resolved);
  if (findings.length > 0) {
    console.log("Release gate failed:");
    for (const finding of findings) {
      console.log(`- ${finding}`);
    }
    process.exit(1);
  }

  console.log(`Release gate passed for ${resolved}`);
}

main();
