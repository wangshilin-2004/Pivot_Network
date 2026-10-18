<script setup lang="ts">
import { computed } from 'vue'
import { useOfferStore } from '../stores/offers'
import { useSessionStore } from '../stores/session'
import { useMonitorStore } from '../stores/monitor'
import ChainTimeline from '../components/landing/ChainTimeline.vue'
import ModuleGrid from '../components/landing/ModuleGrid.vue'
import SecurityBoundary from '../components/landing/SecurityBoundary.vue'

const offers = useOfferStore()
const session = useSessionStore()
const monitor = useMonitorStore()

const heroStats = computed(() => [
  { value: String(monitor.summary.onlineNodes || 4), label: '在线节点' },
  { value: String(offers.offers.length || 3), label: '在架资源' },
  { value: session.session.status === '运行中' ? '1' : '0', label: '活跃会话' },
  { value: '8', label: '主链环节' },
])

const marqueeItems = computed(() => {
  const gpus = Array.from(new Set(offers.offers.map((offer) => offer.gpu)))
  return [...gpus, 'Docker Swarm', 'WireGuard', 'FastAPI', 'PostgreSQL', 'Vue 3', 'Pinia', 'Vite']
})

const problems = [
  {
    index: '01',
    title: '供给是碎的',
    desc: '闲置 GPU 散落在不同机房与团队手里，没有统一的方式被发现、定价和调度。',
  },
  {
    index: '02',
    title: '交付靠人',
    desc: '开通一台机器要配网络、开权限、传凭证。这一步不走通，算力就只是参数表。',
  },
  {
    index: '03',
    title: '运行不可见',
    desc: '任务跑在谁的机器上、环境是否一致、出了什么问题，缺少一个统一的视图。',
  },
]

function scrollToChain() {
  document.getElementById('chain')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="landing">
    <!-- ===== Act 1 · Hero ===== -->
    <section class="hero">
      <div class="hero-bg" aria-hidden="true">
        <span class="hero-glow hero-glow--blue" />
        <span class="hero-glow hero-glow--violet" />
        <div class="hero-grid" />
        <div class="hero-floor" />
      </div>

      <div class="container hero-inner">
        <p class="hero-eyebrow">Pivot Network · 算力交易与运行平台</p>
        <h1 class="hero-title">
          让算力，<br />
          像水电一样<span class="text-gradient">流动</span>。
        </h1>
        <p class="hero-lead">
          把闲置 GPU 接入、上架为可交易资源；买家下单后平台自动编排运行会话——
          不用自己配环境，也不用接触对方的宿主机。
        </p>

        <div class="hero-actions">
          <RouterLink to="/overview" class="btn btn--primary btn--lg">进入控制台</RouterLink>
          <button type="button" class="btn btn--secondary btn--lg" @click="scrollToChain">
            看完整架构
          </button>
        </div>

        <dl class="hero-stats">
          <div v-for="stat in heroStats" :key="stat.label" class="hero-stat">
            <dt>{{ stat.label }}</dt>
            <dd>{{ stat.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="hero-cue" aria-hidden="true">
        <span class="hero-cue-line" />
        <span class="hero-cue-text">向下滚动</span>
      </div>
    </section>

    <!-- ===== Marquee ===== -->
    <div class="marquee" aria-hidden="true">
      <p class="marquee-caption">已接入的硬件与栈</p>
      <div class="marquee-viewport">
        <div class="marquee-track">
          <span v-for="(item, index) in [...marqueeItems, ...marqueeItems]" :key="index" class="marquee-item">
            {{ item }}<i class="marquee-dot" />
          </span>
        </div>
      </div>
    </div>

    <!-- ===== Act 2 · Problem ===== -->
    <section class="act problem-act">
      <div class="container">
        <div class="act-head">
          <p class="eyebrow">Why</p>
          <h2 class="act-title">算力不缺，<br class="br-mobile" />缺的是一条通路。</h2>
          <p class="act-lead">
            真正被卡住的从来不是 GPU 数量，而是从"有机器"到"能跑任务"之间的三步。
          </p>
        </div>

        <div class="problem-grid">
          <article v-for="(item, index) in problems" :key="item.index" v-reveal="index * 80" class="problem-card">
            <span class="problem-index">{{ item.index }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <ChainTimeline />
    <ModuleGrid />
    <SecurityBoundary />

    <!-- ===== Act 3 · One more thing ===== -->
    <section class="finale">
      <div class="finale-bg" aria-hidden="true" />
      <div class="container finale-inner">
        <p class="eyebrow">One more thing</p>
        <h2 class="finale-title">
          现在，把算力<br />
          当作实例来用。
        </h2>
        <p class="finale-lead">
          访问控制台，从资源市场挑一个实例，选一个算法模板，剩下的交给平台。
        </p>
        <div class="finale-actions">
          <RouterLink to="/marketplace" class="btn btn--secondary btn--lg">浏览资源市场</RouterLink>
          <RouterLink to="/overview" class="btn btn--ghost btn--lg">进入控制台</RouterLink>
        </div>
        <p class="finale-hint">
          随时按 <kbd>⌘</kbd><kbd>K</kbd> 打开命令面板，跳转到任意模块。
        </p>
        <p class="finale-note">开发演示环境 · 数据来自前端 Mock 服务</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing {
  position: relative;
  padding-top: 0;
}

/* ================= Hero ================= */
.hero {
  position: relative;
  min-height: calc(100svh - var(--nav-h));
  display: grid;
  place-items: center;
  padding: 96px 0 112px;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
}

.hero-glow--blue {
  width: min(60vw, 760px);
  height: min(60vw, 760px);
  top: -18%;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(41, 151, 255, 0.34), transparent 70%);
}

.hero-glow--violet {
  width: min(46vw, 560px);
  height: min(46vw, 560px);
  right: 4%;
  bottom: -22%;
  background: radial-gradient(circle, rgba(191, 90, 242, 0.2), transparent 70%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 88px 88px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 78%);
  opacity: 0.55;
}

.hero-floor {
  position: absolute;
  left: 50%;
  bottom: -32%;
  width: 160%;
  height: 70%;
  transform: translateX(-50%) perspective(600px) rotateX(74deg);
  transform-origin: top center;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.09) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.09) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, #000, transparent 70%);
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent 70%);
  opacity: 0.4;
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  text-align: center;
}

.hero-eyebrow {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-3);
}

.hero-title {
  margin-top: 24px;
  font-size: clamp(2.9rem, 7.4vw, 6rem);
  font-weight: 650;
  line-height: 1.03;
  letter-spacing: -0.04em;
  background: linear-gradient(180deg, #ffffff 35%, #b9b9c0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-title .text-gradient {
  background: linear-gradient(100deg, var(--cyan), var(--blue) 45%, var(--violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-lead {
  margin-top: 26px;
  max-width: 620px;
  font-size: clamp(1rem, 1.4vw, 1.1875rem);
  line-height: 1.7;
  color: var(--text-2);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 36px;
}

.hero-stats {
  display: flex;
  margin: 64px 0 0;
  border-top: 1px solid var(--line);
}

.hero-stat {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  padding: 22px 34px 0;
  border-left: 1px solid var(--line);
  text-align: left;
}

.hero-stat:first-child {
  border-left: 0;
  padding-left: 0;
}

.hero-stat dt {
  order: 2;
  font-size: 0.6875rem;
  color: var(--text-3);
}

.hero-stat dd {
  margin: 0 0 8px;
  font-size: clamp(1.6rem, 2.6vw, 2.25rem);
  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.hero-cue {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  gap: 10px;
}

.hero-cue-line {
  width: 1px;
  height: 44px;
  background: linear-gradient(to bottom, transparent, var(--line-2));
  animation: cue 2.8s var(--ease) infinite;
}

@keyframes cue {
  0% {
    transform: scaleY(0.4);
    transform-origin: top;
    opacity: 0;
  }
  45% {
    transform: scaleY(1);
    opacity: 1;
  }
  100% {
    transform: scaleY(1);
    transform-origin: bottom;
    opacity: 0;
  }
}

.hero-cue-text {
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-4);
}

/* ================= Marquee ================= */
.marquee {
  border-bottom: 1px solid var(--line);
  padding: 26px 0;
  overflow: hidden;
}

.marquee-caption {
  margin-bottom: 18px;
  text-align: center;
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-4);
}

.marquee-viewport {
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 42s linear infinite;
}

.marquee-item {
  display: inline-flex;
  align-items: center;
  gap: 28px;
  padding-right: 28px;
  font-size: 1.0625rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--text-2);
  white-space: nowrap;
}

.marquee-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--line-3);
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* ================= Acts ================= */
.act {
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

.act-lead {
  margin-top: 20px;
  max-width: 620px;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-2);
}

.br-mobile {
  display: none;
}

/* ================= Problem ================= */
.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.problem-card {
  padding: 30px 28px 34px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  transition: border-color var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
}

.problem-card:hover {
  background: var(--surface-2);
  border-color: var(--line-2);
}

.problem-index {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-4);
}

.problem-card h3 {
  margin-top: 46px;
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.problem-card p {
  margin-top: 12px;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--text-3);
}

/* ================= Finale ================= */
.finale {
  position: relative;
  padding: clamp(100px, 16vw, 200px) 0;
  border-top: 1px solid var(--line);
  overflow: hidden;
}

.finale-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 70% at 50% 110%, rgba(41, 151, 255, 0.16), transparent 70%),
    radial-gradient(ellipse 40% 50% at 80% 0%, rgba(191, 90, 242, 0.1), transparent 70%);
  pointer-events: none;
}

.finale-inner {
  position: relative;
  display: grid;
  justify-items: center;
  text-align: center;
}

.finale-title {
  margin-top: 22px;
  font-size: clamp(2.4rem, 6.2vw, 5rem);
  font-weight: 650;
  line-height: 1.05;
  letter-spacing: -0.04em;
  background: linear-gradient(180deg, #fff 40%, #b9b9c0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.finale-lead {
  margin-top: 24px;
  max-width: 540px;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-2);
}

.finale-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 34px;
}

.finale-hint {
  margin-top: 30px;
  font-size: 0.75rem;
  color: var(--text-3);
}

.finale-hint kbd {
  display: inline-block;
  min-width: 20px;
  padding: 2px 6px;
  margin: 0 2px;
  border: 1px solid var(--line-2);
  border-radius: 6px;
  background: var(--surface-2);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-2);
  text-align: center;
}

.finale-note {
  margin-top: 46px;
  font-size: 0.6875rem;
  color: var(--text-4);
}

/* ================= Responsive ================= */
@media (max-width: 1120px) {
  .hero-stats {
    flex-wrap: wrap;
  }
}

@media (max-width: 860px) {
  .br-mobile {
    display: inline;
  }
  .problem-grid {
    grid-template-columns: 1fr;
  }
  .hero {
    padding: 72px 0 96px;
  }
  .hero-cue {
    display: none;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: clamp(2.35rem, 10vw, 3.1rem);
  }
  .hero-stats {
    width: 100%;
    margin-top: 48px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .hero-stat {
    padding: 16px 0 16px 16px;
    border-left: 1px solid var(--line);
  }
  .hero-stat:first-child {
    padding-left: 16px;
  }
  .hero-stat:nth-child(odd) {
    border-left: 0;
    padding-left: 0;
  }
  .hero-stat:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
  .hero-actions {
    width: 100%;
    display: grid;
  }
  .hero-actions .btn {
    width: 100%;
  }
  .problem-card {
    padding: 24px 22px 28px;
  }
  .problem-card h3 {
    margin-top: 32px;
  }
  .marquee-item {
    font-size: 0.9375rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track,
  .hero-cue-line {
    animation: none;
  }
  .hero-floor,
  .hero-grid {
    display: none;
  }
}
</style>
