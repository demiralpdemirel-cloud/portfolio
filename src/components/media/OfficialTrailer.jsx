import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { assetPath } from '../../utils/assetPath.js'
import '../../styles/official-trailer.css'

export default function OfficialTrailer({ trailer, title, srcSet, compact = false }) {
  const { t } = useLanguage()
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false)
  const root = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) setLoaded(false) })
    observer.observe(root.current)
    const hide = () => { if (document.hidden) setLoaded(false) }
    document.addEventListener('visibilitychange', hide)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', hide) }
  }, [])
  const valid = /^[A-Za-z0-9_-]{11}$/.test(trailer.youtubeId)
  return <div ref={root} className="official-trailer">
    <div className="official-trailer__screen">
      {loaded && valid && !failed ? <iframe title={`${t('OFFICIAL TRAILER')} — ${title}`} src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?rel=0`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={() => setFailed(true)} /> : <button type="button" className="official-trailer__load" onClick={() => setLoaded(true)} disabled={!valid || failed} aria-label={`${t('LOAD OFFICIAL TRAILER')} — ${title}`}>
        {trailer.poster && <img src={assetPath(trailer.poster)} srcSet={srcSet} sizes="(max-width: 768px) 100vw, 70vw" alt="" width="1920" height="1080" loading="lazy" decoding="async" />}
        <span>{t('OFFICIAL TRAILER')} <b aria-hidden="true">▷</b></span>
      </button>}
    </div>
    {!compact && <div className="official-trailer__caption"><p>{t('YouTube loads only after you choose to watch. If playback is unavailable, open the official trailer.')}</p><a href={trailer.watchUrl} target="_blank" rel="noopener noreferrer">{t('WATCH OFFICIAL TRAILER ↗')}</a></div>}
  </div>
}
