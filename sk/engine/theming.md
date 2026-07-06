# Témy

Reast Engine používa CSS custom properties pre vizuálne prispôsobenie. Prepíšte ich na elemente `<reast-engine>` alebo na ľubovoľnom predkovi.

## Dostupné vlastnosti

### Typografia

| Vlastnosť              | Predvolená hodnota                  | Popis                  |
| ---------------------- | ----------------------------------- | ---------------------- |
| `--reast-font-body`    | `Georgia, 'Times New Roman', serif` | Font tela textu        |
| `--reast-font-heading` | `inherit`                           | Font nadpisov          |
| `--reast-font-mono`    | `'Courier New', monospace`          | Font kódu/raw blokov   |
| `--reast-font-size`    | `1.125rem`                          | Základná veľkosť fontu |
| `--reast-line-height`  | `1.7`                               | Základná výška riadku  |

### Farby

| Vlastnosť                    | Predvolená (svetlá) | Popis                           |
| ---------------------------- | ------------------- | ------------------------------- |
| `--reast-color-text`         | `#1a1a2e`           | Primárna farba textu            |
| `--reast-color-bg`           | `#ffffff`           | Farba pozadia                   |
| `--reast-color-accent`       | `#6c5ce7`           | Akcentová farba (voľby, odkazy) |
| `--reast-color-accent-hover` | `#5a4bd4`           | Stav pri hoveri akcentu         |
| `--reast-color-muted`        | `#6b7280`           | Sekundárny/stlmený text         |
| `--reast-color-border`       | `#e5e7eb`           | Farba okrajov                   |

### Medzery

| Vlastnosť                | Predvolená | Popis                           |
| ------------------------ | ---------- | ------------------------------- |
| `--reast-spacing-block`  | `1.5em`    | Vertikálna medzera medzi blokmi |
| `--reast-spacing-inline` | `1em`      | Horizontálne odsadenie          |
| `--reast-max-width`      | `65ch`     | Maximálna šírka obsahu          |

### Voľby

| Vlastnosť                | Predvolená      | Popis                          |
| ------------------------ | --------------- | ------------------------------ |
| `--reast-choice-radius`  | `0.5rem`        | Border radius tlačidiel volieb |
| `--reast-choice-padding` | `0.75em 1.25em` | Padding tlačidiel volieb       |

## Príklad: Tmavá téma

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

## Príklad: Minimálny čitateľ

```css
reast-engine {
  --reast-font-body: 'Literata', serif;
  --reast-font-size: 1.25rem;
  --reast-line-height: 1.8;
  --reast-max-width: 55ch;
  --reast-spacing-block: 2em;
}
```

## Automatický tmavý režim

Player štandardne rešpektuje `prefers-color-scheme`. Pre vynútenie konkrétnej témy nastavte vlastnosti explicitne na elemente.

## Shadow DOM hranica

Player vykresľuje obsah vnútri Shadow DOM, takže štýly vašej stránky doň nepreniknú. Jediný spôsob prispôsobenia vzhľadu je cez tieto CSS custom properties. To zaručuje vizuálnu konzistenciu bez ohľadu na štýly hostiteľskej stránky.
