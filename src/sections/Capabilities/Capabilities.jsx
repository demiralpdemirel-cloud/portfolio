import { useRef } from 'react'
import useReveal from '../../hooks/useReveal'
import { capabilities } from '../../data/capabilities'
import { tools } from '../../data/tools'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

const toolGroups = [
  { label: '3D / CGI', categories: ['3D'] },
  { label: 'VFX / COMPOSITING', categories: ['VFX'] },
  { label: 'IMAGE / AI', categories: ['IMAGE', 'AI'] },
  { label: 'EDITING', categories: ['EDITING'] },
]

export default function Capabilities() {
  const root = useRef(null)
  useReveal(root)
  return <section ref={root} className="capabilities" id="capabilities" aria-labelledby="capabilities-title"><AtmosphericBackground src="media/backgrounds/disciplines.webp" className="capabilities__atmosphere" opacity={.07} brightness={.24} />
    <div className="capabilities__content"><div data-reveal-group><p className="section-index" data-reveal>CAPABILITIES</p><h2 id="capabilities-title" className="motion-mask" data-reveal-mask><span data-reveal>WHAT I DO</span></h2></div><div className="capabilities__grid">{capabilities.map(item=><article key={item.id} data-reveal-group><span data-reveal>{item.id}</span><h3 data-reveal>{item.title}</h3><p data-reveal>{item.description}</p></article>)}</div><div className="capabilities__tools"><p className="section-index">TOOLS / SOFTWARE</p>{toolGroups.map(group => {
      const names = tools.filter(tool => tool.priority === 'primary' && group.categories.includes(tool.category)).sort((a, b) => group.categories.indexOf(a.category) - group.categories.indexOf(b.category)).map(tool => tool.name.replace(/^(Adobe |Boris FX )/, ''))
      return <div className="capabilities__tool-group" key={group.label} data-reveal-group><strong data-reveal>{group.label}</strong><p data-reveal>{names.join(' · ')}</p></div>
    })}</div></div>
  </section>
}
