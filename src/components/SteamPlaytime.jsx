import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { hoursFormatter, loadPlaytime, validatePlaytime } from '../utils/steamPlaytime.js'
import '../styles/steam-playtime.css'
import { assetPath } from '../utils/assetPath.js'

const endpoint = assetPath('data/steam-blender.json')
const storageKey = `steam-blender-last-good:${endpoint || 'unconfigured'}`

export default function SteamPlaytime() {
  const { language, t } = useLanguage()
  const [state, setState] = useState({ status: endpoint ? 'loading' : 'error', data: null })
  const panel = useRef(null)
  const number = useRef(null)
  const motion = useRef({ hours: 0 })
  const formatter = useRef(hoursFormatter(language))
  formatter.current = hoursFormatter(language, state.data?.source === 'steam-community')

  useEffect(() => {
    if (!endpoint) return
    let mounted = true
    loadPlaytime(endpoint).then(data => {
      if (!mounted) return
      setState({ status: data.stale ? 'stale' : 'success', data })
      try { localStorage.setItem(storageKey, JSON.stringify(data)) } catch { /* Storage optional. */ }
    }).catch(() => {
      if (!mounted) return
      let data = null
      try { data = validatePlaytime(JSON.parse(localStorage.getItem(storageKey))) } catch { /* Never fabricate fallback hours. */ }
      setState({ status: data ? 'stale' : 'error', data })
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (number.current) number.current.textContent = formatter.current.format(motion.current.hours)
  }, [language])

  useEffect(() => {
    if (!state.data || !number.current) return
    let tween
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const paint = () => { if (number.current) number.current.textContent = formatter.current.format(motion.current.hours) }
    const finish = () => {
      tween?.kill()
      motion.current.hours = state.data.hours
      paint()
    }
    const animate = () => {
      if (media.matches) return finish()
      tween = gsap.to(motion.current, { hours: state.data.hours, duration: 1.05, ease: 'power3.out', onUpdate: paint })
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); animate() }
    }, { threshold: 0.2 })
    observer.observe(panel.current)
    const onPreference = () => { if (media.matches) finish() }
    media.addEventListener('change', onPreference)
    return () => { observer.disconnect(); tween?.kill(); media.removeEventListener('change', onPreference) }
  }, [state.data?.hours])

  const { data, status } = state
  const publicProfile = data?.source === 'steam-community'
  const updated = data ? new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt)) : null
  return <article ref={panel} className="profile-panel steam-playtime" aria-label={t('Blender Steam Recorded Playtime')} aria-busy={status === 'loading'}>
    <span>BLENDER / STEAM</span>
    <div className="steam-playtime-value">
      {data ? <>
        <strong aria-hidden="true"><span ref={number}>—</span> <small>{t('HOURS')}</small></strong>
        <span className="steam-sr-only">{formatter.current.format(data.hours)} {t('HOURS')}</span>
      </> : <strong aria-hidden="true">—</strong>}
    </div>
    <div className="steam-playtime-copy" role="status">
      <p>{t(publicProfile ? 'Public Steam profile — rounded hours' : 'Steam Recorded Playtime')}</p>
      <p className="steam-sync-state">{t(status === 'loading' ? 'Checking Steam playtime…' : publicProfile ? status === 'stale' ? 'Last verified profile reading' : 'PUBLIC PROFILE VERIFIED' : status === 'success' ? 'STEAM SYNCED' : status === 'stale' ? 'Cached playtime — Steam sync unavailable' : 'Steam playtime unavailable')}</p>
      {updated && <p>{t(status === 'stale' ? 'Last synced' : 'Last updated')}: <time dateTime={data.updatedAt}>{updated}</time></p>}
    </div>
  </article>
}
