<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { navItems } from '../../router/nav'
import CommandPalette from './CommandPalette.vue'

const route = useRoute()
const router = useRouter()

const scrolled = ref(false)
const progress = ref(0)
const menuOpen = ref(false)
const paletteOpen = ref(false)

const navLinks = computed(() => navItems)

const cta = computed(() => {
  if (route.path === '/') return { label: '进入控制台', to: '/overview' }
  if (route.path === '/session') return { label: '浏览资源', to: '/marketplace' }
  return { label: '当前会话', to: '/session' }
})

let frame = 0
function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    const top = window.scrollY || 0
    scrolled.value = top > 8
    const doc = document.documentElement
    const max = doc.scrollHeight - doc.clientHeight
    progress.value = max > 0 ? Math.min(1, top / max) : 0
  })
}

function onKey(event: KeyboardEvent) {
  const isPalette = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
  if (isPalette) {
    event.preventDefault()
    paletteOpen.value = !paletteOpen.value
  }
}

function onOpenCommand() {
  paletteOpen.value = true
}

function go(to: string) {
  menuOpen.value = false
  if (route.path !== to) router.push(to)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('open-command', onOpenCommand)
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('open-command', onOpenCommand)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <header class="nav" :class="{ 'is-scrolled': scrolled, 'is-menu-open': menuOpen }">
    <div class="nav-progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true" />

    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand" aria-label="Pivot Network 首页">
        <span class="brand-mark">P</span>
        <span class="nav-brand-text">Pivot<span class="nav-brand-light">Network</span></span>
      </RouterLink>

      <nav class="nav-links" aria-label="主导航">
        <RouterLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ 'is-active': route.path === item.to }"
          :aria-current="route.path === item.to ? 'page' : undefined"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <button class="nav-search" type="button" aria-label="打开全局搜索" @click="paletteOpen = true">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.4" />
            <path d="M10.6 10.6 14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <kbd>⌘K</kbd>
        </button>
        <RouterLink :to="cta.to" class="btn btn--primary btn--sm nav-cta">{{ cta.label }}</RouterLink>
        <button
          class="nav-burger"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="menuOpen = !menuOpen"
        >
          <span :class="{ 'is-x': menuOpen }" />
        </button>
      </div>
    </div>

    <Transition name="menu">
      <div v-if="menuOpen" class="mobile-menu">
        <button
          v-for="item in navLinks"
          :key="item.to"
          type="button"
          class="mobile-link"
          :class="{ 'is-active': route.path === item.to }"
          :aria-current="route.path === item.to ? 'page' : undefined"
          @click="go(item.to)"
        >
          <span class="mobile-link-label">{{ item.label }}</span>
          <span class="mobile-link-kicker">{{ item.kicker }}</span>
        </button>
        <button class="mobile-search" type="button" @click="menuOpen = false; paletteOpen = true">
          搜索 <kbd>⌘K</kbd>
        </button>
      </div>
    </Transition>

    <CommandPalette v-model:open="paletteOpen" />
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid transparent;
  transition: background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease);
}

.nav.is-scrolled {
  background: rgba(0, 0, 0, 0.78);
  border-bottom-color: var(--line);
}

.nav-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  transform-origin: 0 50%;
  transform: scaleX(0);
  background: var(--gradient-brand);
  transition: transform 80ms linear;
}

.nav-inner {
  max-width: var(--content);
  height: var(--nav-h);
  margin: 0 auto;
  padding-inline: var(--gutter);
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--text);
  text-decoration: none;
  flex: none;
}

.nav-brand:hover {
  text-decoration: none;
}

.nav-brand-text {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.nav-brand-light {
  color: var(--text-3);
  font-weight: 500;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.nav-link {
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 450;
  color: var(--text-2);
  text-decoration: none;
  transition: color var(--dur-1) var(--ease), background var(--dur-1) var(--ease);
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--text);
  background: var(--surface);
  text-decoration: none;
}

.nav-link.is-active {
  color: var(--text);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.nav-search {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid var(--line);
  color: var(--text-3);
  font-size: 0.6875rem;
  transition: color var(--dur-1), border-color var(--dur-1), background var(--dur-1);
}

.nav-search:hover {
  color: var(--text-2);
  border-color: var(--line-2);
  background: var(--surface);
}

.nav-search kbd {
  font-family: var(--font);
  font-size: 0.625rem;
  color: var(--text-3);
  border: 0;
  background: none;
  padding: 0;
}

.nav-cta {
  height: 30px;
  padding: 0 14px;
  font-size: 0.75rem;
}

.nav-burger {
  display: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--line);
  place-items: center;
}

.nav-burger span {
  position: relative;
  display: block;
  width: 14px;
  height: 1.5px;
  background: var(--text);
  border-radius: 2px;
  transition: background var(--dur-1);
}

.nav-burger span::before,
.nav-burger span::after {
  content: '';
  position: absolute;
  left: 0;
  width: 14px;
  height: 1.5px;
  background: var(--text);
  border-radius: 2px;
  transition: transform var(--dur-1) var(--ease), opacity var(--dur-1);
}

.nav-burger span::before {
  top: -4.5px;
}
.nav-burger span::after {
  top: 4.5px;
}

.nav-burger span.is-x {
  background: transparent;
}
.nav-burger span.is-x::before {
  transform: translateY(4.5px) rotate(45deg);
}
.nav-burger span.is-x::after {
  transform: translateY(-4.5px) rotate(-45deg);
}

/* ---------- mobile menu ---------- */
.mobile-menu {
  display: none;
  position: fixed;
  inset: var(--nav-h) 0 0 0;
  padding: 16px var(--gutter) 40px;
  background: rgba(0, 0, 0, 0.94);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  overflow-y: auto;
}

.mobile-link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  padding: 16px 4px;
  border-bottom: 1px solid var(--line);
  color: var(--text);
  text-align: left;
}

.mobile-link-label {
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.mobile-link-kicker {
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
}

.mobile-link.is-active .mobile-link-label {
  color: var(--blue);
}

.mobile-search {
  margin-top: 24px;
  color: var(--text-2);
  font-size: 0.9375rem;
}

.mobile-search kbd {
  font-family: var(--font);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity var(--dur-2) var(--ease);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

@media (max-width: 1000px) {
  .nav-links {
    display: none;
  }
  .nav-actions {
    margin-left: auto;
  }
  .nav-burger {
    display: grid;
  }
  .mobile-menu {
    display: block;
  }
}

@media (max-width: 640px) {
  .nav-inner {
    gap: 12px;
  }
  .nav-search {
    display: none;
  }
  .nav-cta {
    display: none;
  }
}
</style>
