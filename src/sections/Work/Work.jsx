import { useLanguage } from '../../i18n/LanguageContext'
import { useRef, useState } from 'react'
import { personalProjects } from '../../data/projects'
import useReveal from '../../hooks/useReveal'
import ProjectChapter from '../../components/project/ProjectChapter'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'
import ProjectDetail from '../../components/project/ProjectDetail'

export default function Work() {
  const { t } = useLanguage()
  const root = useRef(null)
  useReveal(root)
  const [selected, setSelected] = useState(null)
  const returnFocus = useRef(null)
  const openDetails = (event, index) => { returnFocus.current = event.currentTarget; setSelected(index) }
  return <section ref={root} className="work" id="work" aria-labelledby="personal-work-title">
    <AtmosphericBackground src="media/backgrounds/selected-work.webp" className="work__atmosphere" opacity={.12} blur={30} brightness={.32} />
    <header className="work__header" data-reveal-group><h2 id="personal-work-title" data-reveal>{t('PERSONAL WORK')}</h2><span data-reveal>{String(personalProjects.length).padStart(2,'0')} {t('PROJECTS')}</span></header>
    {personalProjects.map((project, index)=><ProjectChapter key={project.id} project={project} index={index} total={personalProjects.length} onOpenDetails={event => openDetails(event, index)}/>)}
    {selected !== null && <ProjectDetail key={personalProjects[selected].id} project={personalProjects[selected]} onClose={() => setSelected(null)} onNext={() => setSelected((selected + 1) % personalProjects.length)} returnFocus={returnFocus} />}
  </section>
}
