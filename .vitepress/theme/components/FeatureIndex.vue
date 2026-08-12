<script setup lang="ts">
/**
 * The whole language, grouped by what a feature is *for* and filterable by
 * maturity. Rendered by `/spec/features`; reads the same registry the inline
 * `<Feature>` badges read.
 */
import { computed, ref } from 'vue';
import {
  FEATURES,
  GROUPS,
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
  STATUS_ORDER,
  countByStatus,
  renderNote,
  type FeatureStatus,
} from '../../data/features';

const counts = countByStatus();
const total = FEATURES.length;

/** Empty set means "no filter" — every status is shown. */
const active = ref(new Set<FeatureStatus>());

function toggle(status: FeatureStatus): void {
  const next = new Set(active.value);
  if (next.has(status)) next.delete(status);
  else next.add(status);
  active.value = next;
}

function isShown(status: FeatureStatus): boolean {
  return active.value.size === 0 || active.value.has(status);
}

const groups = computed(() =>
  GROUPS.map((group) => ({
    ...group,
    features: FEATURES.filter((f) => f.group === group.id && isShown(f.status)),
    /** Total in the group, so a filtered-away group can say how much it hides. */
    totalCount: FEATURES.filter((f) => f.group === group.id).length,
  })).filter((group) => group.features.length > 0),
);

const shownCount = computed(() => groups.value.reduce((n, g) => n + g.features.length, 0));
</script>

<template>
  <div class="rea-index">
    <p class="rea-index__summary">
      <template v-if="active.size === 0">
        {{ total }} features across {{ GROUPS.length }} areas of the language. Select a status below
        to narrow the list.
      </template>
      <template v-else> Showing {{ shownCount }} of {{ total }} features. </template>
    </p>

    <!-- Legend: also the filter. Clicking a status narrows the tables below.
         It sticks to the top of the viewport, so it stays reachable while
         scrolling a list this long. -->
    <div class="rea-index__legend" role="group" aria-label="Filter features by status">
      <button
        v-for="status in STATUS_ORDER"
        :key="status"
        type="button"
        class="rea-index__chip"
        :class="[`is-${status}`, { 'is-active': active.has(status) }]"
        :aria-pressed="active.has(status)"
        :title="STATUS_DESCRIPTIONS[status]"
        @click="toggle(status)"
      >
        <span class="rea-index__dot" aria-hidden="true" />
        <span class="rea-index__chip-label">{{ STATUS_LABELS[status] }}</span>
        <span class="rea-index__count">{{ counts[status] }}</span>
      </button>
      <button
        v-if="active.size > 0"
        type="button"
        class="rea-index__chip rea-index__reset"
        @click="active = new Set()"
      >
        show all
      </button>
    </div>

    <section v-for="group in groups" :key="group.id" class="rea-index__group">
      <h3 :id="group.id" class="rea-index__group-title">
        <a class="header-anchor" :href="`#${group.id}`" aria-hidden="true">&ZeroWidthSpace;</a>
        <a :href="group.link">{{ group.title }}</a>
        <span class="rea-index__group-count">{{ group.features.length }}/{{ group.totalCount }}</span>
      </h3>
      <p class="rea-index__group-summary">{{ group.summary }}</p>

      <ul class="rea-index__list">
        <li v-for="feature in group.features" :key="feature.id" class="rea-index__item">
          <div class="rea-index__head">
            <a v-if="feature.link" class="rea-index__name" :href="feature.link">{{ feature.title }}</a>
            <span v-else class="rea-index__name">{{ feature.title }}</span>
            <span class="rea-index__badges">
              <span
                class="rea-index__status"
                :class="`is-${feature.status}`"
                :title="STATUS_DESCRIPTIONS[feature.status]"
              >
                <span class="rea-index__dot" aria-hidden="true" />
                {{ STATUS_LABELS[feature.status] }}
              </span>
              <span v-if="feature.since" class="rea-index__version">{{ feature.since }}</span>
            </span>
          </div>
          <code v-if="feature.syntax" class="rea-index__syntax">{{ feature.syntax }}</code>
          <!-- eslint-disable-next-line vue/no-v-html -- escaped in renderNote() -->
          <p class="rea-index__note" v-html="renderNote(feature.note)" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.rea-index {
  margin-top: 24px;
}

/* ── Legend / filter ─────────────────────────────────────────────────────── */
.rea-index__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: sticky;
  top: calc(var(--vp-nav-height) + 8px);
  z-index: 10;
  padding: 10px 0 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
}

.rea-index__chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    color 0.2s;
}

.rea-index__chip:hover {
  border-color: var(--rea-chip-accent, var(--vp-c-brand-1));
  color: var(--rea-chip-accent, var(--vp-c-brand-1));
}

.rea-index__chip.is-active {
  border-color: var(--rea-chip-accent);
  background-color: var(--rea-chip-tint);
  color: var(--rea-chip-accent);
}

.rea-index__chip.is-stable {
  --rea-chip-accent: var(--rea-status-stable);
  --rea-chip-tint: var(--rea-status-stable-soft);
}
.rea-index__chip.is-experimental {
  --rea-chip-accent: var(--rea-status-experimental);
  --rea-chip-tint: var(--rea-status-experimental-soft);
}
.rea-index__chip.is-development {
  --rea-chip-accent: var(--rea-status-development);
  --rea-chip-tint: var(--rea-status-development-soft);
}
.rea-index__chip.is-draft {
  --rea-chip-accent: var(--rea-status-draft);
  --rea-chip-tint: var(--rea-status-draft-soft);
}
.rea-index__chip.is-cancelled {
  --rea-chip-accent: var(--rea-status-cancelled);
  --rea-chip-tint: var(--rea-status-cancelled-soft);
}

.rea-index__chip .rea-index__dot {
  background-color: var(--rea-chip-accent, var(--vp-c-text-3));
}

.rea-index__count {
  padding: 0 6px;
  border-radius: 999px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.rea-index__reset {
  font-weight: 400;
}

.rea-index__summary {
  margin: 0 0 4px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.rea-index__note code,
.rea-index__syntax {
  font-size: 12px;
}

.rea-index__note code {
  padding: 2px 5px;
  border-radius: 4px;
  background-color: var(--vp-c-default-soft);
}

/* ── Groups ──────────────────────────────────────────────────────────────── */
.rea-index__group {
  margin-bottom: 40px;
}

.rea-index__group-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.rea-index__group-title a:not(.header-anchor) {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.rea-index__group-title a:not(.header-anchor):hover {
  color: var(--vp-c-brand-1);
}

.rea-index__group-count {
  color: var(--vp-c-text-3);
  font-size: 13px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.rea-index__group-summary {
  margin: 6px 0 16px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

/* ── Feature rows ────────────────────────────────────────────────────────── */
.rea-index__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rea-index__item {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
}

.rea-index__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.rea-index__name {
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
}

a.rea-index__name:hover {
  color: var(--vp-c-brand-1);
}

.rea-index__badges {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.rea-index__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 9px;
  border-radius: 999px;
  border: 1px solid currentColor;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  cursor: help;
  white-space: nowrap;
}

.rea-index__status.is-stable {
  color: var(--rea-status-stable);
  background-color: var(--rea-status-stable-soft);
}
.rea-index__status.is-experimental {
  color: var(--rea-status-experimental);
  background-color: var(--rea-status-experimental-soft);
}
.rea-index__status.is-development {
  color: var(--rea-status-development);
  background-color: var(--rea-status-development-soft);
}
.rea-index__status.is-draft {
  color: var(--rea-status-draft);
  background-color: var(--rea-status-draft-soft);
}
.rea-index__status.is-cancelled {
  color: var(--rea-status-cancelled);
  background-color: var(--rea-status-cancelled-soft);
}

.rea-index__version {
  padding: 1px 9px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.rea-index__syntax {
  display: inline-block;
  margin-top: 8px;
  padding: 2px 8px;
  border-radius: 6px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.rea-index__note {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

.rea-index__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: currentColor;
}

@media (max-width: 640px) {
  .rea-index__legend {
    position: static;
  }
  .rea-index__head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
