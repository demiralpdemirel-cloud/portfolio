import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { themeSelection, ribbonGeometry, ribbonParticles } from '../utils/themeMath'

// Named snapshots keep the glass and finite particle pool above the root wipe.
// Everything is allocated once per transition; CSS handles every animation frame.
function mountRibbon(showcase = false, duration = 700) {
  const width = window.innerWidth, height = window.innerHeight
  const geometry = ribbonGeometry(width, height, showcase)
  const host = document.createElement('div')
  host.className = 'theme-energy'
  host.setAttribute('aria-hidden', 'true')
  const ribbon = document.createElement('div')
  ribbon.className = 'theme-energy__ribbon'
  ribbon.style.width = `${geometry.length}px`
  ribbon.style.height = `${geometry.thickness}px`
  ribbon.style.viewTransitionName = 'theme-ribbon'
  host.append(ribbon)
  if (showcase) {
    const returning = ribbon.cloneNode(true)
    returning.style.viewTransitionName = 'theme-ribbon-return'
    host.append(returning)
  }
  const style = document.createElement('style')
  // One inherited animated progress drives BOTH snapshot clipping and ribbon.
  let rules = `:root{--theme-travel:${geometry.travel}px;--theme-band-offset:${geometry.bandOffset}px;}`
  ribbonParticles(width, height, showcase, duration).forEach((particle, index) => {
    const node = document.createElement('i')
    node.className = `theme-energy__spark${particle.streak ? ' is-streak' : ''}`
    const name = `theme-spark-${index}`
    // Particle tails must not keep the whole transition/bubble locked beyond
    // the 700ms swipe. They fade within the remaining master interval.
    const life = Math.min(particle.life, duration - particle.delay)
    node.style.viewTransitionName = name
    node.style.width = `${particle.streak ? particle.size * 4 : particle.size}px`
    node.style.height = `${particle.size}px`
    host.append(node)
    rules += `::view-transition-group(${name}){left:0;top:0;z-index:4;--spark-x:${particle.x}px;--spark-y:${particle.y}px;--spark-dx:${particle.dx}px;--spark-dy:${particle.dy}px;animation:theme-spark ${life}ms ${particle.delay}ms cubic-bezier(.15,.5,.3,1) both;animation-play-state:var(--theme-spark-play,paused);}::view-transition-old(${name}),::view-transition-new(${name}){animation:none;mix-blend-mode:normal;}`
  })
  style.textContent = rules
  host.append(style)
  document.body.append(host)
  return () => host.remove()
}

export default function ThemeController() {
  const { t } = useLanguage()
  const [theme, setTheme] = useState('dark')
  const [heroVisible, setHeroVisible] = useState(true)
  const [busy, setBusy] = useState(false)
  const [introCover, setIntroCover] = useState(true)
  const [introSequence, setIntroSequence] = useState(true)
  const introStarted = useRef(false)
  const manual = useRef(null)

  useLayoutEffect(() => {
    const html = document.documentElement
    let disposed = false, active = null, heroInView = true, removeRibbon = null, sweep = null
    let introRunning = true, holdTimer = null, previewActive = false
    let introCompletedAt = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const blocked = () => Boolean(document.fullscreenElement || document.querySelector('dialog[open], .showreel-viewer, .fullscreen-viewer'))
    const apply = next => {
      if (disposed) return
      html.dataset.theme = next
      setTheme(next)
    }
    const clearPreview = () => {
      if (!previewActive) return
      previewActive = false
      html.dataset.theme = 'dark'
    }
    // The preview changes snapshot appearance only, never user selection/bubble.
    const request = (next, intro = false, preview = false) => {
      if (disposed || active || blocked()) return Promise.resolve()
      const reveal = () => {
        if (disposed) return
        if (preview) { previewActive = true; html.dataset.theme = 'light'; html.dataset.themeShowcase = 'band' }
        else apply(next)
        // Commit cover removal before the browser captures the new snapshot.
        if (intro) flushSync(() => setIntroCover(false))
        if (!reduced.matches && active) removeRibbon = mountRibbon(preview)
      }
      if (!document.startViewTransition || (intro && reduced.matches)) {
        if (!preview) reveal()
        return Promise.resolve()
      }
      html.dataset.themeMotion = reduced.matches ? 'reduced' : 'wipe'
      html.style.setProperty('--theme-duration', '700ms')
      setBusy(true)
      let transition
      try { transition = document.startViewTransition(reveal) }
      catch {
        removeRibbon?.(); removeRibbon = null
        delete html.dataset.themeMotion
        setBusy(false)
        reveal()
        clearPreview()
        delete html.dataset.themeShowcase
        return Promise.resolve()
      }
      active = transition
      transition.ready.then(async () => {
        if (disposed || active !== transition || reduced.matches) return
        if (preview) {
          // Capture the masked destination during the short DARK hold, rather
          // than adding snapshot preparation AFTER a 100ms sleep.
          const remaining = Math.max(0, 100 - (performance.now() - introCompletedAt))
          if (remaining > 0) await new Promise(resolve => { holdTimer = window.setTimeout(resolve, remaining) })
          holdTimer = null
          if (disposed || active !== transition) return
        }
        // Animate the originating element: view-transition snapshots inherit its
        // live registered property, not an animated property on a sibling group.
        sweep = html.animate([{ '--theme-progress': 0 }, { '--theme-progress': 1 }], {
          duration: 700, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards',
        })
        html.style.setProperty('--theme-spark-play', 'running')
        if (intro) sweep.onfinish = () => {
          if (disposed || active !== transition) return
          // Page reveal completion is the spatial sweep end, not particle tails.
          introCompletedAt = performance.now()
          transition.skipTransition()
        }
        if (preview) sweep.onfinish = () => {
          if (disposed || active !== transition) return
          // The trailing boundary is already beyond the viewport: the LIGHT
          // snapshot mask is empty. Restore underlying DOM invisibly, with no cut.
          clearPreview()
        }
      }).catch(() => {})
      return transition.finished.catch(() => {}).finally(() => {
        clearPreview()
        removeRibbon?.(); removeRibbon = null
        sweep?.cancel(); sweep = null
        html.style.removeProperty('--theme-spark-play')
        if (disposed || active !== transition) return
        active = null
        delete html.dataset.themeMotion
        delete html.dataset.themeShowcase
        setBusy(false)
      })
    }
    apply('dark')
    const hero = document.getElementById('home')
    // Visibility only: this observer cannot request a transition or change theme.
    const visibility = new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting
      setHeroVisible(heroInView)
    }, { threshold: 0 })
    visibility.observe(hero)
    const resize = () => active?.skipTransition()
    const protectOverlay = () => { if (blocked()) active?.skipTransition() }
    const overlays = new MutationObserver(records => {
      const relevant = records.some(record => record.type === 'attributes' || [...record.addedNodes, ...record.removedNodes].some(node =>
        node.nodeType === 1 && (node.matches('dialog, .showreel-viewer, .fullscreen-viewer') || node.querySelector('dialog, .showreel-viewer, .fullscreen-viewer'))))
      if (relevant) protectOverlay()
    })
    overlays.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] })
    document.addEventListener('fullscreenchange', protectOverlay)
    window.addEventListener('resize', resize, { passive: true })
    manual.current = () => {
      if (introRunning || active || blocked() || !heroInView) return
      request(themeSelection(html.dataset.theme, { type: 'USER_TOGGLE' }))
    }
    // StrictMode-safe initial intro; never scheduled by Hero re-entry.
    // A restored mid-page load starts dark without covering the restored content.
    const atOpening = () => window.scrollY < 10 && (!location.hash || location.hash === '#home' || location.hash === '#top')
    const endIntro = () => {
      introRunning = false
      if (!disposed) setIntroSequence(false)
    }
    if (!atOpening()) { setIntroCover(false); endIntro() }
    document.fonts.ready.then(async () => {
      if (disposed) return
      if (introStarted.current) { setIntroCover(false); endIntro(); return }
      introStarted.current = true
      if (atOpening() && !blocked()) {
        await request('dark', true)
        if (disposed) return
        if (!reduced.matches && document.startViewTransition && atOpening() && !blocked()) {
          if (atOpening() && !blocked()) await request('light', false, true)
        }
      } else setIntroCover(false)
      endIntro()
    })
    return () => {
      disposed = true; manual.current = null; active?.skipTransition()
      window.clearTimeout(holdTimer)
      clearPreview()
      removeRibbon?.(); removeRibbon = null
      sweep?.cancel(); sweep = null
      html.style.removeProperty('--theme-spark-play')
      visibility.disconnect(); overlays.disconnect()
      document.removeEventListener('fullscreenchange', protectOverlay)
      window.removeEventListener('resize', resize)
      delete html.dataset.themeMotion
      delete html.dataset.themeShowcase
    }
  }, [])

  return <>
    {introCover && <div className="theme-intro-cover" aria-hidden="true" />}
    <div className={`theme-bubble-shell${heroVisible ? ' is-visible' : ''}`}>
      <button className="theme-bubble" type="button" disabled={busy || introCover || introSequence} tabIndex={heroVisible ? 0 : -1}
        aria-label={t(theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')}
        aria-pressed={theme === 'light'} onClick={() => manual.current?.()}>
        <span className="theme-orb" aria-hidden="true"><i /></span><span>{t('THEME')}</span>
      </button>
    </div>
  </>
}
