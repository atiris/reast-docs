# Reast Design System

A design system for the Reast interactive story platform, inspired by modern book/reading platforms (Wattpad, Literal.club, Martinus.sk, Goodreads).

## Design Principles

1. **Literary warmth** — Warm neutrals, serif headlines, generous whitespace evoke book culture
2. **Content-first** — Stories are the star; UI recedes behind content
3. **Consistent rhythm** — 4px base grid, modular scale, predictable spacing
4. **Accessible contrast** — WCAG AA minimum, clear text hierarchy
5. **Subtle interactions** — Gentle hover lifts, smooth transitions, no jarring movements

## Color Palette

| Token                   | Value                  | Usage                           |
| ----------------------- | ---------------------- | ------------------------------- |
| `--color-bg`            | `#faf9f6`              | Page background (warm white)    |
| `--color-bg-alt`        | `#f3f1ec`              | Section backgrounds (warm gray) |
| `--color-bg-card`       | `#ffffff`              | Card surfaces                   |
| `--color-bg-card-hover` | `#fdfcfa`              | Card hover state                |
| `--color-surface`       | `#edeae4`              | Inputs, wells                   |
| `--color-border`        | `#ddd9d1`              | Primary borders                 |
| `--color-border-light`  | `#e8e5de`              | Subtle borders                  |
| `--color-text`          | `#1f1f2e`              | Primary text (near-black, warm) |
| `--color-text-muted`    | `#5c5c6e`              | Secondary text                  |
| `--color-text-dim`      | `#8e8e9e`              | Tertiary / meta text            |
| `--color-accent`        | `#5b4fc7`              | Interactive elements (indigo)   |
| `--color-accent-hover`  | `#4a3fb0`              | Hover state                     |
| `--color-accent-glow`   | `rgba(91,79,199,0.12)` | Focus rings, glows              |
| `--color-accent-soft`   | `rgba(91,79,199,0.08)` | Subtle accent backgrounds       |
| `--color-gold`          | `#d97706`              | Ratings, highlights             |
| `--color-success`       | `#059669`              | Success states                  |
| `--color-danger`        | `#dc2626`              | Error states                    |

## Typography

| Role             | Font     | Size                                       | Weight  | Line-height |
| ---------------- | -------- | ------------------------------------------ | ------- | ----------- |
| Display headline | Literata | clamp(1.75rem, 3.5vw, 2.5rem)              | 700     | 1.15        |
| Section title    | Literata | 1.5rem                                     | 700     | 1.25        |
| Card title       | Literata | 1.15rem                                    | 700     | 1.3         |
| Body / Reading   | Literata | clamp(1.0625rem, 0.95rem + 0.5vw, 1.25rem) | 400     | 1.7         |
| UI text          | Inter    | 1rem                                       | 400     | 1.6         |
| Small / meta     | Inter    | 0.8rem - 0.85rem                           | 400-500 | 1.5         |
| Label / badge    | Inter    | 0.7rem                                     | 600     | 1           |

**Font loading**: Google Fonts with `display=swap`. Subset: latin, latin-ext.

## Spacing Scale (4px grid)

| Token         | Value   | Pixels |
| ------------- | ------- | ------ |
| `--space-xs`  | 0.25rem | 4px    |
| `--space-sm`  | 0.5rem  | 8px    |
| `--space-md`  | 1rem    | 16px   |
| `--space-lg`  | 1.5rem  | 24px   |
| `--space-xl`  | 2rem    | 32px   |
| `--space-2xl` | 3rem    | 48px   |
| `--space-3xl` | 4rem    | 64px   |

## Border Radius

| Token         | Value           | Usage                  |
| ------------- | --------------- | ---------------------- |
| `--radius-sm` | 0.1875rem (3px) | Badges, small elements |
| `--radius-md` | 0.375rem (6px)  | Cards, buttons         |
| `--radius-lg` | 0.5rem (8px)    | Featured cards, modals |
| `--radius-xl` | 0.75rem (12px)  | Large containers       |
| `999px`       | Pill shape      | Genre filters, tags    |

## Shadows

| Name          | Value                         | Usage                |
| ------------- | ----------------------------- | -------------------- |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)`  | Resting cards        |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | Elevated elements    |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.08)` | Hover states, modals |

## Transitions

| Token                 | Value      | Usage                  |
| --------------------- | ---------- | ---------------------- |
| `--transition-fast`   | 150ms ease | Hover effects, toggles |
| `--transition-normal` | 250ms ease | Card lifts, expansions |
| `--transition-slow`   | 400ms ease | Page transitions       |

## Layout

- **Max content width**: 1200px
- **Page padding**: `var(--space-xl)` (32px desktop), `var(--space-md)` (16px mobile)
- **Header height**: 56px, sticky, white with bottom border
- **Section spacing**: `var(--space-3xl)` (64px) between major sections
- **Grid**: CSS Grid with `auto-fill, minmax(260px, 1fr)` for story cards

## Components

### Header

- Sticky, white background, bottom border
- Logo (SVG + wordmark) left, nav links right
- Nav links: muted text, accent on hover/active

### Story Card

- White card with subtle border, lift on hover (+shadow, -2px translateY)
- Cover image (140px), body with genre label, serif title, excerpt (2-line clamp), footer meta

### Genre Pill

- Pill shape (999px radius), border, transparent bg
- Active: accent bg, white text
- Hover: accent border

### Featured Card

- Larger card in hero section, same patterns as story card but bigger

### CTA Button

- Accent background, white text, medium weight
- Hover: darker accent
- Padding: `var(--space-sm) var(--space-lg)`

## Responsive Breakpoints

| Name    | Width          | Adjustments                                  |
| ------- | -------------- | -------------------------------------------- |
| Mobile  | ≤ 768px        | Single column, reduced padding, stacked hero |
| Tablet  | 769px - 1024px | 2-column grid                                |
| Desktop | > 1024px       | Full layout, 3-4 column grid                 |

## Accessibility primitives via Angular CDK

The Angular Material _components_ package is intentionally **not** used. The
project consumes only `@angular/cdk` so we keep ownership of every visual
detail (border radius, colour, spacing, motion) while delegating
keyboard, focus and ARIA contracts to a battle-tested upstream — the
strategy that `research/rea/angular-cdk-adoption.md` (§1–§4, §7) settled on.

### Adoption rules

- **Sub-entry imports only.** Always import from a specific CDK sub-entry
  (e.g. `@angular/cdk/menu`, `@angular/cdk/dialog`, `@angular/cdk/a11y`,
  `@angular/cdk/listbox`, `@angular/cdk/overlay`). Never re-export from
  `@angular/cdk` root and never reach for `@angular/material`.
- **Behaviour from CDK, visuals from us.** CDK provides the keyboard
  handling, focus traps, ARIA roles and overlay positioning. The existing
  CSS class hooks (`dropdown-panel`, `dropdown-item`, …) stay; CDK
  attaches its directives to the same elements without changing the
  rendered DOM.
- **No hand-rolled `role="menu" / role="menuitem"` on a CDK widget.** CDK
  emits the correct ARIA roles automatically. Manual roles are only
  acceptable on widgets that have a justified reason not to use a CDK
  primitive.
- **Each interactive widget needs either a full CDK primitive or a
  documented hybrid.** "Hybrid" means CDK directive + custom DOM with a
  one-line comment explaining why the upstream component cannot be used
  as-is.

### Current state

| Widget                         | Module                 | Notes                                             |
| ------------------------------ | ---------------------- | ------------------------------------------------- |
| Header user menu               | `@angular/cdk/menu`    | `cdkMenuTriggerFor`, `cdkMenu`, `cdkMenuItem`.    |
| Header theme-mode menu         | `@angular/cdk/menu`    | `cdkMenu`, `cdkMenuItem`, `cdkMenuItemTriggered`. |
| Story / dialog overlays        | `@angular/cdk/dialog`  | Most modal surfaces (15 references).              |
| Focus trap on transient panels | `@angular/cdk/a11y`    | `cdkTrapFocus`, used by the theme picker.         |
| Listbox-style pickers          | `@angular/cdk/listbox` | Single-select scenarios.                          |
| Custom overlays                | `@angular/cdk/overlay` | Positioning helpers for non-dialog popovers.      |

### Pending CDK migrations

- **Mobile navigation drawer** is still imperative. Move it onto
  `@angular/cdk/dialog` to inherit focus restoration and scroll lock.
- **Search command palette** would benefit from `@angular/cdk/listbox`
  for keyboard navigation parity with the rest of the menu surfaces.

## Browse pages (canonical layout)

The `/stories`, `/authors`, and `/groups` browse pages share a single layout primitive so users see the same shape and behaviour everywhere. Implementation lives in `apps/web/src/app/shared/browse-page.shared.scss`; consumer components `@use` the partial and add only page-specific tweaks (filter pills, sort buttons, card variants).

### Wrapper

- **Outer canvas** `.browse-page` — full screen width, padding `clamp(1.25rem, 3vw, 2.5rem)` block / `clamp(1rem, 3vw, 1.5rem)` inline. Mobile content never touches the screen edge.
- **Inner container** `.browse-inner` — `max-width: 1200px; margin: 0 auto;`. Wide-screen content stays readable without going full-bleed.

### Header

- **Title** `.browse-title` — serif, `clamp(1.5rem, 1.25rem + 1.5vw, 2.25rem)`, **left-aligned** (`text-align: start`). Centered titles are forbidden on browse pages.
- **Subtitle** `.browse-subtitle` — single sentence, muted text, left-aligned.
- **Search** `.browse-search` — slim input with a leading magnifier icon (`.browse-search-icon` absolute at left 12px, `.browse-search-input` padding-left 36px). Width `min(420px, 100%)`. Focus ring uses `--color-accent-glow`.

### Card grid

- **Grid** `.browse-grid` — `grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr))`, gap `--space-md`.
- **Identity card** `.identity-card` (used by `/authors`, `/groups`) — square image left (96px mobile, 120px ≥480px container), name + bio + meta right. Image is a gradient placeholder with the entity initial until an image is uploaded; the language overlay sits in the bottom-right corner of the image once languages are wired into the data model.

### Don'ts

- Do not center-align the title.
- Do not redesign the search field per page (always slim with a leading icon).
- Do not narrow the inner container below 1200px (groups previously used 960px — fixed).
- Do not invent new card shapes for entities that fit `.identity-card` — extend it instead.

## Icons

All SVG icons are defined in `src/app/shared/icons.ts` — the single source of truth.

**Design**: 24×24 viewBox, stroke-only (no fill), `stroke-width: 1.5`, `stroke-linecap: round`, `stroke-linejoin: round`. Modern thin outlined style.

**Usage patterns**:

- **Inline SVG** — paste the path from `ICONS.<name>` inside a `<svg>` wrapper with the standard attributes.
- **Strip / computed** — import `ICONS` and reference path strings directly (header.ts `stripItems`).
- **RSelectOption** — use `svgIcon: ICONS.<name>` for list-based navigation.

**Rules**:

- Never use emoji or unicode characters as icons (☰, 🌍, ⌨, etc.) — always SVG.
- Never use external icon libraries (Material Icons, FontAwesome, etc.) — use custom paths.
- Keep `stroke-width="1.5"` for all icons (thinner = modern look, weight ~200).
- The same entity must use the same icon everywhere (e.g. Groups = two-person icon, not flag in one place and people in another).
