# Systém agregácie dokumentácie — Dizajn

## Prehľad

Dokumentačná stránka `docs.rea.st` agreguje obsah z dvoch typov zdrojov do jednotnej VitePress stránky servovanej z repozitára `reast-docs`. **Natívny obsah** (špecifikácia jazyka Rea a dokumentácia playera) žije priamo v reast-docs repozitári. **Synchronizovaný obsah** (dokumentácia platformy) sa sťahuje z repozitára reast-platform počas CI buildov.

## Architektúra

```text
┌─────────────────────────────────────────────────────────┐
│                     docs.rea.st                         │
│                  (reast-docs repo)                      │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │  /spec/     │  │  /player/    │  │  /platform/   │   │
│  │  /guides/   │  │  embedding   │  │  /deployment/ │   │
│  │  Rea jazyk  │  │  theming     │  │  architektúra │   │
│  │  (natívny)  │  │  API ref     │  │  bezpečnosť   │   │
│  │             │  │  (natívny)   │  │  (sync.)      │   │
│  └─────────────┘  └──────────────┘  └───────────────┘   │
│                                                         │
│       VitePress + vyhľadávanie + navigácia              │
└─────────────────────────────────────────────────────────┘
        │                   │                 ▲
        │ natívny           │ natívny         │ synchr.
        │                   │                 │
   reast-docs          reast-docs        reast-platform
                                          docs/ (verejné)
```

## Zdroje obsahu

### 1. Rea jazykové dokumenty (natívne v reast-docs)

Už v repozitári pod `spec/`. Toto je primárny obsah.

- `/spec/` — Špecifikácia jazyka Rea (5 kapitol + ťahák)
- `/guides/` — Tutoriály a návody (budúcnosť)

### 2. Dokumentácia playera (natívna v reast-docs)

Dokumentácia playera žije natívne v reast-docs, pretože player (webový komponent, CDN bundle, embedding API) je základnou súčasťou ekosystému Rea — jeho dokumentácia patrí k špecifikácii jazyka, nie skrytá v zdrojovom kóde enginu.

- `/player/getting-started` — Rýchle CDN nastavenie
- `/player/embedding` — npm, integrácia do frameworkov
- `/player/theming` — CSS custom properties
- `/player/api` — Atribúty, udalosti, JS API

### 3. Dokumentácia platformy (synchronizovaná z reast-platform — iba verejná)

Zdroj: `reast-platform/docs/` (iba verejná dokumentácia)

Synchronizované do: `reast-docs/platform/`

- `/platform/architecture/` — Systémová architektúra
- `/platform/deployment/` — Návody na nasadenie
- `/platform/security/` — Bezpečnostná dokumentácia
- `/platform/design/` — Dizajn systém

**Interná dokumentácia platformy** (implementačné detaily, interné API, admin návody) NIE JE synchronizovaná do reast-docs. Zostáva v reast-platform a je servovaná iba autentifikovaným administrátorom cez admin panel platformy.
