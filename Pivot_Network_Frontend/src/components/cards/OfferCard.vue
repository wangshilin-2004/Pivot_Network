<script setup lang="ts">
import { computed } from 'vue'
import type { Offer } from '../../types/domain'
import Badge from '../common/Badge.vue'

const props = defineProps<{ offer: Offer }>()
const emit = defineEmits<{ (e: 'buy', id: string): void }>()

const statusTone = computed<'green' | 'orange' | 'blue' | 'plain'>(() => {
  const { status } = props.offer
  if (status.includes('可用') || status.includes('充足')) return 'green'
  if (status.includes('排队') || status.includes('审核')) return 'orange'
  if (status.includes('发布')) return 'blue'
  return 'plain'
})
</script>

<template>
  <article class="panel offer-card">
    <div class="offer-ident">
      <div class="eyebrow">{{ offer.region }}</div>
      <h3 class="offer-gpu">{{ offer.gpu }}</h3>
      <p class="offer-title">{{ offer.title }}</p>
      <p class="offer-meta">
        <span class="mono">{{ offer.runtimeImage }}</span>
        <span class="offer-meta-dot" aria-hidden="true">·</span>
        <span>{{ offer.inventory }}</span>
      </p>
      <div class="chip-row offer-tags">
        <span v-for="tag in offer.tags" :key="tag" class="chip chip--static">{{ tag }}</span>
      </div>
    </div>

    <dl class="offer-specs">
      <div class="kv">
        <dt class="kv-label">GPU</dt>
        <dd class="kv-value">{{ offer.gpu }}</dd>
      </div>
      <div class="kv">
        <dt class="kv-label">CPU</dt>
        <dd class="kv-value">{{ offer.cpu }}</dd>
      </div>
      <div class="kv">
        <dt class="kv-label">内存</dt>
        <dd class="kv-value">{{ offer.memory }}</dd>
      </div>
      <div class="kv">
        <dt class="kv-label">时延</dt>
        <dd class="kv-value">{{ offer.latency }}</dd>
      </div>
    </dl>

    <div class="offer-side">
      <Badge :text="offer.status" :tone="statusTone" />
      <div class="offer-price">
        <span class="offer-price-num">{{ offer.price }}</span>
        <span class="offer-price-unit">{{ offer.unit }}</span>
      </div>
      <button class="btn btn--secondary offer-buy" type="button" @click="emit('buy', offer.id)">
        开通
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.offer-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr) auto;
  grid-template-areas: 'ident specs side';
  align-items: center;
  gap: clamp(20px, 3vw, 36px);
  padding: 28px 30px;
  transition: border-color var(--dur-1) var(--ease), background var(--dur-1) var(--ease);
}

.offer-card:hover {
  border-color: var(--line-2);
  background: var(--surface-2);
}

/* ---------- identity ---------- */
.offer-ident {
  grid-area: ident;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.offer-gpu {
  font-size: clamp(1.5rem, 2.4vw, 1.875rem);
  font-weight: 650;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--text);
}

.offer-title {
  font-size: 0.9375rem;
  color: var(--text-2);
}

.offer-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-3);
  min-width: 0;
}

.offer-meta > span:not(.offer-meta-dot) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.offer-meta-dot {
  color: var(--text-4);
  flex: none;
}

.offer-tags {
  margin-top: 4px;
}

.chip--static {
  pointer-events: none;
  height: 26px;
}

/* ---------- specs ---------- */
.offer-specs {
  grid-area: specs;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
  margin: 0;
  padding-left: clamp(16px, 2vw, 28px);
  border-left: 1px solid var(--line);
}

/* ---------- price + action ---------- */
.offer-side {
  grid-area: side;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  text-align: right;
}

.offer-price {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 6px;
}

.offer-price-num {
  font-size: clamp(2.1rem, 3.2vw, 2.75rem);
  font-weight: 650;
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.offer-price-unit {
  font-size: 0.75rem;
  color: var(--text-3);
  white-space: nowrap;
}

.offer-buy {
  min-width: 118px;
}

/* ---------- tablet ---------- */
@media (max-width: 1120px) {
  .offer-card {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'ident side'
      'specs specs';
    align-items: start;
    gap: 20px 24px;
    padding: 24px;
  }

  .offer-specs {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 18px 0 0;
    border-left: 0;
    border-top: 1px solid var(--line);
  }
}

/* ---------- mobile ---------- */
@media (max-width: 640px) {
  .offer-card {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'ident'
      'specs'
      'side';
    gap: 18px;
    padding: 22px 20px;
  }

  .offer-specs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 16px;
  }

  .offer-side {
    align-items: flex-start;
    text-align: left;
  }

  .offer-price {
    justify-content: flex-start;
  }

  .offer-buy {
    align-self: stretch;
    width: 100%;
  }
}
</style>
