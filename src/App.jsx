import { useLanguage } from './i18n/LanguageContext'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './sections/Hero/Hero'
import About from './sections/About/About'
import Work from './sections/Work/Work'
import Experience from './components/experience/Experience'
import Capabilities from './sections/Capabilities/Capabilities'
import PortfolioArchive from './sections/Archive/PortfolioArchive'
import Contact from './sections/Contact/Contact'
import ScrollToTop from './components/ScrollToTop'

gsap.registerPlugin(ScrollTrigger)
// Resize refreshes are coordinated once here rather than once per chapter.
ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' })

export default function App() {
  const { t } = useLanguage()
  const root = useRef(null)
  useLayoutEffect(() => {
    let disposed = false
    let restoreFrame
    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight
    const onResize = () => {
      if (viewportWidth === window.innerWidth && viewportHeight === window.innerHeight) return
      viewportWidth = window.innerWidth
      viewportHeight = window.innerHeight
      ScrollTrigger.refresh()
    }
    const context = gsap.context(() => {
      const match = gsap.matchMedia()
      match.add({ all: '(min-width: 0px)', desktop: '(min-width: 901px)', reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
        if (conditions.reduced) return
        gsap.to('.global-progress__line', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .15 } })
        if (!conditions.desktop) return
        gsap.timeline({ scrollTrigger: { trigger: root.current.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: .8, invalidateOnRefresh: true } })
          .fromTo('.hero__portrait', { scale: 1, xPercent: 0 }, { scale: 1.1, xPercent: 5, duration: 1, ease: 'none' }, 0)
          .fromTo('.hero__name--first', { xPercent: 0 }, { xPercent: -12, duration: 1, ease: 'none' }, 0)
          .fromTo('.hero__name--last', { xPercent: 0 }, { xPercent: 14, duration: 1, ease: 'none' }, 0)
      })
    }, root)
    const scrollKey = () => `portfolio-scroll:${window.location.pathname}${window.location.hash}`
    const saveScrollPosition = () => sessionStorage.setItem(scrollKey(), String(window.scrollY))
    const restorePosition = () => {
      if (disposed) return
      const navigationType = performance.getEntriesByType('navigation')[0]?.type
      const saved = sessionStorage.getItem(scrollKey())
      const target = document.getElementById(window.location.hash.slice(1))
      if (navigationType === 'reload' && saved !== null) window.scrollTo(0, Number(saved))
      else if (target && navigationType !== 'reload') target.scrollIntoView({ block: 'start' })
      ScrollTrigger.refresh()
    }
    // Font loading may change wrapping. Refresh once after metrics settle, not on each media event.
    document.fonts.ready.then(() => { if (!disposed) restoreFrame = requestAnimationFrame(restorePosition) })
    const onPageShow = event => { if (event.persisted) restoreFrame = requestAnimationFrame(() => ScrollTrigger.refresh()) }
    const onHashLinkClick = event => {
      const link = event.target.closest('a[href^="#"]')
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = document.getElementById(link.getAttribute('href').slice(1))
      if (!target) return
      event.preventDefault()
      window.history.pushState(null, '', link.getAttribute('href'))
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    }
    window.addEventListener('beforeunload', saveScrollPosition)
    window.addEventListener('pagehide', saveScrollPosition)
    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('click', onHashLinkClick)
    return () => {
      disposed = true
      cancelAnimationFrame(restoreFrame)
      window.removeEventListener('beforeunload', saveScrollPosition)
      window.removeEventListener('pagehide', saveScrollPosition)
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('click', onHashLinkClick)
      context.revert()
    }
  }, [])
  return <div ref={root}>
    <LanguageSwitcher />
    <a className="skip-link" href="#work">{t("Skip to selected work")}</a>
    <div className="global-progress" aria-hidden="true"><span className="global-progress__line" /></div>
    <main><Hero /><About /><Work /><Experience /><Capabilities /><PortfolioArchive /><Contact /></main>
    <ScrollToTop />
  </div>
}
