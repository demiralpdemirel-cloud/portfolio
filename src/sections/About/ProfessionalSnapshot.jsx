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
    const headerRule = element.querySelector('[data-header-rule]')
    const hours = professionalProfile.softwareHours[0]
    const hoursValue = element.querySelector('[data-hours-value]')
    const stats = [...element.querySelectorAll('.professional-stat')]
    // Read geometry only on resize, never in an animation frame. The reserved
    // marker column remains unchanged while the final dot aligns to its label.
    const alignDots = () => stats.forEach(stat => {
      const marker = stat.querySelector('.status-marker')
      const label = stat.querySelector('.professional-stat__label')
      const box = marker.getBoundingClientRect(), text = label.getBoundingClientRect()
      const revealY = Number(gsap.getProperty(label, 'y')) || 0
      marker.style.setProperty('--status-dot-y', `${text.top - revealY + text.height / 2 - box.top - box.height / 2}px`)
    })
    alignDots()
    const resize = new ResizeObserver(alignDots)
    stats.forEach(stat => {
      resize.observe(stat)
      resize.observe(stat.querySelector('.professional-stat__body'))
    })
    const context = gsap.context(() => {
      const match = gsap.matchMedia()
      match.add({ all: '(min-width: 0px)', reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
        if (conditions.reduced || !('IntersectionObserver' in window)) return
        const pending = stats.filter(stat => stat.dataset.statusComplete !== 'true' && stat.getBoundingClientRect().bottom > 0)
        pending.forEach(stat => {
          gsap.set(stat.querySelector('.status-ring'), { x: 0, y: 0, scale: 1, rotation: -90, opacity: 0 })
          gsap.set(stat.querySelectorAll('.status-ring__track, .status-ring__progress'), { opacity: 1 })
          gsap.set(stat.querySelector('[data-status-ring]'), { strokeDashoffset: 88 })
          gsap.set(stat.querySelector('.status-ring__dot'), { opacity: 0 })
          gsap.set(stat.querySelectorAll('[data-reveal-part]'), { autoAlpha: 0, y: 8 })
        })
        let headerRevealed = false
        const animations = []
        const observer = new IntersectionObserver(entries => {
          const visible = entries.filter(entry => entry.isIntersecting).map(entry => entry.target)
          visible.sort((a, b) => stats.indexOf(a) - stats.indexOf(b))
          visible.forEach((stat, index) => {
            observer.unobserve(stat)
            const animation = gsap.context(() => {
              const ring = stat.querySelector('.status-ring')
              const arc = stat.querySelector('[data-status-ring]')
              const parts = stat.querySelectorAll('[data-reveal-part]')
              const timeline = gsap.timeline({ delay: index * .08, onComplete: () => {
                stat.dataset.statusComplete = 'true'
                gsap.set([ring, ...parts], { clearProps: 'transform,opacity,visibility' })
                gsap.set(stat.querySelectorAll('circle'), { clearProps: 'opacity,strokeDashoffset' })
              } })
              if (!headerRevealed) {
                timeline.fromTo(headerRule, { scaleX: 0 }, { scaleX: 1, duration: .38, ease: 'power2.out' }, 0)
                headerRevealed = true
              }
              timeline.to(ring, { opacity: 1, duration: .1 }, 0)
                .to(arc, { strokeDashoffset: 0, duration: .65, ease: 'power2.inOut' }, 0)
                .to(ring, { rotation: 0, duration: .65, ease: 'power2.out' }, 0)
                .to(parts, { autoAlpha: 1, y: 0, duration: .4, stagger: .1, ease: 'power3.out' }, .1)
                .to(stat.querySelectorAll('.status-ring__track, .status-ring__progress'), { opacity: 0, duration: .16 }, .68)
                .to(stat.querySelector('.status-ring__dot'), { opacity: 1, duration: .16 }, .68)
                .to(ring, { scale: () => ring.clientWidth < 48 ? .19 : .2,
                  x: () => ring.clientWidth < 48 ? 18 : 20,
                  y: () => Number.parseFloat(stat.querySelector('.status-marker').style.getPropertyValue('--status-dot-y')),
                  duration: .28, ease: 'power3.inOut' }, .7)
              const counterNode = stat.querySelector('[data-hours-value]')
              if (counterNode && hours) {
                const counter = { value: 0 }
                timeline.to(counter, { value: hours.hours, duration: .55, ease: 'power2.out',
                  onUpdate: () => { counterNode.textContent = numberFormat.format(counter.value) },
                }, .2)
              }
            }, stat)
            animations.push(animation)
          })
        }, { threshold: .12, rootMargin: '0px 0px -5% 0px' })
        pending.forEach(stat => observer.observe(stat))
        return () => {
          observer.disconnect()
          animations.forEach(animation => animation.revert())
          if (hoursValue && hours) hoursValue.textContent = numberFormat.format(hours.hours)
        }
      })
    }, element)
    return () => {
      resize.disconnect()
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
