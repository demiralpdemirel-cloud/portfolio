import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { scopePlayback } from '../utils/videoPlayback'

export function trapModalFocus(event) {
  if (event.key !== 'Tab' || event.target.closest('dialog') !== event.currentTarget) return
  const targets = [...event.currentTarget.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]')].filter(target => target.closest('dialog') === event.currentTarget && target.getClientRects().length)
  const first = targets[0]
  const last = targets[targets.length - 1]
  if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first)?.focus({ preventScroll: true })
  }
}

// Shared by project and production details; content and navigation remain separate.
export default function useModalDialog(onClose, returnFocus) {
  const dialog = useRef(null)
  const closeAction = useRef(onClose)
  closeAction.current = onClose
  const closeTimer = useRef(null)
  const closing = useRef(false)
  const [isClosing, setIsClosing] = useState(false)
  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    setIsClosing(true)
    dialog.current?.querySelectorAll('video').forEach(video => video.pause())
    closeTimer.current = window.setTimeout(() => closeAction.current(), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180)
  }, [])

  useLayoutEffect(() => {
    const element = dialog.current
    const trigger = returnFocus?.current || document.activeElement
    const x = window.scrollX
    const y = window.scrollY
    const body = document.body
    const html = document.documentElement
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight, htmlOverflow: html.style.overflow, scrollBehavior: html.style.scrollBehavior }
    const gutter = window.innerWidth - html.clientWidth
    body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + gutter}px`
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    element.showModal()
    const resumePlayback = scopePlayback(element)
    return () => {
      window.clearTimeout(closeTimer.current)
      element.querySelectorAll('video').forEach(video => video.pause())
      element.close()
      body.style.overflow = previous.overflow
      body.style.paddingRight = previous.paddingRight
      html.style.overflow = previous.htmlOverflow
      html.style.scrollBehavior = 'auto'
      window.scrollTo(x, y)
      html.style.scrollBehavior = previous.scrollBehavior
      trigger?.focus({ preventScroll: true })
      resumePlayback()
    }
  }, [returnFocus])
  return { dialog, close, isClosing }
}
