import { siteConfig } from '../../data/siteConfig'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

export default function Contact() {
  const links = [
    siteConfig.email && { label: 'EMAIL', value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    siteConfig.phone && { label: 'PHONE', value: '0532 572 76 87', href: `tel:${siteConfig.phone}` },
  ].filter(Boolean)

  return <footer className="contact" id="contact">
    <AtmosphericBackground src="media/backgrounds/contact.webp" className="contact__atmosphere" opacity={.22} blur={34} brightness={.44} />
    <p className="eyebrow">FINAL FRAME<br/>CONTACT</p>
    <h2 className="contact__headline">LET’S CREATE<br/>SOMETHING.</h2>
    <div className="contact__details">
      <p className="contact__name">{siteConfig.name}</p>
      <div className="contact__links">{links.map(link => <a key={link.label} href={link.href} aria-label={`${link.label}: ${link.value}`}><span className="contact__link-label">{link.label}</span><span className="contact__link-value">{link.value}</span><span className="contact__link-arrow" aria-hidden="true">↗</span></a>)}</div>
    </div>
    <p className="contact__credit">{siteConfig.name.toUpperCase()} / {new Date().getFullYear()}</p>
  </footer>
}
