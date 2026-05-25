# Security Audit — Reast API

Last audited: 2026-05-16 (batches 373–381)

## OWASP Top 10 Checklist

### A01: Broken Access Control

- [x] Global JWT auth guard (`JwtAuthGuard` as `APP_GUARD`)
- [x] Public endpoints explicitly marked with `@Public()` decorator
- [x] Token extraction from `Authorization: Bearer` header only
- [x] Role-based access control (`RolesGuard` with `@Roles()` decorator, enforces creator/administrator on write endpoints)
- [x] Ownership checks on story update/delete (only owner or administrator)
- [x] Slug params validated via `ParseSlugPipe` (rejects path traversal)
- [x] Session IDs validated via `ParseUuidPipe` (prevents path traversal to IdP)

### A02: Cryptographic Failures

- [x] RS256 asymmetric JWT signing via Zitadel JWKS
- [x] TLS termination at reverse proxy (Caddy)
- [x] No secrets in tracked `.env` file (only config defaults)

### A03: Injection

- [x] Global `ValidationPipe` with `whitelist: true` strips unknown properties
- [x] `forbidNonWhitelisted: true` rejects payloads with extra fields
- [x] `transform: true` coerces types from DTOs
- [x] All SQL queries use parameterized queries (`$1`, `$2`) — no string concatenation
- [x] Story slug sanitized in `filePath()` method (`[^a-zA-Z0-9_-]` stripped)

### A04: Insecure Design

- [x] Auth-by-default pattern (all routes require JWT unless `@Public()`)
- [x] Separation of concerns (auth, health, stories, database modules)
- [x] Zitadel handles user management externally

### A05: Security Misconfiguration

- [x] Helmet.js for security headers (CSP, X-Frame-Options, etc.)
- [x] CORS restricted to explicit origins from `CORS_ORIGINS` env
- [x] Only `GET, POST, PUT, PATCH, DELETE, OPTIONS` methods allowed
- [x] Allowed headers restricted to `Content-Type, Authorization`
- [x] CORS `credentials: true` with `maxAge: 7200`
- [x] Swagger endpoint (`/api/docs`) disabled in production via `NODE_ENV` check

### A06: Vulnerable and Outdated Components

- [x] `npm audit` — 0 vulnerabilities (2026-05-07)
- [x] NestJS 11, nodemailer 8, latest passport-jwt, jwks-rsa
- [x] Schedule regular `npm audit` in CI (`.github/workflows/ci.yml` — weekly + on PRs)

### A07: Identification and Authentication Failures

- [x] JWT expiration enforced (`ignoreExpiration: false`)
- [x] Issuer validation against `OIDC_ISSUER`
- [x] Audience validation via OIDC discovery
- [x] JWKS rate limiting (5 requests/min) with caching
- [x] RS256 algorithm enforced (no algorithm confusion attacks)

### A08: Software and Data Integrity Failures

- [x] JWKS source validated against OIDC issuer URL
- [x] No deserialization of untrusted data

### A09: Security Logging and Monitoring Failures

- [x] Terminus health checks at `/api/health` and `/api/health/auth`
- [x] Request logging middleware (`RequestLoggerMiddleware`) on all routes
- [x] Auth event audit logging (`AuditService`) with retention cleanup
- [x] Error logging for 500+ status codes (stack traces server-side only)

### A10: Server-Side Request Forgery (SSRF)

- [x] No user-controlled URL fetching
- [x] JWKS URI derived from config, not user input
- [x] Session/IdP account URLs derived from config

## Rate Limiting

- [x] `ThrottlerModule` — short burst: 10 req/sec, sustained: 100 req/min
- [x] Per-user tracking (`UserThrottlerGuard`) — authenticated users identified by `sub`, anonymous by IP
- [x] Health endpoints excluded via `@SkipThrottle()`

### Per-Endpoint Overrides

| Endpoint             | Burst       | Sustained     | Extra                          |
| -------------------- | ----------- | ------------- | ------------------------------ |
| `POST /me/reports`   | 5 req/60s   | (global)      | + 10 reports/24h (DB-enforced) |
| `GET /catalog/*`     | 5 req/sec   | 30 req/min    | —                              |
| `POST /csp-report`   | 10 req/sec  | 100 req/min   | —                              |
| Catalog groups write | 3–5 req/sec | 10–20 req/min | —                              |

### Error Responses

When a rate limit is hit, the API returns:

- **429 Too Many Requests** — burst/sustained throttler exceeded. Body: `{ statusCode: 429, message: "ThrottlerException: Too Many Requests" }`
- **409 Conflict** — daily report limit (10/24h). Body: `{ statusCode: 409, code: "REPORT_RATE_LIMITED", message: "Report rate limit exceeded" }`

Response headers on throttled endpoints: `X-RateLimit-Limit-*`, `X-RateLimit-Remaining-*`, `Retry-After` (on 429).

## Request Size Limits

- [x] Express `json` and `urlencoded` body parsers limited to 1 MB
- [x] DTO content fields capped at 500 KB via `@MaxLength(500_000)`

## Error Response Hardening

- [x] 500+ errors return generic "Internal server error" message (no stack/path leakage)
- [x] 4xx errors return validation/business messages only (no internal paths)
- [x] Health endpoint excluded from throttling (`@SkipThrottle()`)

## Input Validation Summary

| Endpoint                        | Validation                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `POST /api/stories`             | `CreateStoryDto` — slug regex, title/author/genre/content with length limits |
| `PUT /api/stories/:slug`        | `ParseSlugPipe` + `UpdateStoryDto` — optional fields with length limits      |
| `GET /api/stories/:slug`        | `ParseSlugPipe` — rejects invalid slug format                                |
| `DELETE /api/stories/:slug`     | `ParseSlugPipe` — rejects invalid slug format                                |
| `PUT /api/auth/profiles/:role`  | `UpdateProfileDto` — avatar HTTPS URL regex, length limits                   |
| `DELETE /api/auth/sessions/:id` | `ParseUuidPipe` — validates UUID format                                      |
| `GET /api/auth/events`          | Limit/offset clamped to safe ranges (1-200, 0+)                              |
| `GET /api/stories`              | Page/limit clamped to safe ranges (1+, 1-100)                                |

## Environment Security

- [x] `.env.*` in `.gitignore` (secrets files excluded)
- [x] Tracked `.env` contains only non-secret config defaults
- [x] ConfigService used for all env access

## Recommendations for Production

1. Disable Swagger endpoint (`/api/docs`) or protect with auth
2. Configure CI pipeline to run `npm audit` on every build ✅ (added in CI workflow)
3. Add HTTPS-only cookie flags if cookie-based auth is added

## Infrastructure Hardening (2026-05-16)

- [x] All containers: `security_opt: no-new-privileges:true`
- [x] Stateless containers (API, Caddy, Valkey): `read_only: true` + tmpfs mounts
- [x] Capability drop: `cap_drop: ALL` on Zitadel, GlitchTip, API, Caddy
- [x] Caddy retains only `NET_BIND_SERVICE` capability
- [x] Resource limits (memory + CPU) on all services
- [x] Health checks on all services for orchestrator awareness
- [x] Init process (`init: true`) prevents zombie processes

## Zitadel Security (2026-05-20)

- [x] Password policy configured via Zitadel default settings
- [x] Brute force / lockout protection via Zitadel login policies
- [x] MFA enforcement for administrator and moderator roles via Zitadel actions
- [x] PKCE S256 required, implicit flow disabled
- [x] Refresh token rotation enabled
- [x] Access token lifetime: 15 minutes (configurable via Zitadel console)
- [x] Event logging (login, logout, register) via Zitadel audit log
- [x] Admin events stored in Zitadel event store

## Deploy Security (2026-05-16)

- [x] `check-passwords.sh`: uses `printenv` instead of `eval echo` (no shell injection)
- [x] `first-run-setup.mjs`: 8 KB POST body size limit (prevents payload abuse)
- [x] Known-default password guard prevents production start with `Change-me1!` values

## Content Security Policy (2026-05-16)

CSP is configured in three layers (any of which may apply depending on deployment):

| Layer             | File                                              | Purpose                        |
| ----------------- | ------------------------------------------------- | ------------------------------ |
| Caddy (prod)      | `config/prod/Caddyfile`                           | Reverse proxy adds CSP headers |
| Caddy (test)      | `config/test/Caddyfile`                           | Test environment headers       |
| nginx (container) | `modules/platform/apps/web/security-headers.conf` | Standalone web container       |

**CSP directives** (consistent across all layers):

- `default-src 'self'` — fallback restricts to same-origin
- `script-src 'self'` — no inline scripts, no external JS
- `style-src 'self' 'unsafe-inline' fonts.googleapis.com` — inline styles for Angular
- `font-src 'self' fonts.gstatic.com` — Google Fonts only
- `img-src 'self' data: blob: files.rea.st` — data URIs for icons, blob for canvas
- `connect-src 'self' auth.rea.st files.rea.st errors.rea.st` — API, Zitadel, S3, Sentry
- `frame-src 'self' auth.rea.st` — only Zitadel login / silent-renew iframe
- `frame-ancestors 'self'` — prevents embedding in external sites
- `object-src 'none'` — blocks Flash/Java/plugin embeds
- `worker-src 'self' blob:` — service worker + web workers
- `base-uri 'self'` — prevents `<base>` tag injection
- `form-action 'self'` — prevents form data exfiltration
- `upgrade-insecure-requests` — auto-upgrades HTTP to HTTPS

**CSP violation reporting:**

- `report-uri /api/csp-report` (legacy, wide browser support)
- `report-to csp-endpoint` (Reporting API v1)
- `Reporting-Endpoints` header defines the `csp-endpoint` URL
- API module `CspReportModule` ingests reports (rate-limited, body validated)

## Client-Side Resilience (2026-05-16)

HTTP interceptor chain (in order):

1. **`oidcBearerInterceptor`** — OIDC token injection from session storage
2. **`retryInterceptor`** — Exponential backoff for transient failures
3. **`authErrorInterceptor`** — Error classification and user notification

**Retry strategy** (`retryInterceptor`):

- Only retries idempotent methods: GET, HEAD, OPTIONS
- Retryable statuses: 0 (network), 408, 502, 503, 504
- Default: 2 retries with exponential backoff (1s, 2s)
- Per-request override via `RETRY_COUNT` HttpContext token
- Non-idempotent methods (POST, PUT, DELETE, PATCH) never retried

**Auth error handling** (`authErrorInterceptor`):

- 401: Redirect to Zitadel login (with loop protection via `recentlyAuthenticated()`)
- 403: Permission denied toast
- 429: Rate limit toast
- 0: Network error toast (suppressed when offline banner is visible)
- 500+: Server error toast with extracted detail

**Offline support:**

- `NetworkStatusService` tracks online/offline via window events
- Visual blink indicator on reconnection
- `SessionSyncService` syncs offline data when connection restores
- Multi-tab session awareness via BroadcastChannel

## Related Documents

- [Input Validation](input-validation.md) — detailed breakdown of all validation layers

## Threat Model

### Trust Boundaries

```text
┌──────────────────────────────────────────────────────────┐
│  Internet (untrusted)                                    │
│   ├─ Anonymous readers                                   │
│   └─ Authenticated users (Zitadel JWT)                   │
├──────────────────────────────────────────────────────────┤
│  Reverse Proxy — Caddy (TLS termination, CSP, headers)   │
├──────────────────────────────────────────────────────────┤
│  Application Layer (trusted internal network)            │
│   ├─ Web (Angular SPA, static files via nginx)           │
│   ├─ API (NestJS, JWT validation, rate limiting)         │
│   ├─ Zitadel (identity provider, OIDC/PKCE)             │
│   └─ Valkey (session cache, rate-limit counters)         │
├──────────────────────────────────────────────────────────┤
│  Data Layer (restricted)                                 │
│   ├─ PostgreSQL (user data, stories, audit events)       │
│   └─ SeaweedFS (avatar images, story assets)             │
└──────────────────────────────────────────────────────────┘
```

### Threat Categories (STRIDE)

| Threat                     | Example                               | Mitigation                                                     |
| -------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| **Spoofing**               | Forged JWT, session hijacking         | RS256 via Zitadel JWKS, PKCE S256, refresh token rotation      |
| **Tampering**              | Modified story content, SQL injection | Parameterized queries, ValidationPipe, whitelist DTOs          |
| **Repudiation**            | Deny unauthorized access              | Audit event logging with retention, Zitadel event log          |
| **Information Disclosure** | Stack traces, internal paths          | Generic 500 messages, no source maps in prod, CSP              |
| **Denial of Service**      | API flooding, large payloads          | ThrottlerModule, 1MB body limit, resource limits on containers |
| **Elevation of Privilege** | Role bypass, path traversal           | RolesGuard, ParseSlugPipe, ParseUuidPipe, ownership checks     |

### Attack Surface

| Surface        | Exposure                                       | Controls                                                    |
| -------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| Web UI         | Public                                         | CSP, SRI, no inline scripts, service worker HTTPS-only      |
| REST API       | Public (auth-required except health + catalog) | JWT guard, rate limiting, input validation                  |
| Zitadel admin  | Internal only                                  | Not exposed via Caddy in prod, MFA required for admin roles |
| PostgreSQL     | Internal only                                  | No public port, connection via internal Docker network      |
| SeaweedFS      | Internal (proxied)                             | Accessed via API presigned URLs, no direct public access    |

### Data Classification

| Data                     | Sensitivity | Protection                                             |
| ------------------------ | ----------- | ------------------------------------------------------ |
| User credentials         | Critical    | Managed by Zitadel, never stored in app DB             |
| JWT tokens               | High        | Short-lived (15 min), HttpOnly where possible, RS256   |
| Story content            | Medium      | Ownership-enforced CRUD, slug sanitization             |
| Reading progress / notes | Medium      | User-scoped, data retention cleanup (configurable TTL) |
| Audit logs               | Medium      | Parameterized retention cleanup, no PII in metadata    |
| Health endpoints         | Low         | Public, rate-limited, no sensitive data exposed        |
