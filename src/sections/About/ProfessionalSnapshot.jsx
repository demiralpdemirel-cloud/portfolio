import { useLanguage } from '../../i18n/LanguageContext'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { professionalProfile } from '../../data/professionalProfile'
import StatusRing from '../../components/profile/StatusRing'

const numberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export default function ProfessionalSnapshot() {
  const { t } = useLanguage()
  const root = useRef(null)

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return undefined
    const rings = element.querySelectorAll('[data-status-ring]')
    const revealParts = element.querySelectorAll('[data-reveal-part]')
    const headerRule = element.querySelector('[data-header-rule]')
    const hours = professionalProfile.softwareHours[0]
    const hoursValue = element.querySelector('[data-hours-value]')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || !('IntersectionObserver' in window)) return undefined

    const context = gsap.context(() => {}, element)
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()

      context.add(() => { try {
        gsap.set(rings, { strokeDashoffset: 100 })
        gsap.set(headerRule, { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(revealParts, { autoAlpha: 0, y: 8 })

        const counter = { value: 0 }
        const timeline = gsap.timeline()
          .to(headerRule, { scaleX: 1, duration: .38, ease: 'power2.out' })

        const stats = [...element.querySelectorAll('.professional-stat')]
        stats.forEach((stat, index) => {
          const ring = stat.querySelector('[data-status-ring]')
          const parts = stat.querySelectorAll('[data-reveal-part]')
          if (ring) timeline.to(ring, { strokeDashoffset: 0, duration: .38, ease: 'power2.out' }, index === 0 ? '>-0.04' : '>-0.05')
          timeline.to(parts, { autoAlpha: 1, y: 0, duration: .28, stagger: .08, ease: 'power2.out' }, ring ? '<0.08' : '>-0.05')

          const counterNode = stat.querySelector('[data-hours-value]')
          if (counterNode && hours) {
            timeline.call(() => { counterNode.textContent = '0.0' })
            timeline.to(counter, {
              value: hours.hours,
              duration: 1.15,
              ease: 'power2.out',
              onUpdate: () => { counterNode.textContent = numberFormat.format(counter.value) },
            }, '<')
          }
        })
      } catch {
        gsap.set([...rings, headerRule, ...revealParts].filter(Boolean), { clearProps: 'all' })
        if (hoursValue && hours) hoursValue.textContent = numberFormat.format(hours.hours)
      } })
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' })

    observer.observe(element)
    return () => {
      observer.disconnect()
      context.revert()
      if (hoursValue && hours) hoursValue.textContent = numberFormat.format(hours.hours)
    }
  }, [])

  const { currentCompany, instagram, softwareHours, professionalLinks } = professionalProfile
  const profileCount = String(2 + softwareHours.length + professionalLinks.length).padStart(2, '0')
  return <section ref={root} className="professional-snapshot" aria-labelledby="professional-snapshot-title">
    <header className="professional-snapshot__header">
      <p className="section-index" id="professional-snapshot-title">{t("PROFILE / STATUS")}</p>
      <span>{profileCount} / {profileCount}</span>
      <i className="professional-snapshot__rule" data-header-rule aria-hidden="true" />
    </header>
    <div className="professional-snapshot__grid">
      <article className="professional-stat" aria-label={t(`Current studio: ${currentCompany.name}, ${t(currentCompany.period)}`)}>
        <StatusRing />
        <div className="professional-stat__body">
          <span className="professional-stat__label" data-reveal-part>{t("CURRENT STUDIO")}{' '}<span className="professional-stat__current">{t("· CURRENT")}</span></span>
          <a className="professional-stat__value" href={currentCompany.url} target="_blank" rel="noopener noreferrer" aria-label={t(`${currentCompany.name} — official website`)} data-reveal-part>{currentCompany.name}<span className="professional-stat__arrow" aria-hidden="true">↗</span></a>
          <span className="professional-stat__meta" data-reveal-part>{t(currentCompany.period)}</span>
        </div>
      </article>

      <article className="professional-stat" aria-label={t(`Instagram — ${instagram.handle}`)}>
        <StatusRing />
        <div className="professional-stat__body">
          <span className="professional-stat__label" data-reveal-part>{t("INSTAGRAM")}</span>
          <a className="professional-stat__value" href={instagram.url} target="_blank" rel="noopener noreferrer" aria-label={t(`Instagram — ${instagram.handle}`)} data-reveal-part>{instagram.handle}<span className="professional-stat__arrow" aria-hidden="true">↗</span></a>
          <span className="professional-stat__meta" data-reveal-part>{t("OPEN PROFILE")}</span>
        </div>
      </article>

      {softwareHours.map(software => <article className="professional-stat professional-stat--hours" key={software.id} aria-label={t(`${software.name}, ${numberFormat.format(software.hours)} minimum tracked hours, source ${software.source}`)}>
        <StatusRing />
        <div className="professional-stat__body">
          <span className="professional-stat__label" data-reveal-part>{software.name.toUpperCase()}</span>
          <p className="professional-stat__value professional-stat__value--hours" data-reveal-part><span data-hours-value aria-hidden="true">{numberFormat.format(software.hours)}</span><span aria-hidden="true">{t("+ H")}</span></p>
          <span className="professional-stat__meta" data-reveal-part>{t(software.qualifier.toUpperCase())} / {software.source.toUpperCase()}</span>
        </div>
      </article>)}
      {professionalLinks.map(link => <article className="professional-stat professional-stat--profile" key={link.id}>
        <StatusRing />
        <div className="professional-stat__body">
          <span className="professional-stat__label" data-reveal-part>{t(link.label)}</span>
          <a className="professional-stat__value" href={link.url} target="_blank" rel="noopener noreferrer" aria-label={t(`Demiralp Demirel on ${link.name}`)} data-reveal-part>{t(link.subtitle)}<span className="professional-stat__arrow" aria-hidden="true">↗</span></a>
          <span className="professional-stat__meta" data-reveal-part>{t("OPEN PROFILE")}</span>
        </div>
      </article>)}
    </div>
  </section>
}
