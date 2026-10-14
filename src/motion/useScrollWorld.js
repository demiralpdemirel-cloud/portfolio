import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
})

// One owner for scene timelines, responsive variants and teardown. No scroll-frame React state.
export default function useScrollWorld(root, revision) {
  const initialized = useRef(false)
  useLayoutEffect(() => {
    let stopped = false,
      resizeTimer,
      frame
    const forcedReduced = new URLSearchParams(location.search).has(
      'reduced-motion',
    )
    root.current.dataset.motion =
      forcedReduced || matchMedia('(prefers-reduced-motion:reduce)').matches
        ? 'reduced'
        : 'full'
    const context = gsap.context(() => {
      const media = gsap.matchMedia()
      media.add(
        {
          desktop: '(min-width:1025px)',
          small: '(max-width:1024px)',
          reduced: '(prefers-reduced-motion:reduce)',
        },
        ({ conditions }) => {
          root.current.dataset.motion =
            conditions.reduced || forcedReduced ? 'reduced' : 'full'
          if (conditions.reduced || forcedReduced) return
          const small = conditions.small
          const scenes = root.current.querySelectorAll('[data-scene]')
          const motion = (scene, start = 'top 90%', end = 'bottom 25%') =>
            gsap.timeline({
              scrollTrigger: {
                trigger: scene,
                start,
                end,
                scrub: small ? 0.3 : 0.65,
                invalidateOnRefresh: true,
              },
            })
          const hero = root.current.querySelector('#home')
          const intro = gsap.timeline()
          if (!initialized.current)
            intro.fromTo(
              '.scroll-title > span',
              { y: 45, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out',
              },
            )
          const flight = motion(hero, 'top top', 'bottom top')
          // Portrait is the primary identity and stays fully opaque throughout Hero.
          flight.to('.hero-portrait', {rotateY:small ? -2 : -7, rotateX:small ? 0 : 3, z:small ? -8 : -60, yPercent:-5, ease:'none'},0)
          flight.to(
            '.hero-depth',
            { yPercent: 18, scale: 1.15, rotateX: small ? 0 : 8, ease: 'none' },
            0,
          )
          flight.to(
            '.scroll-title',
            {
              rotateY: small ? -3 : -14,
              rotateX: small ? 2 : 8,
              z: small ? 20 : 160,
              yPercent: -18,
              opacity: 0.35,
              ease: 'none',
            },
            0,
          )
          flight.to(
            '.hero-fragment--one',
            {
              xPercent: small ? 8 : 24,
              yPercent: -38,
              rotateY: -9,
              z: small ? 10 : 220,
              ease: 'none',
            },
            0,
          )
          flight.to(
            '.hero-fragment--two',
            {
              xPercent: -8,
              yPercent: -16,
              rotateY: 8,
              z: small ? 10 : 90,
              ease: 'none',
            },
            0,
          )
          flight.to(
            '.hero-fragment--three',
            { yPercent: 25, z: small ? 0 : 120, ease: 'none' },
            0,
          )
          for (const scene of scenes) {
            const id = scene.id
            if (id === 'home') continue
            const timeline = motion(scene)
            if (id === 'about') {
              timeline.fromTo(
                scene.querySelector('.portrait-depth'),
                { rotateY: small ? -2 : -15, z: -60, y: 50 },
                { rotateY: 4, z: 60, y: -30, ease: 'none' },
                0,
              )
              timeline.fromTo(
                scene.querySelectorAll('.about-word'),
                { opacity: 0.35, y: 14, rotateX: 16 },
                { opacity: 1, y: 0, rotateX: 0, stagger: 0.035, ease: 'none' },
                0,
              )
            } else if (id === 'profile') {
              timeline.fromTo(
                scene.querySelectorAll('.profile-panel'),
                { rotateX: small ? 2 : 12, z: -70, y: 35 },
                { rotateX: 0, z: 0, y: -18, stagger: 0.1, ease: 'none' },
                0,
              )
            } else if (id === 'showreel') {
              timeline.fromTo(
                scene.querySelector('.cinema-shell'),
                {
                  rotateX: small ? 3 : 10,
                  rotateY: small ? -1 : -6,
                  scale: small ? 0.96 : 0.88,
                  y: 40,
                },
                { rotateX: 0, rotateY: 0, scale: 1, y: -12, ease: 'none' },
                0,
              )
            } else if (id === 'work') {
              // Keep the physical shelf frontal throughout the camera passage.
              timeline.fromTo(scene.querySelector('.jewel-heading'),{y:18},{y:0,ease:'none'},0)
            } else if (scene.dataset.world) {
              const world = scene.dataset.world
              timeline.fromTo(scene.querySelector('.world-heading'),{rotateX:small ? 0 : 6,z:-20,y:18},{rotateX:0,z:0,y:-12,ease:'none'},0)
              const seam = scene.querySelectorAll('.world-seam span')
              motion(scene,'top bottom','top 12%').fromTo(seam,{scaleX:0.18,rotate:world==='architecture' ? -12 : 8,xPercent:-20},{scaleX:1,rotate:0,xPercent:0,stagger:0.025,ease:'none'})
              motion(scene,'bottom 90%','bottom 10%').to(scene.querySelector('.world-geometry'),{yPercent:-12,rotateZ:world==='compositing' ? -4 : 0,opacity:0.18,ease:'none'})
              if(world==='architecture') {
                motion(scene,'top 95%','top 15%').fromTo(scene.querySelector('.architectural-lines path'),{strokeDashoffset:1},{strokeDashoffset:0,ease:'none'})
                timeline.fromTo(scene.querySelector('.world-grid'),{rotateX:72,z:-100,y:100},{rotateX:58,z:0,y:-50,ease:'none'},0)
              } else if(world==='product') {
                timeline.fromTo(scene.querySelectorAll('.studio-light'),{xPercent:-35,rotate:-25},{xPercent:35,rotate:15,stagger:0.15,ease:'none'},0)
              } else if(world==='compositing') {
                timeline.fromTo(scene.querySelector('.node-lines'),{xPercent:-6,scale:0.92},{xPercent:4,scale:1,ease:'none'},0)
              } else if(world==='modeling') {
                timeline.fromTo(scene.querySelector('.topology-outline'),{rotateY:-24,rotateX:15,z:-80},{rotateY:10,rotateX:0,z:20,ease:'none'},0)
              } else if(world==='production') {
                timeline.fromTo(scene.querySelector('.projector-beam'),{rotate:-8,xPercent:-15},{rotate:5,xPercent:10,ease:'none'},0)
              }
              scene.querySelectorAll('.world-entry').forEach((entry,index)=>{
                const shot = motion(entry,'top 98%','top 18%')
                const art=entry.querySelector('.world-art')
                const copy=entry.querySelector('.world-entry-copy')
                if(world==='architecture') {
                  shot.fromTo(art,{clipPath:'inset(0 100% 0 0)',rotateY:small ? -2 : -9,z:small ? -10 : -80},{clipPath:'inset(0 0% 0 0)',rotateY:0,z:0,ease:'none'},0)
                } else if(world==='compositing') {
                  shot.fromTo(entry.querySelectorAll('.layer-stack i'),{x:small ? -10 : -65,rotateY:-18,z:-120},{x:0,rotateY:0,z:0,stagger:0.07,ease:'none'},0)
                  shot.fromTo(art,{rotateY:small ? 0 : 8,z:small ? 0 : 70,scale:0.93},{rotateY:0,z:0,scale:1,ease:'none'},0)
                } else if(world==='modeling') {
                  const topology = entry.querySelector('.topology-image')
                  if(topology) {
                    shot.fromTo(art,{opacity:0.12,rotateX:small ? 0 : 6},{opacity:1,rotateX:0,ease:'none'},0)
                    shot.fromTo(topology,{scale:1.02},{scale:1,ease:'none'},0)
                  } else shot.fromTo(art,{rotateY:small ? 0 : -8,z:-30},{rotateY:0,z:0,ease:'none'},0)
                } else if(world==='production') {
                  shot.fromTo(art,{rotateY:small ? 0 : (index%2 ? 8 : -8),y:30,clipPath:'inset(10% 0 10% 0)'},{rotateY:0,y:0,clipPath:'inset(0% 0 0% 0)',ease:'none'},0)
                } else {
                  shot.fromTo(art,{rotateX:small ? 0 : 8,z:small ? -10 : -100,scale:0.94},{rotateX:0,z:0,scale:1,ease:'none'},0)
                }
                shot.fromTo(copy,{x:small ? 0 : (index%2 ? -25 : 25),y:12,opacity:0.65},{x:0,y:0,opacity:1,ease:'none'},0.15)
              })
            } else if (id === 'education') {
              timeline.fromTo(
                scene.querySelector('.education-line'),
                { scaleY: 0.05 },
                { scaleY: 1, ease: 'none' },
                0,
              )
              timeline.fromTo(
                scene.querySelector('.education-copy'),
                { x: small ? 8 : 35 },
                { x: 0, ease: 'none' },
                0,
              )
            } else if (id === 'capabilities') {
              timeline.fromTo(
                scene.querySelectorAll('.discipline-panel'),
                { rotateY: small ? 0 : -8, y: 24, z: -30 },
                { rotateY: 0, y: 0, z: 0, stagger: 0.08, ease: 'none' },
                0,
              )
            } else if (id === 'contact') {
              timeline.fromTo(
                scene.querySelectorAll('.contact-word'),
                { y: 20, rotateX: small ? 2 : 16, z: -30 },
                { y: 0, rotateX: 0, z: 20, stagger: 0.1, ease: 'none' },
                0,
              )
              timeline.fromTo(
                scene.querySelector('.contact-depth'),
                { y: 40, scale: 1.07 },
                { y: -25, scale: 1, ease: 'none' },
                0,
              )
            }
            if (id !== 'work')
              timeline.fromTo(
                scene.querySelector('.scene-number'),
                { y: 15, opacity: 0.45 },
                { y: -10, opacity: 1, ease: 'none' },
                0,
              )
          }
          // Viewport-local light rails have no independent RAF/particle engines.
          root.current
            .querySelectorAll('.light-rail')
            .forEach((rail) =>
              motion(rail.parentElement).fromTo(
                rail,
                { scaleX: 0.12, opacity: 0.15 },
                { scaleX: 1, opacity: 0.65, ease: 'none' },
              ),
            )
        },
      )
    }, root)
    const resize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 140)
    }
    const visibility = () => {
      document.documentElement.dataset.hidden = String(document.hidden)
    }
    const settle = () => {
      if (stopped) return
      ScrollTrigger.refresh()
      const target = document.getElementById(location.hash.slice(1))
      if (
        !initialized.current &&
        target &&
        !document.querySelector('dialog[open]')
      )
        target.scrollIntoView({ block: 'start', behavior: 'instant' })
      initialized.current = true
    }
    document.fonts.ready.then(() => {
      if (!stopped) frame = requestAnimationFrame(settle)
    })
    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', visibility)
    visibility()
    return () => {
      stopped = true
      clearTimeout(resizeTimer)
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
      context.revert()
    }
  }, [root])
  useLayoutEffect(() => {
    // Filtering changes measurements, not the world engines. Refresh once instead of
    // reverting/recreating every scene and every artwork tween on each category click.
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [revision])
}
