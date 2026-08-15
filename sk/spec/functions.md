# Vlastné funkcie

> [Úvod](/sk/spec/) · [Index funkcií](features) · [Ťahák](REA-CHEATSHEET)

<Feature id="functions" />

### Definovanie funkcií {#defining-functions}

Funkcie sa definujú na začiatku súboru alebo v zdieľanom knižničnom súbore:

```rea
{function greet(name, time_of_day) begin}
  {if time_of_day = "morning" begin}
    Dobré ráno, {name}!
  {else}
    Dobrý večer, {name}!
  {end if}
{end function}
```

Funkcie môžu vracať hodnoty:

```rea
{function max(a, b) begin}
  {if a > b begin}
    {return a}
  {else}
    {return b}
  {end if}
{end function}
```

### Volanie funkcií {#calling-functions}

```rea
{greet("Aiden", "morning")}

Silnejší bojovník má {max(player.strength, enemy.strength)} sily.
```

### Správanie funkcie podľa kontextu volania {#function-behavior-by-calling-context}

Funkcie môžu vykresľovať text, vracať hodnoty alebo oboje. Správanie závisí od kontextu:

| Kontext                             | Vykreslí sa text? | Použije sa návratová hodnota? |
| ----------------------------------- | ----------------- | ----------------------------- |
| Samostatne: `{greet("Aiden")}`      | Áno               | Zahodí sa                     |
| Vo výraze: `{max(a, b) + 10}`       | Áno (ak nejaký je) | Áno                          |
| V priradení: `{set x = fn()}`       | Áno (ak nejaký je) | Priradí sa do `x`            |
| V podmienke: `{if fn() begin}`      | Áno (ak nejaký je) | Vyhodnotí sa ako logická hodnota |

**Klasifikácia funkcií:**

- **Čistá funkcia** — len `{return}`, žiadny naratívny text. Správa sa ako tradičná funkcia (`max`, `damage`)
- **Šablónová funkcia** — len naratívny text, bez `{return}`. Správa sa ako znovupoužiteľný blok textu (`greet`)
- **Hybridná funkcia** — vykreslí text A vráti hodnotu. Mocné, ale potenciálne mätúce; kontrolné nástroje by mali varovať
- **Funkcia s vedľajším účinkom** — žiadny text, žiadny `{return}`. Len mení premenné alebo spúšťa príkazy (`reset_stats`)

```rea
{function reset_stats() begin}
  {set player.health = 100}
  {set player.gold = 0}
{end function}
```

Textové telo funkcie sa pri volaní vykreslí vždy — aj v kontexte výrazu. `{return}` je voliteľný; ak chýba, hodnotou funkcie vo výrazoch je `undefined`.

### Parametre {#parameters}

Parametre podporujú predvolené hodnoty:

```rea
{function damage(base, multiplier = 1.0) begin}
  {return base * multiplier}
{end function}
```

## Funkcie a exportovateľnosť do `.rext` {#functions-and-rext-exportability}

Do súboru `.rext` možno definovať a exportovať cez `{use}` len funkcie *čisté* a *s vedľajším účinkom* — teda tie dve klasifikácie vyššie, ktoré nevykresľujú žiadny naratívny text. Súbor `.rext` je bez prózy zo svojej podstaty (pozri [Kde sa pravidlá líšia v `.rext` súboroch](rext-differences)): loader bezpodmienečne odmieta akýkoľvek nepríkazový uzol, vrátane uzlov vnútri tela `{function}…{end function}`, pretože táto kontrola beží skôr než hĺbková brána, ktorá by inak príkazy riadenia toku prepustila. *Šablónové* a *hybridné* funkcie vykresľujú text, takže ich možno definovať len súkromne vnútri súboru `.rea` a používať len v rámci toho istého dokumentu — exportovať sa nedajú. Toto je pevné pravidlo, nie výnimka: funkcia, ktorá vykresľuje akýkoľvek text, čo i len podmienene, nie je pre `.rext` spôsobilá.

## Budúcnosť: sandboxované skriptové rozšírenia (návrh, neimplementované) {#future-sandboxed-script-extensions-draft-not-implemented}

**Budúci smer (návrh, neimplementované):** funkcie v `.rext` sú zámerne len v Rea a bez prózy — pozri [Funkcie a exportovateľnosť do `.rext`](#functions-and-rext-exportability) vyššie. Budúci formát balíčka môže pridať samostatný, výslovne sandboxovaný mechanizmus skriptových rozšírení pre prípady, kde to nestačí, podmienený explicitnou schopnosťou hostiteľa deklarovanou v manifeste (balíček, ktorý ho používa, by sa odmietol načítať na hostiteľovi, ktorý ho nepodporuje, namiesto degradovania). Nič z tohto zatiaľ neexistuje; táto poznámka len upozorňuje, že rozsah `.rext` je zámerný, nie medzera čakajúca na vyplnenie JavaScriptom.
