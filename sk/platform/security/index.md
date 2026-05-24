# Bezpečnosť a súkromie

Bezpečnosť platformy Reast je navrhnutá s ohľadom na OWASP Top 10 a princípy minimálneho oprávnenia.

## Prehľad bezpečnostných opatrení

### Autentifikácia a autorizácia

- Globálny JWT auth guard — všetky endpointy vyžadujú autentifikáciu, pokiaľ nie sú explicitne označené ako verejné
- RS256 asymetrické podpisovanie JWT cez externý JWKS
- RBAC (Role-Based Access Control) — oddelené role pre čitateľov, autorov a administrátorov
- Kontrola vlastníctva pri modifikácii príbehov

### Ochrana pred injekciou

- Globálny `ValidationPipe` so zoznamom povolených vlastností
- Parametrizované SQL dotazy — žiadna konkatenácia reťazcov
- Sanitizácia slugov a ciest súborov

### Bezpečnostné hlavičky

- Helmet.js pre bezpečnostné HTTP hlavičky (CSP, X-Frame-Options)
- CORS obmedzené na explicitné origin domény
- TLS ukončenie na reverse proxy (Caddy)

### Ochrana súkromia

- Minimálny zber údajov — zbierame iba to, čo je nevyhnutné pre fungovanie
- Žiadne sledovacie cookies tretích strán
- Čitateľská aktivita je agregovaná, nie individuálne sledovaná
- Možnosť exportu a vymazania osobných údajov

## Ďalšie informácie

Podrobný technický audit bezpečnosti je dostupný v anglickej verzii dokumentácie.
