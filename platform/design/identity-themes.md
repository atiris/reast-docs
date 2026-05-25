# authentication platform Themes Customization Guide

Guide for customizing the Reast authentication platform login theme.

---

## Directory Structure

```text
confi./authentication-platform/themes/reast/
└── login/
    ├── theme.properties          # Theme config (parent, imports, stylesheets)
    ├── template.ftl              # Master HTML layout (all pages inherit this)
    ├── login.ftl                 # Sign-in page
    ├── register.ftl              # Registration page
    ├── login-reset-password.ftl  # Forgot password page
    ├── login-update-password.ftl # Forced password change page
    ├── error.ftl                 # Error page
    └── resources/
        ├── css/
        │   └── login.css         # All custom styles (light + dark mode)
        └── img/
            └── logo-reast.svg    # Reast logo
```

The theme is mounted into the authentication platform container as a read-only volume:

```yaml
# config/docker/compose.dev.yaml
volumes:
  - ../confi./authentication-platform/themes:/op./authentication-platform/themes:ro
```

---

## Theme Configuration

### theme.properties

```properties
parent=authentication platform          # Inherit from the default authentication platform theme
import=commo./authentication-platform   # Import shared resources (JS, vendor libs)

styles=css/login.css     # Custom stylesheet (loaded after parent styles)
```

**Key properties you can add:**

| Property       | Purpose                                                 | Example                               |
| -------------- | ------------------------------------------------------- | ------------------------------------- |
| `parent`       | Base theme to extend                                    | `authentication platform` (default) or `authentication platform.v2` |
| `import`       | Import shared resources from another theme              | `commo./authentication-platform`                     |
| `styles`       | Space-separated CSS files from `resources/`             | `css/login.css css/extra.css`         |
| `scripts`      | Space-separated JS files from `resources/`              | `js/custom.js`                        |
| `stylesCommon` | CSS from the `common` theme resources                   | `web_modules/@patternfly/...`         |
| `meta`         | HTML meta tags (`name==content` pairs, space-separated) | `robots==noindex`                     |

---

## FreeMarker Template Structure

authentication platform uses [FreeMarker](https://freemarker.apache.org/) (`.ftl`) for server-side HTML rendering.

### template.ftl — Master Layout

This is the base macro that all page templates use. It defines:

- HTML `<head>` (charset, viewport, title, stylesheets, scripts)
- Logo header with link to `/`
- Locale selector dropdown (when i18n enabled)
- Alert/message area
- Content slot via `<#nested "form">`
- Footer

**Page templates call it like this:**

```ftl
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=false; section>
    <#if section = "header">
        Page Title Here
    <#elseif section = "form">
        <!-- Form HTML -->
    <#elseif section = "info">
        <!-- Info/links below form -->
    </#if>
</@layout.registrationLayout>
```

**Available sections:**

| Section           | Purpose                                                      |
| ----------------- | ------------------------------------------------------------ |
| `header`          | Page title text (rendered in `<h1>`)                         |
| `form`            | Main form content                                            |
| `info`            | Additional info below the form (requires `displayInfo=true`) |
| `show-username`   | Username display during re-auth flows                        |
| `socialProviders` | Social login buttons (auto-rendered if providers exist)      |

### Page Templates

Each login flow page overrides the `template.ftl` macro:

| File                        | Flow                      | Key Variables                                                                 |
| --------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| `login.ftl`                 | Username/password sign-in | `login.username`, `url.loginAction`, `realm.rememberMe`, `social.providers`   |
| `register.ftl`              | New account registration  | `url.registrationAction`, `register.*` (firstName, lastName, email, username) |
| `login-reset-password.ftl`  | Forgot password           | `url.loginAction`, `auth.attemptedUsername`                                   |
| `login-update-password.ftl` | Forced password change    | `url.loginAction`, `username`                                                 |
| `error.ftl`                 | Error display             | `message.summary`, `client.baseUrl`                                           |

---

## Common FreeMarker Variables

These are provided by authentication platform to all templates:

### URL Variables (`url.*`)

| Variable                       | Description                            |
| ------------------------------ | -------------------------------------- |
| `url.loginAction`              | Form POST target for login/register    |
| `url.registrationUrl`          | Link to registration page              |
| `url.loginUrl`                 | Link back to login page                |
| `url.loginResetCredentialsUrl` | Link to reset password page            |
| `url.loginRestartFlowUrl`      | Restart login flow                     |
| `url.resourcesPath`            | Path to theme's `resources/` directory |
| `url.resourcesCommonPath`      | Path to shared `common/` resources     |
| `url.ssoLoginInOtherTabsUrl`   | SSO polling endpoint                   |

### Realm Variables (`realm.*`)

| Variable                            | Description                     |
| ----------------------------------- | ------------------------------- |
| `realm.password`                    | Password authentication enabled |
| `realm.registrationAllowed`         | Registration open               |
| `realm.rememberMe`                  | "Remember me" checkbox enabled  |
| `realm.resetPasswordAllowed`        | Password reset enabled          |
| `realm.internationalizationEnabled` | i18n active                     |

### Message Variables

| Variable                                    | Description                                       |
| ------------------------------------------- | ------------------------------------------------- |
| `msg("key")`                                | Localized message by key                          |
| `message.summary`                           | Current alert message text                        |
| `message.type`                              | Alert type: `error`, `success`, `warning`, `info` |
| `messagesPerField.existsError('field')`     | Check if a field has validation error             |
| `messagesPerField.get('field')`             | Get field-specific error message                  |
| `messagesPerField.getFirstError('f1','f2')` | First error across multiple fields                |

### Auth Variables

| Variable                       | Description                            |
| ------------------------------ | -------------------------------------- |
| `auth.attemptedUsername`       | Username from previous attempt         |
| `auth.showUsername()`          | Whether to show the attempted username |
| `auth.showResetCredentials()`  | Whether to show credential reset       |
| `auth.showTryAnotherWayLink()` | Alternative auth methods available     |
| `auth.selectedCredential`      | Currently selected credential ID       |

### Locale (`locale.*`)

| Variable           | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `locale.current`   | Current locale display name                              |
| `locale.supported` | List of supported locales (each has `.url` and `.label`) |
| `locale.rtl`       | Whether current locale is RTL                            |

---

## CSS Customization

### Design Tokens

The Reast theme uses these colors (from `DESIGN-SYSTEM.md`):

| Token        | Light Mode | Dark Mode | Usage                       |
| ------------ | ---------- | --------- | --------------------------- |
| Background   | `#faf9f6`  | `#121218` | Page background             |
| Card         | `#ffffff`  | `#1e1e2a` | Login card                  |
| Text         | `#1f1f2e`  | `#e8e6f0` | Primary text                |
| Muted        | `#5c5c6e`  | `#a0a0b8` | Labels, hints               |
| Accent       | `#5b4fc7`  | `#7b6ff0` | Buttons, links, focus rings |
| Accent hover | `#4a3fb5`  | `#9488f5` | Hover states                |
| Border       | `#d1d5db`  | `#3a3a4e` | Inputs, secondary buttons   |

### Fonts

```css
/* Headings */
font-family: "Playfair Display", Georgia, serif;

/* Body / UI */
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  sans-serif;
```

Loaded via Google Fonts in `login.css`.

### Key CSS Classes

| Class                    | Element                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `.reast-login-container` | Full-page flex centered wrapper                                    |
| `.reast-login-card`      | White card with border + shadow                                    |
| `.reast-logo-header`     | Logo + text centered above form                                    |
| `.reast-page-title`      | `<h1>` page heading                                                |
| `.reast-alert`           | Alert box (combine with `-error`, `-success`, `-warning`, `-info`) |
| `.reast-locale`          | Absolute-positioned language selector                              |
| `.reast-info`            | Info text below form                                               |
| `.reast-error-action`    | Error page back-link container                                     |
| `.reast-back-link`       | Styled button-like link                                            |

### Dark Mode

Dark mode uses `@media (prefers-color-scheme: dark)` — it follows the OS setting automatically. All color overrides are in the dark mode media query block at the bottom of `login.css`.

To add a new element that respects dark mode, add light-mode styles in the main section and override colors inside the `@media (prefers-color-scheme: dark)` block.

### Adding a New Style

1. Add CSS rules to `resources/css/login.css`
2. Use the design tokens above for consistency
3. Add dark mode overrides in the `@media (prefers-color-scheme: dark)` block
4. Test both modes in browser (DevTools → Rendering → Emulate prefers-color-scheme)

---

## Adding New Pages

To add a new authentication platform page (e.g., `login-otp.ftl`, `login-verify-email.ftl`):

### Step 1: Identify the Template Name

authentication platform maps login flows to FTL file names. Common templates you might add:

| File                         | Flow                            |
| ---------------------------- | ------------------------------- |
| `login-otp.ftl`              | TOTP / authenticator code entry |
| `login-verify-email.ftl`     | Email verification prompt       |
| `login-idp-link-confirm.ftl` | Link identity provider account  |
| `login-idp-link-email.ftl`   | Email link for IdP linking      |
| `login-page-expired.ftl`     | Session expired                 |
| `login-config-totp.ftl`      | Set up TOTP authenticator       |
| `info.ftl`                   | Generic info page               |
| `terms.ftl`                  | Terms and conditions acceptance |

### Step 2: Create the FTL File

Copy an existing page as a starting point and adjust:

```ftl
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        ${msg("loginOtpTitle")}
    <#elseif section = "form">
        <form action="${url.loginAction}" method="post">
            <div class="${properties.kcFormGroupClass!}">
                <label for="otp" class="${properties.kcLabelClass!}">
                    ${msg("loginOtpOneTime")}
                </label>
                <input id="otp" name="otp" type="text"
                       class="${properties.kcInputClass!}"
                       autocomplete="one-time-code"
                       autofocus />
            </div>
            <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
                <input type="submit"
                       class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!}"
                       value="${msg("doLogIn")}" />
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
```

### Step 3: Add Page-Specific Styles

If the new page needs custom CSS, add rules to `login.css` scoped by the `data-page-id` attribute:

```css
/* template.ftl sets: <body data-page-id="login-{pageId}"> */
[data-page-id="login-login-otp"] .some-element {
  /* page-specific styles */
}
```

### Step 4: Test

Trigger the flow in authentication platform (e.g., enable OTP in the realm → sign in → OTP page appears).

---

## Logo and Branding

### Replacing the Logo

1. Replace `resources/img/logo-reast.svg` with your new SVG file (keep the same filename, or update references)
2. If using a different filename, update `template.ftl`:

   ```ftl
   <img src="${url.resourcesPath}/img/your-logo.svg" alt="Brand" class="reast-logo-img" width="48" height="48" />
   ```

3. Update the text beside the logo in `template.ftl`:

   ```ftl
   <span class="reast-logo-text">your-brand</span>
   ```

### Adding a Favicon

Place `favicon.ico` in `resources/img/` (referenced in `template.ftl`):

```ftl
<link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
```

### Logo Sizing

The logo is set to 48×48px (40×40 on mobile via the `@media (max-width: 480px)` rule). Adjust in `login.css`:

```css
.reast-logo-img {
  /* default */
}

@media (max-width: 480px) {
  .reast-logo-img {
    width: 40px;
    height: 40px;
  }
}
```

---

## Theme Caching

authentication platform aggressively caches themes in production. During development:

### Dev Mode (Automatic)

The `start-dev` command in `compose.dev.yaml` **disables theme caching** by default:

```yaml
command: start-dev --import-realm
```

In dev mode, templates and CSS reload on every page refresh — no restart needed.

### Production Mode

In production (`start --optimized`), authentication platform caches compiled FreeMarker templates and static resources. To force a refresh:

#### Option 1: Restart the container

```bash
docker compose restart authentication platform
```

#### Option 2: Disable caching via environment variable

```yaml
environment:
  KC_SPI_THEME_STATIC_MAX_AGE: "-1"
  KC_SPI_THEME_CACHE_THEMES: "false"
  KC_SPI_THEME_CACHE_TEMPLATES: "false"
```

> Only use this temporarily — it impacts performance.

#### Option 3: Clear the theme cache directory

```bash
docker exec reast-authentication platform rm -rf /op./authentication-platform/data/tmp/kc-gzip-cache
docker compose restart authentication platform
```

### Browser Caching

Browsers may also cache CSS/JS. During development:

- Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (macOS)
- Or open DevTools → Network tab → check "Disable cache"

---

## Troubleshooting

### Common FTL Errors

**`freemarker.core.InvalidReferenceException`**

A variable is `null` but used without a default. Fix with the `!` operator:

```ftl
<!-- BAD: crashes if login.username is null -->
${login.username}

<!-- GOOD: falls back to empty string -->
${login.username!''}

<!-- GOOD: conditional check -->
<#if login.username?has_content>${login.username}</#if>
```

**`Expected hash, got string`**

Using `.property` on a string variable instead of a hash. Check the authentication platform source for the correct variable type.

**`?no_esc is not allowed on a non-markup-output value`**

The `kcSanitize()` function must wrap the value before `?no_esc`:

```ftl
<!-- GOOD -->
${kcSanitize(message.summary)?no_esc}

<!-- BAD — raw unsanitized HTML injection risk -->
${message.summary?no_esc}
```

#### Template not found

authentication platform falls back to the parent theme (`authentication platform`) for any missing template. If your custom page isn't rendering:

- Check the filename matches authentication platform's expected name exactly
- Check `theme.properties` has `parent=authentication platform`
- Check container logs: `docker compose logs authentication platform | grep -i theme`

### Checking Logs

```bash
# All authentication platform logs
docker compose logs -f authentication platform

# Filter for theme/template errors
docker compose logs authentication platform 2>&1 | grep -iE "freemarker|theme|template"
```

### Theme Not Appearing in Admin Console

1. Verify the volume mount maps correctly:

   ```text
   confi./authentication-platform/themes/reast/ → /op./authentication-platform/themes/reast/
   ```

2. Check the `reast` folder contains `login/theme.properties`
3. In authentication platform admin (<http://localhost:9995/admin>) → Realm Settings → Themes → Login theme → select `reast`
4. If `reast` doesn't appear in the dropdown, restart authentication platform

### Styles Not Loading

1. Verify `theme.properties` lists your CSS: `styles=css/login.css`
2. Check the CSS file path matches: `resources/css/login.css`
3. Open browser DevTools → Network → check if `login.css` loads (200 status)
4. Look for CSS specificity issues — the Reast theme uses `!important` to override PatternFly defaults

### Testing Without Docker

To preview FTL changes without full Docker stack:

1. Edit the `.ftl` / `.css` files locally
2. Restart only authentication platform: `docker compose restart authentication platform`
3. Navigate to <http://localhost:9995/realms/reast/account> (or any login-triggering URL)
4. In dev mode (`start-dev`), changes to CSS take effect on page refresh without restart
