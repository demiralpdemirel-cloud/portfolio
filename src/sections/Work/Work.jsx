import { useLanguage } from '../../i18n/LanguageContext'
import { useRef, useState } from 'react'
import { personalProjects } from '../../data/projects'
import { brandFilms } from '../../data/brandFilms'
import useReveal from '../../hooks/useReveal'
import ProjectChapter from '../../components/project/ProjectChapter'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'
import ProjectDetail from '../../components/project/ProjectDetail'

function WorkCollection({ id, title, projects }) {
  const { t } = useLanguage()
  const root = useRef(null)
  useReveal(root)
  const [selected, setSelected] = useState(null)
  const returnFocus = useRef(null)
  const openDetails = (event, index) => { returnFocus.current = event.currentTarget; setSelected(index) }
  return <section ref={root} className="work" id={id} aria-labelledby={`${id}-title`}>
    <AtmosphericBackground src="media/backgrounds/selected-work.webp" className="work__atmosphere" opacity={.12} blur={30} brightness={.32} />
    <header className="work__header" data-reveal-group><h2 id={`${id}-title`} data-reveal>{t(title)}</h2><span data-reveal>{String(projects.length).padStart(2,'0')} {t('PROJECTS')}</span></header>
    {projects.map((project, index)=><ProjectChapter key={project.id} project={project} index={index} total={projects.length} onOpenDetails={event => openDetails(event, index)}/>)}
    {selected !== null && <ProjectDetail key={projects[selected].id} project={projects[selected]} onClose={() => setSelected(null)} onNext={() => setSelected((selected + 1) % projects.length)} returnFocus={returnFocus} />}
  </section>
}

export default function Work() {
  return <><WorkCollection id="brand-films" title="BRAND & PRODUCT FILMS" projects={brandFilms} /><WorkCollection id="work" title="PERSONAL WORK" projects={personalProjects} /></>
}
