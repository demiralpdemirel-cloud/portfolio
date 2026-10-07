import { useRef, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { assetPath } from '../../utils/assetPath'
import { projectMediaDimensions } from '../../data/projects'

// Modal presentation of the existing breakdownStages schema. Only requested
// passes are mounted; keep the last decoded image visible until the next loads.
export default function BreakdownSwitcher({ stages, title, onOpen, lazy = false }) {
  const { t } = useLanguage()
  const [requested, setRequested] = useState(0)
  const [active, setActive] = useState(0)
  const [visited, setVisited] = useState([0])
  const [failed, setFailed] = useState(false)
  const loaded = useRef(new Set())
  const requestedRef = useRef(0)
  const [width, height] = projectMediaDimensions[stages[0].media] || [1600, 900]
  const select = index => {
    requestedRef.current = index
    setRequested(index)
    setFailed(false)
    setVisited(values => values.includes(index) ? values : [...values, index])
    if (loaded.current.has(index)) setActive(index)
  }
  return <div className="modal-breakdown">
    <button type="button" className="project-modal__image modal-breakdown__frame" style={{ aspectRatio: `${width} / ${height}` }} onClick={() => onOpen(active)} aria-label={t(`Open ${title} — ${stages[active].label} fullscreen`)} aria-busy={requested !== active}>
      {visited.map(index => <img key={stages[index].media} src={assetPath(stages[index].media)} width={width} height={height} alt={t(stages[index].alt || stages[index].label)} aria-hidden={index !== active} className={index === active ? 'is-active' : ''} loading={lazy ? 'lazy' : undefined} decoding="async" onLoad={() => {
        loaded.current.add(index)
        if (requestedRef.current === index) setActive(index)
      }} onError={() => { if (requestedRef.current === index) setFailed(true) }} />)}
    </button>
    <div className="modal-breakdown__controls" role="group" aria-label={t('Breakdown stages')}>
      {stages.map((stage, index) => <button key={stage.label} type="button" aria-pressed={requested === index} onClick={() => select(index)}>{stage.label}</button>)}
    </div>
    {failed && <p role="alert">{t('IMAGE UNAVAILABLE')} — {stages[requested].label}</p>}
  </div>
}
