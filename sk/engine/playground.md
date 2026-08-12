# Ihrisko

Vyskúšajte jazyk Rea naživo vo vašom prehliadači. Napíšte Rea markup do editora a sledujte okamžité vykreslenie webovým komponentom `<reast-engine>`.

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

const defaultStory = `# Môj prvý príbeh

Vitajte v Rea ihrisku!

Toto je jednoduchý rozvetvený príbeh. Skúste ho upraviť.

{set player.zvedavy = true}

* [Preskúmať les]
  Vojdeš do hustého lesa. Vtáky spievajú nad hlavou.
  Cesta sa rozdeľuje na dve.

  * * [Ísť doľava]
    Nájdeš skrytý vodopád. Nádherné!
  * * [Ísť doprava]
    Objavíš starý kamenný most cez potok.

* [Navštíviť mesto]
  Mestské námestie sa hemží ľuďmi.
  Obchodník ti máva.

  @obchodnik: "Chceli by ste vidieť moje tovary?"

  * * [Áno, ukáž mi]
    Obchodník odhalí zbierku vzácnych máp.
  * * [Nie, ďakujem]
    Slušne odmávneš a pokračuješ v ceste.

- *Koniec.*
`;

const source = ref(defaultStory);
const playerContainer = ref(null);

function renderStory() {
  if (!playerContainer.value) return;
  const container = playerContainer.value;
  container.innerHTML = '';
  const player = document.createElement('reast-engine');
  const blob = new Blob([source.value], { type: 'text/plain' });
  player.setAttribute('src', URL.createObjectURL(blob));
  container.appendChild(player);
}

onMounted(async () => {
  if (!customElements.get('reast-engine')) {
    try {
      const mod = await import('@reast/engine/player');
      if (mod.registerEngine) mod.registerEngine();
    } catch {
      // Player nie je dostupný v docs builde — zobrazí sa fallback
    }
  }
  renderStory();
});

let debounce;
watch(source, () => {
  clearTimeout(debounce);
  debounce = setTimeout(renderStory, 500);
});
</script>

<div class="playground">
  <div class="playground-editor">
    <h3>Rea zdrojový kód</h3>
    <textarea
      v-model="source"
      spellcheck="false"
      class="playground-textarea"
      placeholder="Napíšte svoj Rea príbeh tu..."
    ></textarea>
  </div>
  <div class="playground-preview">
    <h3>Náhľad</h3>
    <div ref="playerContainer" class="playground-player">
      <p style="color: var(--vp-c-text-2); font-style: italic;">
        Komponent playera sa načíta za behu. Ak vidíte túto správu,
        skript <code>&lt;reast-engine&gt;</code> nie je v tomto prostredí
        dostupný. Zostavte a servujte dokumentáciu s nalinkovaným balíkom
        playera pre zobrazenie živého náhľadu.
      </p>
    </div>
  </div>
</div>

<style>
.playground {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  min-height: 500px;
}

@media (max-width: 768px) {
  .playground {
    grid-template-columns: 1fr;
  }
}

.playground-editor,
.playground-preview {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
}

.playground-textarea {
  width: 100%;
  min-height: 400px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
  tab-size: 2;
}

.playground-textarea:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

.playground-player {
  min-height: 400px;
  padding: 0.5rem;
}

.playground h3 {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
}
</style>

## Ako to funguje

Ihrisko vytvorí webový komponent `<reast-engine>` a nakŕmi ho vaším zdrojom Rea ako blob URL. Prehrávač značkovanie rozparsuje pomocou `@reast/engine` a interaktívny príbeh vykreslí priamo v prehliadači.

### Podporovaná syntax

Funguje tu všetko, čo jadro implementuje — teda všetko označené ako `stable` alebo `experimental` v [indexe funkcií](/sk/spec/features):

- **Próza** — odseky, nadpisy, dôraz, citácie, čiary, poznámky pod čiarou a nápovedy
- **Voľby** — `*` jednorazové, `+` trvalé, `-` zbery, `->` odbočky, `->->` tunely
- **Stav** — `{set player.gold = 100}`, `{if …begin}…{end if}`, cykly, funkcie
- **Naratív** — `{once}`, meniaci sa text, storylety, balíčky, menu objavovania, karty

Funkcie so značkou `development` alebo `draft` implementované nie sú, takže ich parser spracuje ako bežný text — pozri [elegantnú degradáciu](/sk/spec/04-utilities#_27-error-handling).

### Obmedzenia

- **Žiadny balík** — ihrisko podáva prehrávaču jediný súbor `.rea`, takže tu niet manifestu, médií ani rozšírení `.rext`
- **Žiadne mediálne súbory** — vloženie ako `[!map < media/map.jpg]` nemá čo rozlíšiť a vykreslí svoj zástupný obsah
- **Žiadne GPS, NFC ani senzory** — príkazy závislé od hardvéru vyšlú svoju požiadavku hostiteľovi a nedostanú odpoveď
- **Žiadna perzistencia** — stav príbehu sa pri každom vykreslení vynuluje
