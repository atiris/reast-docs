# Témy

Reast Engine sa témuje cez CSS custom properties, všetky s prefixom `--re-`.
Prepíšte ich na elemente `<reast-engine>` alebo na ľubovoľnom predkovi — hodnoty
sa dedia cez hranicu Shadow DOM.

## Dva štýlové zošity

Engine dodáva dva adoptované stylesheety:

- **`playerStyles`** — štrukturálne štýly, adoptované **každým** elementom. Jeho
  predvolené farby a typografia sa opierajú o `inherit`, `currentColor` a
  `transparent`, takže nenaštýlovaný embed **prevezme vzhľad hostiteľskej
  stránky** namiesto toho, aby vnucoval vlastný. Holý `<reast-engine>` vo vašej
  aplikácii zdedí váš font, farbu aj pozadie.
- **`standaloneStyles`** — vyhranená čitateľská paleta (farby, fonty, remapy pre
  dark mode a vysoký kontrast a predvolený lightbox overlay). Adoptuje ju
  **iba standalone CDN build**, navrch `playerStyles`.

Takže CDN snippet vyzerá navrhnuto hneď po vybalení, kým embedovaný element
vyzerá ako súčasť vášho webu, kým si ho nenaštýlujete.

## Custom properties

„Embedded" je to, čo nenaštýlovaný embed dostane z `playerStyles`; „Standalone"
je to, čo `standaloneStyles` priradí v CDN builde.

### Rozloženie

| Vlastnosť | Predvolená | Popis |
| --- | --- | --- |
| `--re-max-width` | `42rem` | Maximálna šírka obsahu |
| `--re-padding` | `1.5rem` | Vnútorné odsadenie |

### Farby

| Vlastnosť | Embedded | Standalone (svetlá) | Popis |
| --- | --- | --- | --- |
| `--re-color-bg` | `transparent` | `#faf9f6` | Pozadie |
| `--re-color-text` | `inherit` | `#1f1f2e` | Text tela |
| `--re-color-heading` | dedí text | dedí text | Farba nadpisov |
| `--re-color-text-muted` | `inherit` | `#5c5c6e` | Stlmený/sekundárny text |
| `--re-color-border` | `currentColor` | `#d4d4d8` | Okraje |
| `--re-color-accent` | `currentColor` | `#5b4fc7` | Akcent / odkazy |
| `--re-color-accent-hover` | `currentColor` | `#4a3fb0` | Akcent pri hoveri |
| `--re-color-code-bg` | tint `currentColor` | `rgba(0,0,0,0.06)` | Pozadie kódu |
| `--re-color-danger` | `#dc2626` | `#dc2626` | Farba chyby |
| `--re-color-highlight` | priesvitná žltá | priesvitná žltá | Pozadie zvýrazňovacej značky |
| `--re-color-choice-bg` | `transparent` | `rgba(91,79,199,0.06)` | Pozadie voľby |
| `--re-color-choice-border` | tint `currentColor` | `rgba(91,79,199,0.2)` | Okraj voľby |
| `--re-color-choice-bg-hover` | tint `currentColor` | `rgba(91,79,199,0.12)` | Pozadie voľby pri hoveri |

### Typografia

| Vlastnosť | Embedded | Standalone | Popis |
| --- | --- | --- | --- |
| `--re-font-body` | `inherit` | `'Literata', Georgia, serif` | Font tela |
| `--re-font-heading` | dedí telo | dedí telo | Font nadpisov |
| `--re-font-mono` | `monospace` | `'Fira Code', monospace` | Monospace font |
| `--re-font-size` | `inherit` | `clamp(1.0625rem, …, 1.25rem)` | Základná veľkosť fontu |
| `--re-line-height` | `inherit` | `1.7` | Výška riadku tela |
| `--re-h1-size` … `--re-h5-size` | `2em`–`1em` | rovnaké | Veľkosti nadpisov |

### Medzery a tvar

| Vlastnosť | Predvolená | Popis |
| --- | --- | --- |
| `--re-paragraph-spacing` | `1em` | Medzera medzi odsekmi |
| `--re-heading-margin` | `1.5em 0.5em` | Margin bloku nadpisu |
| `--re-hr-margin` | `2em` | Margin horizontálnej čiary |
| `--re-choice-gap` | `0.5em` | Medzera medzi voľbami |
| `--re-choice-radius` | `6px` | Border radius volieb |
| `--re-choice-padding` | `0.75em 1em` | Vnútorné odsadenie volieb |
| `--re-media-radius` | `6px` | Border radius médií |
| `--re-transition-speed` | `0.2s` | Globálna rýchlosť prechodov (`0s` pri reduced-motion) |

### Remapy len pre standalone

`standaloneStyles` CDN buildu tiež definuje hodnoty `--re-dark-*` aplikované pod
`@media (prefers-color-scheme: dark)` a hodnoty `--re-hc-*` aplikované pod
`@media (prefers-contrast: more)`. Embedovaný element ich **nedodáva** —
hostiteľ, ktorý chce dark mode, nastaví `--re-color-*` sám (zvyčajne dedením z
vlastnej témy), čo je aj tak zvyčajne to, čo chcete, keďže embed už prevzal
farby hostiteľa.

## Príklad: tmavý embed

Keďže embedované predvolené hodnoty dedia, najjednoduchšia tmavá téma je nechať
element zdediť tmavého hostiteľa, alebo nastaviť pár vlastností:

```css
reast-engine {
  --re-color-bg: #1a1a2e;
  --re-color-text: #e0e0e0;
  --re-color-accent: #a78bfa;
  --re-color-accent-hover: #8b6ff0;
  --re-color-border: #374151;
}
```

## Príklad: minimálny čitateľ

```css
reast-engine {
  --re-font-body: 'Literata', serif;
  --re-font-size: 1.25rem;
  --re-line-height: 1.8;
  --re-max-width: 55ch;
  --re-paragraph-spacing: 2em;
}
```

## Núdzový východ: `extraStyleSheets`

Pre pravidlá, ktoré CSS custom properties nevyjadria, vložte `CSSStyleSheet` do
`ReastEngine.extraStyleSheets` **pred** vytvorením akéhokoľvek elementu — adoptuje
sa do shadow rootu každého elementu za `playerStyles`. Už vytvorené inštancie sa
dodatočne neupravia. (Presne takto standalone build pridáva `standaloneStyles`.)

```ts
import { ReastEngine, registerEngine } from '@reast/engine/player';

const sheet = new CSSStyleSheet();
sheet.replaceSync(`.re-choice { text-transform: uppercase; }`);
ReastEngine.extraStyleSheets.push(sheet);

registerEngine();
```

## Hranica Shadow DOM

Player vykresľuje obsah vnútri Shadow DOM, takže štýly hostiteľskej stránky doň
nepreniknú a štýly príbehu von. Custom properties a `extraStyleSheets` sú
podporované spôsoby cez hranicu; element navyše vystavuje atribúty `part`
(`identity`, `identity-title`, `identity-authors`) pre štýlovanie cez
`::part()`.
