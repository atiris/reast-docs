# Dizajn systém Reast

Dizajn systém pre interaktívnu príbehovú platformu Reast, inšpirovaný modernými knižnými/čitateľskými platformami (Wattpad, Literal.club, Martinus.sk, Goodreads).

## Dizajnové princípy

1. **Literárna vrúcnosť** — Teplé neutrály, serifové nadpisy, veľkorysé prázdne miesto evokujú knižnú kultúru
2. **Obsah na prvom mieste** — Príbehy sú hviezdou; UI ustupuje za obsah
3. **Konzistentný rytmus** — 4px základná mriežka, modulárna škála, predvídateľné rozostupy
4. **Prístupný kontrast** — Minimum WCAG AA, jasná textová hierarchia
5. **Jemné interakcie** — Mierne zdvihnutia pri hoveri, plynulé prechody, žiadne prudké pohyby

## Farebná paleta

Podrobné tabuľky farebných tokenov nájdete v [anglickej verzii](/platform/design/system). Hodnoty CSS custom properties sú identické vo všetkých jazykových mutáciách.

## Typografia

| Použitie | Font                          | Váha    |
| -------- | ----------------------------- | ------- |
| Nadpisy  | `'Playfair Display', serif`   | 600–700 |
| Telo     | `'Inter', sans-serif`         | 400–500 |
| Kód      | `'JetBrains Mono', monospace` | 400     |

## Mriežka

- Základná jednotka: `4px`
- Modular scale: `1.25` (Major Third)
- Max šírka obsahu: `1200px`

## Komponenty

Všetky vizuálne komponenty sú vlastné (žiadne externé UI knižnice). Angular CDK poskytuje iba behaviorálne primitívy (overlays, focus trap, a11y).

Podrobná dokumentácia komponentov je v [anglickej verzii](/platform/design/system).
