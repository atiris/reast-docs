# Submodule Architecture

The reast orchestrator repository coordinates three git submodules under the `modules/` directory. Each submodule is an independent repository with its own license and release cycle.

## Repository Map

```text
reast/                        (orchestrator — private)
├── modules/
│   ├── player/               → github.com/atiris/reast-player (RPL license)
│   ├── platform/             → github.com/atiris/reast-platform (proprietary)
│   └── docs/                 → github.com/atiris/reast-docs (CC-BY-SA-4.0)
├── cli/                      CLI orchestrator
├── config/                   Compose files (dev, prod, test)
├── deploy/                   Deployment scripts
├── init/                     Database migrations
└── shared/                   Cross-module utilities
```

## Submodule Roles

| Submodule          | Contents                                                                     | Standalone?                                       |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| `modules/player`   | `@reast/engine` — parser, runtime, validator, `<reast-player>` web component | Yes — zero dependencies except fflate             |
| `modules/platform` | Angular web app (`apps/web`), NestJS API (`apps/api`), platform docs         | Partial — needs player for `@reast/engine` import |
| `modules/docs`     | REA language specification (`spec/`), VitePress documentation site           | Yes                                               |

## Development Workflow

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>
cd reast

# Or init submodules after clone
git submodule update --init

# Start the full dev stack
npx reast start

# Apply code changes to running containers
npx reast apply

# Sync submodule state
npx reast sync
```

## Code Flow

The platform web app imports the player engine via TypeScript path mappings:

```text
modules/platform/apps/web/tsconfig.json
  → @reast/engine → ../../modules/player/src/index.ts
```

In the container environment (compose), paths are set via volume mounts:

```yaml
# Web container
volumes:
  - modules/platform/apps/web:/app
  - modules/player:/packages/rea-engine

# API container
volumes:
  - modules/platform/apps/api/src:/app/src:ro
```

## Configuration Precedence

The orchestrator's `config/` directory contains the canonical compose files. Submodules may contain their own compose files for standalone development, but the orchestrator's configuration takes precedence when running via `reast start`.

## Synchronization

The `reast sync` command updates all submodules to their latest remote state:

1. Runs `git submodule update --remote` for each submodule
2. Reports the current commit hash and branch for each

Changes flow from the orchestrator to submodules: edit files in `modules/`, commit in the submodule directory, push the submodule, then commit the updated submodule reference in the orchestrator.
