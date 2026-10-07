import { useLanguage } from '../../i18n/LanguageContext'
import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MediaPlaceholder from '../media/MediaPlaceholder'
import BeforeAfter from '../media/BeforeAfter'
import ThreeDBreakdown from '../media/ThreeDBreakdown'
import LazyVideo from '../media/LazyVideo'
import ProjectMeta from './ProjectMeta'
import AtmosphericBackground from '../media/AtmosphericBackground'
import EnvironmentGallery from './EnvironmentGallery'
import BreakdownSwitcher from '../media/BreakdownSwitcher'
import FullscreenImageViewer from './FullscreenImageViewer'
import SceneStatistics from './SceneStatistics'

export default function ProjectChapter({ project, isActive = false, index = 0, total = 1, staticPresentation = false, onOpenDetails }) {
  const { t } = useLanguage()
  const root = useRef(null)
  const breakdownRef = useRef(null)
  const beforeAfterRef = useRef(null)
  const galleryRef = useRef(null)
  const stageControls = useRef(null)
  const [viewer, setViewer] = useState(null)
  const switcher = project.breakdownPresentation === 'switcher' && project.breakdownStages?.length > 0
  const setMediaRatio = ratio => {
    if (Number.isFinite(ratio) && ratio > 0) root.current?.style.setProperty('--project-media-ratio', String(ratio))
  }

  useLayoutEffect(() => {
    const element = root.current
    if (staticPresentation) return undefined
    const context = gsap.context(() => {
      const match = gsap.matchMedia()
      match.add({ all: '(min-width: 0px)', desktop: '(min-width: 901px)', reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
        if (conditions.reduced) return
        const media = element.querySelector('.project-chapter__media')
        const info = element.querySelector('.project-chapter__info')
        const items = element.querySelectorAll('[data-project-reveal]')
        const atmosphere = element.querySelector('.project__atmosphere')
        const title = element.querySelector('.project-title > span')
        const mask = element.querySelector('.project-title')
        const meta = element.querySelector('.project-meta')
        const textContext = gsap.context(() => {}, element)
        let observer
        if ('IntersectionObserver' in window && element.getBoundingClientRect().top >= 0) {
          gsap.set(items, { opacity: 0, y: 20 })
          gsap.set(title, { opacity: 0, yPercent: 105 })
          observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return
            observer.disconnect()
            textContext.add(() => {
              gsap.set(mask, { overflow: 'hidden' })
              const reveal = gsap.timeline({ onComplete: () => {
                gsap.set([...items, title], { clearProps: 'opacity,transform' })
                gsap.set(mask, { clearProps: 'overflow' })
              } })
                .to(items, { opacity: 1, y: 0, duration: .65, stagger: .08, ease: 'power3.out' }, .08)
                .to(title, { opacity: 1, yPercent: 0, duration: .75, ease: 'power3.out' }, .16)
              if (meta) reveal.fromTo(meta, { '--meta-rule-scale': 0 }, { '--meta-rule-scale': 1, duration: .6, ease: 'power2.out' }, .35)
            })
          }, { threshold: 0, rootMargin: '0px 0px -12% 0px' })
          observer.observe(element)
        }
        const cleanupText = () => {
          observer?.disconnect()
          textContext.revert()
          for (const target of [...items, title]) {
            target.style.removeProperty('opacity')
            target.style.removeProperty('transform')
          }
          mask.style.removeProperty('overflow')
        }
        if (!conditions.desktop) {
          gsap.from(media, { opacity: 0, y: 16, duration: .6, scrollTrigger: { trigger: media, start: 'top 92%', once: true } })
          return cleanupText
        }
        const syncMedia = self => {
          const progress = gsap.utils.clamp(0, 1, (self.progress - .18) / .64)
          breakdownRef.current?.setProgress(progress)
          beforeAfterRef.current?.setProgress(progress)
          galleryRef.current?.setProgress(progress)
        }
        // Scroll distance belongs to the article; visual height belongs to its sticky child.
        const hasProgressMedia = ['environment', '3d-breakdown', 'vfx-breakdown'].includes(project.presentation)
        gsap.timeline({ scrollTrigger: {
          trigger: element, start: 'top 85%', end: 'bottom 15%', scrub: .3, invalidateOnRefresh: true,
          ...(hasProgressMedia ? { onUpdate: syncMedia } : {}),
          onRefresh: self => {
            self.getTween()?.progress(1)
            self.animation?.progress(self.progress)
            if (hasProgressMedia) syncMedia(self)
          },
        } })
          .fromTo(media, { opacity: 0, scale: .94, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: .16, ease: 'power2.out' }, 0)
          .fromTo(atmosphere, { opacity: 0 }, { opacity: 1, duration: .18, ease: 'none' }, 0)
          .to(media, { opacity: 0, scale: .96, y: -30, duration: .18, ease: 'power2.in' }, .82)
          .to(info, { opacity: 0, y: -20, duration: .18, ease: 'power2.in' }, .82)
          .to(atmosphere, { opacity: 0, duration: .18, ease: 'none' }, .82)
        return cleanupText
      })
    }, element)
    return () => context.revert()
  }, [project, staticPresentation])

  return <article ref={root} className={`project project-chapter project--${project.presentation}${switcher ? ' project-chapter--switcher' : ''}${project.breakdownVideo ? ' project-chapter--secondary-video' : ''}${isActive ? ' is-active' : ''}${staticPresentation ? ' project-chapter--static' : ''}`} id={staticPresentation ? undefined : project.id} aria-labelledby={`${project.id}-title`}>
    <div className="project-chapter__sticky" data-project-viewport>
      <AtmosphericBackground src={project.cover} className="project__atmosphere" opacity={.16} blur={32} brightness={.36} />
      <div className="project-chapter__layout">
        <div className="project-chapter__media">
          {switcher ? <BreakdownSwitcher lazy stages={project.breakdownStages} title={project.title} onOpen={active => setViewer({ index: active, origin: root.current.querySelector('.modal-breakdown__frame').getBoundingClientRect() })} />
            : project.presentation === 'vfx-breakdown' && project.beforeAfter ? <BeforeAfter ref={beforeAfterRef} data={project.beforeAfter} placeholder={project.placeholder} />
            : project.presentation === '3d-breakdown' ? <ThreeDBreakdown ref={breakdownRef} controlsRef={stageControls} stages={project.breakdownStages || []} placeholder={project.placeholder} />
            : project.presentation === 'environment' ? <EnvironmentGallery ref={galleryRef} media={project.media} title={project.title} />
            : project.video ? <div className="project-chapter__videos"><LazyVideo video={project.video} title={project.title} detail={staticPresentation} muted onAspectRatio={setMediaRatio} placeholder={project.placeholder} />{project.breakdownVideo && <div className="project-chapter__breakdown-video"><p>{t("BREAKDOWN VIDEO")}</p><LazyVideo video={project.breakdownVideo} title={`${project.title} breakdown`} detail={staticPresentation} muted placeholder={project.placeholder} /></div>}</div>
            : <MediaPlaceholder label={project.title} path={project.media?.[0] || project.cover} placeholder={project.placeholder} />}
        </div>
        <div className="project-chapter__info">
          <p className="project-chapter__counter" data-project-reveal>{t('PROJECT')} / {String(index + 1).padStart(3, '0')} <span>/ {String(total).padStart(3, '0')}</span></p>
          <h2 className="project-title motion-mask" id={`${project.id}-title`}><span>{project.title}</span></h2>
          <p className="project-chapter__category" data-project-reveal>{t(project.primaryCategory || project.categories?.[0])}</p>
          <p className="project__description" data-project-reveal>{t(project.description)}</p>
          <ProjectMeta project={project} reveal />
          <SceneStatistics stats={project.sceneStats} className="project-chapter__stats" />
          {onOpenDetails && <button type="button" className="project-chapter__details" aria-haspopup="dialog" onClick={onOpenDetails}>{t('VIEW PROJECT')} ↗</button>}
          {project.presentation === '3d-breakdown' && <ol ref={stageControls} className="project-chapter__stages" aria-label={t("3D breakdown stage")} data-project-reveal>{project.breakdownStages?.map((stage, stageIndex) => <li key={stage.label} className={stageIndex === 0 ? 'is-active' : ''}>{t(stage.label)}</li>)}</ol>}
        </div>
      </div>
    </div>
    {viewer && <FullscreenImageViewer media={project.breakdownStages.map(stage => stage.fullResolution || stage.media)} title={project.title} index={viewer.index} origin={viewer.origin} onNavigate={next => setViewer(value => ({ ...value, index: next }))} onClose={() => setViewer(null)} />}
  </article>
}
