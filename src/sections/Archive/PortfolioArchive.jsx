import { useEffect,useMemo,useRef,useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projectCategories,projects } from '../../data/projects'
import ProjectDetail from '../../components/project/ProjectDetail'
import { assetPath } from '../../utils/assetPath'
import useReveal from '../../hooks/useReveal'

export default function PortfolioArchive() {
  const root = useRef(null)
  const [category,setCategory]=useState('all')
  const [selected,setSelected]=useState(null)
  const [preview,setPreview]=useState(null)
  const [previousPreview,setPreviousPreview]=useState(null)
  const lastTrigger=useRef(null)
  const filtered=useMemo(()=>category==='all'?projects:projects.filter(project=>project.categoryIds.includes(category)),[category])
  useReveal(root, category)

  useEffect(()=>{const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());return()=>cancelAnimationFrame(frame)},[category])
  useEffect(()=>{
    if(!previousPreview)return undefined
    const timer=window.setTimeout(()=>setPreviousPreview(null),420)
    return()=>window.clearTimeout(timer)
  },[previousPreview])
  const activatePreview=project=>{
    if(preview?.id===project.id)return
    setPreviousPreview(preview)
    setPreview(project)
  }
  const clearPreview=()=>{setPreviousPreview(preview);setPreview(null)}
  const openProject=(project,event)=>{
    event.preventDefault()
    event.stopPropagation()
    lastTrigger.current=event.currentTarget
    setSelected(project)
  }
  const closeProject=()=>{
    setSelected(null)
  }
  const nextProject=()=>{
    const index=projects.findIndex(project=>project.id===selected.id)
    const next=projects[(index+1)%projects.length]
    setSelected(next)
  }

  return <section ref={root} className="archive" id="archive" aria-labelledby="archive-title" onMouseLeave={clearPreview}>
    <header className="archive__header" data-reveal-group><p className="section-index" data-reveal>EXPLORE WORK</p><h2 id="archive-title" className="motion-mask" data-reveal-mask><span data-reveal>PROJECT ARCHIVE</span></h2><p data-reveal>{String(filtered.length).padStart(2,'0')} / {String(projects.length).padStart(2,'0')}</p></header>
    <nav className="category-nav" aria-label="Filter work by category">{projectCategories.map(item=><button key={item.id} type="button" className={category===item.id?'is-active':''} aria-pressed={category===item.id} onClick={()=>setCategory(item.id)}>{item.label}</button>)}</nav>
    <div className="archive__work-area"><div className="archive__list" aria-live="polite">{filtered.map(project=><button type="button" aria-haspopup="dialog" data-reveal-group className={`archive-row${preview?.id===project.id?' is-previewing':''}`} key={project.id} onMouseEnter={()=>activatePreview(project)} onFocus={()=>activatePreview(project)} onClick={event=>openProject(project,event)}><span className="archive-row__number" data-reveal>{project.number}</span><span className="archive-row__title" data-reveal>{project.title}</span><span className="archive-row__category" data-reveal>{project.primaryCategory || project.categories[0]}</span>{project.year && project.year !== '—' && <span className="archive-row__year">{project.year}</span>}<span className="archive-row__open" aria-hidden="true">↗</span></button>)}</div>
      <aside className={`archive-preview${preview?' is-active':''}`} aria-hidden="true">
        {previousPreview&&<img key={`previous-${previousPreview.id}`} className="archive-preview__image archive-preview__image--previous" src={assetPath(previousPreview.cover)} alt="" />}
        {preview&&<img key={preview.id} className="archive-preview__image archive-preview__image--current" src={assetPath(preview.cover)} alt="" loading="lazy" />}
        <div className="archive-preview__caption"><span>{preview?.number || '—'}</span><span>{preview?.title || 'SELECT A PROJECT'}</span></div>
      </aside></div>
    {selected&&<ProjectDetail project={selected} onClose={closeProject} onNext={nextProject} returnFocus={lastTrigger}/>}
  </section>
}
