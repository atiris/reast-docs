# Prispievanie do Reast

Vítame príspevky do platformy Reast! Tento návod vysvetľuje ako sa zapojiť.

## Spôsoby prispievania

- **Nahlasujte chyby** — Otvorte issue s popisom problému, krokmi na reprodukciu a očakávaným správaním
- **Navrhujte funkcie** — Popíšte prípad použitia a prečo by to prospelo čitateľom alebo autorom
- **Vylepšujte dokumentáciu** — Opravujte preklepy, spresňujte vysvetlenia, pridávajte príklady
- **Píšte REA príbehy** — Vytvárajte ukážkové príbehy demonštrujúce funkcie jazyka
- **Prispievajte kódom** — Opravujte chyby, implementujte funkcie, vylepšujte testy

## Vývojové prostredie

1. **Klonovanie so submodulmi:**

   ```bash
   git clone --recurse-submodules https://github.com/atiris/reast.git
   cd reast
   ```

2. **Inštalácia závislostí:**

   ```bash
   npm install
   cd modules/player && npm install
   cd ../platform && npm install
   ```

3. **Spustenie vývojového stacku:**

   ```bash
   npx reast start
   ```

4. **Aplikovanie zmien do bežiacich kontajnerov:**

   ```bash
   npx reast apply
   ```

## Štruktúra projektu

| Oblasť        | Umiestnenie                  | Čo obsahuje                      |
| ------------- | ---------------------------- | -------------------------------- |
| Platform API  | `modules/platform/apps/api/` | NestJS REST backend              |
| Platform Web  | `modules/platform/apps/web/` | Angular PWA frontend             |
| Player Engine | `modules/player/`            | REA parser, runtime, komponent   |
| Dokumentácia  | `modules/docs/`              | Táto dokumentačná stránka        |
| CLI nástroj   | `cli/`                       | `reast` rozhranie príkaz. riadku |

## Pravidlá kódu

- **Jazyk**: Všetok kód, komentáre a commit správy v angličtine
- **Štýl**: Dodržiavajte existujúce vzory; ESLint vynucuje konzistentnosť
- **Typy**: TypeScript strict mode — žiadne `any`, žiadne nekontrolované assertions
- **Testy**: Každá funkcia alebo oprava musí obsahovať testy
- **Bezpečnosť**: Validujte vstupy, sanitizujte výstupy, dodržiavajte OWASP pokyny
- **Prístupnosť**: Všetky UI musia byť navigovateľné klávesnicou s príslušnými ARIA atribútmi

## Formát commit správ

Používajte konvenčný formát commitov:

```text
feat: add timer command to REA language
fix: correct choice rendering in RTL mode
docs: update player embedding guide
test: add parser fuzz tests for nested commands
```

## Proces pull requestov

1. Vytvorte feature branch z `main`
2. Robte zamerané, atomické commity
3. Uistite sa, že všetky testy prechádzajú: `npm test`
4. Uistite sa, že nie sú lint chyby: `npm run lint`
5. Otvorte PR s jasným popisom zmien
6. Adresujte spätnú väzbu z code review
