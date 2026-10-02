import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { assetPath } from '../../utils/assetPath'
import useModalDialog, { trapModalFocus as trapFocus } from '../../hooks/useModalDialog'
import VideoPlayer from '../showreel/VideoPlayer'
import ProjectMeta from './ProjectMeta'
import { projectMediaDimensions } from '../../data/projects'

function DetailImage({ src, title, onOpen }) {
  const [failed, setFailed] = useState(false)
  const [width, height] = projectMediaDimensions[src] || [1600, 900]
  return <button className="project-modal__image" style={{ aspectRatio: `${width} / ${height}` }} type="button" onClick={onOpen} aria-label={`Open ${title} fullscreen`} disabled={failed}>
    {failed ? <span role="alert">IMAGE UNAVAILABLE — {title}</span> : <img src={assetPath(src)} width={width} height={height} alt={title} decoding="async" onError={() => setFailed(true)} />}
  </button>
}

function ImageLightbox({ images, initialIndex, title, onClose }) {
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
  return <dialog ref={dialog} className="project-lightbox" aria-label={`${title} image viewer`} onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }} onKeyDown={event => {
    trapFocus(event)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1) }
  }}>
    <button className="project-lightbox__close" type="button" onClick={onClose} autoFocus>CLOSE ×</button>
    {failed ? <p role="alert">IMAGE UNAVAILABLE</p> : <img key={images[index]} src={assetPath(images[index])} alt={`${title} — view ${index + 1}`} decoding="async" onError={() => setFailed(true)} />}
    <div className="project-lightbox__controls"><button type="button" onClick={() => navigate(-1)} aria-label="Previous image">←</button><span aria-live="polite">{index + 1} / {images.length}</span><button type="button" onClick={() => navigate(1)} aria-label="Next image">→</button><a href={assetPath(images[index])} target="_blank" rel="noopener noreferrer">OPEN FULL IMAGE ↗</a></div>
  </dialog>
}

export default function ProjectDetail({ project, onClose, onNext, returnFocus }) {
  const { dialog, close, isClosing } = useModalDialog(onClose, returnFocus)
  const scroll = useRef(null)
  const [imageIndex, setImageIndex] = useState(null)
  const images = project.media?.length ? project.media : project.video ? [] : [project.cover].filter(Boolean)
  useLayoutEffect(() => {
    scroll.current?.scrollTo({ top: 0, behavior: 'instant' })
    setImageIndex(null)
    dialog.current?.querySelector('.project-modal__close')?.focus({ preventScroll: true })
  }, [project.id])

  return createPortal(<dialog ref={dialog} className={`project-modal${isClosing ? ' is-closing' : ''}`} aria-labelledby="project-modal-title" aria-modal="true" onKeyDown={trapFocus} onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div ref={scroll} className="project-modal__scroll">
      <header className="project-modal__header"><p>PROJECT / {project.number}</p><button className="project-modal__close" type="button" onClick={close} autoFocus>CLOSE ×</button></header>
      <div className="project-modal__content" key={project.id}>
        <div className="project-modal__intro"><div className="project-modal__hero">
          {project.video && project.breakdownVideo && <p className="section-index">MAIN FILM</p>}
          {project.video && project.presentation !== 'environment' ? <VideoPlayer src={project.video.src} poster={project.video.poster} label={project.breakdownVideo ? 'Main film' : project.title} /> : images[0] && <DetailImage src={images[0]} title={`${project.title} — view 1`} onOpen={() => setImageIndex(0)} />}
        </div><div className="project-modal__info"><h2 id="project-modal-title">{project.title}</h2><p className="section-index">{project.primaryCategory || project.categories?.join(' / ')}</p><p className="project-modal__description">{project.description}</p><ProjectMeta project={project} />{project.credits?.length > 0 && <p>CREDITS / {project.credits.join(' / ')}</p>}</div></div>
        {images.length > 1 && <section className="project-modal__gallery" aria-label={`${project.title} gallery`}>{images.slice(1).map((src, index) => <DetailImage key={src} src={src} title={`${project.title} — view ${index + 2}`} onOpen={() => setImageIndex(index + 1)} />)}</section>}
        {project.presentation === 'environment' && project.video && <section className="project-modal__video"><p className="section-index">PROJECT FILM</p><VideoPlayer src={project.video.src} poster={project.video.poster} label={`${project.title} film`} /></section>}
        {project.breakdownVideo && <section className="project-modal__video project-modal__video--secondary" aria-label="Secondary project media"><p className="section-index">BREAKDOWN</p><VideoPlayer src={project.breakdownVideo.src} poster={project.breakdownVideo.poster} label="Breakdown" /></section>}
        {project.breakdownStages?.length > 0 && <section className="project-modal__gallery" aria-label="Breakdown stages">{project.breakdownStages.map(stage => <figure key={stage.label}><img src={assetPath(stage.media)} alt={stage.label} decoding="async" loading="lazy" /><figcaption>{stage.label}</figcaption></figure>)}</section>}
        {project.beforeAfter && <section className="project-modal__gallery" aria-label="Before and after">{['before', 'after'].map(stage => <figure key={stage}><img src={assetPath(project.beforeAfter[stage])} alt={stage} decoding="async" loading="lazy" /><figcaption>{stage.toUpperCase()}</figcaption></figure>)}</section>}
        <button type="button" className="project-modal__next" onClick={onNext} disabled={isClosing}>NEXT PROJECT →</button>
      </div>
    </div>
    {imageIndex !== null && <ImageLightbox images={images} initialIndex={imageIndex} title={project.title} onClose={() => setImageIndex(null)} />}
  </dialog>, document.body)
}
