<script setup lang="ts">
import { useOfferStore } from '../stores/offers'
import { useSessionStore } from '../stores/session'
import { useMonitorStore } from '../stores/monitor'
import PanelHeader from '../components/common/PanelHeader.vue'
import MetricCard from '../components/cards/MetricCard.vue'
import ActivityItem from '../components/cards/ActivityItem.vue'
import InlineExplainer from '../components/common/InlineExplainer.vue'

const offers = useOfferStore()
const session = useSessionStore()
const monitor = useMonitorStore()
</script>

<template>
  <div class="overview-grid dashboard-grid">
    <section class="content-panel dashboard-main">
      <PanelHeader
        eyebrow="总览" title="平台运行态势"
        tip="如果你先想快速了解平台当前状态，可以先看这里的资源数量、会话活跃度和 GPU 负载。"
        badge="稳定运行"
      />
      <div class="metric-row dashboard-metrics">
        <MetricCard label="在线节点" :value="monitor.summary.onlineNodes" :accent="true" />
        <MetricCard label="可售资源" :value="offers.offers.length" />
        <MetricCard label="活跃会话" :value="session.session.status === '运行中' ? 1 : 0" />
        <MetricCard label="平均 GPU" :value="`${monitor.summary.avgGpuUsage}%`" />
      </div>
      <InlineExplainer class="section-space" summary="查看总览说明" description="你可以在这一页快速判断三件事：当前资源够不够用、平台会话是否活跃、集群负载是否适合继续提交任务。" />
      <div class="dashboard-stream section-space">
        <div class="stream-card">
          <div class="stream-label">资源流转</div>
          <div class="stream-value">资源接入后上架展示，用户下单后即可进入会话运行。</div>
        </div>
        <div class="stream-card">
          <div class="stream-label">当前主场景</div>
          <div class="stream-value">适用于训练、推理和多模态任务的统一调度与运行。</div>
        </div>
      </div>
    </section>

    <section class="content-panel dashboard-side">
      <PanelHeader eyebrow="动态" title="近期活动" tip="如果你想了解平台刚刚发生了什么，可以在这里查看关键动作。" />
      <div class="activity-list compact-activity-list">
        <ActivityItem label="新资源上架" badge="Offer" description="卖家节点通过验收后进入资源池。" />
        <ActivityItem label="订单创建" badge="Order" description="买家选择算力与算法模板后创建订单。" />
        <ActivityItem label="授权签发" badge="Grant" description="当前会话已生成访问授权并完成开通。" />
        <ActivityItem label="任务运行中" badge="Task" description="样例推理作业正在处理目标检测任务。" />
      </div>
    </section>
  </div>
</template>
