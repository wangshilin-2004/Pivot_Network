<script setup lang="ts">
import type { TrendPoint } from '../types/domain'

defineProps<{ points: TrendPoint[]; peak: number; avg: number }>()
</script>

<template>
  <div class="monitor-chart section-space">
    <div class="chart-title">
      <div>
        <strong>GPU 使用率趋势</strong>
        <div class="muted">近 {{ points.length }} 个时段</div>
      </div>
      <div class="muted">峰值 {{ peak }}%</div>
    </div>
    <div class="chart-bars">
      <div v-for="point in points" :key="point.label" class="bar-column">
        <div class="bar-stack"><div class="bar" :style="{ height: `${point.value}%` }"></div></div>
        <div class="bar-label">{{ point.label }}</div>
      </div>
    </div>
  </div>
</template>
