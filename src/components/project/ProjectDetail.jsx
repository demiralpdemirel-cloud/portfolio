import { useLanguage } from '../../i18n/LanguageContext'
import LanguageSwitcher from '../../i18n/LanguageSwitcher'
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { assetPath } from '../../utils/assetPath'
import useModalDialog, { trapModalFocus as trapFocus } from '../../hooks/useModalDialog'
import VideoPlayer from '../showreel/VideoPlayer'
import ProjectMeta from './ProjectMeta'
import BreakdownSwitcher from '../media/BreakdownSwitcher'
import { projectMediaDimensions } from '../../data/projects'
import SceneStatistics from './SceneStatistics'

function DetailImage({ src, title, onOpen }) {
  const { t } = useLanguage()
  const [failed, setFailed] = useState(false)
  const [width, height] = projectMediaDimensions[src] || [1600, 900]
  return <button className="project-modal__image" style={{ aspectRatio: `${width} / ${height}` }} type="button" onClick={onOpen} aria-label={t(`Open ${title} fullscreen`)} disabled={failed}>
    {failed ? <span role="alert">{t('IMAGE UNAVAILABLE')} — {title}</span> : <img src={assetPath(src)} width={width} height={height} alt={title} decoding="async" onError={() => setFailed(true)} />}
  </button>
}

function ImageLightbox({ images, alts, initialIndex, title, onClose }) {
  const { t } = useLanguage()
  const dialog = useRef(null)
  const [index, setIndex] = useState(initialIndex)
  const [failed, setFailed] = useState(false)
  const navigate = direction => { setFailed(false); setIndex(value => (value + direction + images.length) % images.length) }
  useLayoutEffect(() => {
    const element = dialog.current
    const trigger = document.activeElement
    element.showModal()
    return () => { element.close(); trigger?.focus({ preventScroll: true }) }
  }, [])
  return <dialog ref={dialog} className="project-lightbox" aria-label={t(`${title} image viewer`)} onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }} onKeyDown={event => {
    trapFocus(event)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1) }
  }}>
    <div className="viewer-language"><LanguageSwitcher inline /></div>
    <button className="project-lightbox__close" type="button" onClick={onClose} autoFocus>{t("CLOSE ×")}</button>
    {failed ? <p role="alert">{t("IMAGE UNAVAILABLE")}</p> : <img key={images[index]} src={assetPath(images[index])} alt={t(alts?.[index] || `${title} — view ${index + 1}`)} decoding="async" onError={() => setFailed(true)} />}
    <div className="project-lightbox__controls"><button type="button" onClick={() => navigate(-1)} aria-label={t("Previous image")}>←</button><span aria-live="polite">{index + 1} / {images.length}</span><button type="button" onClick={() => navigate(1)} aria-label={t("Next image")}>→</button><a href={assetPath(images[index])} target="_blank" rel="noopener noreferrer">{t("OPEN FULL IMAGE ↗")}</a></div>
  </dialog>
}

export default function ProjectDetail({ project, onClose, onNext, returnFocus }) {
  const { t } = useLanguage()
  const { dialog, close, cancel, isClosing } = useModalDialog(onClose, returnFocus)
  const scroll = useRef(null)
  const [imageIndex, setImageIndex] = useState(null)
  const switcher = project.breakdownPresentation === 'switcher' && project.breakdownStages?.length > 0
  const images = project.media?.length ? project.media : project.video ? [] : [project.cover].filter(Boolean)
  const lightboxImages = switcher ? project.breakdownStages.map(stage => stage.fullResolution || stage.media) : images
  useLayoutEffect(() => {
    scroll.current?.scrollTo({ top: 0, behavior: 'instant' })
    setImageIndex(null)
    dialog.current?.querySelector('.project-modal__close')?.focus({ preventScroll: true })
  }, [project.id])

  return createPortal(<dialog ref={dialog} className={`project-modal${isClosing ? ' is-closing' : ''}`} aria-labelledby="project-modal-title" aria-modal="true" onKeyDown={trapFocus} onCancel={cancel} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div ref={scroll} className="project-modal__scroll">
      <header className="project-modal__header"><p>{t('PROJECT')} / {project.number}</p><div className="modal-header-actions"><LanguageSwitcher inline /><button className="project-modal__close" type="button" onClick={close} autoFocus>{t("CLOSE ×")}</button></div></header>
      <div className="project-modal__content" key={project.id}>
        <div className="project-modal__intro"><div className="project-modal__hero">
          {project.video && project.breakdownVideo && <p className="section-index">{t("MAIN FILM")}</p>}
          {switcher ? <BreakdownSwitcher stages={project.breakdownStages} title={project.title} onOpen={setImageIndex} /> : project.video && project.presentation !== 'environment' ? <VideoPlayer src={project.video.src} poster={project.video.poster} label={project.breakdownVideo ? 'Main film' : project.title} /> : images[0] && <DetailImage src={images[0]} title={`${project.title} — view 1`} onOpen={() => setImageIndex(0)} />}
        </div><div className="project-modal__info"><h2 id="project-modal-title">{project.title}</h2><p className="section-index">{t(project.primaryCategory || project.categories?.join(' / '))}</p><p className="project-modal__description">{t(project.description)}</p><ProjectMeta project={project} />{project.credits?.length > 0 && <p>{t('CREDITS')} / {project.credits.join(' / ')}</p>}</div></div>
        {project.type && <p className="section-index">{t(project.type)}</p>}
        <SceneStatistics stats={project.sceneStats} />
        {!switcher && images.length > 1 && <section className="project-modal__gallery" aria-label={t(`${project.title} gallery`)}>{images.slice(1).map((src, index) => <DetailImage key={src} src={src} title={`${project.title} — view ${index + 2}`} onOpen={() => setImageIndex(index + 1)} />)}</section>}
        {project.presentation === 'environment' && project.video && <section className="project-modal__video"><p className="section-index">{t("PROJECT FILM")}</p><VideoPlayer src={project.video.src} poster={project.video.poster} label={`${project.title} film`} /></section>}
        {project.breakdownVideo && <section className="project-modal__video project-modal__video--secondary" aria-label={t("Secondary project media")}><p className="section-index">{t("BREAKDOWN")}</p><VideoPlayer src={project.breakdownVideo.src} poster={project.breakdownVideo.poster} label={t("Breakdown")} /></section>}
        {!switcher && project.breakdownStages?.length > 0 && <section className="project-modal__gallery" aria-label={t("Breakdown stages")}>{project.breakdownStages.map(stage => <figure key={stage.label}><img src={assetPath(stage.media)} alt={t(stage.label)} decoding="async" loading="lazy" /><figcaption>{t(stage.label)}</figcaption></figure>)}</section>}
        {project.beforeAfter && <section className="project-modal__gallery" aria-label={t("Before and after")}>{['before', 'after'].map(stage => <figure key={stage}><img src={assetPath(project.beforeAfter[stage])} alt={t(stage)} decoding="async" loading="lazy" /><figcaption>{t(stage.toUpperCase())}</figcaption></figure>)}</section>}
        <button type="button" className="project-modal__next" onClick={onNext} disabled={isClosing}>{t("NEXT PROJECT →")}</button>
      </div>
    </div>
    {imageIndex !== null && <ImageLightbox images={lightboxImages} alts={switcher ? project.breakdownStages.map(stage => stage.alt) : undefined} initialIndex={imageIndex} title={project.title} onClose={() => setImageIndex(null)} />}
  </dialog>, document.body)
}
