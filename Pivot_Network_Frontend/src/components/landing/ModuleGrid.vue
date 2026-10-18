<script setup lang="ts">
const modules = [
  {
    to: '/overview',
    en: 'Overview',
    zh: '平台总览',
    desc: '指标、主链状态与近期动态，一屏看清平台正在发生什么。',
  },
  {
    to: '/marketplace',
    en: 'Marketplace',
    zh: '资源市场',
    desc: '按 GPU 型号、地域与价格挑选算力实例，按小时开通。',
  },
  {
    to: '/algorithms',
    en: 'Algorithms',
    zh: '算法工坊',
    desc: '训练、推理与微调模板开箱可用，下单时一键绑定。',
  },
  {
    to: '/monitor',
    en: 'Monitor',
    zh: '监控中心',
    desc: '节点状态、GPU 利用率与趋势曲线，波动一眼可见。',
  },
  {
    to: '/seller',
    en: 'Seller Console',
    zh: '卖家控制台',
    desc: '接入节点、上架资源，把闲置算力变成可交易的供给。',
  },
  {
    to: '/session',
    en: 'Session Center',
    zh: '会话中心',
    desc: '授权、工作区、任务与运行日志集中管理，随时进入终端。',
  },
]
</script>

<template>
  <section id="modules" class="act modules-act">
    <div class="container">
      <div class="act-head">
        <p class="eyebrow">Product</p>
        <h2 class="act-title">六个模块，<br class="br-mobile" />一个闭环。</h2>
        <p class="act-lead">
          供给、交易、运行三段被拆进六个界面。每个界面只做一件事，并且把这件事做到位。
        </p>
      </div>

      <div class="module-grid">
        <RouterLink
          v-for="(module, index) in modules"
          :key="module.to"
          v-reveal="index * 50"
          :to="module.to"
          class="module-card"
        >
          <span class="module-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="module-main">
            <span class="module-en">{{ module.en }}</span>
            <span class="module-zh">{{ module.zh }}</span>
            <p class="module-desc">{{ module.desc }}</p>
          </div>
          <span class="module-arrow" aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.modules-act {
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

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.module-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  padding: 26px 26px 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  overflow: hidden;
  transition:
    background var(--dur-2) var(--ease),
    border-color var(--dur-2) var(--ease),
    transform var(--dur-2) var(--ease);
}

.module-card::after {
  content: '';
  position: absolute;
  right: -60px;
  top: -60px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(41, 151, 255, 0.28), transparent 70%);
  opacity: 0;
  transition: opacity var(--dur-2) var(--ease);
}

.module-card:hover {
  background: var(--surface-2);
  border-color: var(--line-2);
  transform: translateY(-3px);
  text-decoration: none;
}

.module-card:hover::after {
  opacity: 1;
}

.module-index {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-4);
}

.module-main {
  display: block;
  margin-top: 28px;
}

.module-en {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.module-zh {
  display: block;
  margin-top: 8px;
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.module-desc {
  margin-top: 10px;
  font-size: 0.8125rem;
  line-height: 1.65;
  color: var(--text-3);
}

.module-arrow {
  position: absolute;
  right: 24px;
  bottom: 22px;
  font-size: 1.125rem;
  color: var(--text-3);
  transition: transform var(--dur-2) var(--ease), color var(--dur-2) var(--ease);
}

.module-card:hover .module-arrow {
  transform: translateX(4px);
  color: var(--text);
}

@media (max-width: 1120px) {
  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .br-mobile {
    display: inline;
  }
}

@media (max-width: 640px) {
  .module-grid {
    grid-template-columns: 1fr;
  }
  .module-card {
    min-height: 0;
    padding: 22px;
  }
}
</style>
