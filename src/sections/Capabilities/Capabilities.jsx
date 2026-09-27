import { capabilities } from '../../data/capabilities'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

const tools = [
  ['3D', 'Blender · Cinema 4D · OctaneRender · Corona Renderer'],
  ['VFX', 'After Effects · Mocha Pro · Silhouette'],
  ['IMAGE / AI', 'Photoshop · Topaz Video AI · Upscayl'],
  ['EDITING', 'Premiere Pro'],
]

export default function Capabilities() {
  return <section className="capabilities" id="capabilities" aria-labelledby="capabilities-title"><AtmosphericBackground src="media/backgrounds/disciplines.webp" className="capabilities__atmosphere" opacity={.13} blur={30} brightness={.38} />
    <div className="capabilities__content"><p className="section-index">CAPABILITIES</p><h2 id="capabilities-title">WHAT I DO</h2><div className="capabilities__grid">{capabilities.map(item=><article key={item.id}><span>{item.id}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div><div className="capabilities__tools"><p className="section-index">TOOLS / SOFTWARE</p>{tools.map(([label,list])=><div key={label}><strong>{label}</strong><p>{list}</p></div>)}</div></div>
  </section>
}
