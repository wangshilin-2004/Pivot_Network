<script setup lang="ts">
import { useSessionStore } from '../stores/session'
import PanelHeader from '../components/common/PanelHeader.vue'
import TaskCard from '../components/cards/TaskCard.vue'
import Badge from '../components/common/Badge.vue'
import InlineExplainer from '../components/common/InlineExplainer.vue'

const session = useSessionStore()
</script>

<template>
  <div class="session-grid console-grid">
    <section class="session-panel console-main">
      <PanelHeader
        eyebrow="会话中心" :title="session.session.offerTitle"
        tip="当你已经开通资源后，可以在这里查看当前会话、启动任务、刷新状态或暂停运行。"
        :badge="session.session.status"
      />
      <InlineExplainer summary="查看会话说明" description="这一页用于管理已经创建的运行会话，包括查看授权信息、工作区状态和当前任务执行进度。" />

      <div class="session-hero compact-session-hero console-hero section-space">
        <div>
          <div class="session-title">{{ session.session.algorithmName }}</div>
          <div class="muted">{{ session.session.duration }} 分钟 · {{ session.session.runtimeBundleStatus }}</div>
        </div>
        <div class="session-actions">
          <button class="secondary-button" @click="session.refreshSession()">刷新</button>
          <button class="secondary-button" @click="session.startTask()">启动任务</button>
          <button class="ghost-button" @click="session.stopSession()">暂停</button>
        </div>
      </div>

      <div class="console-meta-grid">
        <div class="session-pill"><span>Session</span><strong>{{ session.session.id }}</strong></div>
        <div class="session-pill"><span>Grant</span><strong>{{ session.session.grantCode }}</strong></div>
        <div class="session-pill"><span>Workspace</span><strong>{{ session.session.workspace }}</strong></div>
        <div class="session-pill"><span>Shell</span><strong>{{ session.session.shellStatus }}</strong></div>
      </div>

      <div class="task-list section-space compact-task-grid">
        <TaskCard v-for="task in session.session.tasks" :key="task.name" :task="task" />
      </div>
    </section>

    <section class="session-panel console-side">
      <PanelHeader
        eyebrow="日志与工作区" title="当前状态"
        tip="如果你想确认数据、模型和输出目录是否可用，或者查看最近运行日志，可以看这里。"
      />
      <div class="workspace-card compact-card">
        <div class="workspace-list compact-workspace-list">
          <div v-for="item in session.session.workspaceItems" :key="item.name" class="workspace-item">
            <div><strong>{{ item.name }}</strong></div>
            <Badge :text="item.status" />
          </div>
        </div>
      </div>

      <div class="log-list section-space compact-log-list">
        <div v-for="(log, index) in session.session.logs.slice(0, 3)" :key="`${index}-${log}`" class="log-item compact-card">
          <strong>日志 {{ index + 1 }}</strong>
          <span class="muted">{{ log }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
