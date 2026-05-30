<script setup lang="ts">
import { ref } from 'vue';
import { useData } from 'vitepress';

const { theme, lang } = useData();

const version = (theme.value as Record<string, unknown>).docVersion as string | undefined;

const isSk = lang.value?.startsWith('sk');

const inviteText = isSk
  ? 'Navštívte rea.st a vyskúšajte interaktívne príbehy priamo vo vašom prehliadači!'
  : 'Visit rea.st to try interactive stories right in your browser!';

const versionLabel = isSk ? 'Verzia dokumentácie' : 'Documentation version';
const versionsHeading = isSk ? 'Dostupné verzie' : 'Available versions';
const changelogLabel = isSk ? 'Zoznam zmien' : 'Changelog';
const changelogLink = isSk ? '/sk/changelog' : '/changelog';

const open = ref(false);
</script>

<template>
  <footer v-if="version" class="reast-footer">
    <div class="reast-footer__inner">
      <a class="reast-footer__invite" href="https://rea.st" target="_blank" rel="noopener">
        <img class="reast-footer__logo" src="/logo-reast.svg" alt="rea.st" width="24" height="24" />
        <span>{{ inviteText }}</span>
      </a>

      <div class="reast-footer__version">
        <button
          type="button"
          class="reast-footer__version-btn"
          :aria-expanded="open"
          aria-haspopup="listbox"
          @click="open = !open"
        >
          {{ versionLabel }}: {{ version }}
          <span class="reast-footer__caret" :class="{ 'is-open': open }" aria-hidden="true">▾</span>
        </button>
        <ul v-if="open" class="reast-footer__versions" role="listbox" :aria-label="versionsHeading">
          <li role="option" aria-selected="true">
            <span class="reast-footer__versions-current">v{{ version }}</span>
          </li>
          <li role="option" aria-selected="false">
            <a :href="changelogLink">{{ changelogLabel }}</a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
