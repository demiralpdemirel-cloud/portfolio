import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { themeSelection } from '../utils/themeMath'

export default function ThemeController() {
  const { t } = useLanguage()
  const [theme, setTheme] = useState('dark')
  const [heroVisible, setHeroVisible] = useState(true)
  const [busy, setBusy] = useState(false)
  const [introCover, setIntroCover] = useState(true)
  const introStarted = useRef(false)
  const manual = useRef(null)

  useLayoutEffect(() => {
    const html = document.documentElement
    let disposed = false, active = null, heroInView = true
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const blocked = () => Boolean(document.fullscreenElement || document.querySelector('dialog[open], .showreel-viewer, .fullscreen-viewer'))
    const apply = next => {
      if (disposed) return
      html.dataset.theme = next
      setTheme(next)
    }
    // Intro reveals an already-dark site. Only user actions change its palette.
    // Both use the existing snapshot engine, without any scroll/theme mapping.
    const request = (next, intro = false) => {
      if (disposed || active || blocked()) return
      const reveal = () => {
        if (disposed) return
        apply(next)
        // Commit cover removal before the browser captures the new snapshot.
        if (intro) flushSync(() => setIntroCover(false))
      }
      if (!document.startViewTransition || (intro && reduced.matches)) { reveal(); return }
      html.dataset.themeMotion = reduced.matches ? 'reduced' : 'wipe'
      setBusy(true)
      let transition
      try { transition = document.startViewTransition(reveal) }
      catch {
        delete html.dataset.themeMotion
        setBusy(false)
        reveal()
        return
      }
      active = transition
      transition.ready.catch(() => {})
      transition.finished.catch(() => {}).finally(() => {
        if (disposed || active !== transition) return
        active = null
        delete html.dataset.themeMotion
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
      if (active || blocked() || !heroInView) return
      request(themeSelection(html.dataset.theme, { type: 'USER_TOGGLE' }))
    }
    // StrictMode-safe initial intro; never scheduled by Hero re-entry.
    // A restored mid-page load starts dark without covering the restored content.
    const atOpening = () => window.scrollY < 10 && (!location.hash || location.hash === '#home' || location.hash === '#top')
    if (!atOpening()) setIntroCover(false)
    document.fonts.ready.then(() => {
      if (disposed || introStarted.current) return
      introStarted.current = true
      if (atOpening() && !blocked()) request('dark', true)
      else setIntroCover(false)
    })
    return () => {
      disposed = true; manual.current = null; active?.skipTransition()
      visibility.disconnect(); overlays.disconnect()
      document.removeEventListener('fullscreenchange', protectOverlay)
      window.removeEventListener('resize', resize)
      delete html.dataset.themeMotion
    }
  }, [])

  return <>
    {introCover && <div className="theme-intro-cover" aria-hidden="true" />}
    <div className={`theme-bubble-shell${heroVisible ? ' is-visible' : ''}`}>
      <button className="theme-bubble" type="button" disabled={busy || introCover} tabIndex={heroVisible ? 0 : -1}
        aria-label={t(theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')}
        aria-pressed={theme === 'light'} onClick={() => manual.current?.()}>
        <span className="theme-orb" aria-hidden="true"><i /></span><span>{t('THEME')}</span>
      </button>
    </div>
  </>
}
