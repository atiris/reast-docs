# Dizajn manuál Reast

> Samostatná vývojárska referencia pre vizuálnu identitu Reast. Autoritatívny zdroj pre dizajn tokeny, vzory komponentov a pravidlá ich používania.

---

## Dizajnové princípy

1. **Literárna vrúcnosť** — Teplé neutrály, serifové nadpisy, veľkorysé prázdne miesto evokujú knižnú kultúru.
2. **Obsah na prvom mieste** — Príbehy sú hviezdou; UI ustupuje za obsah.
3. **Konzistentný rytmus** — 4px základná mriežka, modulárna škála, predvídateľné rozostupy.
4. **Prístupný kontrast** — Minimum WCAG AA, jasná textová hierarchia, dostupné kontrastné témy.
5. **Jemné interakcie** — Mierne zdvihnutia pri hoveri, plynulé prechody, žiadne prudké pohyby.
6. **Pripravené pre offline** — Každá čitateľská funkcia funguje bez sieťového pripojenia.
7. **Žiadne externé UI knižnice** — Angular CDK pre správanie; všetky vizuály sú vlastné.

---

## Farebné tokeny

Všetky farby sú CSS custom properties definované v `apps/web/src/styles.scss`. Podporovaných je päť tém: **predvolená (svetlá)**, **tmavá**, **vysoký kontrast**, **tmavá s vysokým kontrastom** a **svetlá s vysokým kontrastom**.

Podrobné tabuľky tokenov nájdete v anglickej verzii tejto stránky — hodnoty sú rovnaké vo všetkých jazykových mutáciách.

---

## Typografia

- **Nadpisy:** `'Playfair Display', serif`
- **Telo:** `'Inter', sans-serif`
- **Kód:** `'JetBrains Mono', monospace`
- Základná veľkosť: `1rem` = `16px`, škála `1.25` (Major Third)

---

## Mriežka a medzery

- Základná jednotka: `4px`
- Bežné hodnoty: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`
- Maximálna šírka obsahu: `1200px`
- Medzery medzi kartami: `16px` (mobilné), `24px` (desktop)
