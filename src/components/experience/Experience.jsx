import { useRef, useState } from 'react'
import useReveal from '../../hooks/useReveal'
import { experience } from '../../data/experience'
import { getProductionDetail } from '../../data/productionDetails'
import ProductionDetailModal from './ProductionDetailModal'

export default function Experience() {
  const sectionRef = useRef(null)
  const returnFocus = useRef(null)
  const [selectedProduction, setSelectedProduction] = useState(null)

  useReveal(sectionRef)

  return <section ref={sectionRef} className="experience" id="experience" aria-labelledby="experience-title">
    <header className="experience__header" data-reveal-group><p id="experience-title" data-reveal>EXPERIENCE / PRODUCTION</p></header>
    <div className="experience__list">{experience.map(item => <article className="experience__row" data-reveal-group key={item.title}>
      <span className="motion-rule" data-reveal-line aria-hidden="true" />
      <button type="button" className="experience__open" aria-label={`View ${item.title} production details`} aria-haspopup="dialog" onClick={event => { returnFocus.current = event.currentTarget; setSelectedProduction(getProductionDetail(item)) }}><span aria-hidden="true">↗</span></button>
      <div className="experience__period" data-reveal>{item.period && <p>{item.period}</p>}</div><div><h3 data-reveal>{item.title}</h3>{item.company && <p className="experience__company" data-reveal>{item.company}</p>}</div><div className="experience__summary"><p data-reveal>{item.summary}</p>{item.highlights?.length > 0 && <ul>{item.highlights.slice(0,3).map(skill => <li key={skill} data-reveal>{skill}</li>)}</ul>}</div>
    </article>)}</div>
    <div className="experience__education"><span>EDUCATION</span><strong>AÇIK ÖĞRETİM GRAFİK TASARIM</strong><em>İSTANBUL ÜNİVERSİTESİ · 2023–TODAY</em></div>
    {selectedProduction && <ProductionDetailModal production={selectedProduction} onClose={() => setSelectedProduction(null)} returnFocus={returnFocus} />}
  </section>
}
