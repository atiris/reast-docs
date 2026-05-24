# Ihrisko

Vyskúšajte jazyk REA naživo vo vašom prehliadači. Napíšte REA markup do editora a sledujte okamžité vykreslenie webovým komponentom `<reast-player>`.

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

const defaultStory = `# Môj prvý príbeh

Vitajte v REA ihrisku!

Toto je jednoduchý rozvetvený príbeh. Skúste ho upraviť.

{choice}
  {option} Preskúmať les
    Vojdeš do hustého lesa. Vtáky spievajú nad hlavou.
    Cesta sa rozdeľuje na dve.

    {choice}
      {option} Ísť doľava
        Nájdeš skrytý vodopád. Nádherné!
      {option} Ísť doprava
        Objavíš starý kamenný most cez potok.
    {end choice}

  {option} Navštíviť mesto
    Mestské námestie sa hemží ľuďmi.
    Obchodník ti máva.

    "Chceli by ste vidieť moje tovary?"

    {choice}
      {option} Áno, ukáž mi
        Obchodník odhalí zbierku vzácnych máp.
      {option} Nie, ďakujem
        Slušne odmávneš a pokračuješ v ceste.
    {end choice}
{end choice}

**Koniec.**
`;

const source = ref(defaultStory);
const playerContainer = ref(null);

function renderStory() {
  if (!playerContainer.value) return;
  const container = playerContainer.value;
  container.innerHTML = '';
  const player = document.createElement('reast-player');
  const blob = new Blob([source.value], { type: 'text/plain' });
  player.setAttribute('src', URL.createObjectURL(blob));
  container.appendChild(player);
}

onMounted(async () => {
  if (!customElements.get('reast-player')) {
    try {
      const mod = await import('@reast/engine/player');
      if (mod.registerPlayer) mod.registerPlayer();
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
    <h3>REA zdrojový kód</h3>
    <textarea
      v-model="source"
      spellcheck="false"
      class="playground-textarea"
      placeholder="Napíšte svoj REA príbeh tu..."
    ></textarea>
  </div>
  <div class="playground-preview">
    <h3>Náhľad</h3>
    <div ref="playerContainer" class="playground-player">
      <p style="color: var(--vp-c-text-2); font-style: italic;">
        Komponent playera sa načíta za behu. Ak vidíte túto správu,
        skript <code>&lt;reast-player&gt;</code> nie je v tomto prostredí
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
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.playground-player {
  min-height: 400px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  padding: 1rem;
  background: var(--vp-c-bg);
}
</style>
