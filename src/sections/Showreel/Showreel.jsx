import { useLanguage } from '../../i18n/LanguageContext'
import { useRef, useState } from 'react'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'
import BreakdownViewer from '../../components/showreel/BreakdownViewer'
import VideoPlayer from '../../components/showreel/VideoPlayer'
import { showreel } from '../../data/showreel'
import { assetPath } from '../../utils/assetPath'
import useReveal from '../../hooks/useReveal'

export default function Showreel() {
  const { t } = useLanguage()
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const triggerRef = useRef(null)
  const root = useRef(null)
  useReveal(root)

  const openBreakdown = (event, index) => {
    triggerRef.current = event.currentTarget
    setSelected(index)
  }

  return <section ref={root} id="showreel" className="showreel" aria-labelledby="showreel-title">
    <AtmosphericBackground src={showreel.poster} className="showreel__atmosphere" opacity={.13} blur={38} brightness={.25} />
    <div className="showreel__content">
      <header className="showreel__header" data-reveal-group>
        <div><p className="section-index" data-reveal>{t("VFX / COMPOSITING / CGI")}</p><h2 id="showreel-title" className="motion-mask" data-reveal-mask><span data-reveal>{t("SHOWREEL & BREAKDOWNS")}</span></h2></div>
        <p className="showreel__year">2020 — 2026<br />{t("SELECTED WORK")}</p>
      </header>

      <VideoPlayer lazy src={showreel.video} poster={showreel.poster} durationHint={showreel.duration} label={t("Showreel")} />

      <section className="showreel__breakdowns" aria-labelledby="breakdowns-title">
        <header><h3 id="breakdowns-title">{t("SELECTED BREAKDOWNS")}</h3><span>{String(showreel.breakdowns.length).padStart(2, '0')} / {t('REAL PROCESS FILMS')}</span></header>
        <div className="showreel__breakdown-layout">
          <div className="showreel__rows">
            {showreel.breakdowns.map((item, index) => <button key={item.id} className={`showreel-row${preview?.id === item.id ? ' is-active' : ''}`} type="button" onMouseEnter={() => setPreview(item)} onFocus={() => setPreview(item)} onClick={event => openBreakdown(event, index)}>
              <span className="showreel-row__number">{item.number}</span><span className="showreel-row__title">{t(item.title)}<small>{t(item.kind)} · {item.production.release?.slice(0, 4)}</small></span><span className="showreel-row__detail">{t('VFX STUDIO')} · {item.production.vfxStudio}<small>{t(item.production.myRole?.join(' / ') || '')}</small></span><span className="showreel-row__duration">{Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}</span><span className="showreel-row__open" aria-hidden="true">↗</span>
            </button>)}
          </div>
          <aside className={`showreel__preview${preview ? ' is-visible' : ''}`} aria-hidden="true">
            {preview && <img key={preview.id} src={assetPath(preview.poster)} alt="" loading="lazy" />}
            <span>{t(preview?.title || 'SELECT BREAKDOWN')}</span>
          </aside>
        </div>
      </section>
    </div>
    {selected !== null && <BreakdownViewer items={showreel.breakdowns} index={selected} onNavigate={setSelected} onClose={() => setSelected(null)} returnFocusRef={triggerRef} />}
  </section>
}
