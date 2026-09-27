import { useEffect,useMemo,useRef,useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projectCategories,projects } from '../../data/projects'
import ProjectDetail from '../../components/project/ProjectDetail'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'
import { assetPath } from '../../utils/assetPath'

export default function PortfolioArchive() {
  const [category,setCategory]=useState('all')
  const [selected,setSelected]=useState(()=>projects.find(project=>!project.featured&&project.id===window.location.hash.slice(1))||null)
  const [preview,setPreview]=useState(null)
  const [previousPreview,setPreviousPreview]=useState(null)
  const lastTrigger=useRef(null)
  const scrollFrame=useRef(null)
  const filtered=useMemo(()=>category==='all'?projects:projects.filter(project=>project.categoryIds.includes(category)),[category])

  useEffect(()=>{const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());return()=>cancelAnimationFrame(frame)},[category])
  useEffect(()=>{
    const syncProjectFromHash=()=>{
      const project=projects.find(item=>!item.featured&&item.id===window.location.hash.slice(1))||null
      setSelected(project)
      if(project) document.getElementById('archive')?.scrollIntoView({block:'start'})
    }
    const onPopState=()=>{
      syncProjectFromHash()
      const target=document.getElementById(window.location.hash.slice(1))
      if(target) {
        const targetY=window.scrollY+target.getBoundingClientRect().top
        window.scrollTo({top:targetY,behavior:'instant'})
      }
    }
    if(selected) requestAnimationFrame(()=>document.getElementById('archive')?.scrollIntoView({block:'start'}))
    window.addEventListener('popstate',onPopState)
    window.addEventListener('hashchange',syncProjectFromHash)
    return()=>{
      if(scrollFrame.current!==null)cancelAnimationFrame(scrollFrame.current)
      window.removeEventListener('popstate',onPopState)
      window.removeEventListener('hashchange',syncProjectFromHash)
    }
  },[])
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
  const scrollToFeaturedChapter=project=>{
    const chapter=document.getElementById(project.id)
    if(!chapter)return
    if(scrollFrame.current!==null)cancelAnimationFrame(scrollFrame.current)
    ScrollTrigger.refresh()
    const targetY=window.scrollY+chapter.getBoundingClientRect().top
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      window.scrollTo(0,targetY)
      ScrollTrigger.refresh()
      return
    }
    const startY=window.scrollY
    const startTime=performance.now()
    const duration=Math.min(900,Math.max(520,Math.abs(targetY-startY)*.055))
    const animate=now=>{
      const progress=Math.min((now-startTime)/duration,1)
      const eased=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2
      window.scrollTo(0,startY+(targetY-startY)*eased)
      if(progress<1)scrollFrame.current=requestAnimationFrame(animate)
      else {
        window.scrollTo(0,targetY)
        scrollFrame.current=null
        ScrollTrigger.refresh()
      }
    }
    scrollFrame.current=requestAnimationFrame(animate)
  }
  const openProject=(project,event)=>{
    event.preventDefault()
    event.stopPropagation()
    lastTrigger.current=event.currentTarget
    window.history.replaceState(null,'','#archive')
    window.history.pushState(null,'',`#${project.id}`)
    if(project.featured&&document.getElementById(project.id)){
      scrollToFeaturedChapter(project)
      return
    }
    setSelected(project)
  }
  const closeProject=()=>{
    if(scrollFrame.current!==null)cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current=null
    setSelected(null)
    window.history.replaceState(null,'','#archive')
    requestAnimationFrame(()=>lastTrigger.current?.focus())
  }
  const nextProject=()=>{
    const index=projects.findIndex(project=>project.id===selected.id)
    const next=projects[(index+1)%projects.length]
    window.history.pushState(null,'',`#${next.id}`)
    if(next.featured&&document.getElementById(next.id)){
      setSelected(null)
      scrollToFeaturedChapter(next)
    } else setSelected(next)
  }

  return <section className="archive" id="archive" aria-labelledby="archive-title" onMouseLeave={clearPreview}>
    <header className="archive__header"><p className="section-index">EXPLORE WORK</p><h2 id="archive-title">PROJECT ARCHIVE</h2><p>{String(filtered.length).padStart(2,'0')} / {String(projects.length).padStart(2,'0')}</p></header>
    <nav className="category-nav" aria-label="Filter work by category">{projectCategories.map(item=><button key={item.id} type="button" className={category===item.id?'is-active':''} aria-pressed={category===item.id} onClick={()=>setCategory(item.id)}>{item.label}</button>)}</nav>
    <div className="archive__work-area"><div className="archive__list" aria-live="polite">{filtered.map(project=><a className={`archive-row${preview?.id===project.id?' is-previewing':''}`} href={`#${project.id}`} key={project.id} onMouseEnter={()=>activatePreview(project)} onFocus={()=>activatePreview(project)} onClick={event=>openProject(project,event)}><span className="archive-row__number">{project.number}</span><span className="archive-row__title">{project.title}</span><span className="archive-row__category">{project.categories[0]}{project.personal ? ' · PERSONAL' : ''}</span><span className="archive-row__year">{project.year}</span><span className="archive-row__open" aria-hidden="true">↗</span></a>)}</div>
      <aside className={`archive-preview${preview?' is-active':''}`} aria-hidden="true">
        {previousPreview&&<img key={`previous-${previousPreview.id}`} className="archive-preview__image archive-preview__image--previous" src={assetPath(previousPreview.cover)} alt="" />}
        {preview&&<img key={preview.id} className="archive-preview__image archive-preview__image--current" src={assetPath(preview.cover)} alt="" loading="lazy" />}
        <div className="archive-preview__caption"><span>{preview?.number || '—'}</span><span>{preview?.title || 'SELECT A PROJECT'}</span></div>
      </aside></div>
    {selected&&<ProjectDetail project={selected} onClose={closeProject} onNext={nextProject}/>} 
  </section>
}
