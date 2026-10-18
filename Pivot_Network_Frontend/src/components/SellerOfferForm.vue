<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'

interface SellerOfferPayload {
  title: string
  region: string
  gpu: string
  cpu: string
  memory: string
  price: number
  image: string
}

const emit = defineEmits<{
  (e: 'publish', payload: SellerOfferPayload): void
}>()

const form = reactive<SellerOfferPayload>({
  title: '',
  region: '',
  gpu: '',
  cpu: '',
  memory: '',
  price: 20,
  image: '',
})

const touched = reactive<Record<string, boolean>>({})
const submitted = ref(false)
const success = ref('')
let successTimer: ReturnType<typeof setTimeout> | undefined

const isValid = computed(
  () =>
    form.title.trim().length > 0 &&
    form.region.trim().length > 0 &&
    form.gpu.trim().length > 0 &&
    form.cpu.trim().length > 0 &&
    form.memory.trim().length > 0 &&
    form.image.trim().length > 0 &&
    Number(form.price) > 0,
)

const filledCount = computed(
  () =>
    [form.title, form.region, form.gpu, form.cpu, form.memory, form.image].filter((value) => value.trim().length > 0)
      .length + (Number(form.price) > 0 ? 1 : 0),
)

const REQUIRED_COUNT = 7

function errorOf(field: keyof SellerOfferPayload): string {
  const visible = submitted.value || touched[field]
  if (!visible) return ''
  switch (field) {
    case 'title':
      return form.title.trim() ? '' : '请输入资源名称'
    case 'region':
      return form.region.trim() ? '' : '请输入所在区域'
    case 'gpu':
      return form.gpu.trim() ? '' : '请输入 GPU 型号'
    case 'cpu':
      return form.cpu.trim() ? '' : '请输入 CPU 规格'
    case 'memory':
      return form.memory.trim() ? '' : '请输入内存规格'
    case 'image':
      return form.image.trim() ? '' : '请输入运行镜像'
    case 'price':
      return Number(form.price) > 0 ? '' : '请输入有效单价'
    default:
      return ''
  }
}

function resetForm() {
  form.title = ''
  form.region = ''
  form.gpu = ''
  form.cpu = ''
  form.memory = ''
  form.price = 20
  form.image = ''
  Object.keys(touched).forEach((key) => {
    touched[key] = false
  })
  submitted.value = false
}

function submit() {
  submitted.value = true
  if (!isValid.value) return

  const payload: SellerOfferPayload = { ...form }
  emit('publish', payload)
  resetForm()

  success.value = `「${payload.title}」已提交审核，稍后可在发布记录中查看。`
  if (successTimer) clearTimeout(successTimer)
  successTimer = setTimeout(() => {
    success.value = ''
  }, 6000)
}

onBeforeUnmount(() => {
  if (successTimer) clearTimeout(successTimer)
})
</script>

<template>
  <form class="offer-form" novalidate @submit.prevent="submit">
    <p class="form-intro">填写实例规格与定价，提交后进入平台审核队列。带 * 为必填项。</p>

    <div class="form-grid">
      <label class="field">
        <span class="field-label">资源名称 <em>*</em></span>
        <input
          v-model="form.title"
          class="input"
          type="text"
          placeholder="4090 推理实例"
          autocomplete="off"
          @blur="touched.title = true"
        />
        <small v-if="errorOf('title')" class="field-error">{{ errorOf('title') }}</small>
      </label>

      <label class="field">
        <span class="field-label">所在区域 <em>*</em></span>
        <input
          v-model="form.region"
          class="input"
          type="text"
          placeholder="天津边缘节点"
          autocomplete="off"
          @blur="touched.region = true"
        />
        <small v-if="errorOf('region')" class="field-error">{{ errorOf('region') }}</small>
      </label>

      <label class="field">
        <span class="field-label">GPU 型号 <em>*</em></span>
        <input
          v-model="form.gpu"
          class="input"
          type="text"
          placeholder="RTX 4090"
          autocomplete="off"
          @blur="touched.gpu = true"
        />
        <small v-if="errorOf('gpu')" class="field-error">{{ errorOf('gpu') }}</small>
      </label>

      <label class="field">
        <span class="field-label">CPU 规格 <em>*</em></span>
        <input
          v-model="form.cpu"
          class="input"
          type="text"
          placeholder="32 vCPU"
          autocomplete="off"
          @blur="touched.cpu = true"
        />
        <small v-if="errorOf('cpu')" class="field-error">{{ errorOf('cpu') }}</small>
      </label>

      <label class="field">
        <span class="field-label">内存规格 <em>*</em></span>
        <input
          v-model="form.memory"
          class="input"
          type="text"
          placeholder="128 GB"
          autocomplete="off"
          @blur="touched.memory = true"
        />
        <small v-if="errorOf('memory')" class="field-error">{{ errorOf('memory') }}</small>
      </label>

      <label class="field">
        <span class="field-label">单价（元/小时） <em>*</em></span>
        <input
          v-model.number="form.price"
          class="input"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          @blur="touched.price = true"
        />
        <small v-if="errorOf('price')" class="field-error">{{ errorOf('price') }}</small>
      </label>
    </div>

    <label class="field">
      <span class="field-label">运行镜像 <em>*</em></span>
      <input
        v-model="form.image"
        class="input"
        type="text"
        placeholder="pytorch:2.3-cuda12"
        autocomplete="off"
        spellcheck="false"
        @blur="touched.image = true"
      />
      <small v-if="errorOf('image')" class="field-error">{{ errorOf('image') }}</small>
    </label>

    <div class="form-foot">
      <div class="form-status">
        <span class="form-progress" :class="{ 'is-ready': isValid }">
          {{ filledCount }}/{{ REQUIRED_COUNT }} 必填项已填写
        </span>
        <span class="form-hint">{{ isValid ? '校验通过，可以发布。' : '补全全部必填项后即可发布。' }}</span>
      </div>
      <button class="btn btn--secondary btn--lg submit-btn" type="submit" :disabled="!isValid">
        发布资源
      </button>
    </div>

    <p v-if="success" class="form-success" role="status" aria-live="polite">
      <span class="success-dot" aria-hidden="true" />
      {{ success }}
    </p>
  </form>
</template>

<style scoped>
.offer-form {
  display: grid;
  gap: var(--s-5);
}

.form-intro {
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: var(--text-3);
  text-wrap: pretty;
}

.field-label em {
  font-style: normal;
  color: var(--orange);
  margin-left: 2px;
}

.field-error {
  font-size: 0.75rem;
  color: var(--red);
}

.form-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: var(--s-4);
  border-top: 1px solid var(--line);
}

.form-status {
  display: grid;
  gap: 2px;
}

.form-progress {
  font-size: var(--fs-sm);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.form-progress.is-ready {
  color: var(--green);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-3);
}

.submit-btn {
  min-width: 148px;
}

.form-success {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(48, 209, 88, 0.26);
  background: rgba(48, 209, 88, 0.1);
  color: var(--green);
  font-size: var(--fs-sm);
  line-height: 1.5;
}

.success-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  flex: none;
}

@media (max-width: 640px) {
  .form-foot {
    flex-direction: column;
    align-items: stretch;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
