import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { archiveProductions, productionPresentation } from '../utils/productionArchive.js'
import { assetPath } from '../utils/assetPath.js'
import VideoPlayer from './showreel/VideoPlayer.jsx'
import OfficialTrailer from './media/OfficialTrailer.jsx'
import '../styles/production-showcase.css'

gsap.registerPlugin(ScrollTrigger)

function ProductionDossier({ entry, onOpen, index }) {
  const { t } = useLanguage()
  const info = productionPresentation(entry)
  return <aside className="credits-dossier" aria-labelledby="credits-project-title">
    <p className="credits-eyebrow">{t('PRODUCTION DOSSIER')} / {String(index + 1).padStart(2, '0')}</p>
    <h3 id="credits-project-title">{t(entry.title)}</h3>
    <div className="credits-contribution">
      <h4>{t('MY CONTRIBUTION')}</h4>
      {info.contribution.length ? <ul>{info.contribution.map(role => <li key={role}>{t(role)}</li>)}</ul> : <p>{t('PRODUCTION BREAKDOWN')}</p>}
      {info.contributionCopy && <p className="credits-copy">{t(info.contributionCopy)}</p>}
      {entry.detail.creditNote && <p className="credits-credit-note">{t(entry.detail.creditNote)}</p>}
    </div>
    <dl className="credits-facts">
      {[["PRODUCTION TYPE", entry.detail.type], ['YEAR', info.year], ['ROLE', info.contribution.join(' / ')]].filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{t(key)}</dt><dd>{t(value)}</dd></div>)}
    </dl>
    <button className="credits-open" type="button" aria-haspopup="dialog" onClick={event => onOpen(event, entry)}>{t('VIEW PROJECT')} <span aria-hidden="true">↗</span></button>
  </aside>
}

export default function ProductionShowcase({ onOpen }) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState(archiveProductions[0].id)
  const [pending, setPending] = useState(null)
  const [trailerReset, setTrailerReset] = useState(0)
  const root = useRef(null), wipe = useRef(null), strip = useRef(null), video = useRef(null)
  const transition = useRef(null), requested = useRef(selected), mounted = useRef(true), chooseRef = useRef(null)
  const reduced = useRef(false)
  const index = archiveProductions.findIndex(entry => entry.id === selected)
  const entry = archiveProductions[index]
  const info = productionPresentation(entry)

  useLayoutEffect(() => {
    mounted.current = true
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => { reduced.current = preference.matches || new URLSearchParams(location.search).has('reduced-motion'); if (reduced.current) transition.current?.progress(1) }
    updatePreference()
    preference.addEventListener('change', updatePreference)
    const context = gsap.context(() => {
      if (reduced.current) return
      gsap.fromTo(root.current.querySelectorAll('.credits-heading, .credits-stage-layout, .credits-strip-shell'), { y: 20, opacity: .5 }, { y: 0, opacity: 1, duration: .65, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 88%', once: true } })
    }, root)
    const visibility = () => { if (document.hidden) transition.current?.progress(1) }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      mounted.current = false
      transition.current?.kill()
      context.revert()
      preference.removeEventListener('change', updatePreference)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  useLayoutEffect(() => {
    transition.current?.kill()
    if (reduced.current) { gsap.set(wipe.current, { scaleX: 0 }); return }
    const timeline = gsap.timeline()
    timeline.set(wipe.current, { transformOrigin: 'right center' })
      .to(wipe.current, { scaleX: 0, duration: .38, ease: 'power3.inOut' })
      .fromTo(root.current.querySelector('.credits-dossier'), { y: 9, opacity: .55 }, { y: 0, opacity: 1, duration: .3, ease: 'power2.out' }, .08)
    transition.current = timeline
    return () => timeline.kill()
  }, [selected])

  // Scroll the selection into this strip, never scrollIntoView (which moves the page).
  useEffect(() => {
    const rail = strip.current, item = rail.querySelector(`[data-production="${selected}"]`)
    if (!item) return
    const left = item.offsetLeft - rail.offsetLeft
    if (left < rail.scrollLeft || left + item.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollTo({ left: left - (rail.clientWidth - item.offsetWidth) / 2, behavior: reduced.current ? 'instant' : 'smooth' })
  }, [selected])

  const choose = id => {
    if (requested.current === id) return
    requested.current = id
    setPending(id)
    transition.current?.kill()
    video.current?.pause()
    const commit = () => {
      if (!mounted.current) return
      // Returning to the current item during a pending wipe must also uncover it.
      if (requested.current === selected) transition.current = gsap.to(wipe.current, { scaleX: 0, duration: reduced.current ? 0 : .3, ease: 'power3.out' })
      setSelected(requested.current)
      setPending(null)
    }
    if (reduced.current) { gsap.set(wipe.current, { scaleX: 0 }); commit(); return }
    transition.current = gsap.timeline().set(wipe.current, { transformOrigin: 'left center' })
      .to(wipe.current, { scaleX: 1, duration: .16, ease: 'power2.in', onComplete: commit })
  }
  const navigate = delta => {
    const current = archiveProductions.findIndex(item => item.id === requested.current)
    choose(archiveProductions[Math.max(0, Math.min(archiveProductions.length - 1, current + delta))].id)
  }
  const keyboard = event => {
    const actions = { ArrowLeft: () => navigate(-1), ArrowRight: () => navigate(1), Home: () => choose(archiveProductions[0].id), End: () => choose(archiveProductions.at(-1).id) }
    if (!actions[event.key]) return
    event.preventDefault()
    actions[event.key]()
    const target = strip.current.querySelector(`[data-production="${requested.current}"]`)
    target?.focus({ preventScroll: true })
  }
  chooseRef.current = choose

  useEffect(() => {
    const followAnchor = () => {
      const id = location.hash.slice(1)
      if (archiveProductions.some(item => item.id === id && !item.categories.includes('brand'))) chooseRef.current(id)
    }
    followAnchor()
    window.addEventListener('hashchange', followAnchor)
    return () => window.removeEventListener('hashchange', followAnchor)
  }, [])

  return <section ref={root} id="production" className="camera-scene credits-archive" data-scene data-world="production" data-atmosphere={info.atmosphere}>
    <div className="credits-atmosphere" aria-hidden="true"><i/><i/><i/></div>
    <header className="credits-heading"><p className="scene-number">09 / {t('PROFESSIONAL PRODUCTIONS')}</p><div><h2>{t('SCREEN CREDITS')}</h2><p>{t('A CINEMATIC PRODUCTION ARCHIVE')}<span>{t('SELECTED FILM / TELEVISION / COMMERCIAL WORK')}</span></p></div></header>
    <div className="credits-stage-layout">
      <div className="credits-screen">
        <div className="credits-screen-label"><span>{t(entry.detail.officialTrailer ? 'OFFICIAL TRAILER' : entry.detail.video ? entry.detail.videoLabel || 'SCENE VIEW' : 'PRODUCTION IMAGE')}</span><span>{String(index + 1).padStart(2, '0')} / {String(archiveProductions.length).padStart(2, '0')}</span></div>
        <div className="credits-screen-surface" aria-busy={!!pending}>
          {entry.detail.officialTrailer ? <OfficialTrailer key={`${entry.id}:${trailerReset}`} compact trailer={entry.detail.officialTrailer} title={entry.title} srcSet={entry.detail.imageSrcSet} /> : entry.detail.video ? <VideoPlayer key={entry.id} videoRef={video} src={entry.detail.video.src} poster={info.poster} durationHint={entry.detail.video.duration} label={entry.title} lazy /> : info.poster ? <img className="credits-still" src={assetPath(info.poster)} alt={t(entry.title)} decoding="async" width="1920" height="1080" /> : <div className="credits-no-image"><span>{t('PRODUCTION DOSSIER')}</span><strong>{t(entry.title)}</strong><p>{t('PRODUCTION IMAGE NOT AVAILABLE')}</p></div>}
          <div ref={wipe} className="credits-projection-wipe" aria-hidden="true"/>
          <div className="credits-glass" aria-hidden="true"/>
        </div>
        <div className="credits-screen-caption"><span>{t(entry.detail.type)}</span>{entry.detail.officialTrailer ? <a href={entry.detail.officialTrailer.watchUrl} target="_blank" rel="noopener noreferrer">{t('WATCH OFFICIAL TRAILER ↗')}</a> : <span>{t('PICTURE / PRODUCTION / CREDITS')}</span>}</div>
      </div>
      <ProductionDossier {...{ entry, index }} onOpen={(event, record) => { setTrailerReset(value => value + 1); onOpen(event, record) }} />
    </div>
    <div className="credits-strip-shell">
      <div className="credits-strip-heading"><div><span>{t('THE PRODUCTION INDEX')}</span><p>{t('Select a production to screen its work.')}</p></div><div className="credits-arrows"><button type="button" aria-label={t('Previous production')} disabled={index === 0 && !pending} onClick={() => navigate(-1)}>←</button><button type="button" aria-label={t('Next production')} disabled={index === archiveProductions.length - 1 && !pending} onClick={() => navigate(1)}>→</button></div></div>
      <div ref={strip} className="credits-strip" role="group" aria-label={t('Production selection')} onKeyDown={keyboard}>
        {archiveProductions.map((item, itemIndex) => <button key={item.id} id={!item.categories.includes('brand') ? item.id : undefined} type="button" className="credits-item" data-production={item.id} aria-label={t('SELECT PRODUCTION') + ' — ' + t(item.title)} aria-pressed={selected === item.id} data-pending={pending === item.id} onClick={() => choose(item.id)}>
          <span className="credits-thumb">{item.image ? <img src={assetPath(item.thumbnailLarge || item.image)} srcSet={item.detail.imageSrcSet} sizes="(max-width:600px) 80vw, (max-width:1100px) 33vw, 25vw" alt="" width="480" height="270" loading="lazy" decoding="async" style={{ objectPosition: item.objectPosition }} /> : <span className="credits-type-poster">{t(item.title)}</span>}<i aria-hidden="true"/><span className="credits-selection">{t(selected === item.id ? 'SELECTED' : 'SCREEN')}</span></span>
          <span className="credits-item-index">{String(itemIndex + 1).padStart(2, '0')} / {item.detail.officialTrailer ? `${t(item.year)} / ` : ''}{t(item.detail.type)}</span>
          <strong>{t(item.title)}</strong><span className="credits-item-role">{t(item.discipline)}</span>
        </button>)}
      </div>
    </div>
    <p className="credits-announcement" role="status" aria-live="polite">{t('SELECTED')}: {t(entry.title)}</p>
    <div className="world-exit"><span>{t('NEXT WORLD')}</span><a href="#capabilities">{t('CAPABILITIES')} ↗</a></div>
  </section>
}
