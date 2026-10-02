import { useLanguage } from '../../i18n/LanguageContext'
import LanguageSwitcher from '../../i18n/LanguageSwitcher'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import useModalDialog, { trapModalFocus } from '../../hooks/useModalDialog'
import { assetPath } from '../../utils/assetPath'

function ProductionMetadata({ production }) {
  const { t, formatDate } = useLanguage()
  const series = production.type === 'TV SERIES'
  const rows = [
    ['TYPE', production.type || 'Not confirmed'],
    ['FIRST RELEASE YEAR', production.firstReleaseYear ?? 'Not confirmed'],
    [series ? 'FIRST RELEASE' : 'RELEASE DATE / TURKEY', formatDate(production.releaseStart)],
    ...(series ? [['RELEASE RANGE', production.releaseStart ? `${formatDate(production.releaseStart)} — ${production.status === 'ONGOING' ? 'PRESENT' : formatDate(production.releaseEnd)}` : 'Not confirmed'], ['SEASONS', production.seasons ?? 'Not confirmed']] : []),
    ['IMDb RATING', production.imdbRating == null ? 'IMDb rating unavailable' : `${production.imdbRating.toFixed(1)} / 10`],
  ]
  return <>
    <dl className="production-modal__metadata">{rows.map(([label, value], index) => <div key={label} style={{ '--metadata-order': index }}><dt>{t(label)}</dt><dd>{t(value)}</dd></div>)}</dl>
    {production.imdbUrl && <a className="production-modal__link" href={production.imdbUrl} target="_blank" rel="noopener noreferrer">{t(`VIEW ${production.title} ON IMDb ↗`)}</a>}
  </>
}

export default function ProductionDetailModal({ production, onClose, returnFocus }) {
  const { t } = useLanguage()
  const { dialog, close, cancel, isClosing } = useModalDialog(onClose, returnFocus)
  const [imageFailed, setImageFailed] = useState(false)
  return createPortal(<dialog ref={dialog} className={`project-modal production-modal${isClosing ? ' is-closing' : ''}`} aria-modal="true" aria-labelledby="production-modal-title" onKeyDown={trapModalFocus} onCancel={cancel} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="project-modal__scroll">
      <header className="project-modal__header"><p>{t("PRODUCTION / DETAIL")}</p><div className="modal-header-actions"><LanguageSwitcher inline /><button type="button" className="project-modal__close" onClick={close} autoFocus>{t("CLOSE ×")}</button></div></header>
      <div className="project-modal__content production-modal__composition">
        <figure className="production-modal__visual">
          {production.image && !imageFailed ? <img src={assetPath(production.image)} width={production.imageWidth} height={production.imageHeight} alt={t(`${production.title} — production publicity image`)} decoding="async" onError={() => setImageFailed(true)} /> : <div className="production-modal__placeholder">{t("PRODUCTION IMAGE")}<br />{t("NOT AVAILABLE")}</div>}
          {production.imageSource && !imageFailed && <figcaption>{t(production.imageSource)}{production.imageSourceUrl && <> · <a href={production.imageSourceUrl} target="_blank" rel="noopener noreferrer">{t("SOURCE ↗")}</a></>}</figcaption>}
        </figure>
        <div className="production-modal__info">
          <h2 id="production-modal-title">{production.title}</h2>
          {production.films ? <section aria-label={t("Individual film metadata")} className="production-modal__films">{production.films.map(film => <article key={film.imdbTitleId}><h3>{film.title}</h3><ProductionMetadata production={film} /><p className="production-modal__credit">{t(film.personalCredit ? 'PERSONAL WORK CREDIT' : 'SERIES CONTEXT ONLY — NOT A PERSONAL CREDIT')}</p></article>)}</section> : <ProductionMetadata production={production} />}
          <div className="production-modal__work">
            <dl><div><dt>{t("COMPANY / VFX STUDIO")}</dt><dd>{production.company || 'Not confirmed'}</dd></div>{production.period && <div><dt>{t("MY WORK PERIOD")}</dt><dd>{production.period}</dd></div>}<div><dt>{t("MY ROLE")}</dt><dd>{t(production.role.length ? production.role.join(' / ') : 'Not confirmed')}</dd></div></dl>
            {production.creditNote && <p className="production-modal__credit">{t(production.creditNote)}</p>}
            <h3>{t("MY WORK")}</h3><p>{t(production.description)}</p>
            <h3>{t("DISCIPLINES")}</h3>{production.disciplines.length ? <ul>{production.disciplines.map(discipline => <li key={discipline}>{t(discipline)}</li>)}</ul> : <p>{t("Not confirmed")}</p>}
          </div>
        </div>
      </div>
    </div>
  </dialog>, document.body)
}
