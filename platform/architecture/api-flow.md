# API Request Flow

How an HTTP request travels through the NestJS API from arrival to response.

## Pipeline

```text
Client
  │
  ▼
┌─────────────────────────┐
│  Middleware (global)     │
│  1. RequestIdMiddleware  │  ← adds X-Request-Id header
│  2. ContentLengthMiddle… │  ← rejects bodies > limit
│  3. RequestLoggerMiddle… │  ← logs method, url, duration
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  Guards (global)         │
│  1. ThrottlerGuard       │  ← rate limiting (short + long)
│  2. JwtAuthGuard         │  ← validates Bearer JWT from Keycloak
│  3. RolesGuard           │  ← checks @Roles() decorator
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  Interceptors (global)   │
│  1. TimeoutInterceptor   │  ← aborts after N seconds
│  2. PerformanceIntercep… │  ← logs slow requests
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  ValidationPipe (global) │  ← class-validator + class-transformer
│  whitelist: true         │  ← strips unknown properties
│  forbidNonWhitelisted    │  ← rejects unknown properties
│  transform: true         │  ← auto-transforms query params
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  Controller method       │
│  (route handler)         │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  AllExceptionsFilter     │  ← catches unhandled errors
│  (global exception       │  ← returns structured error response
│   filter)                │
└─────────────────────────┘
```

## Middleware

| Order | Class                     | Purpose                                                       |
| ----- | ------------------------- | ------------------------------------------------------------- |
| 1     | `RequestIdMiddleware`     | Attaches a unique `X-Request-Id` to every request for tracing |
| 2     | `ContentLengthMiddleware` | Rejects requests exceeding the configured body size limit     |
| 3     | `RequestLoggerMiddleware` | Logs HTTP method, URL, status code, and duration              |

Applied to all routes (`*`).

## Guards

| Order | Class            | Purpose                                                                                                   |
| ----- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| 1     | `ThrottlerGuard` | Enforces per-route rate limits via `@Throttle()` decorator. Default: 10 req/s (short), 100 req/min (long) |
| 2     | `JwtAuthGuard`   | Validates Keycloak-issued JWT. Skipped for routes decorated with `@Public()`                              |
| 3     | `RolesGuard`     | Checks user roles from the JWT against `@Roles()` decorator. Fail-safe: denies if roles missing           |

## Interceptors

| Order | Class                    | Purpose                                         |
| ----- | ------------------------ | ----------------------------------------------- |
| 1     | `TimeoutInterceptor`     | Aborts the request after a configurable timeout |
| 2     | `PerformanceInterceptor` | Logs requests that exceed a duration threshold  |

## Validation

The global `ValidationPipe` (configured in `main.ts`) processes DTOs:

- **whitelist: true** — strips properties without decorators
- **forbidNonWhitelisted: true** — rejects unknown properties with 400
- **transform: true** — converts query string values to their declared types

## Exception Handling

`AllExceptionsFilter` catches all unhandled exceptions and returns a structured JSON response:

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "InternalServerError",
  "requestId": "uuid"
}
```

## Auth Flow

```text
@Public() route?
  ├─ YES → skip JwtAuthGuard → skip RolesGuard → handler
  └─ NO  → JwtAuthGuard validates token
              ├─ INVALID → 401
              └─ VALID → RolesGuard
                           ├─ @Roles() present?
                           │    ├─ YES → check user.roles
                           │    │         ├─ match → handler
                           │    │         └─ no match → 403
                           │    └─ NO → handler
                           └─ (no roles on user + @Roles present → 403)
```

## Modules

| Module        | Controllers                                                                                                                                                         | Scope                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Auth          | `AuthController`, `AvatarController`, `SessionController`                                                                                                           | Login, logout, avatar upload, session management, audit log    |
| Stories       | `StoriesController`                                                                                                                                                 | CRUD for stories, rating, review, moderation                   |
| Catalog       | `CatalogController`, `CatalogSearchController`, `CatalogAuthorsController`, `CatalogCollectionsController`, `CatalogGroupsController`, `CatalogLanguagesController` | Public story browsing, search, author/collection/group listing |
| Admin         | `AdminController`, `ModerationController`, `PlatformController`                                                                                                     | User management, log inspection, platform settings             |
| AuthorProfile | `AuthorProfileController`                                                                                                                                           | Public author profiles with slug-based URLs                    |
| UserPrefs     | `UserPrefsController`                                                                                                                                               | Reader settings, menu hints                                    |
| Shelf         | `ShelfController`                                                                                                                                                   | Personal story shelf                                           |
| Notes         | `NotesController`                                                                                                                                                   | Per-story user notes                                           |
| Bookmarks     | `BookmarksController`                                                                                                                                               | Story bookmarks                                                |
| Progress      | `ProgressController`                                                                                                                                                | Reading progress tracking                                      |
| Overlays      | `OverlaysController`                                                                                                                                                | Story variable overlays                                        |
| Tutorials     | `TutorialsController`, `TutorialsAdminController`                                                                                                                   | Public tutorial retrieval, admin CRUD                          |
| Mail          | `MailController`                                                                                                                                                    | Internal mail sending                                          |
| MeData        | `MeDataController`                                                                                                                                                  | User data export                                               |
| Health        | `HealthController`                                                                                                                                                  | Liveness and readiness probes                                  |
| CspReport     | `CspReportController`                                                                                                                                               | CSP violation reporting endpoint                               |
| DataRetention | `DataRetentionController`                                                                                                                                           | Retention policy info                                          |

## Sentry

`SentryModule.forRoot()` is loaded first. Captures unhandled exceptions and performance data automatically.

## Data Flow Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                              │
│  Angular SPA ─ auth-error interceptor ─ retry interceptor ─ bearer    │
└────────────┬───────────────────────────────────────────┬───────────────┘
             │ HTTPS                                     │ OIDC/PKCE
             ▼                                           ▼
┌────────────────────┐                        ┌─────────────────────┐
│   Caddy (reverse   │◄──── TLS ─────────────►│    Keycloak         │
│   proxy + CSP)     │      termination       │  (identity provider)│
│   :443 → :9990/91  │                        │  :9995              │
└────────┬───────────┘                        └──────────┬──────────┘
         │ HTTP (internal)                               │ JWKS
         ▼                                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NestJS API (:9991)                              │
│                                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Middleware  │─►│    Guards    │─►│ Interceptors │                  │
│  │  (logging,  │  │ (throttle,   │  │ (timeout,    │                  │
│  │   req-id)   │  │  JWT, roles) │  │  perf-log)   │                  │
│  └─────────────┘  └──────────────┘  └──────┬───────┘                  │
│                                             ▼                          │
│  ┌──────────────────────────────────────────────────────┐              │
│  │              Controller + Service Layer              │              │
│  │  Stories │ Auth │ Catalog │ Notes │ Mail │ Admin     │              │
│  └──────┬──────────────┬──────────────┬────────────────┘              │
│         │              │              │                                │
│         ▼              ▼              ▼                                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                         │
│  │ PostgreSQL │ │ SeaweedFS  │ │   Valkey   │                         │
│  │  :9992     │ │  S3 :9993  │ │   :9996    │                         │
│  │ (stories,  │ │ (avatars,  │ │ (rate-limit│                         │
│  │  users,    │ │  assets)   │ │  counters, │                         │
│  │  audit)    │ │            │ │  sessions) │                         │
│  └────────────┘ └────────────┘ └────────────┘                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Write Path (Story Create)

1. Client sends `POST /api/stories` with JWT + story body
2. Caddy terminates TLS, forwards to API
3. ThrottlerGuard checks rate limits (Valkey counter)
4. JwtAuthGuard validates token (Keycloak JWKS)
5. RolesGuard verifies `creator` or `administrator` role
6. ValidationPipe validates `CreateStoryDto`
7. StoriesService inserts row into PostgreSQL
8. Response: `201 Created` with story slug

### Read Path (Story Load)

1. Client sends `GET /api/stories/:slug` (public or authenticated)
2. JwtAuthGuard allows (public route) or validates token
3. StoriesService queries PostgreSQL by slug
4. Response: `200 OK` with story data (content, metadata)
