import { useLanguage } from '../../i18n/LanguageContext'
import { useRef } from 'react'
import { projects } from '../../data/projects'
import useReveal from '../../hooks/useReveal'
import ProjectChapter from '../../components/project/ProjectChapter'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'
import Showreel from '../Showreel/Showreel'

export default function Work() {
  const { t } = useLanguage()
  const root = useRef(null)
  useReveal(root)
  const featured=projects.filter(project=>project.featured)
  return <section ref={root} className="work" id="work" aria-label={t("Selected work")}>
    <AtmosphericBackground src="media/backgrounds/selected-work.webp" className="work__atmosphere" opacity={.12} blur={30} brightness={.32} />
    <header className="work__header" data-reveal-group><span data-reveal>{String(featured.length).padStart(2,'0')} {t('PROJECTS')}</span></header>
    {featured.map((project, index)=><ProjectChapter key={project.id} project={project} index={index} total={featured.length}/>)}
    <Showreel />
  </section>
}
