<script setup lang="ts">
/**
 * Inline maturity badge, rendered directly under a feature's heading:
 *
 *     ### Headings
 *
 *     <Feature id="headings" />
 *
 * Everything shown comes from `.vitepress/data/features.ts`, so the badge here
 * and the row on `/spec/features` can never disagree. An unknown id renders a
 * visible warning rather than nothing, so a typo is caught while reading the
 * page instead of silently dropping the status.
 *
 * The same tag is written verbatim on the Slovak pages: the wording is resolved
 * from the page's locale, so a translation never repeats a status.
 */
import { computed } from 'vue';
import { useData } from 'vitepress';
import { getFeature, langOf, renderNote, statusDescriptions, statusLabels } from '../../data/features';

const props = defineProps<{ id: string }>();

const { lang } = useData();
const locale = computed(() => langOf(lang.value));

const feature = computed(() => getFeature(props.id, locale.value));
const STATUS_LABELS = computed(() => statusLabels(locale.value));
const STATUS_DESCRIPTIONS = computed(() => statusDescriptions(locale.value));

/** The one string this component owns rather than reads from the registry. */
const versionTitle = computed(() =>
  locale.value === 'sk'
    ? 'Verzia špecifikácie Rea, v ktorej sa táto funkcia stala dostupnou'
    : 'Rea spec version this feature became available in',
);
</script>

<template>
  <div v-if="feature" class="rea-feature" :class="`is-${feature.status}`">
    <div class="rea-feature__badges">
      <span class="rea-feature__status" :title="STATUS_DESCRIPTIONS[feature.status]">
        <span class="rea-feature__dot" aria-hidden="true" />
        {{ STATUS_LABELS[feature.status] }}
      </span>
      <span v-if="feature.since" class="rea-feature__version" :title="versionTitle">
        <span class="rea-feature__version-prefix">{{ locale === 'sk' ? 'od' : 'since' }}</span>
        {{ feature.since }}
      </span>
      <code v-if="feature.syntax" class="rea-feature__syntax">{{ feature.syntax }}</code>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- escaped in renderNote() -->
    <p class="rea-feature__note" v-html="renderNote(feature.note)" />
  </div>
  <div v-else class="rea-feature is-unknown">
    <div class="rea-feature__badges">
      <span class="rea-feature__status">{{ locale === 'sk' ? 'neznáma funkcia' : 'unknown feature' }}</span>
    </div>
    <p v-if="locale === 'sk'" class="rea-feature__note">
      Pod identifikátorom <code>{{ id }}</code> nie je v súbore
      <code>.vitepress/data/features.ts</code> zaregistrovaná žiadna funkcia.
    </p>
    <p v-else class="rea-feature__note">
      No feature is registered under the id <code>{{ id }}</code> in
      <code>.vitepress/data/features.ts</code>.
    </p>
  </div>
</template>

<style scoped>
.rea-feature {
  --rea-feature-accent: var(--vp-c-default-1);
  --rea-feature-tint: var(--vp-c-default-soft);
  margin: 12px 0 20px;
  padding: 10px 14px 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--rea-feature-accent);
  background-color: var(--vp-c-bg-soft);
}

.rea-feature.is-stable {
  --rea-feature-accent: var(--rea-status-stable);
  --rea-feature-tint: var(--rea-status-stable-soft);
}
.rea-feature.is-experimental {
  --rea-feature-accent: var(--rea-status-experimental);
  --rea-feature-tint: var(--rea-status-experimental-soft);
}
.rea-feature.is-development {
  --rea-feature-accent: var(--rea-status-development);
  --rea-feature-tint: var(--rea-status-development-soft);
}
.rea-feature.is-draft {
  --rea-feature-accent: var(--rea-status-draft);
  --rea-feature-tint: var(--rea-status-draft-soft);
}
.rea-feature.is-cancelled {
  --rea-feature-accent: var(--rea-status-cancelled);
  --rea-feature-tint: var(--rea-status-cancelled-soft);
}

.rea-feature__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.rea-feature__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  background-color: var(--rea-feature-tint);
  color: var(--rea-feature-accent);
  border: 1px solid var(--rea-feature-accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  cursor: help;
  white-space: nowrap;
}

.rea-feature__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--rea-feature-accent);
}

.rea-feature__version {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Written as an element rather than CSS `content`, so the label translates. */
.rea-feature__version-prefix {
  margin-right: 4px;
  color: var(--vp-c-text-3);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.06em;
}

.rea-feature__syntax {
  padding: 2px 8px;
  border-radius: 6px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.6;
}

.rea-feature__note {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

/* Inline code inside a note inherits doc styling that is too loud at this size. */
.rea-feature__note code {
  padding: 2px 5px;
  border-radius: 4px;
  background-color: var(--vp-c-default-soft);
  font-size: 0.88em;
}
</style>
