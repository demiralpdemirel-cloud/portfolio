import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MediaPlaceholder from '../media/MediaPlaceholder'
import BeforeAfter from '../media/BeforeAfter'
import ThreeDBreakdown from '../media/ThreeDBreakdown'
import LazyVideo from '../media/LazyVideo'
import ProjectMeta from './ProjectMeta'
import AtmosphericBackground from '../media/AtmosphericBackground'
import EnvironmentGallery from './EnvironmentGallery'

export default function ProjectChapter({ project, isActive = false }) {
  const root = useRef(null)
  const breakdownRef = useRef(null)
  const beforeAfterRef = useRef(null)
  const breakdownScreens = project.presentation === '3d-breakdown' ? Math.max(project.breakdownStages?.length || 0, 1) + 1 : null

  useLayoutEffect(() => {
    const element = root.current
    const scrollSpace = element.querySelector('.project__scroll-space')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined
    const context = gsap.context(() => {
      ScrollTrigger.create({ trigger: scrollSpace, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, fastScrollEnd: false, onUpdate: self => { breakdownRef.current?.setProgress(self.progress); beforeAfterRef.current?.setProgress(self.progress) }, onRefresh: self => { breakdownRef.current?.setProgress(self.progress); beforeAfterRef.current?.setProgress(self.progress) } })
      const title = element.querySelector('.project-title')
      const meta = element.querySelectorAll('.project-meta, .project__description')
      gsap.timeline({ scrollTrigger: { trigger: scrollSpace, start: 'top top', end: 'bottom bottom', scrub: .7, invalidateOnRefresh: true } })
        .fromTo(title, { autoAlpha: 0, scale: .96, filter: 'blur(6px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .08, ease: 'none', immediateRender: true })
        .to(title, { autoAlpha: 1, duration: .7 })
        .to(title, { autoAlpha: 0, scale: 1.02, filter: 'blur(5px)', duration: .22, ease: 'none' })
      gsap.fromTo(meta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: .04, ease: 'none', immediateRender: true, scrollTrigger: { trigger: '.project__info-band', start: 'top 85%', end: 'top 55%', scrub: .35, invalidateOnRefresh: true } })
      if (project.presentation === 'product') {
        const media = element.querySelector('.cinematic__media')
        gsap.fromTo(media, { scale: .88 }, { scale: 1, ease: 'none', immediateRender: true, scrollTrigger: { trigger: scrollSpace, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true } })
      }
    }, element)
    let resizeFrame
    const refreshOnResize = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => ScrollTrigger.refresh()) }
    window.addEventListener('resize', refreshOnResize)
    return () => { window.removeEventListener('resize', refreshOnResize); cancelAnimationFrame(resizeFrame); context.revert() }
  }, [project])

  return <article ref={root} className={`project project--${project.presentation}${isActive?' is-active':''}`} id={project.id} aria-labelledby={`${project.id}-title`} style={breakdownScreens ? { '--project-scroll-screens': breakdownScreens } : undefined}>
    <AtmosphericBackground src={project.cover} className="project__atmosphere" opacity={.2} blur={32} brightness={.42} />
    <div className="project__scroll-space"><div className="project__sticky" data-project-viewport>
      <p className="project__number">PROJECT / {project.number}<span>{project.placeholder ? 'DEMONSTRATION CHAPTER' : project.date}</span></p>
      {project.presentation === 'product' && <div className="cinematic__media"><MediaPlaceholder label="3D PRODUCT / OBJECT" path={project.cover} variant="media-placeholder--object" placeholder={project.placeholder} /></div>}
      {project.presentation === 'vfx-breakdown' && <BeforeAfter ref={beforeAfterRef} data={project.beforeAfter} placeholder={project.placeholder} />}
      {project.presentation === '3d-breakdown' && <ThreeDBreakdown ref={breakdownRef} stages={project.breakdownStages} placeholder={project.placeholder} />}
      {project.presentation === 'environment' && <EnvironmentGallery media={project.media} title={project.title} />}
      {project.presentation === 'video' && <div className={`video-frame${project.video && project.breakdownVideo ? ' video-frame--with-breakdown' : ''}`}><LazyVideo video={project.video} title={project.title} placeholder={project.placeholder} />{project.breakdownVideo && <div className="video-frame__breakdown"><p>BREAKDOWN VIDEO</p><LazyVideo video={project.breakdownVideo} title={`${project.title} breakdown`} placeholder={project.placeholder} /></div>}</div>}
      <div className="project__title-wrap"><h2 className="project-title" id={`${project.id}-title`}>{project.title}</h2></div>
    </div></div>
    <div className="project__info-band"><p className="project__description">{project.description}</p><ProjectMeta project={project} /></div>
  </article>
}
