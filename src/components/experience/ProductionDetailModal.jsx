import { useState } from 'react'
import { createPortal } from 'react-dom'
import useModalDialog, { trapModalFocus } from '../../hooks/useModalDialog'
import { assetPath } from '../../utils/assetPath'

const formatDate = value => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)).toUpperCase() : 'Not confirmed'

function ProductionMetadata({ production }) {
  const series = production.type === 'TV SERIES'
  const rows = [
    ['TYPE', production.type || 'Not confirmed'],
    ['FIRST RELEASE YEAR', production.firstReleaseYear ?? 'Not confirmed'],
    [series ? 'FIRST RELEASE' : 'RELEASE DATE / TURKEY', formatDate(production.releaseStart)],
    ...(series ? [['RELEASE RANGE', production.releaseStart ? `${formatDate(production.releaseStart)} — ${production.status === 'ONGOING' ? 'PRESENT' : formatDate(production.releaseEnd)}` : 'Not confirmed'], ['SEASONS', production.seasons ?? 'Not confirmed']] : []),
    ['IMDb RATING', production.imdbRating == null ? 'IMDb rating unavailable' : `${production.imdbRating.toFixed(1)} / 10`],
  ]
  return <>
    <dl className="production-modal__metadata">{rows.map(([label, value], index) => <div key={label} style={{ '--metadata-order': index }}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {production.imdbUrl && <a className="production-modal__link" href={production.imdbUrl} target="_blank" rel="noopener noreferrer">VIEW {production.title} ON IMDb ↗</a>}
  </>
}

export default function ProductionDetailModal({ production, onClose, returnFocus }) {
  const { dialog, close, isClosing } = useModalDialog(onClose, returnFocus)
  const [imageFailed, setImageFailed] = useState(false)
  return createPortal(<dialog ref={dialog} className={`project-modal production-modal${isClosing ? ' is-closing' : ''}`} aria-modal="true" aria-labelledby="production-modal-title" onKeyDown={trapModalFocus} onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="project-modal__scroll">
      <header className="project-modal__header"><p>PRODUCTION / DETAIL</p><button type="button" className="project-modal__close" onClick={close} autoFocus>CLOSE ×</button></header>
      <div className="project-modal__content production-modal__composition">
        <figure className="production-modal__visual">
          {production.image && !imageFailed ? <img src={assetPath(production.image)} width={production.imageWidth} height={production.imageHeight} alt={`${production.title} — production publicity image`} decoding="async" onError={() => setImageFailed(true)} /> : <div className="production-modal__placeholder">PRODUCTION IMAGE<br />NOT AVAILABLE</div>}
          {production.imageSource && !imageFailed && <figcaption>{production.imageSource}{production.imageSourceUrl && <> · <a href={production.imageSourceUrl} target="_blank" rel="noopener noreferrer">SOURCE ↗</a></>}</figcaption>}
        </figure>
        <div className="production-modal__info">
          <h2 id="production-modal-title">{production.title}</h2>
          {production.films ? <section aria-label="Individual film metadata" className="production-modal__films">{production.films.map(film => <article key={film.imdbTitleId}><h3>{film.title}</h3><ProductionMetadata production={film} /><p className="production-modal__credit">{film.personalCredit ? 'PERSONAL WORK CREDIT' : 'SERIES CONTEXT ONLY — NOT A PERSONAL CREDIT'}</p></article>)}</section> : <ProductionMetadata production={production} />}
          <div className="production-modal__work">
            <dl><div><dt>COMPANY / VFX STUDIO</dt><dd>{production.company || 'Not confirmed'}</dd></div>{production.period && <div><dt>MY WORK PERIOD</dt><dd>{production.period}</dd></div>}<div><dt>MY ROLE</dt><dd>{production.role.length ? production.role.join(' / ') : 'Not confirmed'}</dd></div></dl>
            {production.creditNote && <p className="production-modal__credit">{production.creditNote}</p>}
            <h3>MY WORK</h3><p>{production.description}</p>
            <h3>DISCIPLINES</h3>{production.disciplines.length ? <ul>{production.disciplines.map(discipline => <li key={discipline}>{discipline}</li>)}</ul> : <p>Not confirmed</p>}
          </div>
        </div>
      </div>
    </div>
  </dialog>, document.body)
}
