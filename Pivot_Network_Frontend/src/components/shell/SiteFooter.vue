<script setup lang="ts">
import { navItems } from '../../router/nav'
import { useConnectionStore } from '../../stores/connection'

const year = new Date().getFullYear()
const connection = useConnectionStore()
const connected = connection.modeLabel
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="brand-mark">P</span>
            <span class="footer-name">Pivot Network</span>
          </div>
          <p class="footer-tagline">把闲置算力，变成可交易、可编排、可隔离运行的云资源。</p>
        </div>

        <nav class="footer-links" aria-label="页脚导航">
          <div class="footer-col">
            <div class="footer-col-title">产品</div>
            <RouterLink v-for="item in navItems.slice(1, 4)" :key="item.to" :to="item.to">
              {{ item.label }}
            </RouterLink>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">平台</div>
            <RouterLink v-for="item in navItems.slice(4)" :key="item.to" :to="item.to">
              {{ item.label }}
            </RouterLink>
          </div>
          <div class="footer-col footer-col--muted">
            <div class="footer-col-title">技术栈</div>
            <span>Vue 3 · Vite · TypeScript</span>
            <span>FastAPI · PostgreSQL</span>
            <span>Docker Swarm · WireGuard</span>
          </div>
        </nav>
      </div>

      <div class="footer-bottom">
        <span>© {{ year }} Pivot Network · 毕业设计项目</span>
        <span class="footer-note">
          {{ connected }} · {{ connection.apiLabel }}
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--line);
  padding: 56px 0 40px;
  background: #000;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  padding-bottom: 40px;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-name {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.footer-tagline {
  margin-top: 14px;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-3);
}

.footer-links {
  display: flex;
  gap: clamp(32px, 6vw, 88px);
}

.footer-col {
  display: grid;
  gap: 10px;
  align-content: start;
}

.footer-col-title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 2px;
}

.footer-col a {
  font-size: 0.8125rem;
  color: var(--text-2);
  text-decoration: none;
  transition: color var(--dur-1);
}

.footer-col a:hover {
  color: var(--text);
  text-decoration: none;
}

.footer-col--muted span {
  font-size: 0.8125rem;
  color: var(--text-3);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  font-size: 0.75rem;
  color: var(--text-3);
}

.footer-note {
  color: var(--text-4);
}

@media (max-width: 860px) {
  .footer-top {
    flex-direction: column;
    gap: 36px;
  }
  .footer-links {
    flex-wrap: wrap;
    gap: 32px 48px;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
