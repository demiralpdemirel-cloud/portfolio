import { useEffect } from 'react'
import MediaPlaceholder from '../media/MediaPlaceholder'
import LazyVideo from '../media/LazyVideo'

export default function ProjectDetail({project,onClose,onNext}) {
  const isVfx=project.categoryIds?.includes('vfx')
  useEffect(()=>{
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    const onKey=event=>{if(event.key==='Escape')onClose()}
    window.addEventListener('keydown',onKey)
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)}
  },[onClose])

  return <div className="project-detail" role="dialog" aria-modal="true" aria-labelledby="project-detail-title">
    <header className="project-detail__header"><p>PROJECT / {project.number}</p><button type="button" onClick={onClose} autoFocus>CLOSE <span aria-hidden="true">×</span></button></header>
    <div className="project-detail__hero"><MediaPlaceholder label="HERO SHOT" path={project.cover} placeholder={project.placeholder}/><h2 id="project-detail-title">{project.title}</h2></div>
    <section className="project-detail__facts" aria-label="Project information"><p><span>Category</span>{project.categories[0]}</p><p><span>Role</span>{project.role.join(' / ')}</p><p><span>Tools</span>{project.software.join(' / ')}</p><p><span>Year</span>{project.year}</p></section>
    <section className="project-detail__copy"><p className="section-index">DESCRIPTION</p><p>{project.description}</p></section>
    {!isVfx&&project.breakdownStages.length>0&&<section className="project-detail__breakdown"><p className="section-index">BREAKDOWN</p>{project.breakdownStages.map(stage=><div key={stage.label}><MediaPlaceholder label={stage.label} path={stage.media} placeholder={project.placeholder}/><p>{stage.label}</p></div>)}</section>}
    {!isVfx&&project.beforeAfter&&<section className="project-detail__before-after"><p className="section-index">BEFORE / AFTER</p><div><MediaPlaceholder label="BEFORE" path={project.beforeAfter.before} placeholder={project.placeholder}/><MediaPlaceholder label="AFTER" path={project.beforeAfter.after} placeholder={project.placeholder}/></div></section>}
    {project.video&&<section className="project-detail__video"><p className="section-index">VIDEO</p><div><LazyVideo video={project.video} title={`${project.title} video`} detail placeholder={project.placeholder}/></div></section>}
    {project.breakdownVideo&&<section className="project-detail__video"><p className="section-index">BREAKDOWN VIDEO</p><div><LazyVideo video={project.breakdownVideo} title={`${project.title} breakdown video`} detail placeholder={project.placeholder}/></div></section>}
    {project.media.length>0&&<section className="project-detail__gallery" aria-label="Project images">{project.media.map((media,index)=><MediaPlaceholder key={media} label={`IMAGE / ${String(index+1).padStart(2,'0')}`} path={media} placeholder={project.placeholder}/>)}</section>}
    <section className="project-detail__credits"><p className="section-index">CREDITS</p><p>{project.credits.length?project.credits.join(' / '):'Credits will be added with final project media.'}</p></section>
    <button className="project-detail__next" type="button" onClick={onNext}><span>NEXT PROJECT</span><strong>{project.number === '005' ? '001' : String(Number(project.number) + 1).padStart(3, '0')}</strong><span aria-hidden="true">→</span></button>
  </div>
}
