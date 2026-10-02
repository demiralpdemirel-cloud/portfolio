import { useLanguage } from '../../i18n/LanguageContext'
import { useRef } from 'react'
import useReveal from '../../hooks/useReveal'
import { siteConfig } from '../../data/siteConfig'
import { professionalProfile } from '../../data/professionalProfile'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

export default function Contact() {
  const { t } = useLanguage()
  const root = useRef(null)
  useReveal(root)
  const email = siteConfig.email && !/^(hello@example\.com|your@email\.com)$/i.test(siteConfig.email) ? siteConfig.email : null
  const links = [
    email && { label: 'EMAIL', value: email, href: `mailto:${email}` },
    siteConfig.phone && { label: 'PHONE', value: '0532 572 76 87', href: `tel:${siteConfig.phone}` },
    siteConfig.instagram && { label: 'INSTAGRAM', value: siteConfig.instagram.handle, href: siteConfig.instagram.url, external: true },
  ].filter(Boolean)

  return <footer ref={root} className="contact" id="contact" >
    <AtmosphericBackground src="media/backgrounds/contact.webp" className="contact__atmosphere" opacity={.22} blur={34} brightness={.44} />
    <p className="eyebrow">{t("FINAL FRAME")}<br/>{t("CONTACT")}</p>
    <div data-reveal-group className="contact__composition"><h2 className="contact__headline"><span className="motion-mask" data-reveal-mask><span data-reveal>{t("LET’S CREATE")}</span></span><span className="motion-mask" data-reveal-mask><span data-reveal>{t("SOMETHING.")}</span></span></h2>
    <div className="contact__details">
      <p className="contact__name" data-reveal>{siteConfig.name}</p>
      <div className="contact__links">{links.map(link => <a data-reveal key={link.label} href={link.href} aria-label={t(`${t(link.label)}: ${link.value}`)} {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><span className="contact__link-label">{t(link.label)}</span><span className="contact__link-value">{link.value}</span><span className="contact__link-arrow" aria-hidden="true">↗</span></a>)}</div>
      <div className="contact__links contact__professional-links">{professionalProfile.professionalLinks.map(link => <a data-reveal key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={t(`${siteConfig.name} on ${link.name}`)}><span className="contact__link-label">{t(link.label)}</span><span className="contact__link-value">{t(link.subtitle)}</span><span className="contact__link-arrow" aria-hidden="true">↗</span></a>)}</div>
    </div>
    </div>
    <p className="contact__credit">{siteConfig.name.toUpperCase()} / {new Date().getFullYear()}</p>
  </footer>
}
