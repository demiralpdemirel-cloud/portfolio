import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { caseDestination, nextCaseState } from '../utils/caseMotion.js'

export default forwardRef(function CaseReveal(_, ref) {
  const { t } = useLanguage()
  const dialog = useRef(null), physical = useRef(null), presentation = useRef(null), veil = useRef(null)
  const flight = useRef(null), source = useRef(null), restore = useRef(null), phase = useRef('idle')
  const suspendedMotion = useRef([])
  const advance = event => {
    phase.current = nextCaseState(phase.current, event)
    if (dialog.current) dialog.current.dataset.phase = phase.current
  }
  const finish = () => {
    flight.current?.kill()
    flight.current = null
    if (source.current) source.current.style.visibility = ''
    dialog.current?.close()
    physical.current?.replaceChildren()
    presentation.current?.replaceChildren()
    restore.current?.()
    restore.current = null
    suspendedMotion.current.forEach(animation => { if (animation.playState === 'paused') animation.play() })
    suspendedMotion.current = []
    phase.current = 'idle'
    source.current?.closest('button')?.focus({ preventScroll: true })
    source.current = null
  }
  const reverse = () => {
    if (!flight.current || phase.current === 'closing') return
    advance(phase.current === 'open' ? 'close' : 'cancel')
    flight.current.eventCallback('onComplete', null)
    if (flight.current.progress() === 0) { finish(); return }
    flight.current.reverse()
  }
  useLayoutEffect(() => () => finish(), [])
  useImperativeHandle(ref, () => ({
    open(element, commit) {
      if (phase.current !== 'idle') return
      const face = element.querySelector('.jewel-face')
      if (!face || matchMedia('(prefers-reduced-motion: reduce)').matches) { commit(); return }
      // Keep the exact in-flight hover pose. Finishing its transition here causes a snap.
      const trackMotion = element.closest('.jewel-track')?.getAnimations() || []
      const faceMotion = face.getAnimations()
      suspendedMotion.current = [...trackMotion, ...faceMotion]
      suspendedMotion.current.forEach(animation => animation.pause())
      const origin = element.getBoundingClientRect()
      const box = { left: origin.left, top: origin.top, width: face.offsetWidth, height: face.offsetHeight }
      const hoverTransform = getComputedStyle(face).transform
      const pose = new DOMMatrixReadOnly(hoverTransform === 'none' ? undefined : hoverTransform)
      const destination = caseDestination(box, { width: innerWidth, height: innerHeight })
      const mobile = innerWidth < 600
      const slideLeft = Math.min(mobile ? 64 : 110, Math.max(24, box.left - 20))
      const coveredWidth = Math.max(0, box.width - origin.width)
      const centerX = destination.x - (box.width / 2 - 18) * (destination.scale - 1)
      const body = document.body, html = document.documentElement
      const previous = { overflow: body.style.overflow, padding: body.style.paddingRight }
      const gutter = innerWidth - html.clientWidth
      const padding = parseFloat(getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${padding + gutter}px`
      body.style.overflow = 'hidden'
      restore.current = () => { body.style.overflow = previous.overflow; body.style.paddingRight = previous.padding }
      source.current = face
      const copy = face.cloneNode(true)
      Object.assign(copy.style, { width: '100%', height: '100%', transform: 'none', clipPath: `inset(0px ${coveredWidth}px 0px 0px)` })
      physical.current.replaceChildren(copy)
      const insert = copy.querySelector('.case-insert'), lid = copy.querySelector('.case-lid')
      const artwork = insert.cloneNode(true)
      artwork.classList.add('case-presentation-art')
      presentation.current.replaceChildren(artwork)
      Object.assign(physical.current.style, { width: `${box.width}px`, height: `${box.height}px`, left: `${box.left}px`, top: `${box.top}px` })
      // Explicit percentages prevent GSAP inferring -50% from a tiny hover matrix.
      gsap.set(physical.current, { transformOrigin: '18px 50%', xPercent: 0, yPercent: 0, x: pose.m41, y: pose.m42, z: 0, scale: 1, rotationX: 0, rotationY: Math.asin(-pose.m13) * 180 / Math.PI, rotationZ: Math.atan2(pose.m12, pose.m11) * 180 / Math.PI, opacity: 1 })
      gsap.set(presentation.current, { xPercent: 0, yPercent: 0, opacity: 0, scale: .45, rotationY: 8, x: mobile ? 26 : 70, y: 0 })
      gsap.set(veil.current, { opacity: 0 })
      dialog.current.showModal()
      face.style.visibility = 'hidden'
      advance('select')
      const mark = event => { if (phase.current !== 'closing') advance(event) }
      flight.current = gsap.timeline({
        onComplete: () => { advance('present'); commit() },
        onReverseComplete: finish,
      })
        .to(veil.current, { opacity: 1, duration: .55, ease: 'sine.inOut' }, 0)
        // First leave the row to the left, at shelf height and without growing.
        .to(physical.current, { x: pose.m41 - slideLeft, duration: .32, ease: 'sine.inOut' }, 0)
        .to(copy, { clipPath: 'inset(0px 0px 0px 0px)', duration: .32, ease: 'sine.inOut' }, 0)
        .call(() => { copy.style.clipPath = phase.current === 'closing' ? 'inset(0px 0px 0px 0px)' : 'none' }, [], .32)
        .to(physical.current, { x: centerX, y: destination.y - 12, rotationY: 0, rotationZ: 0, scale: destination.scale, duration: .44, ease: 'sine.inOut' }, .32)
        .call(() => mark('hinge'), [], .66)
        .to(lid, { rotationY: mobile ? -95 : -122, duration: .4, ease: 'sine.inOut' }, .66)
        .call(() => mark('extract'), [], .92)
        .to(insert, { x: mobile ? 38 : 100, y: -20, z: 90, rotationY: 10, duration: .36, ease: 'sine.inOut' }, .92)
        .call(() => mark('expand'), [], 1.14)
        .to(insert, { opacity: 0, duration: .22, ease: 'sine.inOut' }, 1.14)
        .to(physical.current, { opacity: 0, duration: .3, ease: 'sine.inOut' }, 1.18)
        .to(presentation.current, { opacity: 1, scale: 1, x: 0, y: 0, rotationY: 0, duration: .44, ease: 'power2.inOut' }, 1.14)
    },
    close(commit) { commit(); reverse() },
  }))
  return createPortal(<dialog className="case-reveal" ref={dialog} aria-label={t('Opening project')} onCancel={event => { event.preventDefault(); reverse() }}>
    <div className="case-reveal__veil" ref={veil}/>
    <div className="case-reveal__physical" ref={physical} aria-hidden="true"/>
    <div className="case-reveal__presentation" ref={presentation} aria-hidden="true"/>
    <button className="case-reveal__cancel" type="button" onClick={reverse}>{t('CLOSE ×')}</button>
  </dialog>, document.body)
})
