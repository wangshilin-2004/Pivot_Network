<script setup lang="ts">
import type { AlgorithmTemplate, Offer } from '../types/domain'

const props = defineProps<{
  visible: boolean
  offer: Offer | null
  algorithms: AlgorithmTemplate[]
  algorithmId: string
  duration: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:algorithmId', v: string): void
  (e: 'update:duration', v: number): void
  (e: 'submit'): void
}>()
</script>

<template>
  <div v-if="visible" class="drawer">
    <div class="drawer-header">
      <div>
        <div class="drawer-kicker">订单创建</div>
        <h3>创建资源订单</h3>
      </div>
      <button class="icon-button" @click="emit('close')" aria-label="关闭">×</button>
    </div>

    <div class="drawer-body" v-if="offer">
      <div class="summary-card compact-card">
        <div class="summary-label">已选资源</div>
        <div class="summary-title">{{ offer.title }}</div>
        <div class="summary-meta">{{ offer.gpu }} · {{ offer.cpu }} · {{ offer.price }}{{ offer.unit }}</div>
      </div>

      <label class="field">
        <span>算法模板</span>
        <select :value="algorithmId" @change="emit('update:algorithmId', ($event.target as HTMLSelectElement).value)">
          <option v-for="item in algorithms" :key="item.id" :value="item.id">{{ item.name }} · {{ item.recommendation }}</option>
        </select>
      </label>

      <label class="field">
        <span>使用时长</span>
        <select :value="duration" @change="emit('update:duration', Number(($event.target as HTMLSelectElement).value))">
          <option :value="60">60 分钟</option>
          <option :value="180">180 分钟</option>
          <option :value="360">360 分钟</option>
          <option :value="720">720 分钟</option>
        </select>
      </label>
    </div>

    <div class="drawer-footer">
      <button class="secondary-button" @click="emit('close')">取消</button>
      <button class="primary-button" @click="emit('submit')">确认下单</button>
    </div>
  </div>
</template>
