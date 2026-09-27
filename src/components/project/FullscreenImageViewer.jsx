import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { assetPath } from '../../utils/assetPath'

const dustParticles = Array.from({ length: 14 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 61 + 7) % 100}%`,
  drift: `${(index % 2 ? 1 : -1) * (12 + (index * 7) % 22)}px`,
  duration: `${2.4 + (index % 5) * .35}s`,
  delay: `${(index % 6) * .09}s`,
}))

function getFitBounds(width, height) {
  const ratio = width / height || 1
  const maxWidth = window.innerWidth * .9
  const maxHeight = window.innerHeight * .88
  const fittedWidth = Math.min(maxWidth, maxHeight * ratio)
  const fittedHeight = fittedWidth / ratio
  return {
    left: (window.innerWidth - fittedWidth) / 2,
    top: (window.innerHeight - fittedHeight) / 2,
    width: fittedWidth,
    height: fittedHeight,
  }
}

export default function FullscreenImageViewer({ media, title, index, origin, onNavigate, onClose }) {
  const closeButton = useRef(null)
  const dialog = useRef(null)
  const closeTimer = useRef(null)
  const focusTimer = useRef(null)
  const closing = useRef(false)
  const [bounds, setBounds] = useState(origin)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const src = assetPath(media[index])

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    setBounds(origin)
    setIsExpanded(false)
    setIsClosing(true)
    closeTimer.current = window.setTimeout(onClose, 520)
  }, [onClose, origin])

  const navigate = useCallback(direction => {
    const next = (index + direction + media.length) % media.length
    onNavigate(next)
  }, [index, media.length, onNavigate])

  useEffect(() => {
    const image = new Image()
    let isMounted = true
    const expand = () => {
      if (!isMounted || closing.current) return
      const target = getFitBounds(image.naturalWidth, image.naturalHeight)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isMounted || closing.current) return
          setBounds(target)
          setIsExpanded(true)
        })
      })
    }
    image.onload = expand
    image.src = src
    if (image.complete && image.naturalWidth > 0) expand()

    const handleResize = () => {
      if (image.naturalWidth > 0 && !closing.current) setBounds(getFitBounds(image.naturalWidth, image.naturalHeight))
    }
    window.addEventListener('resize', handleResize)
    return () => {
      isMounted = false
      window.removeEventListener('resize', handleResize)
    }
  }, [src])

  useEffect(() => {
    if (!isExpanded || isClosing) return undefined
    focusTimer.current = window.setTimeout(() => closeButton.current?.focus({ preventScroll: true }), 120)
    return () => window.clearTimeout(focusTimer.current)
  }, [isExpanded, isClosing])

  useEffect(() => {
    const body = document.body
    const scrollY = window.scrollY
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    const bodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    if (scrollBarWidth) body.style.paddingRight = `${scrollBarWidth}px`

    return () => {
      window.clearTimeout(closeTimer.current)
      window.clearTimeout(focusTimer.current)
      Object.entries(bodyStyles).forEach(([property, value]) => { body.style[property] = value })
      window.scrollTo(0, scrollY)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = event => {
      if (closing.current) return
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        navigate(-1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        navigate(1)
      } else if (event.key === 'Tab') {
        const focusable = dialog.current?.querySelectorAll('button:not([disabled])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!dialog.current?.contains(document.activeElement)) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close, navigate])

  const viewer = (
    <div
      className={`fullscreen-viewer${isExpanded ? ' is-open' : ''}${isClosing ? ' is-closing' : ''}`}
      onClick={event => { if (event.target === event.currentTarget) close() }}
    >
      <div className="fullscreen-viewer__dust" aria-hidden="true">
        {dustParticles.map((particle, particleIndex) => <span key={particleIndex} style={{ '--particle-left': particle.left, '--particle-top': particle.top, '--particle-drift': particle.drift, '--particle-duration': particle.duration, '--particle-delay': particle.delay }} />)}
      </div>
      <div ref={dialog} className="fullscreen-viewer__dialog" role="dialog" aria-modal="true" aria-label={`${title} image viewer`}>
        <img
          key={src}
          className="fullscreen-viewer__image"
          src={src}
          alt={`${title} — view ${String(index + 1).padStart(2, '0')}`}
          draggable="false"
          style={{ left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }}
        />
        <button ref={closeButton} type="button" className="fullscreen-viewer__close" onClick={close} aria-label="Close image viewer" autoFocus>×</button>
        <button type="button" className="fullscreen-viewer__nav fullscreen-viewer__nav--previous" onClick={() => navigate(-1)} aria-label="Previous image">‹</button>
        <button type="button" className="fullscreen-viewer__nav fullscreen-viewer__nav--next" onClick={() => navigate(1)} aria-label="Next image">›</button>
        <p className="fullscreen-viewer__count" aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}</p>
      </div>
    </div>
  )

  return createPortal(viewer, document.body)
}
