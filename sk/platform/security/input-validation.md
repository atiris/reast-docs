# Validácia vstupov

Všetky užívateľské vstupy vstupujúce do API sú validované cez viaceré vrstvy pred dosiahnutím business logiky.

## Vrstva 1: Limity veľkosti požiadaviek

| Content-Type                        | Limit |
| ----------------------------------- | ----- |
| `application/json` (predvolený)     | 1 MB  |
| `application/csp-report`            | 10 KB |
| `application/reports+json`          | 10 KB |
| `application/x-www-form-urlencoded` | 1 MB  |

Požiadavky presahujúce tieto limity sú odmietnuté s HTTP 413 pred akýmkoľvek parsovaním.

## Vrstva 2: Globálny ValidationPipe

Aplikovaný globálne:

```typescript
new ValidationPipe({
  whitelist: true, // Odstráni neznáme vlastnosti
  transform: true, // Auto-transformácia primitív na DTO typy
  forbidNonWhitelisted: true, // Odmietne požiadavky s neznámymi vlastnosťami (400)
});
```

Každý parameter controller metódy dekorovaný `@Body()` je validovaný oproti svojej DTO triede.

## Vrstva 3: Vlastné Pipes

- **ParseSlugPipe** — Validuje slugy (alfanumerické + pomlčky), odmietne traversáciu ciest
- **ParseUuidPipe** — Validuje UUID formát, zabraňuje traversácii k autentifikačnej platforme

## Vrstva 4: Business logika

Dodatočné kontroly špecifické pre doménu (napr. kontrola vlastníctva, kvóty, duplicity) na úrovni služieb.

Podrobná technická dokumentácia je v [anglickej verzii](/platform/security/input-validation).
