# Theming

The Reast Engine uses CSS custom properties for visual customisation. Override them on the `<reast-engine>` element or any ancestor.

## Available Properties

### Typography

| Property               | Default                             | Description           |
| ---------------------- | ----------------------------------- | --------------------- |
| `--reast-font-body`    | `Georgia, 'Times New Roman', serif` | Body text font family |
| `--reast-font-heading` | `inherit`                           | Heading font family   |
| `--reast-font-mono`    | `'Courier New', monospace`          | Code/raw block font   |
| `--reast-font-size`    | `1.125rem`                          | Base font size        |
| `--reast-line-height`  | `1.7`                               | Base line height      |

### Colours

| Property                     | Default (light) | Description                    |
| ---------------------------- | --------------- | ------------------------------ |
| `--reast-color-text`         | `#1a1a2e`       | Primary text colour            |
| `--reast-color-bg`           | `#ffffff`       | Background colour              |
| `--reast-color-accent`       | `#6c5ce7`       | Accent colour (choices, links) |
| `--reast-color-accent-hover` | `#5a4bd4`       | Accent hover state             |
| `--reast-color-muted`        | `#6b7280`       | Secondary/muted text           |
| `--reast-color-border`       | `#e5e7eb`       | Border colour                  |

### Spacing

| Property                 | Default | Description                 |
| ------------------------ | ------- | --------------------------- |
| `--reast-spacing-block`  | `1.5em` | Vertical gap between blocks |
| `--reast-spacing-inline` | `1em`   | Horizontal padding          |
| `--reast-max-width`      | `65ch`  | Maximum content width       |

### Choices

| Property                 | Default         | Description                 |
| ------------------------ | --------------- | --------------------------- |
| `--reast-choice-radius`  | `0.5rem`        | Choice button border radius |
| `--reast-choice-padding` | `0.75em 1.25em` | Choice button padding       |

## Example: Dark Theme

```css
reast-engine {
  --reast-color-text: #e0e0e0;
  --reast-color-bg: #1a1a2e;
  --reast-color-accent: #a78bfa;
  --reast-color-accent-hover: #8b6ff0;
  --reast-color-muted: #9ca3af;
  --reast-color-border: #374151;
}
```

## Example: Minimal Reader

```css
reast-engine {
  --reast-font-body: 'Literata', serif;
  --reast-font-size: 1.25rem;
  --reast-line-height: 1.8;
  --reast-max-width: 55ch;
  --reast-spacing-block: 2em;
}
```

## Automatic Dark Mode

The player respects `prefers-color-scheme` by default. To force a specific theme, set the properties explicitly on the element.

## Shadow DOM Boundary

The player renders inside Shadow DOM, so your page styles do not leak in. The only way to customise appearance is through these CSS custom properties. This guarantees visual consistency regardless of the host page's stylesheet.
