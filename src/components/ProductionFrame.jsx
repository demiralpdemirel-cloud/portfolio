import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { assetPath } from '../utils/assetPath.js'

export const cafeFrames = {
  final: 'media/projects/cafe-environment/final.webp',
  solid: 'media/projects/cafe-environment/clay.webp',
  mist: 'media/projects/cafe-environment/mist.webp',
}

// Real, registered Cafe passes. Guides are explicitly presentation graphics,
// never claimed to be exported project wireframes or isolated lighting passes.
export default function ProductionFrame({ closing = false }) {
  const { t } = useLanguage()
  const root = useRef(null)
  useLayoutEffect(() => {
    const element = root.current
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (new URLSearchParams(location.search).has('reduced-motion')) return
      const select = gsap.utils.selector(element)
      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' },
      })
      timeline.fromTo(select('.production-frame__solid'), { opacity: 1 }, { opacity: 0, duration: .85 }, .28)
        .fromTo(select('.production-frame__solid'), { x: -18, y: 12, rotationY: -4, scale:.98 }, { x:0,y:0,rotationY:0,scale:1,duration:.8 }, 0)
        .fromTo(select('.production-frame__mist'), { opacity: .65 }, { opacity: 0, duration: .7 }, .1)
        .fromTo(select('.production-frame__final'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.15 }, .22)
        .fromTo(select('.production-frame__light'), { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: .6, duration: .85 }, .3)
        .to(select('.production-frame__light'), { opacity: 0, duration: .3 }, 1.15)
        .fromTo(select('.production-frame__guides'), { opacity: .85, scale: 1.035 }, { opacity: 0, scale: 1, duration: .65 }, .85)
        .fromTo(select('.production-frame__caption'), { y: 8, opacity: .4 }, { y: 0, opacity: 1, duration: .45 }, .95)
      if (closing) timeline.timeScale(.65)
      let stopped = false, inView = false, ready = false, started = false
      const playWhenReady = () => {
        if (!stopped && ready && inView && !document.hidden) { started = true; timeline.play() }
        else if (started && (!inView || document.hidden)) timeline.pause()
      }
      // Decode before the one-shot assembly, otherwise slow assets could arrive
      // after its reveal has already finished. The base final remains usable.
      Promise.all([...element.querySelectorAll('img')].slice(0,3).map(img => img.decode().catch(()=>{}))).then(()=> { ready=true;playWhenReady() })
      const observer = new IntersectionObserver(entries=> { inView=entries[0].isIntersecting;playWhenReady() },{threshold:.12})
      observer.observe(element)
      const visibility = () => {
        if (document.hidden) timeline.pause()
        else playWhenReady()
      }
      document.addEventListener('visibilitychange', visibility)
      return () => { stopped=true;observer.disconnect();document.removeEventListener('visibilitychange', visibility);timeline.kill() }
    }, element)
    return () => media.revert()
  }, [closing])
  return <figure ref={root} className={`production-frame${closing ? ' production-frame--closing' : ''}`}>
    <div className="production-frame__image">
      <img src={assetPath(cafeFrames.final)} alt={t('Cafe environment — final artist render')} width="1920" height="1080" loading={closing ? 'lazy' : 'eager'} fetchPriority={closing ? 'auto' : 'high'} decoding="async" />
      <img className="production-frame__solid" src={assetPath(cafeFrames.solid)} alt="" aria-hidden="true" width="1920" height="1080" loading={closing ? 'lazy' : 'eager'} decoding="async" />
      <img className="production-frame__mist" src={assetPath(cafeFrames.mist)} alt="" aria-hidden="true" width="1920" height="1080" loading={closing ? 'lazy' : 'eager'} decoding="async" />
      <img className="production-frame__final" src={assetPath(cafeFrames.final)} alt="" aria-hidden="true" width="1920" height="1080" loading={closing ? 'lazy' : 'eager'} decoding="async" />
      <span className="production-frame__light" aria-hidden="true" />
      <svg className="production-frame__guides" viewBox="0 0 1920 1080" aria-hidden="true"><path d="M60 180V60H240 M1680 60H1860V180 M1860 900V1020H1680 M240 1020H60V900 M960 40V100 M960 980V1040 M40 540H100 M1820 540H1880" /></svg>
    </div>
    <figcaption className="production-frame__caption"><span>CAFE ENVIRONMENT</span><span>{t('SOLID / MIST / FINAL — REAL PROJECT PASSES')}</span></figcaption>
  </figure>
}
