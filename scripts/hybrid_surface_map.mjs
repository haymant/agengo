#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "dist", "build", "__pycache__", ".venv", "venv"].includes(entry.name)) {
        continue;
      }
      walk(resolved, results);
    } else {
      results.push(resolved);
    }
  }
  return results;
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node scripts/hybrid_surface_map.mjs <target-dir>");
    process.exit(2);
  }

  const root = path.resolve(target);
  if (!fs.existsSync(root)) {
    console.error(`Target directory not found: ${root}`);
    process.exit(2);
  }

  const files = walk(root);
  const nextRoutes = [];
  const apiRoutes = [];
  const pythonServices = [];
  const configFiles = [];

  for (const file of files) {
    const rel = path.relative(root, file).replaceAll("\\", "/");
    if (rel.startsWith("app/") || rel.startsWith("pages/")) {
      nextRoutes.push(rel);
    }
    if (rel.includes("/api/") || rel.startsWith("app/api/")) {
      apiRoutes.push(rel);
    }
    if (rel.endsWith(".py") && /(service|worker|job|etl|api|main|app)/i.test(path.basename(rel))) {
      pythonServices.push(rel);
    }
    if (["package.json", "pyproject.toml", "requirements.txt", "next.config.js", "next.config.mjs", "next.config.ts", "Dockerfile", "docker-compose.yml"].includes(path.basename(rel))) {
      configFiles.push(rel);
    }
  }

  console.log(`# Hybrid Surface Map for ${root}`);
  console.log();
  console.log("## Next.js Surfaces");
  for (const item of nextRoutes.slice(0, 40)) {
    console.log(`- ${item}`);
  }
  console.log();
  console.log("## API-like Surfaces");
  for (const item of apiRoutes.slice(0, 40)) {
    console.log(`- ${item}`);
  }
  console.log();
  console.log("## Python Service or Job Candidates");
  for (const item of pythonServices.slice(0, 40)) {
    console.log(`- ${item}`);
  }
  console.log();
  console.log("## Configuration Signals");
  for (const item of configFiles.slice(0, 40)) {
    console.log(`- ${item}`);
  }
}

main();