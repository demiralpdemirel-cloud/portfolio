import { useLayoutEffect } from 'react'
import gsap from 'gsap'

// One observer per section, one short timeline per visible group. No scroll-frame updates.
export default function useReveal(rootRef, revision) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const context = gsap.context(() => {
      const match = gsap.matchMedia()
      match.add({ all: '(min-width: 0px)', reduced: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 900px)' }, ({ conditions }) => {
        if (conditions.reduced || !('IntersectionObserver' in window)) return
        const groups = [...root.querySelectorAll('[data-reveal-group]')]
        const targetsFor = group => [...group.querySelectorAll('[data-reveal]')]
        const animations = []
        const reveal = group => {
          const animationContext = gsap.context(() => {
            const targets = targetsFor(group)
            const masks = [...group.querySelectorAll('[data-reveal-mask]')]
            const lines = group.querySelectorAll('[data-reveal-line]')
            gsap.set(masks, { overflow: 'hidden' })
            const timeline = gsap.timeline({ onComplete: () => {
              group.dataset.motionComplete = 'true'
              gsap.set(targets, { clearProps: 'opacity,visibility,transform' })
              gsap.set(masks, { clearProps: 'overflow' })
            } })
            targets.forEach((target, index) => {
              const masked = target.parentElement.hasAttribute('data-reveal-mask')
              timeline.fromTo(target, { autoAlpha: 0, y: masked ? 0 : (conditions.mobile ? 14 : 24), yPercent: masked ? 105 : 0 }, { autoAlpha: 1, y: 0, yPercent: 0, duration: conditions.mobile ? .5 : .75, ease: 'power3.out' }, index * .075)
            })
            if (lines.length) timeline.fromTo(lines, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: .6, ease: 'power2.out' }, 0)
          }, group)
          animations.push(animationContext)
        }
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return
            observer.unobserve(entry.target)
            reveal(entry.target)
          })
        }, { rootMargin: '0px 0px -3% 0px', threshold: 0 })
        groups.forEach(group => {
          if (group.dataset.motionComplete === 'true') return
          // A reload above a group leaves its already-passed copy visible.
          if (group.getBoundingClientRect().bottom <= 0) return
          gsap.set(targetsFor(group), { autoAlpha: 0 })
          observer.observe(group)
        })
        return () => {
          observer.disconnect()
          animations.forEach(animation => animation.revert())
          root.querySelectorAll('[data-reveal]').forEach(target => {
            for (const property of ['opacity', 'visibility', 'transform']) target.style.removeProperty(property)
          })
          root.querySelectorAll('[data-reveal-mask]').forEach(mask => mask.style.removeProperty('overflow'))
        }
      })
    }, root)
    return () => context.revert()
  }, [rootRef, revision])
}
