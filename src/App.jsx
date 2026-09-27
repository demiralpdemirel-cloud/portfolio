import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './sections/Hero/Hero'
import About from './sections/About/About'
import Work from './sections/Work/Work'
import Experience from './components/experience/Experience'
import Capabilities from './sections/Capabilities/Capabilities'
import PortfolioArchive from './sections/Archive/PortfolioArchive'
import Contact from './sections/Contact/Contact'
import Showreel from './sections/Showreel/Showreel'
import { pageRegistry } from './data/pageRegistry'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const root = useRef(null)
  const [currentPageId, setCurrentPageId] = useState('home')
  const currentPageIdRef = useRef('home')
  const currentPage = pageRegistry.find(page => page.id === currentPageId) || pageRegistry[0]

  useLayoutEffect(() => {
    const updateCurrentPage = () => {
      const viewportCenter = window.innerHeight / 2
      let nearestPage = pageRegistry[0]
      let nearestDistance = Infinity

      pageRegistry.forEach(page => {
        const element = document.getElementById(page.id)
        if (!element) return
        const rect = element.getBoundingClientRect()
        const distance = viewportCenter < rect.top
          ? rect.top - viewportCenter
          : viewportCenter > rect.bottom
            ? viewportCenter - rect.bottom
            : 0
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestPage = page
        }
      })

      if (nearestPage.id !== currentPageIdRef.current) {
        currentPageIdRef.current = nearestPage.id
        setCurrentPageId(nearestPage.id)
      }
    }

    if (import.meta.env.DEV) {
      const missingIds = pageRegistry.filter(page => !document.getElementById(page.id)).map(page => page.id)
      if (missingIds.length) console.error('Page registry entries missing from DOM:', missingIds)
    }

    let indicatorFrame = null
    const scheduleCurrentPageUpdate = () => {
      if (indicatorFrame !== null) return
      indicatorFrame = requestAnimationFrame(() => {
        indicatorFrame = null
        updateCurrentPage()
      })
    }
    ScrollTrigger.addEventListener('refresh', scheduleCurrentPageUpdate)
    window.addEventListener('scroll', scheduleCurrentPageUpdate, { passive: true })
    window.addEventListener('resize', scheduleCurrentPageUpdate, { passive: true })
    window.addEventListener('hashchange', scheduleCurrentPageUpdate)
    window.addEventListener('popstate', scheduleCurrentPageUpdate)
    updateCurrentPage()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => {
        if (indicatorFrame !== null) cancelAnimationFrame(indicatorFrame)
        ScrollTrigger.removeEventListener('refresh', scheduleCurrentPageUpdate)
        window.removeEventListener('scroll', scheduleCurrentPageUpdate)
        window.removeEventListener('resize', scheduleCurrentPageUpdate)
        window.removeEventListener('hashchange', scheduleCurrentPageUpdate)
        window.removeEventListener('popstate', scheduleCurrentPageUpdate)
      }
    }
    const scrollKey = `portfolio-scroll:${window.location.pathname}${window.location.hash}`
    const saveScrollPosition = () => sessionStorage.setItem(scrollKey, String(window.scrollY))
    const context = gsap.context(() => {
      gsap.to('.global-progress__line', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.15 } })
      gsap.fromTo('.hero__portrait', { scale: 1, xPercent: 0, clipPath: 'inset(4% 5% 4% 5%)' }, { scale: 1.12, xPercent: 5, clipPath: 'inset(1% 1% 1% 1%)', ease: 'none', immediateRender: true, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } })
      gsap.fromTo('.hero__name--first', { xPercent: 0 }, { xPercent: -12, ease: 'none', immediateRender: true, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.9, invalidateOnRefresh: true } })
      gsap.fromTo('.hero__name--last', { xPercent: 0 }, { xPercent: 14, ease: 'none', immediateRender: true, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.9, invalidateOnRefresh: true } })
    }, root)
    const navigationType = performance.getEntriesByType('navigation')[0]?.type
    const restoredScroll = navigationType === 'reload' ? Number(sessionStorage.getItem(scrollKey)) : NaN
    const anchorFrame = window.location.hash ? requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash)
      if (Number.isFinite(restoredScroll)) window.scrollTo(0, restoredScroll)
      else if (target && navigationType !== 'reload') target.scrollIntoView({ block: 'start' })
      requestAnimationFrame(() => { ScrollTrigger.refresh(); updateCurrentPage() })
    }) : null
    const refreshAfterRestore = () => requestAnimationFrame(() => { ScrollTrigger.refresh(); updateCurrentPage() })
    const onHashLinkClick = event => {
      const link = event.target.closest('a[href^="#"]')
      if (!link) return
      const target = document.querySelector(link.getAttribute('href'))
      if (!target) return
      event.preventDefault()
      window.history.pushState(null, '', link.getAttribute('href'))
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.setTimeout(() => { ScrollTrigger.refresh(); updateCurrentPage() }, 450)
    }
    window.addEventListener('beforeunload', saveScrollPosition)
    window.addEventListener('pagehide', saveScrollPosition)
    window.addEventListener('pageshow', refreshAfterRestore)
    document.addEventListener('click', onHashLinkClick)
    return () => {
      if (anchorFrame) cancelAnimationFrame(anchorFrame)
      window.removeEventListener('beforeunload', saveScrollPosition)
      window.removeEventListener('pagehide', saveScrollPosition)
      window.removeEventListener('pageshow', refreshAfterRestore)
      document.removeEventListener('click', onHashLinkClick)
      if (indicatorFrame !== null) cancelAnimationFrame(indicatorFrame)
      ScrollTrigger.removeEventListener('refresh', scheduleCurrentPageUpdate)
      window.removeEventListener('scroll', scheduleCurrentPageUpdate)
      window.removeEventListener('resize', scheduleCurrentPageUpdate)
      window.removeEventListener('hashchange', scheduleCurrentPageUpdate)
      window.removeEventListener('popstate', scheduleCurrentPageUpdate)
      context.revert()
    }
  }, [])

  return (
    <div ref={root}>
      <a className="skip-link" href="#work">Skip to selected work</a>
      <div className="global-progress" aria-hidden="true"><span className="global-progress__line" /></div>
      <aside className="project-position is-visible" data-page-id={currentPage.id} data-page-count={pageRegistry.length} aria-label={`Current page ${String(currentPage.index).padStart(3, '0')} of ${String(pageRegistry.length).padStart(3, '0')}`}>
        <strong>{String(currentPage.index).padStart(3, '0')}</strong><span>/ {String(pageRegistry.length).padStart(3, '0')}</span>
      </aside>
      <main><Hero /><Showreel /><Work activePageId={currentPageId} /><About /><Experience /><Capabilities /><PortfolioArchive /><Contact /></main>
    </div>
  )
}
