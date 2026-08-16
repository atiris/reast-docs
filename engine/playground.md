# Playground

Try the Rea language live in your browser. Type Rea markup in the editor below and see it rendered instantly by the `<reast-engine>` web component.

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

const defaultStory = `# My First Story

Welcome to the Rea playground!

This is a simple branching story. Try editing it.

{set story.player.curious = true}

* [Explore the forest]
  You walk into a dense forest. Birds sing above.
  The path splits in two.

  * * [Go left]
    You find a hidden waterfall. Beautiful!
  * * [Go right]
    You discover an old stone bridge crossing a stream.

* [Visit the town]
  The town square is bustling with people.
  A merchant waves you over.

  @merchant: "Would you like to see my wares?"

  * * [Yes, show me]
    The merchant reveals a collection of rare maps.
  * * [No, thanks]
    You wave politely and continue walking.

- *The End.*
`;

const source = ref(defaultStory); const playerContainer = ref(null);

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
  // Load the player script
  if (!customElements.get('reast-engine')) {
    try {
      const mod = await import('@reast/engine/player');
      if (mod.registerEngine) mod.registerEngine();
    } catch {
      // Player not available in docs build — show fallback
    }
  }
  renderStory();
});

let debounce; watch(source, () => {
  clearTimeout(debounce);
  debounce = setTimeout(renderStory, 500);
});
</script>

<div class="playground">
  <div class="playground-editor">
    <h3>Rea Source</h3>
    <textarea
      v-model="source"
      spellcheck="false"
      class="playground-textarea"
      placeholder="Type your Rea story here..."
    ></textarea>
  </div>
  <div class="playground-preview">
    <h3>Preview</h3>
    <div ref="playerContainer" class="playground-player">
      <p style="color: var(--vp-c-text-2); font-style: italic;">
        The player component loads at runtime. If you see this message,
        the <code>&lt;reast-engine&gt;</code> script is not available in this
        environment. Build and serve the docs with the player package linked
        to see a live preview.
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

.playground-editor, .playground-preview {
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

## How it works

The playground creates a `<reast-engine>` web component and feeds it your Rea source as a blob URL. The player parses the markup using `@reast/engine` and renders the interactive story directly in the browser.

### Supported syntax

Anything the engine implements works here — that is everything marked `stable` or `experimental` on the [feature index](/spec/features):

- **Prose** — paragraphs, headings, emphasis, blockquotes, rules, footnotes and hints
- **Choices** — `*` one-time, `+` sticky, `-` gathers, `->` diverts, `->->` tunnels
- **State** — `{set story.player.gold = 100}`, `{if …begin}…{end if}`, loops, functions
- **Narrative** — `{once}`, varying text, storylets, decks, exploration menus, cards

Features badged `development` or `draft` are not implemented, so the parser treats them as ordinary text — see [graceful degradation](/spec/error-handling).

### Limitations

- **No package** — the playground feeds a single `.rea` file to the player, so
  there is no manifest, no media and no `.rext` extensions
- **No media files** — an embed such as `[!map < media/map.jpg]` has nothing to
  resolve against and renders its placeholder
- **No GPS/NFC/sensors** — hardware-dependent commands emit their host request
  and receive no answer
- **No persistence** — story state resets on each render
