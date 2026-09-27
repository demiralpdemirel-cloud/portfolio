import { projects } from '../../data/projects'
import ProjectChapter from '../../components/project/ProjectChapter'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

export default function Work({activePageId}) {
  const featured=projects.filter(project=>project.featured)
  return <section className="work" id="work" aria-label="Selected work"><AtmosphericBackground src="media/backgrounds/selected-work.webp" className="work__atmosphere" opacity={.18} blur={28} brightness={.4} /><header className="work__header"><span>{String(featured.length).padStart(2,'0')} PROJECTS</span></header>{featured.map(project=><ProjectChapter key={project.id} project={project} isActive={activePageId===project.id}/>)}</section>
}
