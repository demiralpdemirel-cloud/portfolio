import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// One observer and tab-visibility listener for the whole software showcase.
const watched = new Map()
let observer
const notifyVisibility = () => watched.forEach(callback => callback(!document.hidden))
function watch(element, callback) {
  if (!observer) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.dataset.visible = String(entry.isIntersecting)
      watched.get(entry.target)?.(!document.hidden)
    }), { threshold: 0.12 })
    document.addEventListener('visibilitychange', notifyVisibility)
  }
  watched.set(element, callback)
  observer.observe(element)
  return () => {
    observer.unobserve(element)
    watched.delete(element)
    if (!watched.size) {
      observer.disconnect()
      observer = null
      document.removeEventListener('visibilitychange', notifyVisibility)
    }
  }
}

export function buildSoftwareTimeline(id, timeline, select) {
  const logo = select('.software-logo')
  switch (id) {
    case 'blender':
      timeline.to(select('.cube-orbit'), { rotation: 360, duration: 1.85, ease: 'power2.inOut' }, 0)
        .to(select('.default-cube'), { rotationY: 210, rotationX: -24, duration: 1.85 }, 0)
        .to(select('.viewport-orbit'), { opacity: 0.65, duration: 0.5 }, 0)
        .to(select('.default-cube i'), { backgroundColor: '#d3945666', duration: .6, stagger: .04 }, 1.05)
      break
    case 'after-effects':
      timeline.fromTo(select('.micro-burst--left'), { scale: 0.25, opacity: 0 }, { scale: 1.15, opacity: 0.85, duration: 0.32 }, 0.08)
        .to(select('.micro-burst--left'), { scale: 1.5, opacity: 0, duration: 0.5 }, 0.4)
        .fromTo(select('.micro-burst--right'), { scale: 0.25, opacity: 0 }, { scale: 1.15, opacity: 0.85, duration: 0.32 }, 0.58)
        .to(select('.micro-burst--right'), { scale: 1.5, opacity: 0, duration: 0.5 }, 0.9)
        .to(logo, { x: 10, rotation: 4, duration: 0.28 }, 0.1)
        .to(logo, { x: -10, rotation: -4, duration: 0.45 }, 0.6)
        .to(logo, { x: 0, rotation: 0, duration: 0.55 }, 1.05)
        .to(select('.impact-line'), { scaleX: 1, opacity: 0.45, duration: 0.5 }, 0.15)
        .fromTo(select('.ae-layer-assembly i'), { x: index => (index-1)*20, y: index => (index-1)*-10, opacity: 0 }, { x: 0, y: 0, opacity: .5, duration: .55, stagger: .06 }, 1.05)
      break
    case 'premiere':
      timeline.to(logo, { y: -16, duration: 0.5 }, 0)
        .to(select('.micro-timeline'), { opacity: 0.9, y: 0, duration: 0.5 }, 0)
        .to(select('.edit-playhead'), { x: 119, duration: 1.1, ease: 'power1.inOut' }, 0.15)
        .to(select('.edit-cut'), { opacity: 1, scaleY: 1, duration: 0.2 }, 0.65)
        .to(select('.clip-left'), { x: -7, duration: 0.45 }, 0.7)
        .to(select('.clip-right'), { x: 7, duration: 0.45 }, 0.7)
      break
    case 'photoshop':
      timeline.to(select('.layer-back'), { x: -18, y: 12, rotation: -5, opacity: 0.5, duration: 0.7 }, 0)
        .to(select('.layer-front'), { x: 18, y: -10, rotation: 4, opacity: 0.45, duration: 0.7 }, 0.08)
        .to(select('.crop-selection'), { opacity: 0.85, scale: 1, duration: 0.55 }, 0.25)
        .to(logo, { y: -3, duration: 0.5 }, 0)
        .to(select('.layer-back'), { x: 0, y: 0, rotation: 0, opacity: .65, duration: .65 }, .85)
        .to(select('.layer-front'), { x: 0, y: 0, rotation: 0, opacity: .7, duration: .65 }, .9)
      break
    case 'illustrator':
      timeline.to(select('.bezier-handles'), { opacity: 0.6, duration: 0.4 }, 0)
        .to(select('.bezier-curve'), { strokeDashoffset: 0, opacity: 0.9, duration: 1.15, ease: 'power2.inOut' }, 0.08)
        .to(select('.vector-node'), { opacity: 1, scale: 1, stagger: 0.12, duration: 0.3, transformOrigin: 'center' }, 0.05)
      break
    case 'octane':
      timeline.to(select('.ring-a'), { rotation: 100, opacity: 0.7, duration: 1.4 }, 0)
        .to(select('.ring-b'), { rotation: -70, opacity: 0.5, duration: 1.4 }, 0)
        .fromTo(select('.render-sweep'), { x: -95, opacity: 0 }, { x: 95, opacity: 0.7, duration: 1.1 }, 0.1)
        .to(select('.render-sweep'), { opacity: 0, duration: 0.2 }, 1.2)
        .to(select('.sample-points i'), { opacity: 0.8, scale: 1, stagger: 0.06, duration: 0.35 }, 0)
        .to(select('.sample-points i'), { opacity: 0.15, duration: 0.6 }, 0.9)
      break
    case 'cinema':
      timeline.to(select('.mograph-array i'), { y: index => [-15, 8, -6, 12, -12, 5][index], rotation: index => index % 2 ? 35 : -20, opacity: 0.7, stagger: 0.065, duration: 0.8 }, 0)
        .to(select('.mograph-array i'), { rotation: 0, y: 0, duration: 0.7, stagger: 0.045 }, 0.9)
      break
    case 'corona':
      timeline.to(select('.portal-back'), { x: -12, opacity: 0.6, duration: 0.9 }, 0)
        .to(select('.portal-front'), { x: 12, opacity: 0.8, duration: 0.9 }, 0)
        .to(select('.daylight-patch'), { scaleX: 1, opacity: 0.5, duration: 1.3 }, 0.1)
        .to(select('.light-aperture'), { y: 7, opacity: 0.65, duration: 1 }, 0.15)
      break
    case 'mocha':
      timeline.to(select('.planar-grid'), { opacity: 0.35, duration: 0.45 }, 0)
        .to(select('.planar-track'), { opacity: 0.9, x: 11, y: -5, rotation: -5, duration: 0.65 }, 0)
        .to(select('.track-crosshair'), { opacity: 0.65, x: 11, y: -5, duration: 0.65 }, 0)
        .to(select('.planar-track'), { x: -8, y: 7, rotation: 3, duration: 0.85 }, 0.65)
        .to(select('.track-crosshair'), { x: -8, y: 7, duration: 0.85 }, 0.65)
      break
    case 'silhouette':
      timeline.to(select('.roto-outline'), { strokeDashoffset: 0, opacity: 0.9, duration: 1.25, ease: 'power1.inOut' }, 0)
        .to(select('.roto-node'), { opacity: 0.85, stagger: 0.12, duration: 0.35 }, 0.2)
        .to(select('.roto-pen'), { x: -6, y: -9, opacity: 0.8, duration: 0.9 }, 0.2)
      break
    case 'topaz':
      timeline.to(select('.restoration-grid'), { scaleX: 0, opacity: 0, duration: 1.15, ease: 'power2.inOut' }, 0)
        .to(select('.recovered-detail'), { opacity: 0.6, duration: 1.1 }, 0.12)
        .to(select('.recovery-scan'), { x: 126, opacity: 0.9, duration: 1.15 }, 0)
        .to(select('.recovery-scan'), { opacity: 0, duration: 0.25 }, 1.15)
      break
  }
  return timeline
}

export default function useSoftwareMotion(root, id) {
  const control = useRef(null)
  useEffect(() => {
    const element = root.current
    const select = gsap.utils.selector(element)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const limited = window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4)
    let hovering = false
    let focused = false
    let pinned = false
    let pageVisible = !document.hidden
    let timeline
    const context = gsap.context(() => {
      timeline = buildSoftwareTimeline(id, gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.6 } }), select)
    }, element)
    const update = () => {
      const active = (hovering || focused || pinned) && pageVisible && element.dataset.visible === 'true'
      element.dataset.emphasis = String(active)
      if (reduced.matches) { timeline.pause(0); return }
      // Keyboard focus keeps the same emphasis without the full choreography.
      if (focused && !hovering && !pinned) { timeline.pause(0); return }
      if (!pageVisible || element.dataset.visible !== 'true') { timeline.pause(0); return }
      if (active) timeline.timeScale(limited ? 1.3 : 1).play()
      else timeline.timeScale(1.65).reverse()
    }
    const unwatch = watch(element, visible => { pageVisible = visible; update() })
    reduced.addEventListener('change', update)
    control.current = {
      enter: event => { if (event.pointerType !== 'touch') hovering = true; update() },
      leave: () => { hovering = false; update() },
      focus: () => { focused = element.querySelector('button').matches(':focus-visible'); update() },
      blur: () => { focused = false; pinned = false; update() },
      toggle: () => { pinned = !pinned; update(); return pinned },
    }
    return () => { control.current = null; unwatch(); reduced.removeEventListener('change', update); context.revert() }
  }, [root, id])
  return {
    enter: event => control.current?.enter(event), leave: () => control.current?.leave(),
    focus: () => control.current?.focus(), blur: () => control.current?.blur(),
    toggle: () => control.current?.toggle() || false,
  }
}
