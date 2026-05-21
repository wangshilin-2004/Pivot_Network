<script setup lang="ts">
import { useMonitorStore } from '../stores/monitor'
import PanelHeader from '../components/common/PanelHeader.vue'
import NodeRow from '../components/cards/NodeRow.vue'
import GpuTrendChart from '../components/GpuTrendChart.vue'
import InlineExplainer from '../components/common/InlineExplainer.vue'
import EmptyState from '../components/common/EmptyState.vue'
import SkeletonCard from '../components/common/SkeletonCard.vue'

const monitor = useMonitorStore()
</script>

<template>
  <div class="monitor-grid">
    <section class="content-panel">
      <PanelHeader
        eyebrow="监控中心" title="集群负载"
        tip="如果你想确认当前是否适合启动新任务，可以先查看这里的整体 GPU 负载变化。"
        :badge="monitor.loading ? '加载中...' : `平均 GPU ${monitor.summary.avgGpuUsage}%`"
      />
      <InlineExplainer summary="查看监控说明" description="这里会展示平台近期的 GPU 使用趋势，帮助你判断当前资源是否充足、负载是否平稳。" />

      <GpuTrendChart v-if="!monitor.loading"
        :points="monitor.trend"
        :peak="74"
        :avg="monitor.summary.avgGpuUsage"
      />
      <SkeletonCard v-else :lines="5" class="section-space" />
    </section>

    <section class="content-panel">
      <PanelHeader
        eyebrow="节点状态" title="在线节点"
        tip="如果你需要了解某个节点是否健康、是否有空闲资源，可以在这里查看节点级状态。"
      />

      <div v-if="monitor.loading" class="node-table">
        <SkeletonCard v-for="i in 4" :key="i" :lines="2" />
      </div>

      <template v-else>
        <EmptyState
          v-if="monitor.nodes.length === 0"
          title="暂无在线节点"
          description="当前所有节点均处于离线状态。"
        />
        <div v-else class="node-table">
          <NodeRow v-for="node in monitor.nodes" :key="node.name" :node="node" />
        </div>
      </template>
    </section>
  </div>
</template>
