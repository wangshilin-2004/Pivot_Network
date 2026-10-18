<script setup lang="ts">
const steps = [
  { name: 'Seller', zh: '卖家接入', desc: '登记身份并提交算力节点，成为可被平台调度的供给方。' },
  { name: 'Verified Node', zh: '节点验收', desc: '连通性、镜像与资源配额通过校验后，节点进入可售状态。' },
  { name: 'Offer', zh: '资源上架', desc: '把节点抽象为带 GPU、地域、价格与镜像的实例商品。' },
  { name: 'Order', zh: '下单', desc: '买家按小时选择实例与算法模板，生成订单。' },
  { name: 'AccessGrant', zh: '授权签发', desc: '平台按会话签发短期凭证，绑定算法与运行环境。' },
  { name: 'RuntimeSession', zh: '运行时编排', desc: '自动创建隔离的运行时会话，挂载工作区与任务。' },
  { name: 'WireGuard', zh: '隧道建立', desc: '控制面与节点建立加密隧道，买家无需接触宿主机。' },
  { name: 'Shell', zh: '可交互', desc: '在浏览器内进入终端、工作区与任务视图，直接跑起来。' },
]
</script>

<template>
  <section id="chain" class="act chain-act">
    <div class="container">
      <div class="act-head">
        <p class="eyebrow">Architecture</p>
        <h2 class="act-title">一条链路，<br class="br-mobile" />从接入到可交互。</h2>
        <p class="act-lead">
          算力不是"给一台机器"，而是一条被编排出来的交付链路。八个环节首尾相接，
          平台负责每一次状态流转，买家只需要在最后一步进入会话。
        </p>
      </div>

      <ol class="chain">
        <li
          v-for="(step, index) in steps"
          :key="step.name"
          v-reveal="index * 40"
          class="chain-step"
          :class="{ 'is-live': index === steps.length - 1 }"
        >
          <span class="chain-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="chain-dot" aria-hidden="true" />
          <span class="chain-name">{{ step.name }}</span>
          <span class="chain-zh">{{ step.zh }}</span>
          <p class="chain-desc">{{ step.desc }}</p>
        </li>
      </ol>

      <p class="chain-note">
        WireGuard 目前作为过渡组网方案；链路语义与运行时边界不依赖具体隧道实现。
      </p>
    </div>
  </section>
</template>

<style scoped>
.chain-act {
  padding: clamp(80px, 11vw, 140px) 0;
  border-top: 1px solid var(--line);
}

.act-head {
  max-width: 760px;
  margin-bottom: clamp(40px, 6vw, 64px);
}

.act-title {
  margin-top: 14px;
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  font-weight: 650;
  line-height: 1.06;
  letter-spacing: -0.035em;
}

.br-mobile {
  display: none;
}

.act-lead {
  margin-top: 20px;
  max-width: 620px;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-2);
}

.chain {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--line);
}

.chain-step {
  position: relative;
  padding: 28px 24px 32px;
  border-left: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  transition: background var(--dur-2) var(--ease);
}

.chain-step:nth-child(4n + 1) {
  border-left: 0;
  padding-left: 0;
}

.chain-step:hover {
  background: var(--surface);
}

.chain-index {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-4);
}

.chain-dot {
  position: absolute;
  top: -4px;
  left: 24px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 4px rgba(48, 209, 88, 0.12);
}

.chain-step:nth-child(4n + 1) .chain-dot {
  left: 0;
}

.chain-step.is-live .chain-dot {
  background: var(--blue);
  box-shadow: 0 0 0 4px rgba(41, 151, 255, 0.16);
  animation: chain-pulse 2.6s var(--ease) infinite;
}

@keyframes chain-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(41, 151, 255, 0.16);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(41, 151, 255, 0.04);
  }
}

.chain-name {
  display: block;
  margin-top: 14px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--text-2);
  letter-spacing: -0.01em;
}

.chain-zh {
  display: block;
  margin-top: 6px;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.chain-desc {
  margin-top: 10px;
  font-size: 0.8125rem;
  line-height: 1.65;
  color: var(--text-3);
}

.chain-note {
  margin-top: 22px;
  font-size: 0.75rem;
  color: var(--text-4);
}

@media (max-width: 860px) {
  .br-mobile {
    display: inline;
  }
  .chain {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .chain-step:nth-child(4n + 1) {
    border-left: 1px solid var(--line);
    padding-left: 24px;
  }
  .chain-step:nth-child(2n + 1) {
    border-left: 0;
    padding-left: 0;
  }
  .chain-step:nth-child(4n + 1) .chain-dot {
    left: 24px;
  }
  .chain-step:nth-child(2n + 1) .chain-dot {
    left: 0;
  }
}

@media (max-width: 640px) {
  .chain {
    grid-template-columns: 1fr;
  }
  .chain-step,
  .chain-step:nth-child(2n + 1) {
    border-left: 0;
    padding: 22px 0 26px;
  }
  .chain-step .chain-dot,
  .chain-step:nth-child(2n + 1) .chain-dot {
    left: 0;
  }
}
</style>
