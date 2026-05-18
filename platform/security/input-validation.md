# Input Validation

All user input entering the API is validated through multiple layers before reaching business logic.

## Layer 1: Request Body Limits

Configured in `apps/api/src/main.ts`:

| Content-Type                        | Limit |
| ----------------------------------- | ----- |
| `application/json` (default)        | 1 MB  |
| `application/csp-report`            | 10 KB |
| `application/reports+json`          | 10 KB |
| `application/x-www-form-urlencoded` | 1 MB  |

Requests exceeding these limits are rejected with HTTP 413 before any parsing.

## Layer 2: Global ValidationPipe

Applied globally in `main.ts`:

```typescript
new ValidationPipe({
  whitelist: true, // Strip unknown properties
  transform: true, // Auto-transform primitives to DTO types
  forbidNonWhitelisted: true, // Reject requests with unknown properties (400)
});
```

Every controller method parameter decorated with `@Body()` is validated against its DTO class using `class-validator` decorators (`@IsString`, `@IsEmail`, `@IsEnum`, `@Min`, `@Max`, `@MaxLength`, etc.).

## Layer 3: Custom Pipes

### ParseSlugPipe

**File:** `apps/api/src/common/parse-slug.pipe.ts`

Validates URL `:slug` parameters against `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$`. This rejects:

- Path traversal sequences (`../`, `..\\`)
- Dots, slashes, backslashes, spaces, special characters
- Empty strings and strings over 100 characters

Used on all story, overlay, author-profile, and group endpoints.

### ParseUuidPipe

**File:** `apps/api/src/common/parse-uuid.pipe.ts`

Validates URL `:id` parameters against RFC 4122 UUID format (`^[0-9a-f]{8}-...`). Rejects any non-UUID identifier with HTTP 400.

## Layer 4: File Upload Validation

**File:** `apps/api/src/common/upload.ts`

Image uploads (avatars, group banners) pass through:

1. **Size check:** 4 MB hard limit (`IMAGE_MAX_BYTES`)
2. **MIME type whitelist:** Only `image/png`, `image/jpeg`, `image/webp`
3. **Magic byte verification:** Uses `file-type` library to confirm the actual file content matches the declared MIME type, preventing disguised malicious files

## Layer 5: Rate Limiting

**Module:** `@nestjs/throttler` (global)

Every controller has `@Throttle()` decorators with per-endpoint limits:

| Endpoint Category | Short (per second) | Medium (per minute) |
| ----------------- | ------------------ | ------------------- |
| Read endpoints    | 10/s               | 60/min              |
| Write endpoints   | 5/s                | 30/min              |
| Admin endpoints   | 10/s               | 60/min              |
| Auth endpoints    | 5/s                | 30/min              |

Rate limit headers are added via `ThrottlerBehindProxyGuard` which respects `X-Forwarded-For`.

## Layer 6: SQL Parameterization

All database queries use parameterized placeholders (`$1`, `$2`, ...). Dynamic WHERE clause construction (e.g., in `AuditService.getRecent()`) uses only hardcoded column names — user input is never interpolated into SQL strings.

## Layer 7: S3 Key Safety

S3 object keys are constructed from slugs validated by `ParseSlugPipe`. Since the slug regex blocks dots, slashes, and backslashes, path traversal through S3 keys is impossible:

```text
stories/${slug}.rea    → safe (slug is [a-zA-Z0-9_-]+)
avatars/${slug}.${ext} → safe (ext is hardcoded whitelist)
banners/${slug}.${ext} → safe (ext is hardcoded whitelist)
```
