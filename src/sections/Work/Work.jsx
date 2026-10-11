import { useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../i18n/LanguageContext'
import { catalog, catalogFilters, filterCatalog } from '../../data/catalog'
import { assetPath } from '../../utils/assetPath'
import ProjectDetail from '../../components/project/ProjectDetail'
import ProductionDetailModal from '../../components/experience/ProductionDetailModal'
import './catalog.css'

export default function Work() {
  const { t } = useLanguage()
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState(null)
  const returnFocus = useRef(null)
  const entries = filterCatalog(category)
  const selectedEntry = catalog.find(entry => entry.id === selected)
  useLayoutEffect(() => { ScrollTrigger.refresh() }, [category])
  const open = (event, entry) => { returnFocus.current = event.currentTarget; setSelected(entry.id) }
  const nextProject = () => {
    const projects = entries.filter(entry => entry.kind === 'project')
    setSelected(projects[(projects.findIndex(entry => entry.id === selected) + 1) % projects.length].id)
  }
  return <section className="work catalog" id="work" aria-labelledby="catalog-title">
    <header className="catalog__header">
      <div><p className="section-index">{t('WORKS')}</p><h2 id="catalog-title">{t('SELECTED WORKS')}</h2></div>
      <span className="catalog__count" aria-live="polite">{String(entries.length).padStart(2,'0')} / {String(catalog.length).padStart(2,'0')} {t('WORKS')}</span>
    </header>
    <div className="catalog__filters" role="group" aria-label={t('Filter works')}>
      {catalogFilters.map(filter => <button key={filter.id} type="button" aria-pressed={category === filter.id} onClick={() => setCategory(filter.id)}>{t(filter.label)}</button>)}
    </div>
    <div className="catalog__grid">
      {entries.map(entry => <button key={entry.id} id={entry.id} type="button" className="catalog-card" aria-haspopup="dialog" aria-label={t('VIEW PROJECT')+' — '+t(entry.title)} onClick={event => open(event,entry)}>
        <div className="catalog-card__poster">
          {entry.thumbnail ? <img src={assetPath(entry.thumbnail)} srcSet={assetPath(entry.thumbnail)+' 480w, '+assetPath(entry.thumbnailLarge)+' 960w'} sizes="(min-width:1800px) 19vw, (min-width:1300px) 24vw, (min-width:950px) 32vw, (min-width:600px) 48vw, 96vw" width="480" height="640" style={{objectFit:entry.fit,objectPosition:entry.objectPosition}} alt={t(entry.title)+' '+t('POSTER')} loading="lazy" decoding="async"/> : <span className="catalog-card__type-art">{t(entry.title)}</span>}
        </div>
        <div className="catalog-card__meta"><p className="catalog-card__index">{entry.number}{entry.year && <> / {t(entry.year)}</>}</p><h3>{t(entry.title)}</h3><p className="catalog-card__discipline">{t(entry.discipline)}</p><span className="catalog-card__arrow" aria-hidden="true">↗</span></div>
      </button>)}
    </div>
    {selectedEntry?.kind === 'project' && <ProjectDetail project={selectedEntry.detail} onClose={() => setSelected(null)} onNext={nextProject} returnFocus={returnFocus}/>}
    {selectedEntry?.kind === 'production' && <ProductionDetailModal key={selectedEntry.id} production={selectedEntry.detail} onClose={() => setSelected(null)} returnFocus={returnFocus}/>}
  </section>
}
