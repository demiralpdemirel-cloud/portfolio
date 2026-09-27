import { experience } from '../../data/experience'

export default function Experience() {
  return <section className="experience" id="experience" aria-labelledby="experience-title">
    <header className="experience__header"><p id="experience-title">EXPERIENCE / PRODUCTION</p></header>
    <div className="experience__list">{experience.map(item => <article className="experience__row" key={item.title}>
      <div className="experience__period">{item.period && <p>{item.period}</p>}</div><div><h3>{item.title}</h3>{item.company && <p className="experience__company">{item.company}</p>}</div><div className="experience__summary"><p>{item.summary}</p>{item.highlights?.length > 0 && <ul>{item.highlights.slice(0,3).map(skill => <li key={skill}>{skill}</li>)}</ul>}</div>
    </article>)}</div>
    <div className="experience__education"><span>EDUCATION</span><strong>AÇIK ÖĞRETİM GRAFİK TASARIM</strong><em>İSTANBUL ÜNİVERSİTESİ · 2023–TODAY</em></div>
  </section>
}
