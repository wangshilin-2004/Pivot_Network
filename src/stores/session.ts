import { ref } from 'vue'
import { defineStore } from 'pinia'
import { sessionMock } from '../services/mock/platform.mock'
import type { AlgorithmTemplate, Offer, RuntimeSession } from '../types/domain'

export const useSessionStore = defineStore('session', () => {
  const session = ref<RuntimeSession>(structuredClone(sessionMock))

  function createSession(offer: Offer, algorithm: AlgorithmTemplate, duration: number) {
    session.value = {
      ...session.value,
      id: `rt-session-${Date.now().toString().slice(-6)}`,
      status: '运行中',
      offerTitle: offer.title,
      algorithmName: algorithm.name,
      duration,
      runtimeBundleStatus: 'ready',
      logs: [
        `订单已确认：${offer.title}`,
        `授权已签发：已绑定算法模板 ${algorithm.name}`,
        '运行时会话已创建，可进入工作区执行任务。',
      ],
      tasks: [
        { name: '环境初始化', status: '完成', output: `${offer.runtimeImage} 运行环境已准备完成` },
        { name: '主任务执行', status: '待启动', output: `${algorithm.name} 已完成参数装载` },
      ],
      workspaceItems: [
        { name: 'datasets/', type: '数据目录', status: '已同步' },
        { name: 'models/', type: '模型目录', status: '已挂载' },
        { name: 'runs/output/', type: '输出目录', status: '可写入' },
      ],
    }
  }

  function refreshSession() { session.value.logs.unshift('会话保活成功，运行状态已刷新。') }
  function stopSession() {
    session.value.status = '已暂停'
    session.value.runtimeBundleStatus = 'suspended'
    session.value.logs.unshift('会话已暂停，可随时恢复。')
  }
  function startTask() {
    session.value.tasks = session.value.tasks.map((task, index) =>
      index === 1 ? { ...task, status: '运行中', output: '任务已启动，当前吞吐量 128 samples/min' } : task,
    )
    session.value.logs.unshift('主任务已启动。')
  }

  return { session, createSession, refreshSession, stopSession, startTask }
})
