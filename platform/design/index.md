# Reast Design Manual

> Standalone developer reference for the Reast visual identity. Authoritative source for design tokens, component patterns and enforcement rules.
> For the embedded web-app version see [Design System](design/system.md).

---

## Design Principles

1. **Literary warmth** — Warm neutrals, serif headlines, generous whitespace evoke book culture.
2. **Content-first** — Stories are the star; UI recedes behind content.
3. **Consistent rhythm** — 4px base grid, modular scale, predictable spacing.
4. **Accessible contrast** — WCAG AA minimum, clear text hierarchy, high-contrast themes available.
5. **Subtle interactions** — Gentle hover lifts, smooth transitions, no jarring movements.
6. **Offline-ready** — Every reader feature works without a network connection.
7. **No external UI libraries** — Angular CDK for behaviour; all visuals are custom.

---

## Color Tokens

All colors are CSS custom properties defined in `apps/web/src/styles.scss`. Five themes are supported: **default (light)**, **dark**, **high-contrast**, **dark high-contrast**, and **light high-contrast**.

### Default (Light) — `:root`

| Token                         | Value                     | Usage                                 |
| ----------------------------- | ------------------------- | ------------------------------------- |
| `--color-bg`                  | `#faf9f6`                 | Page background (warm white)          |
| `--color-bg-alt`              | `#f3f1ec`                 | Section backgrounds (warm gray)       |
| `--color-bg-card`             | `#ffffff`                 | Card surfaces                         |
| `--color-bg-card-hover`       | `#fdfcfa`                 | Card hover state                      |
| `--color-surface`             | `#edeae4`                 | Inputs, wells                         |
| `--color-border`              | `#ddd9d1`                 | Primary borders                       |
| `--color-border-light`        | `#e8e5de`                 | Subtle borders                        |
| `--color-text`                | `#1f1f2e`                 | Primary text (near-black, warm)       |
| `--color-text-muted`          | `#5c5c6e`                 | Secondary text                        |
| `--color-text-dim`            | `#67677a`                 | Tertiary / meta text                  |
| `--color-accent`              | `#5b4fc7`                 | Interactive elements (indigo)         |
| `--color-accent-hover`        | `#4a3fb0`                 | Hover state                           |
| `--color-accent-strong`       | `#5b4fc7`                 | CTA backgrounds (white text, WCAG AA) |
| `--color-accent-strong-hover` | `#4a3fb0`                 | CTA hover                             |
| `--color-accent-glow`         | `rgba(91, 79, 199, 0.12)` | Focus rings, glows                    |
| `--color-accent-soft`         | `rgba(91, 79, 199, 0.08)` | Subtle accent backgrounds             |
| `--color-gold`                | `#d97706`                 | Ratings, highlights                   |
| `--color-success`             | `#059669`                 | Success states                        |
| `--color-danger`              | `#dc2626`                 | Error states                          |

### Dark — `[data-theme='dark']`

| Token                         | Value                       |
| ----------------------------- | --------------------------- |
| `--color-bg`                  | `#121218`                   |
| `--color-bg-alt`              | `#1a1a24`                   |
| `--color-bg-card`             | `#1e1e2a`                   |
| `--color-bg-card-hover`       | `#252535`                   |
| `--color-surface`             | `#2a2a3a`                   |
| `--color-border`              | `#3a3a4e`                   |
| `--color-border-light`        | `#2e2e42`                   |
| `--color-text`                | `#e8e6f0`                   |
| `--color-text-muted`          | `#a0a0b8`                   |
| `--color-text-dim`            | `#9494b0`                   |
| `--color-accent`              | `#7b6ff0`                   |
| `--color-accent-hover`        | `#9488f5`                   |
| `--color-accent-strong`       | `#5b4fc7`                   |
| `--color-accent-strong-hover` | `#4a3fb0`                   |
| `--color-accent-glow`         | `rgba(123, 111, 240, 0.15)` |
| `--color-accent-soft`         | `rgba(123, 111, 240, 0.1)`  |
| `--color-gold`                | `#f59e0b`                   |
| `--color-success`             | `#10b981`                   |
| `--color-danger`              | `#ef4444`                   |

### High Contrast — `[data-theme='high-contrast']` / `[data-theme='dark-hc']`

| Token                  | Value     |
| ---------------------- | --------- |
| `--color-bg`           | `#000000` |
| `--color-bg-alt`       | `#0a0a0a` |
| `--color-bg-card`      | `#111111` |
| `--color-text`         | `#ffffff` |
| `--color-border`       | `#ffffff` |
| `--color-accent`       | `#ffcc00` |
| `--color-accent-hover` | `#ffe066` |
| `--color-gold`         | `#fbbf24` |
| `--color-success`      | `#34d399` |
| `--color-danger`       | `#f87171` |

### Light High Contrast — `[data-theme='light-hc']`

| Token                  | Value     |
| ---------------------- | --------- |
| `--color-bg`           | `#ffffff` |
| `--color-bg-alt`       | `#f5f5f5` |
| `--color-bg-card`      | `#ffffff` |
| `--color-text`         | `#000000` |
| `--color-border`       | `#000000` |
| `--color-accent`       | `#0000ee` |
| `--color-accent-hover` | `#0000bb` |
| `--color-gold`         | `#b45309` |
| `--color-success`      | `#047857` |
| `--color-danger`       | `#b91c1c` |

---

## Typography

| Role             | Font             | Size                                         | Weight  | Line-height |
| ---------------- | ---------------- | -------------------------------------------- | ------- | ----------- |
| Display headline | Literata (serif) | `clamp(1.75rem, 3.5vw, 2.5rem)`              | 700     | 1.15        |
| Section title    | Literata         | `1.5rem`                                     | 700     | 1.25        |
| Card title       | Literata         | `1.15rem`                                    | 700     | 1.3         |
| Body / Reading   | Literata         | `clamp(1.0625rem, 0.95rem + 0.5vw, 1.25rem)` | 400     | 1.7         |
| UI text          | Inter (sans)     | `1rem`                                       | 400     | 1.6         |
| Small / meta     | Inter            | `0.8rem – 0.85rem`                           | 400–500 | 1.5         |
| Label / badge    | Inter            | `0.7rem`                                     | 600     | 1           |

### Font stacks

```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-serif: "Literata", Georgia, serif;
```

### Accessibility font

OpenDyslexic is bundled (`/fonts/OpenDyslexic-Regular.woff2`, `/fonts/OpenDyslexic-Bold.woff2`) as an opt-in accessibility font for users with dyslexia. It is activated via user preferences in the reading settings.

### Rules

- **Headlines** always use the serif font (`--font-serif`).
- **UI chrome** (buttons, labels, navigation) always uses the sans font (`--font-sans`).
- **Story body text** uses the serif font at reading size with generous line-height (1.7).
- Use `clamp()` for fluid sizing — never fixed `px` for text.
- `font-display: swap` on all custom fonts.
- Google Fonts subsets: `latin`, `latin-ext`.

---

## Spacing Scale (4px base grid)

| Token         | Value     | Pixels |
| ------------- | --------- | ------ |
| `--space-xs`  | `0.25rem` | 4px    |
| `--space-sm`  | `0.5rem`  | 8px    |
| `--space-md`  | `1rem`    | 16px   |
| `--space-lg`  | `1.5rem`  | 24px   |
| `--space-xl`  | `2rem`    | 32px   |
| `--space-2xl` | `3rem`    | 48px   |
| `--space-3xl` | `4rem`    | 64px   |

All spacing must align to the 4px grid. Use the tokens, not arbitrary values.

---

## Border Radius

| Token         | Value             | Usage                  |
| ------------- | ----------------- | ---------------------- |
| `--radius-sm` | `0.1875rem` (3px) | Badges, small elements |
| `--radius-md` | `0.375rem` (6px)  | Cards, buttons         |
| `--radius-lg` | `0.5rem` (8px)    | Featured cards, modals |
| `--radius-xl` | `0.75rem` (12px)  | Large containers       |
| `999px`       | Pill shape        | Genre filters, tags    |

---

## Shadows

| Name          | Light value                   | Dark value                   | Usage                |
| ------------- | ----------------------------- | ---------------------------- | -------------------- |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)`  | `0 1px 3px rgba(0,0,0,0.2)`  | Resting cards        |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | `0 4px 12px rgba(0,0,0,0.3)` | Elevated elements    |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.08)` | `0 8px 24px rgba(0,0,0,0.4)` | Hover states, modals |

---

## Transitions

| Token                 | Value        | Usage                  |
| --------------------- | ------------ | ---------------------- |
| `--transition-fast`   | `150ms ease` | Hover effects, toggles |
| `--transition-normal` | `250ms ease` | Card lifts, expansions |
| `--transition-slow`   | `400ms ease` | Page transitions       |

---

## Layout

| Property               | Value                                            |
| ---------------------- | ------------------------------------------------ |
| Max content width      | `1200px`                                         |
| Page padding (desktop) | `var(--space-xl)` (32px)                         |
| Page padding (mobile)  | `var(--space-md)` (16px)                         |
| Header height          | `56px`, sticky, bottom border                    |
| Section spacing        | `var(--space-3xl)` (64px) between major sections |
| Card grid              | `repeat(auto-fill, minmax(260px, 1fr))`          |

### Responsive Breakpoints

| Name    | Width          | Adjustments                                  |
| ------- | -------------- | -------------------------------------------- |
| Mobile  | ≤ 768px        | Single column, reduced padding, stacked hero |
| Tablet  | 769px – 1024px | 2-column grid                                |
| Desktop | > 1024px       | Full layout, 3–4 column grid                 |

### CSS methodology

- **Grid** for 2D layouts, **Flexbox** for 1D.
- **Container queries** where component-level responsiveness is needed.
- **Fluid units**: `em` / `rem` / `%` / `vw` / `dvh`, `clamp()` / `min()` / `max()` / `minmax()`.
- **Intrinsic sizes**: `min-content` / `max-content` / `fit-content`.
- **Mobile-first** media queries.
- **Logical properties** (`inline-start`, `block-end`, etc.) for RTL readiness.
- **Minimum breakpoints** — prefer fluid sizing over many breakpoints.
- Fixed `px` only when strictly necessary (e.g. icon sizes, borders).

---

## Header Modes

The header is mode-aware. Its width, title content and visibility rules change depending on the active surface. The header hosts three menu surfaces: **LMenu** (logo-triggered left panel, CSS prefix `.lmenu-*`), **HMenu** (horizontal text links, CSS prefix `.hmenu-*`), and **RMenu** (user tile right panel, CSS prefix `.rmenu-*`).

| Mode              | Header width            | Title                     | Search                      |
| ----------------- | ----------------------- | ------------------------- | --------------------------- |
| Browser, Settings | 1200px container        | "reast"                   | "Search stories or authors" |
| Reader            | Full-width, flush edges | Story title + author      | None                        |
| Author            | 1200px container        | Author name               | "Search author's stories"   |
| Group             | 1200px container        | Group name                | "Search stories or authors" |
| Editor, Builder   | Full-width, flush edges | Story name or "New Story" | None                        |

Reader mode hides the header after scrolling past the title (logo remains visible).

---

## Component Patterns

### Story Card

- White card with subtle border, lift on hover (`+shadow`, `-2px translateY`)
- Cover image (140px), body with genre label, serif title, excerpt (2-line clamp), footer meta

### Genre Pill

- Pill shape (`999px` radius), border, transparent background
- Active: accent background, white text
- Hover: accent border

### CTA Button

- `--color-accent-strong` background, white text, medium weight
- Hover: `--color-accent-strong-hover`
- Padding: `var(--space-sm) var(--space-lg)`
- Border radius: `--radius-md`

### Browse Pages (canonical layout)

All browse pages (`/stories`, `/authors`, `/groups`) share a single layout primitive from `apps/web/src/app/shared/browse-page.shared.scss`.

- **Outer canvas** `.browse-page` — full screen width, `clamp()` padding.
- **Inner container** `.browse-inner` — `max-width: 1200px; margin: 0 auto`.
- **Title** `.browse-title` — serif, fluid size, **left-aligned** (never centered).
- **Search** `.browse-search` — slim input with leading magnifier icon, width `min(420px, 100%)`.
- **Grid** `.browse-grid` — `repeat(auto-fill, minmax(min(100%, 22rem), 1fr))`.

### Identity Card (authors, groups)

- Square image left (96px mobile, 120px ≥480px container)
- Name + bio + meta right
- Gradient placeholder with initial until image uploaded

---

## Icons

All SVG icons are defined in `apps/web/src/app/shared/icons.ts` — the single source of truth.

### Specifications

- 24×24 `viewBox`
- Stroke-only (no fill)
- `stroke-width: 1.5`
- `stroke-linecap: round`, `stroke-linejoin: round`
- Modern thin outlined style

### Usage

1. **Inline SVG** — paste the path from `ICONS.<name>` inside an `<svg>` wrapper
2. **Strip / computed** — import `ICONS` and reference path strings directly
3. **RSelectOption** — use `svgIcon: ICONS.<name>`

### Rules

- Never use emoji or Unicode characters as icons (☰, 🌍, ⌨)
- Never use external icon libraries (Material Icons, FontAwesome)
- Always use custom SVG paths from `icons.ts`
- Keep `stroke-width="1.5"` everywhere
- Same entity = same icon everywhere (e.g. Groups = two-person icon, not flag in one place and people in another)
- New icons must follow the same visual weight and style

---

## Accessibility

### Angular CDK (behaviour only)

The project uses `@angular/cdk` for keyboard handling, focus traps, ARIA roles and overlay positioning. `@angular/material` is explicitly **not used**.

| Widget      | CDK module             | Directives                                    |
| ----------- | ---------------------- | --------------------------------------------- |
| Menus       | `@angular/cdk/menu`    | `cdkMenuTriggerFor`, `cdkMenu`, `cdkMenuItem` |
| Dialogs     | `@angular/cdk/dialog`  | Modal surfaces                                |
| Focus traps | `@angular/cdk/a11y`    | `cdkTrapFocus`                                |
| Listboxes   | `@angular/cdk/listbox` | Single-select pickers                         |
| Overlays    | `@angular/cdk/overlay` | Positioning helpers                           |

### Rules

- Always import from specific CDK sub-entries (`@angular/cdk/menu`), never from root
- CDK provides behaviour; all visuals are custom CSS
- Do not hand-roll `role="menu"` / `role="menuitem"` on CDK widgets — CDK emits ARIA roles automatically
- Each interactive widget must use a CDK primitive or document why it cannot

### Theme support

- 5 themes: default, dark, high-contrast (dark-hc), light-hc
- Theme selector in user preferences
- All tokens must work across all themes — test every new component in all 5
- OpenDyslexic font available as opt-in for readers with dyslexia
- WCAG AA contrast minimum on all text/background combinations

---

## Footer Patterns

The footer hosts the **FMenu** (CSS prefix `.fmenu-*`) — a columnar navigation section with Explore, Support and Legal columns.

| Mode                     | Footer content                                                                  |
| ------------------------ | ------------------------------------------------------------------------------- |
| Browser, Settings, Group | Classic: Reast, slogan, explore/support/legal links                             |
| Reader                   | Fixed, low, transparent. "rea.st" right-bottom. Offline/online status indicator |
| Editor, Builder          | Status bar: left = reast (home link), right = support/help/terms                |
| Author                   | Follows Browser pattern                                                         |

---

## Do's and Don'ts

### Do

- Use design tokens (`var(--color-*)`, `var(--space-*)`) everywhere
- Test every component in all 5 themes
- Use `clamp()` for fluid typography and spacing
- Use CSS Grid for page layouts, Flexbox for component internals
- Keep story content as the visual priority — UI recedes
- Use `transition` with design tokens for hover/focus effects
- Provide keyboard navigation for all interactive elements (via CDK)
- Keep text readable: 1.6+ line-height for UI, 1.7 for reading

### Don't

- Don't use hardcoded color values — always use tokens
- Don't use `px` for font sizes — use `rem` with `clamp()`
- Don't import `@angular/material`
- Don't use emoji or Unicode as icons
- Don't center-align browse page titles
- Don't create new card shapes when `.identity-card` fits
- Don't use external icon fonts
- Don't add `role="menu"` manually when using CDK menus
- Don't skip dark/HC theme testing
- Don't use `position: fixed` for headers (use `position: sticky`)
- Don't redesign the search field per page — always slim with leading icon

---

## Developer Checklist

Before submitting a UI change, verify:

- [ ] All colors use `var(--color-*)` tokens
- [ ] Spacing uses `var(--space-*)` tokens on the 4px grid
- [ ] Typography uses the correct font family (serif for headings/reading, sans for UI)
- [ ] Font sizes use `rem` or `clamp()`, not `px`
- [ ] Component renders correctly in all 5 themes (default, dark, high-contrast, dark-hc, light-hc)
- [ ] WCAG AA contrast ratio met for all text/background combinations
- [ ] Interactive elements use Angular CDK primitives for keyboard/ARIA
- [ ] Icons come from `icons.ts`, follow 24×24 stroke-only spec
- [ ] Hover/focus states use design transition tokens
- [ ] Layout uses CSS Grid (2D) or Flexbox (1D), not floats or tables
- [ ] Responsive: tested at mobile (≤768px), tablet (769–1024px), desktop (>1024px)
- [ ] No hardcoded colors, no `@angular/material`, no external icons

---

## File References

| File                                              | Description                                        |
| ------------------------------------------------- | -------------------------------------------------- |
| `apps/web/src/styles.scss`                        | Global CSS custom properties and theme definitions |
| `apps/web/src/styles/animations.scss`             | Shared animation keyframes                         |
| `apps/web/src/styles/buttons.scss`                | Button base styles                                 |
| `apps/web/src/styles/dropdown.scss`               | Dropdown/menu shared styles                        |
| `apps/web/src/app/shared/browse-page.shared.scss` | Browse page canonical layout                       |
| `apps/web/src/app/shared/icons.ts`                | SVG icon path registry                             |
| `docs/design/system.md`                           | Embedded design system (web-app scoped)            |
