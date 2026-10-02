import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { translate } from './translations'

const LanguageContext = createContext(null)
const storageKey = 'portfolio-language'
const initialLanguage = () => {
  try { return localStorage.getItem(storageKey) === 'tr' ? 'tr' : 'en' } catch { return 'en' }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage)
  const transitionTimer = useRef(null)
  useEffect(() => () => window.clearTimeout(transitionTimer.current), [])
  const t = useCallback(value => translate(value, language), [language])
  const formatDate = useCallback(value => value ? new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)).toLocaleUpperCase(language) : t('Not confirmed'), [language, t])
  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem(storageKey, language) } catch { /* Private browsing can deny storage. */ }
    document.title = language === 'tr' ? 'Demiralp Demirel — 3D / VFX / Compositing Sanatçısı' : 'Demiralp Demirel — 3D / VFX / Compositing Artist'
    const descriptions = { description: 'Demiralp Demirel — 3D, VFX and compositing artist.', 'og:description': 'Selected 3D, VFX and compositing work by Demiralp Demirel.' }
    Object.entries(descriptions).forEach(([key, copy]) => document.querySelector(`meta[name="${key}"], meta[property="${key}"]`)?.setAttribute('content', t(copy)))
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
  }, [language, t])
  const changeLanguage = useCallback(next => {
    if (!['en', 'tr'].includes(next) || next === language) return
    // Never remount chapters or rerun reveal timelines; refresh their measurements only.
    const y = window.scrollY
    const hash = window.location.hash
    window.clearTimeout(transitionTimer.current)
    setLanguage(next)
    document.documentElement.classList.remove('language-change')
    document.documentElement.classList.add('language-change')
    transitionTimer.current = window.setTimeout(() => {
      ScrollTrigger.refresh()
      if (document.body.style.position !== 'fixed' && window.location.hash === hash) window.scrollTo({ top: y, behavior: 'instant' })
      document.documentElement.classList.remove('language-change')
    }, 220)
  }, [language])
  const value = useMemo(() => ({ language, t, formatDate, changeLanguage }), [language, t, formatDate, changeLanguage])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
