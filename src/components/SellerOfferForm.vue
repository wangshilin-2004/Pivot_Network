<script setup lang="ts">
import { reactive, ref } from 'vue'

const emit = defineEmits<{
  (e: 'publish', payload: { title: string; region: string; gpu: string; cpu: string; memory: string; price: number; image: string }): void
}>()

const form = reactive({ title: '', region: '', gpu: '', cpu: '', memory: '', price: 20, image: '' })
const errors = reactive<Record<string, string>>({})
const submitted = ref(false)

function validate() {
  errors.title = form.title ? '' : '请输入资源名称'
  errors.region = form.region ? '' : '请输入区域'
  errors.gpu = form.gpu ? '' : '请输入 GPU 型号'
  errors.cpu = form.cpu ? '' : '请输入 CPU 规格'
  errors.memory = form.memory ? '' : '请输入内存规格'
  errors.image = form.image ? '' : '请输入运行镜像'
  errors.price = form.price > 0 ? '' : '请输入有效价格'
  return !Object.values(errors).some(Boolean)
}

function submit() {
  submitted.value = true
  if (!validate()) return
  emit('publish', { ...form })
  form.title = ''
  form.region = ''
  form.gpu = ''
  form.cpu = ''
  form.memory = ''
  form.price = 20
  form.image = ''
  submitted.value = false
}
</script>

<template>
  <form @submit.prevent="submit">
    <div class="two-column-fields">
      <label class="field">
        <span>资源名称</span>
        <input v-model="form.title" placeholder="4090 推理实例" required />
        <small v-if="submitted && errors.title" class="field-error">{{ errors.title }}</small>
      </label>
      <label class="field">
        <span>区域</span>
        <input v-model="form.region" placeholder="天津边缘节点" required />
        <small v-if="submitted && errors.region" class="field-error">{{ errors.region }}</small>
      </label>
      <label class="field">
        <span>GPU</span>
        <input v-model="form.gpu" placeholder="RTX 4090" required />
        <small v-if="submitted && errors.gpu" class="field-error">{{ errors.gpu }}</small>
      </label>
      <label class="field">
        <span>CPU</span>
        <input v-model="form.cpu" placeholder="32 vCPU" required />
        <small v-if="submitted && errors.cpu" class="field-error">{{ errors.cpu }}</small>
      </label>
      <label class="field">
        <span>内存</span>
        <input v-model="form.memory" placeholder="128 GB" required />
        <small v-if="submitted && errors.memory" class="field-error">{{ errors.memory }}</small>
      </label>
      <label class="field">
        <span>单价</span>
        <input v-model.number="form.price" type="number" min="1" required />
        <small v-if="submitted && errors.price" class="field-error">{{ errors.price }}</small>
      </label>
    </div>
    <label class="field section-space">
      <span>运行镜像</span>
      <input v-model="form.image" placeholder="pytorch:2.3-cuda12" required />
      <small v-if="submitted && errors.image" class="field-error">{{ errors.image }}</small>
    </label>
    <div class="form-actions section-space"><button class="primary-button" type="submit">发布资源</button></div>
  </form>
</template>

<style scoped>
.field-error {
  color: #e03a3a;
  font-size: 0.78rem;
}
</style>
