# Prispôsobenie tém autentifikačnej platformy

Návod na prispôsobenie prihlasovacích tém platformy Reast.

---

## Štruktúra adresárov

```text
config/authentication platform/themes/reast/
└── login/
    ├── theme.properties          # Konfigurácia témy
    ├── template.ftl              # Hlavný HTML layout
    ├── login.ftl                 # Prihlasovacia stránka
    ├── register.ftl              # Registračná stránka
    ├── login-reset-password.ftl  # Zabudnuté heslo
    ├── login-update-password.ftl # Vynútená zmena hesla
    ├── error.ftl                 # Chybová stránka
    └── resources/
        ├── css/
        │   └── login.css         # Vlastné štýly (svetlý + tmavý režim)
        └── img/
            └── logo-reast.svg    # Logo Reast
```

## Prispôsobenie

Téma dedí od rodičovskej témy autentifikačnej platformy a prekrýva iba vizuálne štýly a šablóny. Farby, typografia a rozloženie zodpovedajú dizajn systému Reast.

Podrobná technická dokumentácia úprav šablón je v [anglickej verzii](/platform/design/identity-themes).
