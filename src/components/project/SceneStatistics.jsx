import { useLanguage } from '../../i18n/LanguageContext'

export default function SceneStatistics({ stats, className = '' }) {
  const { t } = useLanguage()
  if (!stats) return null
  return <section className={`project-modal__stats ${className}`} aria-label={t('SCENE STATISTICS')}>
    <h3 className="section-index">{t('SCENE STATISTICS')}</h3>
    <dl>{Object.entries(stats).map(([label, value]) => <div key={label}><dt>{label.toUpperCase()}</dt><dd>{value.toLocaleString('en-US')}</dd></div>)}</dl>
  </section>
}
