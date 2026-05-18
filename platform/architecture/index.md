# Architecture Overview

Reast is a **modular monorepo** consisting of two application packages (web + api), a CLI tool for orchestration, shared types, and infrastructure configuration for containerized development.

```txt
┌─────────────────────────────────────────────────────────────────┐
│                        Developer Machine                        │
│                                                                 │
│   reast CLI ─── orchestrates ──▶ Podman/Docker Compose          │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                Container Stack (999x ports)             │   │
│   │                                                         │   │
│   │   web (Angular PWA)          :9990                      │   │
│   │   api (NestJS)               :9991                      │   │
│   │   postgres                   :9992                      │   │
│   │   seaweedfs (S3)             :9993 / :9994 (UI)         │   │
│   │   keycloak (SSO)             :9995                      │   │
│   │   valkey (cache/pubsub)      :9996                      │   │
│   │   glitchtip (errors)         :9997                      │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Repository Structure

```txt
reast/
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/       # JWT guard, Keycloak JWKS strategy
│   │   │   ├── catalog/    # Stories, authors, groups, search
│   │   │   ├── database/   # TypeORM / migrations
│   │   │   ├── health/     # Health endpoint (Terminus)
│   │   │   ├── storage/    # S3 client (SeaweedFS)
│   │   │   └── stories/    # Story CRUD and body streaming
│   │   └── seed-stories/   # Sample .rea files for development
│   │
│   └── web/                 # Angular 21 PWA
│       └── src/app/
│           ├── core/        # Parser, services, guards, interceptors
│           │   └── parser/  # REA lexer → block parser → post-processor
│           ├── reader/      # Story runtime & rendering
│           ├── editor/      # Web-based .rea editor
│           ├── builder/     # Story packager (.rea → .reast)
│           ├── auth/        # Login/register/callback flows
│           ├── layout/      # Shell, header, navigation
│           └── shared/      # Reusable UI components
│
├── cli/                     # reast CLI (pure ESM Node.js, zero deps)
│   ├── bin/reast.mjs        # Entry point
│   └── lib/
│       ├── compose.mjs      # Compose runner (podman → docker fallback)
│       ├── env.mjs          # Environment management
│       └── commands/        # One file per CLI command
│
├── config/
│   ├── <env>/               # Per-environment config (compose.yaml, .env)
│   ├── shared/              # Shared config (keycloak, seaweedfs, tls)
│   └── keycloak/            # Realm export + custom themes
│
├── deploy/                  # Production/test deployment scripts
├── init/                    # DB initialization scripts (SQL)
├── packages/
│   └── rea-engine/          # Publishable @reast/engine library
│       ├── src/parser/      # REA lexer + block parser + analyser
│       ├── src/loader/      # .reast ZIP archive extraction + decryption
│       ├── src/runtime/     # StoryEngine, state manager, expression evaluator
│       ├── src/player/      # <reast-player> web component (browser-only)
│       └── src/geo.ts       # Geolocation utilities
├── shared/                  # Shared TypeScript types (web ↔ api)
├── spec/                    # REA language specification (5 parts)
├── data/                    # Persistent data directories (gitignored)
└── .specify/                # Product specifications and requirements
```

## @reast/engine Package

The story engine is extracted as a standalone library (`packages/rea-engine/`) that can be published independently to npm. It has **zero framework dependencies** (only `fflate` for ZIP).

- **Parser**: Tokenizes REA markup → AST (`ReaDocument`)
- **Loader**: Extracts `.reast` archives (ZIP with manifest, media, encrypted content)
- **Runtime**: `StoryEngine` interprets the AST with state, choices, variables, conditions
- **Player**: `<reast-player>` web component with Shadow DOM isolation (CDN-embeddable)

The web app imports the engine via TypeScript path mappings (`@reast/engine/*`). The player subpath is browser-only; the main barrel export is Node-safe.

## Security Architecture

### Authentication & Authorization

- **Keycloak** provides OpenID Connect (OIDC) with PKCE S256
- Public client (no secret) — SPA-friendly
- **Mandatory MFA (OTP)** for administrator, moderator, and support roles
- Custom browser flow: `browser-with-admin-otp`
- Access tokens: 15-minute lifetime with refresh token rotation (`revokeRefreshToken: true`)
- Brute force protection: 5 failures → progressive lockout (max 15 min)

### API Security

- Global `ValidationPipe` with `whitelist`, `transform`, `forbidNonWhitelisted`
- All DTOs validated with class-validator (length limits, regex patterns, enums)
- Rate limiting via `@nestjs/throttler` on all write endpoints
- Body size limits: 1 MB JSON, 10 KB CSP reports, 4 MB images
- Helmet headers, CORS restricted to known origins
- Path params validated with custom pipes (`ParseSlugPipe`, `ParseUuidPipe`)

### Infrastructure Hardening

- All containers run with `no-new-privileges`, `cap_drop: ALL`
- Stateless services (API, Caddy, Valkey) have `read_only: true` + tmpfs
- Resource limits (memory, CPU) on all services
- All services have health checks for orchestrator awareness
- TLS with Caddy in prod/test environments
