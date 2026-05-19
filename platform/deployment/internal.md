# Deployment Guide

## Local Development

### Prerequisites

- Podman Desktop (or Docker) with compose support
- Node.js 22+

### Architecture

Reast is a fully standalone project. Local development uses direct port bindings — no reverse proxy needed. The dev compose file contains the **entire stack** (web, api, postgres, keycloak, seaweedfs, valkey, glitchtip) so a single `reast start` brings everything up. For hot reload, stop the `web` or `api` service and run `npm start` on the host instead.

```text
┌─────────────────────────────────────────────────┐
│            Podman / Docker Containers            │
│  Web (nginx) :9990    API (NestJS)   :9991        │
│  PostgreSQL  :9992    SeaweedFS S3   :9993        │
│  SeaweedFS UI:9994    Keycloak       :9995        │
│  Valkey      :9996    GlitchTip      :9997        │
└─────────────────────────────────────────────────┘
```

### Setup Steps

1. **First-time setup** (writes `config/env/.env.dev` and pins the active env):

   ```bash
   cd cli && npm link          # one-time CLI install
   reast init                  # defaults to dev
   ```

2. **Start the full stack**:

   ```bash
   reast start                 # brings up web, api and all infra
   reast status                # confirm every service is Up
   ```

3. **Hot-reload workflow** (optional, replaces containerised web/api):

   ```bash
   reast stop web
   cd apps/web && npm start    # Angular dev server on 9990

   reast stop api
   cd apps/api && npm run start:dev
   ```

4. **Verify**:
   - <http://localhost:9990> — web app
   - <http://localhost:9991> — API
   - <http://localhost:9995> — Keycloak admin
   - <http://localhost:9994> — SeaweedFS master cluster UI (`/ui`)

### Dev Port Assignments

All Reast services use the `999x` port range to avoid conflicts:

| Port | Service        | Container Port |
| ---- | -------------- | -------------- |
| 9990 | Frontend (ng)  | — (CLI dev)    |
| 9991 | Backend (nest) | — (CLI dev)    |
| 9992 | PostgreSQL     | 5432           |
| 9993 | SeaweedFS S3   | 8333           |
| 9994 | SeaweedFS UI   | 9333           |
| 9995 | Keycloak       | 8080           |
| 9996 | Valkey         | 6379           |
| 9997 | GlitchTip      | 8000           |

Access services directly: `psql -h localhost -p 9992`, the SeaweedFS master UI at `http://localhost:9994/ui`, the S3 endpoint at `http://localhost:9993` (use `awscli --endpoint-url`), etc.

---

## Test / Production Deployment

Test and production environments use **Caddy** as the reverse proxy with automatic TLS. See `deploy/compose.test.yaml` and `deploy/compose.prod.yaml`.

### Test (test.rea.st)

```bash
docker compose -f deploy/compose.test.yaml --env-file deploy/.env.test up -d
```

### Production (rea.st)

```bash
docker compose -f deploy/compose.prod.yaml --env-file deploy/.env.prod up -d
```

---

## Synology NAS Deployment

### Auto-deploy on push to main

Uses a simple webhook + script approach. On `git push` to main, the Synology pulls and restarts.

#### Option A: Synology Task Scheduler (polling)

Create a scheduled task in Synology DSM → Control Panel → Task Scheduler:

- Type: User-defined script
- Schedule: Every 5 minutes
- Script:

  ```bash
  #!/bin/bash
  cd /volume1/docker/reast
  CURRENT=$(git rev-parse HEAD)
  git fetch origin main --quiet
  REMOTE=$(git rev-parse origin/main)
  if [ "$CURRENT" != "$REMOTE" ]; then
    git pull --ff-only origin main
    docker compose -f config/docker/compose.dev.yaml up -d --build
    echo "$(date): Deployed $REMOTE" >> /volume1/docker/reast/deploy.log
  fi
  ```

---

## Production VPS Deployment

Planned for post-PoC. Same Docker compose stack with:

- Let's Encrypt via Caddy (automatic HTTPS)
- Proper secrets management
- Automated backups to S3-compatible storage
- Monitoring (health endpoints + structured logging)
