<script setup lang="ts">
const points = [
  {
    title: '买家不触碰宿主机',
    desc: '会话由平台控制面编排，买家拿到的是一段运行时会话，而不是一台机器的账号。',
  },
  {
    title: '凭证按会话签发',
    desc: 'AccessGrant 绑定算法模板与时长，随会话结束一并回收，不做长期授权。',
  },
  {
    title: '运行过程可审计',
    desc: '会话、任务与日志都留在平台侧，跑过什么、何时开始，随时可以回看。',
  },
]
</script>

<template>
  <section id="security" class="act security-act">
    <div class="container security-layout">
      <div class="security-copy">
        <p class="eyebrow">Boundary</p>
        <h2 class="act-title">运行在平台<br class="br-mobile" />的边界内。</h2>
        <p class="act-lead">
          算力属于卖家，但运行的边界属于平台。买家与卖家通过一条被编排的会话连接，
          双方都不需要暴露自己的环境。
        </p>

        <ul class="security-points">
          <li v-for="(point, index) in points" :key="point.title" v-reveal="index * 60" class="security-point">
            <span class="security-check" aria-hidden="true">✓</span>
            <div>
              <h3>{{ point.title }}</h3>
              <p>{{ point.desc }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div v-reveal="120" class="security-diagram panel panel--pad">
        <div class="diagram-row">
          <div class="diagram-node">
            <span class="diagram-label">买家</span>
            <span class="diagram-meta">浏览器</span>
          </div>
          <span class="diagram-link" aria-hidden="true" />
          <div class="diagram-node is-key">
            <span class="diagram-label">平台控制面</span>
            <span class="diagram-meta">授权 · 编排 · 审计</span>
          </div>
        </div>

        <div class="diagram-bridge">
          <span class="bridge-line" aria-hidden="true" />
          <span class="bridge-tag">加密隧道 · WireGuard</span>
          <span class="bridge-line" aria-hidden="true" />
        </div>

        <div class="diagram-row">
          <div class="diagram-node is-muted">
            <span class="diagram-label">运行时</span>
            <span class="diagram-meta">RuntimeSession</span>
          </div>
          <span class="diagram-link" aria-hidden="true" />
          <div class="diagram-node is-muted">
            <span class="diagram-label">卖家节点</span>
            <span class="diagram-meta">不对外暴露</span>
          </div>
        </div>

        <p class="diagram-note">
          WireGuard 是当前过渡组网方案，隧道实现可替换，会话边界保持不变。
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.security-act {
  padding: clamp(80px, 11vw, 140px) 0;
  border-top: 1px solid var(--line);
}

.security-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(40px, 6vw, 80px);
  align-items: center;
}

.act-title {
  margin-top: 14px;
  font-size: clamp(2rem, 4.2vw, 3.2rem);
  font-weight: 650;
  line-height: 1.06;
  letter-spacing: -0.035em;
}

.br-mobile {
  display: none;
}

.act-lead {
  margin-top: 20px;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-2);
}

.security-points {
  margin-top: 36px;
  display: grid;
  gap: 20px;
}

.security-point {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 12px;
}

.security-check {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  border-radius: 50%;
  background: rgba(48, 209, 88, 0.14);
  color: var(--green);
  font-size: 0.6875rem;
}

.security-point h3 {
  font-size: 0.9375rem;
  font-weight: 600;
}

.security-point p {
  margin-top: 5px;
  font-size: 0.8125rem;
  line-height: 1.65;
  color: var(--text-3);
}

.security-diagram {
  display: grid;
  gap: 18px;
  padding: 32px;
}

.diagram-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.diagram-node {
  flex: 1;
  display: grid;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.diagram-node.is-key {
  border-color: rgba(41, 151, 255, 0.4);
  background: rgba(41, 151, 255, 0.08);
}

.diagram-node.is-muted {
  opacity: 0.72;
}

.diagram-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.diagram-meta {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  color: var(--text-3);
}

.diagram-link {
  align-self: center;
  width: 18px;
  height: 1px;
  background: var(--line-2);
  flex: 0 0 auto;
}

.diagram-bridge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
}

.bridge-line {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(90deg, var(--line-2) 0 5px, transparent 5px 10px);
}

.bridge-tag {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  color: var(--text-3);
  white-space: nowrap;
}

.diagram-note {
  font-size: 0.6875rem;
  line-height: 1.6;
  color: var(--text-4);
}

@media (max-width: 1120px) {
  .security-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .br-mobile {
    display: inline;
  }
}

@media (max-width: 640px) {
  .security-diagram {
    padding: 20px;
  }
  .diagram-row {
    flex-direction: column;
  }
  .diagram-link {
    display: none;
  }
}
</style>
