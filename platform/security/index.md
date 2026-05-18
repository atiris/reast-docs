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
- [x] Session IDs validated via `ParseUuidPipe` (prevents path traversal to Keycloak)

### A02: Cryptographic Failures

- [x] RS256 asymmetric JWT signing via Keycloak JWKS
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
- [x] Keycloak handles user management externally

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
- [x] Issuer validation against `KC_ISSUER`
- [x] Audience validation (`audience: "account"`)
- [x] JWKS rate limiting (5 requests/min) with caching
- [x] RS256 algorithm enforced (no algorithm confusion attacks)

### A08: Software and Data Integrity Failures

- [x] JWKS source validated against Keycloak issuer URL
- [x] No deserialization of untrusted data

### A09: Security Logging and Monitoring Failures

- [x] Terminus health checks at `/api/health` and `/api/health/auth`
- [x] Request logging middleware (`RequestLoggerMiddleware`) on all routes
- [x] Auth event audit logging (`AuditService`) with retention cleanup
- [x] Error logging for 500+ status codes (stack traces server-side only)

### A10: Server-Side Request Forgery (SSRF)

- [x] No user-controlled URL fetching
- [x] JWKS URI derived from config, not user input
- [x] Session/Keycloak account URLs derived from config

## Rate Limiting

- [x] `ThrottlerModule` — short burst: 10 req/sec, sustained: 100 req/min

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
- [x] Capability drop: `cap_drop: ALL` on Keycloak, GlitchTip, API, Caddy
- [x] Caddy retains only `NET_BIND_SERVICE` capability
- [x] Resource limits (memory + CPU) on all services
- [x] Health checks on all services for orchestrator awareness
- [x] Init process (`init: true`) prevents zombie processes

## Keycloak Security (2026-05-16)

- [x] Password policy: 8+ chars, mixed case, digits, special, not username/email, history 3
- [x] Brute force protection: 5 failures → progressive lockout (max 15 min wait)
- [x] Mandatory OTP/TOTP for administrator, moderator, and support roles
- [x] PKCE S256 required, implicit flow disabled, direct access grants disabled
- [x] Refresh token rotation (revokeRefreshToken: true, maxReuse: 0)
- [x] Access token lifetime: 15 minutes
- [x] Event logging enabled (login, logout, register, password reset, email verify)
- [x] Admin events with details enabled

## Deploy Security (2026-05-16)

- [x] `check-passwords.sh`: uses `printenv` instead of `eval echo` (no shell injection)
- [x] `first-run-setup.mjs`: 8 KB POST body size limit (prevents payload abuse)
- [x] Known-default password guard prevents production start with `Change-me1!` values

## Content Security Policy (2026-05-16)

CSP is configured in three layers (any of which may apply depending on deployment):

| Layer             | File                             | Purpose                        |
| ----------------- | -------------------------------- | ------------------------------ |
| Caddy (prod)      | `config/prod/Caddyfile`          | Reverse proxy adds CSP headers |
| Caddy (test)      | `config/test/Caddyfile`          | Test environment headers       |
| nginx (container) | `apps/web/security-headers.conf` | Standalone web container       |

**CSP directives** (consistent across all layers):

- `default-src 'self'` — fallback restricts to same-origin
- `script-src 'self'` — no inline scripts, no external JS
- `style-src 'self' 'unsafe-inline' fonts.googleapis.com` — inline styles for Angular
- `font-src 'self' fonts.gstatic.com` — Google Fonts only
- `img-src 'self' data: blob: files.rea.st` — data URIs for icons, blob for canvas
- `connect-src 'self' auth.rea.st files.rea.st errors.rea.st` — API, Keycloak, S3, Sentry
- `frame-src 'self' auth.rea.st` — only Keycloak login iframe
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

1. **`includeBearerTokenInterceptor`** — Keycloak token injection with auto-refresh (5 min)
2. **`retryInterceptor`** — Exponential backoff for transient failures
3. **`authErrorInterceptor`** — Error classification and user notification

**Retry strategy** (`retryInterceptor`):

- Only retries idempotent methods: GET, HEAD, OPTIONS
- Retryable statuses: 0 (network), 408, 502, 503, 504
- Default: 2 retries with exponential backoff (1s, 2s)
- Per-request override via `RETRY_COUNT` HttpContext token
- Non-idempotent methods (POST, PUT, DELETE, PATCH) never retried

**Auth error handling** (`authErrorInterceptor`):

- 401: Redirect to Keycloak (with loop protection via `recentlyAuthenticated()`)
- 403: Permission denied toast
- 429: Rate limit toast
- 0: Network error toast (suppressed when offline banner is visible)
- 500+: Server error toast with extracted detail

**Offline support:**

- `NetworkStatusService` tracks online/offline via window events
- Visual blink indicator on reconnection
- `SessionSyncService` syncs offline data when connection restores
- Multi-tab session awareness via BroadcastChannel
