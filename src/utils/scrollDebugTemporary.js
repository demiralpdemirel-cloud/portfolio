// Temporary local diagnosis only. Removed before final build.
import { ScrollTrigger } from 'gsap/ScrollTrigger'
if (new URLSearchParams(location.search).has('scroll-debug')) {
  const records = []
  let previousY = scrollY, lastEvent = 'load', refreshing = false
  const record = (type, extra = {}) => {
    records.push({ type, y: scrollY, w: innerWidth, h: innerHeight, event: lastEvent, refreshing, hash: location.hash, ...extra })
    if (records.length > 100) records.shift()
    let out = document.querySelector('[data-scroll-debug]')
    if (!out && document.body) { out = document.createElement('pre'); out.dataset.scrollDebug = ''; out.hidden = true; document.body.append(out) }
    if (out) out.textContent = JSON.stringify(records)
  }
  const nativeScroll = window.scrollTo.bind(window)
  window.scrollTo = (...args) => { record('scrollTo', { args, stack: new Error().stack }); return nativeScroll(...args) }
  for (const name of ['resize', 'orientationchange', 'touchstart', 'touchend', 'hashchange']) window.addEventListener(name, () => { lastEvent = name; record(name) }, { passive: true })
  window.visualViewport?.addEventListener('resize', () => { lastEvent = 'visualViewport.resize'; record(lastEvent) }, { passive: true })
  window.addEventListener('scroll', () => { if (previousY > 300 && scrollY < 10) record('RESET', { before: previousY }); previousY = scrollY }, { passive: true })
  ScrollTrigger.addEventListener('refreshInit', () => { refreshing = true; record('refreshInit') })
  ScrollTrigger.addEventListener('refresh', () => { record('refresh'); refreshing = false; requestAnimationFrame(() => record('after-refresh-frame')) })
  document.addEventListener('DOMContentLoaded', () => record('ready'))
}
