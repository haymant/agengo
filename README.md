# Traco

Traco is the coordination repo for a trading-focused hybrid platform. It is not a strict application mono-repo with one build graph. Instead, it is the root workspace for a set of business documentation, agent definitions, developer automation, and one or more implementation repos or imported legacy surfaces such as Python services, Next.js apps, Node services, and shared libraries.

The working assumption in this repository is:

- the root repo owns the shared developer experience
- the KB under `kb/` owns canonical project intent and delivery state
- each subrepo or imported code surface owns its own runtime-specific README and local implementation details
- agents help both business users and developers navigate the system without collapsing requirements, design, implementation, and evidence into chat-only knowledge

## Workspace Shape

Open the workspace through `traco.code-workspace`.

Current managed surfaces:

- `.`: root coordination layer for KB, agents, prompts, scripts, and VS Code configuration
- `lake/`: imported Python service surface, currently the first managed legacy code area

This structure lets you keep the top-level operating model in one place while still opening each implementation surface as a first-class workspace folder for search, debug, and agent navigation.

## Who Should Start Where

Business users, analysts, and product stakeholders:

- start at `kb/05-learning-paths/USER-GUIDE.md`
- use the Guide agent when you need a guided tour, system overview, or plain-language explanation of how Traco is organized
- use Orchestrator when your request spans requirements, design, delivery status, or modernization planning

Developers:

- start at `kb/TEAM-HANDBOOK.md`
- read `.github/agents/README.md` for the role model and agent boundaries
- use `traco.code-workspace` so VS Code shows the root coordination layer and the subrepo code surfaces together
- read the local README inside the implementation surface you are changing before editing code

## AI-Driven Development Model

This repo is set up for a KB-first, agent-assisted SDLC.

- `kb/` is the source of truth for requirements, design, implementation plans, testing plans, and testing evidence
- `.github/agents/` defines role agents for BA, Architect, Developer, QA, DevOps, Orchestrator, and onboarding guidance
- `.github/skills/` captures reusable working methods such as legacy reconstruction, KB bootstrapping, and test planning
- `.github/prompts/` provides stage entry points for common workflows
- `scripts/` contains deterministic helpers for KB validation, release gates, and legacy scanning

The high-level rule is simple: chat helps you work, but the KB records what is true.

## Recommended Agent Entry Points

Use these as the default routing model:

- `Guide`: onboarding, business-friendly walkthroughs, developer orientation, and prompting users to the right docs or next agent
- `Orchestrator`: cross-phase requests, unclear ownership, or deciding the next valid SDLC step
- `BA`: turn a business ask or inferred legacy behavior into explicit requirements
- `Architect`: convert approved requirements into a design and implementation sequence
- `Developer`: implement approved work and keep code, tests, and KB aligned
- `QA`: collect evidence and map it back to acceptance criteria
- `DevOps`: runtime, environment, release, rollback, and migration concerns

## Legacy Code Reconstruction Workflow

For code coming from another repo or external folder, the preferred workflow is to ingest the legacy surface into a managed subdirectory or subrepo under this workspace, then document provenance in the KB.

Why this repo prefers local ingestion over a permanent external path dependency:

- the workspace becomes portable for other developers and agents
- scripts can scan the imported surface deterministically
- README links, debug configs, and search all work inside one VS Code workspace
- KB artifacts can refer to stable in-repo paths instead of machine-specific absolute directories

For large upstream repos, keep the import scoped. Bring in the slice you are reconstructing first, document the upstream origin, and let the subrepo README preserve runtime-specific setup.

## Current Python Surface

The current imported Python service lives in `lake/`.

- root debug config: `.vscode/launch.json`
- workspace folder entry: `traco.code-workspace`
- service-specific guide: `lake/README.md`

Use the root workspace and launch configuration for day-to-day navigation, but treat `lake/README.md` as the service-local source of truth for package management, runtime behavior, and implementation details.

## Adding Another Subrepo Or Code Surface

When you add another app or service:

1. add it as another folder entry in `traco.code-workspace`
2. keep its own local `README.md` inside that surface
3. add or update KB artifacts before claiming architecture or behavior as canonical
4. extend `.vscode/launch.json` only for shared launch flows that are useful at the root workspace level
5. route new work through Orchestrator if the phase is not already clear

## Useful Repo Entry Points

- human and team onboarding: `kb/TEAM-HANDBOOK.md`
- mixed business and developer onboarding: `kb/05-learning-paths/USER-GUIDE.md`
- agent roster: `.github/agents/README.md`
- legacy reconstruction prompts: `.github/prompts/reverse-engineer-legacy.prompt.md`
- KB validation: `scripts/validate_kb.py`
- release gate: `scripts/release_gate.mjs`

## Working Agreement

Use the root repo to coordinate the system. Use subrepo READMEs to implement within each surface. Use the KB to record what the system is supposed to do, how it is designed, and what evidence proves it.
