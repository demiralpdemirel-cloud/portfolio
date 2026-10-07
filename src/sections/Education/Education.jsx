import { useRef } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { education } from '../../data/education'
import useReveal from '../../hooks/useReveal'

export default function Education() {
  const root = useRef(null)
  const { t } = useLanguage()
  useReveal(root)
  return <section ref={root} id="education" className="education" aria-labelledby="education-title">
    <div className="experience__education" data-reveal-group>
      <h2 id="education-title" className="section-index" data-reveal>{t('EDUCATION')}</h2>
      <strong data-reveal>{t(education.program)}</strong>
      <em data-reveal>{t(education.institutionPeriod)}</em>
    </div>
  </section>
}
