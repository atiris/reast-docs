<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { useData, useRoute, inBrowser } from 'vitepress';
import { watchEffect } from 'vue';
import Footer from './Footer.vue';

const { lang } = useData();
const route = useRoute();

/**
 * Language persistence cookie.
 * When the user switches language via the VitePress language switcher,
 * we store the choice in a cookie. The platform can set this cookie
 * before redirecting to docs (e.g., `reast_docs_lang=sk`) to pre-select
 * the user's platform language.
 *
 * Fallback behaviour: if no Slovak page exists, VitePress naturally
 * falls back to the root (English) content since the router 404s
 * on missing /sk/* paths and the user sees the English version.
 */
watchEffect(() => {
  if (inBrowser) {
    const langCode = lang.value || 'en';
    document.cookie = `reast_docs_lang=${langCode}; max-age=31536000; path=/; SameSite=Lax`;
  }
});
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <Footer />
    </template>
  </DefaultTheme.Layout>
</template>
