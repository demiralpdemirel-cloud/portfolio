import { useLayoutEffect, useRef, useState } from 'react'
import { personalCatalog, personalFilters } from '../data/catalog.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import JewelCase from './JewelCase.jsx'
import { shelfIndex, shelfOffset } from '../utils/catalogShelf.js'

export default function JewelCaseCatalog({ entries, category, onCategoryChange, onOpen }) {
  const { t } = useLanguage()
  const cases = useRef([])
  const viewport = useRef(null), track = useRef(null)
  const archive = useRef(null)
  const [step, setStep] = useState(0)
  const pendingFocus = useRef(false)
  const pointerPreview = useRef(null)
  const [selection, setSelection] = useState({ category, index: 0 })
  const [preview, setPreview] = useState(null)
  const index = selection.category === category ? shelfIndex(selection.index, entries.length) : 0
  const shown = entries[preview?.category === category ? preview.index : index] || entries[index]
  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setStep(parseFloat(getComputedStyle(track.current).getPropertyValue('--case-step')))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport.current)
    return () => observer.disconnect()
  }, [category])
  useLayoutEffect(() => {
    const element = archive.current
    const observer = new IntersectionObserver(records => {
      if (!records.some(record => record.isIntersecting)) return
      element.dataset.formed = 'true'
      observer.disconnect()
    }, { threshold: .12 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    cases.current[entries[index]?.id]?.focus({ preventScroll: true })
  }, [index, category])
  const choose = (next, focus = false) => {
    const bounded = shelfIndex(next, entries.length)
    pendingFocus.current = focus
    setSelection({ category, index: bounded })
    setPreview(null)
    pointerPreview.current = null
  }
  const keys = event => {
    const destinations = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: entries.length - 1 }
    if (!(event.key in destinations)) return
    event.preventDefault()
    choose(destinations[event.key], true)
  }
  const description = shown.detail.productionDescription || shown.detail.myWork || shown.detail.description
  const categoryLabel = shown.categories.map(id => t(personalFilters.find(filter => filter.id === id)?.label)).filter(Boolean).join(' / ') || t(shown.detail.primaryCategory || shown.discipline)
  return (
    <div className="jewel-archive" ref={archive}>
      <header className="jewel-heading">
        <div><p className="scene-number">04 / {t('PERSONAL WORKS')}</p><h2>{t('THE COLLECTION.')}</h2></div>
        <p className="jewel-instruction">{t('Nine worlds. Open a case.')}</p>
      </header>
      <div className="jewel-filters" role="group" aria-label={t('Filter works')}>
        {personalFilters.map(filter => <button key={filter.id} type="button" aria-pressed={category === filter.id} onClick={() => { setPreview(null); setSelection({ category: filter.id, index: 0 }); onCategoryChange(filter.id) }}>{t(filter.label)}</button>)}
      </div>
      <div className="jewel-controls">
        <span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span>
        <div><button type="button" aria-label={t('Previous project')} disabled={index === 0} onClick={() => choose(index - 1)}>←</button><button type="button" aria-label={t('Next project')} disabled={index === entries.length - 1} onClick={() => choose(index + 1)}>→</button></div>
      </div>
      <div className="jewel-presentation">
      <div className="jewel-shelf" onKeyDown={keys}>
        <div className="jewel-viewport" ref={viewport}>
          <div className="jewel-track" ref={track} style={{ transform: `translate3d(${-shelfOffset(index, step, entries.length)}px,0,0)` }}>
            {personalCatalog.map(entry => {
              const position = entries.findIndex(item => item.id === entry.id)
              const included = position !== -1
              return <button className={`jewel-case${included && position === index ? ' is-active' : ''}${included && position === entries.length - 1 ? ' is-last' : ''}`} style={{ '--slot': Math.max(0, position), '--step': `${step}px`, '--order': Math.max(0, position) }} inert={!included} aria-hidden={!included} data-included={included} type="button" key={entry.id} ref={element => { cases.current[entry.id] = element }} tabIndex={included && position === index ? 0 : -1} aria-haspopup="dialog" aria-pressed={included && position === index} aria-label={t(entry.title)} onClick={event => onOpen(event, entry)} onPointerEnter={event => { if (event.pointerType === 'mouse') { pointerPreview.current = { category, index: position }; setPreview(pointerPreview.current) } }} onPointerLeave={() => { pointerPreview.current = null; setPreview(null) }} onFocus={() => setPreview(pointerPreview.current || { category, index: position })} onBlur={() => setPreview(pointerPreview.current)}>
                <JewelCase entry={entry} title={t(entry.title)}/>
                <span className="jewel-caption"><small>{entry.number} / {t(entry.kind === 'project' ? 'PROJECT' : 'PRODUCTION')}</small><strong>{t(entry.title)}</strong></span>
              </button>
            })}
          </div>
        </div>
        <div className="jewel-ledge" aria-hidden="true"/>
      </div>
      <div className="jewel-detail">
        <div><p className="jewel-detail-index">{shown.number} / {t('SELECTED CASE')}</p><h3>{t(shown.title)}</h3><button type="button" className="jewel-open" aria-haspopup="dialog" onClick={() => onOpen({ currentTarget: cases.current[shown.id] }, shown)}>{t('VIEW PROJECT')} <span aria-hidden="true">↗</span></button></div>
        <div className="jewel-detail-copy"><dl><div><dt>{t('ROLE')}</dt><dd>{t(shown.discipline)}</dd></div><div><dt>{t('CATEGORY')}</dt><dd>{categoryLabel}</dd></div><div><dt>{t('YEAR')}</dt><dd>{shown.year ? t(shown.year) : '—'}</dd></div></dl>{description && <p>{t(description)}</p>}</div>
      </div>
      </div>
    </div>
  )
}
