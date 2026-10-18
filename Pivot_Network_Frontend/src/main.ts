import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './assets/styles/main.css'

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * v-reveal：元素进入视口时播放一次"淡入上移"。
 * 可选参数为延迟毫秒数，例如 v-reveal="140"。
 */
const reveal = {
  mounted(el: HTMLElement, binding: { value?: unknown }) {
    if (typeof binding.value === 'number') {
      el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    }
    el.classList.add('reveal')

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-in')
            observer.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    ;(el as HTMLElement & { __revealObserver?: IntersectionObserver }).__revealObserver = observer
  },
  unmounted(el: HTMLElement & { __revealObserver?: IntersectionObserver }) {
    el.__revealObserver?.disconnect()
    delete el.__revealObserver
  },
}

const app = createApp(App)
app.directive('reveal', reveal)
app.use(createPinia())
app.use(router)
app.mount('#app')
