<script setup lang="ts">
// Added onMounted and onUnmounted to manage global click event listeners
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';

interface DocVersion {
  /** Display label, e.g. "v0.2.0" or "v0.1.0 (archived)". */
  label: string;
  /** Absolute link to that version's docs root, e.g. "/" or "/v0.1.0/". */
  link: string;
  /** Marks the version the live site is currently serving. */
  current?: boolean;
}

const { theme, lang } = useData();

const themeRecord = theme.value as Record<string, unknown>;
const version = themeRecord.docVersion as string | undefined;
const configuredVersions = (themeRecord.docVersions as DocVersion[] | undefined) ?? [];

// Derive locale-dependent strings reactively so they re-render when the reader
// switches language: VitePress reuses this Footer instance across the SPA locale
// change (setup() never re-runs), so plain consts captured at mount would stay
// stale. `computed` tracks `lang` and updates the footer in place.
const isSk = computed(() => lang.value?.startsWith('sk') ?? false);

const inviteText = computed(() =>
  isSk.value
    ? 'Navštívte rea.st a vyskúšajte interaktívne príbehy priamo vo vašom prehliadači!'
    : 'Visit rea.st to try interactive stories right in your browser!',
);

const shortInviteText = computed(() => (isSk.value ? 'Viac na rea.st' : 'Try it on rea.st'));

const versionLabel = computed(() => (isSk.value ? 'Verzia dokumentácie' : 'Documentation version'));
const versionsHeading = computed(() => (isSk.value ? 'Dostupné verzie' : 'Available versions'));
const changelogLabel = computed(() => (isSk.value ? 'Zoznam zmien' : 'Changelog'));
const changelogLink = computed(() => (isSk.value ? '/sk/changelog' : '/changelog'));

// Always offer at least the live version so the menu is never empty even
// before any archived snapshot has been published.
const versions: DocVersion[] = configuredVersions.length
  ? configuredVersions
  : version
    ? [{ label: `v${version}`, link: '/', current: true }]
    : [];

const open = ref(false);

// Template ref to track the DOM element of the version menu wrapper
const menuRef = ref<HTMLElement | null>(null);

// Closes the menu if it is open and the click target is outside of the menu element
const closeMenuOnOutsideClick = (event: MouseEvent) => {
  if (open.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    open.value = false;
  }
};

// Register the global click event listener when the component mounts
onMounted(() => {
  document.addEventListener('click', closeMenuOnOutsideClick);
});

// Clean up the global click event listener when the component unmounts
onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnOutsideClick);
});
</script>

<template>
  <footer v-if="version" class="reast-footer">
    <div class="reast-footer__inner">
      <a class="reast-footer__invite" href="https://rea.st" target="_blank" rel="noopener">
        <img
          class="reast-footer__logo logo"
          src="/logo-reast.svg"
          alt="rea.st"
          width="24"
          height="24"
        />
        <span class="reast-footer__invite text-full">{{ inviteText }}</span>
        <span class="reast-footer__invite text-short">{{ shortInviteText }}</span>
      </a>

      <!-- Added ref="menuRef" to capture the boundary for outside clicks -->
      <div ref="menuRef" class="reast-footer__version">
        <button
          type="button"
          class="reast-footer__version-btn"
          :aria-expanded="open"
          aria-haspopup="listbox"
          @click="open = !open"
        >
          <span class="reast-footer__version text-full">{{ versionLabel }}: {{ version }}</span>
          <span class="reast-footer__version text-short">Ver.: {{ version }}</span>
          <span class="reast-footer__caret" :class="{ 'is-open': open }" aria-hidden="true">▾</span>
        </button>
        <ul v-if="open" class="reast-footer__versions" role="listbox" :aria-label="versionsHeading">
          <!-- Added @click="open = false" to close menu on selection -->
          <li
            v-for="v in versions"
            :key="v.link"
            role="option"
            :aria-selected="!!v.current"
            @click="open = false"
          >
            <!-- Turned current version from span to a clickable link pointing to v.link -->
            <a v-if="v.current" :href="v.link" class="reast-footer__versions-current">{{
              v.label
            }}</a>
            <a v-else :href="v.link">{{ v.label }}</a>
          </li>
          <!-- Added @click="open = false" to close menu on changelog selection -->
          <li role="option" aria-selected="false" @click="open = false">
            <a :href="changelogLink">{{ changelogLabel }}</a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
