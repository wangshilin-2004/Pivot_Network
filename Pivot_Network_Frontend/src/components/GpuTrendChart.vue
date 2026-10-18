<script setup lang="ts">
import { computed } from 'vue'
import type { TrendPoint } from '../types/domain'

const props = defineProps<{ points: TrendPoint[]; peak: number; avg: number }>()

const W = 560
const H = 180
const PAD_X = 6
const PAD_Y = 16

const maxValue = computed(() => Math.max(100, ...props.points.map((point) => point.value)))

const coords = computed(() =>
  props.points.map((point, index) => {
    const x = PAD_X + (index * (W - PAD_X * 2)) / Math.max(1, props.points.length - 1)
    const y = PAD_Y + (1 - point.value / maxValue.value) * (H - PAD_Y * 2)
    return { ...point, x, y }
  }),
)

const linePath = computed(() =>
  coords.value.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' '),
)

const areaPath = computed(() => {
  const cs = coords.value
  if (!cs.length) return ''
  const first = cs[0]
  const last = cs[cs.length - 1]
  return `${linePath.value} L${last.x.toFixed(1)},${H - 6} L${first.x.toFixed(1)},${H - 6} Z`
})

const gridLines = computed(() =>
  [0.25, 0.5, 0.75].map((ratio) => PAD_Y + ratio * (H - PAD_Y * 2)),
)

const peakPoint = computed(() => {
  const list = coords.value
  if (!list.length) return null
  return list.reduce((best, item) => (item.value > best.value ? item : best), list[0])
})
</script>

<template>
  <div class="chart">
    <div class="chart-head">
      <div>
        <div class="chart-title">GPU 使用率趋势</div>
        <div class="chart-sub">近 {{ points.length }} 个时段</div>
      </div>
      <div class="chart-stats">
        <span class="chart-stat"><em>{{ peak }}%</em> 峰值</span>
        <span class="chart-stat chart-stat--muted"><em>{{ avg }}%</em> 均值</span>
      </div>
    </div>

    <div class="chart-canvas">
      <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg" role="img" aria-label="GPU 使用率趋势图">
        <defs>
          <linearGradient id="gpu-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2997ff" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#2997ff" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="gpu-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#2997ff" />
            <stop offset="60%" stop-color="#64d2ff" />
            <stop offset="100%" stop-color="#bf5af2" />
          </linearGradient>
        </defs>

        <line
          v-for="(y, index) in gridLines"
          :key="index"
          :x1="PAD_X"
          :x2="W - PAD_X"
          :y1="y"
          :y2="y"
          stroke="rgba(255,255,255,0.06)"
          stroke-dasharray="3 6"
        />

        <path :d="areaPath" fill="url(#gpu-area)" />
        <path
          :d="linePath"
          fill="none"
          stroke="url(#gpu-line)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle
          v-for="(point, index) in coords"
          :key="point.label"
          :cx="point.x"
          :cy="point.y"
          :r="index === 0 || index === coords.length - 1 || point.value === peak ? 4 : 2.5"
          :fill="point.value === peak ? '#fff' : '#2997ff'"
          :opacity="point.value === peak ? 1 : 0.75"
        >
          <title>{{ point.label }} · {{ point.value }}%</title>
        </circle>

        <circle
          v-if="peakPoint"
          :cx="peakPoint.x"
          :cy="peakPoint.y"
          r="9"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          stroke-width="1"
        />
      </svg>
    </div>

    <div class="chart-axis">
      <span v-for="point in points" :key="point.label">{{ point.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  display: grid;
  gap: 14px;
}

.chart-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.chart-title {
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.chart-sub {
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--text-3);
}

.chart-stats {
  display: flex;
  gap: 18px;
  font-size: 0.75rem;
  color: var(--text-2);
}

.chart-stat em {
  font-style: normal;
  font-size: 1.0625rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  margin-right: 4px;
}

.chart-stat--muted em {
  color: var(--text-2);
}

.chart-canvas {
  width: 100%;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.chart-axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
</style>
