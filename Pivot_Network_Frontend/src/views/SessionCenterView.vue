<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSessionStore } from '../stores/session'
import PageHeader from '../components/common/PageHeader.vue'
import PanelHeader from '../components/common/PanelHeader.vue'
import Badge from '../components/common/Badge.vue'
import TaskCard from '../components/cards/TaskCard.vue'

const session = useSessionStore()

const confirming = ref(false)

const idle = computed(() => session.session.id === '—')
const ended = computed(() => ['已结束', '已暂停', '运行异常'].includes(session.session.status))
const runningSessions = computed(() => (session.isLive ? 1 : 0))
const doneTasks = computed(() => session.session.tasks.filter((task) => task.status === '完成').length)

const statusLabel = computed(() => session.session.status)
const statusTone = computed(() => {
  if (session.isLive) return 'green' as const
  if (session.session.status === '已暂停') return 'orange' as const
  if (session.session.status === '运行异常') return 'red' as const
  return 'plain' as const
})

const heroNote = computed(() => {
  if (idle.value) return '还没有运行中的会话。在资源市场选择实例下单，平台会自动签发 AccessGrant 并编排 RuntimeSession。'
  if (ended.value) return '会话已结束或暂停，运行时隧道已关闭，可回到资源市场新建会话。'
  return `${session.session.algorithmName} 正在 ${session.session.offerTitle} 上运行，共 ${runningSessions.value} 个活跃会话。`
})

function requestEnd() {
  confirming.value = true
}

function cancelEnd() {
  confirming.value = false
}

async function confirmEnd() {
  confirming.value = false
  await session.stopSession()
  if (session.error) {
    /* 失败原因由 store.error 记录，页面在顶部提示条展示 */
    confirming.value = false
  }
}

function workspaceTone(status: string) {
  if (status === '已同步') return 'green' as const
  if (status === '已挂载') return 'blue' as const
  if (status === '可写入') return 'violet' as const
  return 'plain' as const
}

function workspaceIcon(type: string) {
  if (type === '数据目录') return '▤'
  if (type === '模型目录') return '◈'
  return '▸'
}
</script>

<template>
  <div class="page">
    <div class="container">
      <PageHeader
        eyebrow="Runtime Session"
        title="会话中心"
        description="一条安全隧道，连到正在运行的算力。查看授权、任务与工作区，全部在一屏之内。"
      >
        <template v-if="confirming">
          <button class="btn btn--secondary" type="button" @click="cancelEnd">取消</button>
          <button class="btn btn--secondary" type="button" @click="confirmEnd">确认结束</button>
        </template>
        <template v-else>
          <button class="btn btn--secondary" type="button" :disabled="ended || idle" @click="requestEnd">
            结束会话
          </button>
          <button class="btn btn--primary" type="button" :disabled="ended || idle" @click="session.startTask()">
            启动任务
          </button>
        </template>
      </PageHeader>

      <p v-if="session.error" class="session-error" role="alert">{{ session.error }}</p>

      <section v-reveal class="panel panel--pad session-hero">
        <div class="hero-top">
          <div class="hero-main">
            <div class="eyebrow">Live Session</div>
            <div class="session-id">{{ session.session.id }}</div>
            <div class="hero-status">
              <Badge :text="statusLabel" :tone="statusTone" />
              <span class="hero-status-note">{{ heroNote }}</span>
            </div>
          </div>
          <button
            class="btn btn--ghost hero-refresh"
            type="button"
            :disabled="ended || idle"
            @click="session.refreshSession()"
          >
            刷新状态 ›
          </button>
        </div>

        <p v-if="confirming" class="confirm-tip" role="status" aria-live="polite">
          结束会话会停止运行中的任务，且不可恢复，确认后立即生效。
        </p>

        <div class="hero-kv">
          <div class="kv">
            <span class="kv-label">GPU 实例</span>
            <span class="kv-value">{{ session.session.offerTitle }}</span>
          </div>
          <div class="kv">
            <span class="kv-label">算法</span>
            <span class="kv-value">{{ session.session.algorithmName }}</span>
          </div>
          <div class="kv">
            <span class="kv-label">运行时长</span>
            <span class="kv-value num">{{ session.session.duration }} 分钟</span>
          </div>
          <div class="kv">
            <span class="kv-label">授权码</span>
            <span class="kv-value mono grant-code">{{ session.session.grantCode }}</span>
          </div>
        </div>

        <div class="hero-chips chip-row">
          <span class="chip mono">{{ session.session.workspace }}</span>
          <span class="chip">网络 · {{ session.session.networkMode }}</span>
          <span class="chip">Shell · {{ session.session.shellStatus }}</span>
          <span class="chip">Bundle · {{ session.session.runtimeBundleStatus }}</span>
        </div>
      </section>

      <div class="session-grid">
        <section v-reveal="60" class="panel terminal-panel">
          <div class="term-bar">
            <div class="term-dots" aria-hidden="true">
              <span class="term-dot term-dot--red" />
              <span class="term-dot term-dot--yellow" />
              <span class="term-dot term-dot--green" />
            </div>
            <span class="term-title mono" :title="`pivot@runtime — ${session.session.id}`">
              pivot@runtime — {{ session.session.id }}
            </span>
            <span class="term-status">
              <span class="term-status-dot" aria-hidden="true" />
              shell {{ session.session.shellStatus }}
            </span>
          </div>

          <div class="term-body" role="log" aria-label="会话运行日志">
            <div v-for="(log, index) in session.session.logs" :key="`${index}-${log}`" class="term-line">
              <span class="term-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="term-prompt" aria-hidden="true">❯</span>
              <span class="term-text">{{ log }}</span>
            </div>
            <div class="term-line term-line--cursor" aria-hidden="true">
              <span class="term-index">{{ String(session.session.logs.length + 1).padStart(2, '0') }}</span>
              <span class="term-prompt">❯</span>
              <span class="term-cursor" />
            </div>
          </div>

          <div class="term-foot">
            <span class="term-foot-item mono">{{ session.session.networkMode }}</span>
            <span class="term-foot-sep" aria-hidden="true">·</span>
            <span class="term-foot-item">bundle {{ session.session.runtimeBundleStatus }}</span>
            <span class="term-foot-spacer" />
            <span class="term-foot-item term-foot-path mono">{{ session.session.workspace }}</span>
          </div>
        </section>

        <section v-reveal="100" class="panel panel--pad workspace-panel">
          <PanelHeader eyebrow="Workspace" title="工作区" tip="数据集、模型与输出目录均挂载在当前会话的持久化工作区中。">
            <Badge :text="`${session.session.workspaceItems.length} 项`" />
          </PanelHeader>

          <div class="ws-list">
            <div
              v-for="item in session.session.workspaceItems"
              :key="item.name"
              class="ws-row"
            >
              <span class="ws-icon" aria-hidden="true">{{ workspaceIcon(item.type) }}</span>
              <div class="ws-copy">
                <span class="ws-name mono">{{ item.name }}</span>
                <span class="ws-type">{{ item.type }}</span>
              </div>
              <Badge :text="item.status" :tone="workspaceTone(item.status)" />
            </div>
          </div>

          <div class="hairline ws-divider" />
          <p class="ws-note">工作区在会话存续期间保持挂载，结束后转为只读快照。</p>
        </section>

        <section v-reveal="140" class="panel panel--pad tasks-panel">
          <PanelHeader eyebrow="Tasks" title="运行任务" tip="任务按编排顺序执行，运行中的任务会实时上报进度。">
            <Badge :text="`${doneTasks}/${session.session.tasks.length} 完成`" tone="blue" />
          </PanelHeader>

          <div class="task-list">
            <TaskCard v-for="task in session.session.tasks" :key="task.name" :task="task" />
          </div>

          <button
            class="btn btn--secondary btn--block tasks-start"
            type="button"
            :disabled="ended || idle"
            @click="session.startTask()"
          >
            启动主任务
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- hero ---------- */
.session-hero {
  margin-bottom: 20px;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-main {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.session-id {
  font-family: var(--font-mono);
  font-size: clamp(1.5rem, 3vw, 2.125rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--text);
  overflow-wrap: anywhere;
}

.hero-status {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-status-note {
  font-size: var(--fs-sm);
  line-height: 1.5;
  color: var(--text-3);
}

.hero-refresh {
  flex: none;
}

.confirm-tip {
  margin-top: 18px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 159, 10, 0.26);
  background: rgba(255, 159, 10, 0.08);
  color: var(--orange);
  font-size: var(--fs-sm);
  line-height: 1.5;
}

.session-error {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 69, 58, 0.28);
  background: rgba(255, 69, 58, 0.08);
  color: var(--red);
  font-size: var(--fs-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.hero-kv {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.grant-code {
  letter-spacing: 0.02em;
}

.hero-chips {
  margin-top: 20px;
}

.hero-chips .chip {
  font-size: 0.75rem;
}

/* ---------- layout ---------- */
.session-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
}

/* ---------- terminal ---------- */
.terminal-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.term-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
}

.term-dots {
  display: flex;
  gap: 6px;
  flex: none;
}

.term-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.term-dot--red {
  background: var(--red);
}
.term-dot--yellow {
  background: var(--orange);
}
.term-dot--green {
  background: var(--green);
}

.term-title {
  font-size: 0.75rem;
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.term-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 0.6875rem;
  color: var(--text-3);
  flex: none;
}

.term-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 3px rgba(48, 209, 88, 0.16);
}

.term-body {
  flex: 1 1 auto;
  overflow-x: auto;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg);
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}

.term-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5px 0;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.term-index {
  color: var(--text-4);
  flex: none;
  font-size: 0.6875rem;
  line-height: 1.9;
}

.term-prompt {
  color: var(--blue);
  flex: none;
}

.term-text {
  color: var(--text-2);
}

.term-cursor {
  display: inline-block;
  width: 7px;
  height: 14px;
  margin-top: 3px;
  background: var(--green);
  animation: term-blink 1.1s steps(2, start) infinite;
}

@keyframes term-blink {
  50% {
    opacity: 0;
  }
}

.term-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-top: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
  font-size: 0.6875rem;
  color: var(--text-4);
}

.term-foot-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.term-foot-sep {
  color: var(--text-4);
}

.term-foot-spacer {
  flex: 1 1 auto;
}

.term-foot-path {
  color: var(--text-3);
}

/* ---------- workspace ---------- */
.ws-list {
  display: grid;
}

.ws-row {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-top: 1px solid var(--line);
}

.ws-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.ws-icon {
  font-size: 0.8125rem;
  color: var(--blue);
  text-align: center;
}

.ws-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.ws-name {
  font-size: 0.8125rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ws-type {
  font-size: 0.75rem;
  color: var(--text-3);
}

.ws-divider {
  margin: 18px 0;
}

.ws-note {
  font-size: var(--fs-xs);
  line-height: 1.65;
  color: var(--text-3);
  text-wrap: pretty;
}

/* ---------- tasks ---------- */
.task-list {
  display: grid;
}

.tasks-start {
  margin-top: 20px;
}

/* ---------- responsive ---------- */
@media (max-width: 1120px) {
  .session-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .terminal-panel {
    grid-column: 1 / -1;
  }

  .hero-kv {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
}

@media (max-width: 640px) {
  .session-grid {
    grid-template-columns: 1fr;
  }

  .terminal-panel {
    grid-column: auto;
  }

  .hero-kv {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .term-body {
    max-height: 300px;
    flex: 0 1 auto;
  }

  .term-title {
    max-width: 42vw;
  }

  .term-foot-path {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .term-cursor {
    animation: none;
  }
}
</style>
