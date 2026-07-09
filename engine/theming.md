# Theming

The Reast Engine is themed through CSS custom properties, all prefixed `--re-`.
Override them on the `<reast-engine>` element or any ancestor — the values
inherit through the Shadow DOM boundary.

## Two style sheets

The engine ships two adopted stylesheets:

- **`playerStyles`** — structural styles, adopted by **every** element. Its
  colour and typography defaults lean on `inherit`, `currentColor` and
  `transparent`, so an unstyled embed **adopts the host page's look** instead of
  imposing one. A bare `<reast-engine>` inside your app inherits your font,
  colour and background.
- **`standaloneStyles`** — the opinionated reading palette (colours, fonts,
  dark-mode and high-contrast remaps, and the default lightbox overlay). It is
  adopted **only by the standalone CDN build**, on top of `playerStyles`.

So the CDN snippet looks designed out of the box, while an embedded element
looks like part of your site until you theme it.

## Custom properties

"Embedded" is what an unthemed embed gets from `playerStyles`; "Standalone" is
what `standaloneStyles` assigns in the CDN build.

### Layout

| Property | Default | Description |
| --- | --- | --- |
| `--re-max-width` | `42rem` | Maximum content width |
| `--re-padding` | `1.5rem` | Inner padding |

### Colours

| Property | Embedded | Standalone (light) | Description |
| --- | --- | --- | --- |
| `--re-color-bg` | `transparent` | `#faf9f6` | Background |
| `--re-color-text` | `inherit` | `#1f1f2e` | Body text |
| `--re-color-heading` | inherits text | inherits text | Heading colour |
| `--re-color-text-muted` | `inherit` | `#5c5c6e` | Muted/secondary text |
| `--re-color-border` | `currentColor` | `#d4d4d8` | Borders |
| `--re-color-accent` | `currentColor` | `#5b4fc7` | Accent / links |
| `--re-color-accent-hover` | `currentColor` | `#4a3fb0` | Accent hover |
| `--re-color-code-bg` | `currentColor` tint | `rgba(0,0,0,0.06)` | Code background |
| `--re-color-danger` | `#dc2626` | `#dc2626` | Error colour |
| `--re-color-highlight` | translucent yellow | translucent yellow | Highlight-mark background |
| `--re-color-choice-bg` | `transparent` | `rgba(91,79,199,0.06)` | Choice background |
| `--re-color-choice-border` | `currentColor` tint | `rgba(91,79,199,0.2)` | Choice border |
| `--re-color-choice-bg-hover` | `currentColor` tint | `rgba(91,79,199,0.12)` | Choice hover background |

### Typography

| Property | Embedded | Standalone | Description |
| --- | --- | --- | --- |
| `--re-font-body` | `inherit` | `'Literata', Georgia, serif` | Body font stack |
| `--re-font-heading` | inherits body | inherits body | Heading font stack |
| `--re-font-mono` | `monospace` | `'Fira Code', monospace` | Monospace font |
| `--re-font-size` | `inherit` | `clamp(1.0625rem, …, 1.25rem)` | Base font size |
| `--re-line-height` | `inherit` | `1.7` | Body line height |
| `--re-h1-size` … `--re-h5-size` | `2em`–`1em` | same | Heading sizes |

### Spacing & shape

| Property | Default | Description |
| --- | --- | --- |
| `--re-paragraph-spacing` | `1em` | Space between paragraphs |
| `--re-heading-margin` | `1.5em 0.5em` | Heading block margin |
| `--re-hr-margin` | `2em` | Horizontal-rule margin |
| `--re-choice-gap` | `0.5em` | Gap between choices |
| `--re-choice-radius` | `6px` | Choice border radius |
| `--re-choice-padding` | `0.75em 1em` | Choice inner padding |
| `--re-media-radius` | `6px` | Media border radius |
| `--re-transition-speed` | `0.2s` | Global transition speed (`0s` under reduced-motion) |

### Standalone-only remaps

The CDN build's `standaloneStyles` also defines `--re-dark-*` values applied
under `@media (prefers-color-scheme: dark)` and `--re-hc-*` values applied under
`@media (prefers-contrast: more)`. An embedded element does **not** ship these —
a host that wants dark mode sets `--re-color-*` itself (typically inheriting
from its own theme), which is usually what you want, since the embed already
adopts the host's colours.

## Example: dark embed

Because the embedded defaults inherit, the simplest dark theme is to let the
element inherit a dark host, or set a few properties:

```css
reast-engine {
  --re-color-bg: #1a1a2e;
  --re-color-text: #e0e0e0;
  --re-color-accent: #a78bfa;
  --re-color-accent-hover: #8b6ff0;
  --re-color-border: #374151;
}
```

## Example: minimal reader

```css
reast-engine {
  --re-font-body: 'Literata', serif;
  --re-font-size: 1.25rem;
  --re-line-height: 1.8;
  --re-max-width: 55ch;
  --re-paragraph-spacing: 2em;
}
```

## Escape hatch: `extraStyleSheets`

For rules that CSS custom properties cannot express, push a `CSSStyleSheet`
onto `ReastEngine.extraStyleSheets` **before** constructing any element — it is
adopted into every element's shadow root after `playerStyles`. Already-created
instances are not retrofitted. (This is exactly how the standalone build adds
`standaloneStyles`.)

```ts
import { ReastEngine, registerEngine } from '@reast/engine/player';

const sheet = new CSSStyleSheet();
sheet.replaceSync(`.re-choice { text-transform: uppercase; }`);
ReastEngine.extraStyleSheets.push(sheet);

registerEngine();
```

## Shadow DOM boundary

The player renders inside Shadow DOM, so host page styles do not leak in and
story styles do not leak out. Custom properties and `extraStyleSheets` are the
supported ways across the boundary; the element also exposes `part` attributes
(`identity`, `identity-title`, `identity-authors`) for `::part()` styling.
