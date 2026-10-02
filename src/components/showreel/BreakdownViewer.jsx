import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import VideoPlayer from './VideoPlayer'

export default function BreakdownViewer({ items, index, onNavigate, onClose, returnFocusRef }) {
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  const item = items[index]
  const production = item.production
  const credits = [
    ['TYPE / RELEASE', [production.type, production.release].filter(Boolean).join(' · ')],
    ['PRODUCTION COMPANY', production.productionCompany],
    ['BROADCASTER / PLATFORM', [production.broadcaster, production.platform].filter(Boolean).join(' · ') || null],
    ['BRAND / AGENCY', [production.brand, production.agency].filter(Boolean).join(' · ') || null],
    ['DIRECTOR', production.director],
    ['VFX STUDIO', production.vfxStudio],
    ['MY ROLE', production.myRole?.join(' / ') || null],
  ].filter(([, value]) => value)
  const navigate = useCallback(direction => onNavigate((index + direction + items.length) % items.length), [index, items.length, onNavigate])

  useEffect(() => {
    const scrollY = window.scrollY
    const body = document.body
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      Object.entries(previous).forEach(([key, value]) => { body.style[key] = value })
      window.scrollTo(0, scrollY)
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [returnFocusRef])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose() }
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1) }
      if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1) }
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled])')
        if (!focusable?.length) return
        if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus() }
        else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus() }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, onClose])

  return createPortal(<div className="showreel-viewer" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="showreel-viewer__dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${item.title} video breakdown`}>
      <header className="showreel-viewer__header"><p><span>{item.number}</span> / {item.title} · {item.kind}</p><button ref={closeRef} type="button" onClick={onClose} aria-label="Close breakdown viewer">CLOSE ×</button></header>
        <VideoPlayer key={item.id} src={item.src} poster={item.poster} label={item.title} durationHint={item.duration} autoPlay />
      <button className="showreel-viewer__nav showreel-viewer__nav--previous" type="button" onClick={() => navigate(-1)} aria-label="Previous breakdown">←</button>
      <button className="showreel-viewer__nav showreel-viewer__nav--next" type="button" onClick={() => navigate(1)} aria-label="Next breakdown">→</button>
      <dl className="showreel-viewer__credits">{credits.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {production.roleDetail && <p className="showreel-viewer__role-detail">{production.roleDetail}</p>}
      <footer className="showreel-viewer__footer"><span>{item.kind} · {production.country}</span><span>{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></footer>
    </div>
  </div>, document.body)
}
