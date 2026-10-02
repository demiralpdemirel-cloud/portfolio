import { useLanguage } from '../../i18n/LanguageContext'
import { siteConfig } from '../../data/siteConfig'
import { assetPath } from '../../utils/assetPath'
import { pageRegistry } from '../../data/pageRegistry'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

export default function Hero() {
  const { t } = useLanguage()
  return <header className="hero" id="home">
    <AtmosphericBackground src="media/backgrounds/hero.webp" className="hero__atmosphere" opacity={.28} brightness={.52} critical />
    <nav className="primary-nav" aria-label={t("Primary navigation")}><a href={`#${pageRegistry[0].id}`} className="wordmark">{siteConfig.name}</a><div>{pageRegistry.filter(page => page.navLabel).map(page => <a key={page.id} href={`#${page.id}`}>{t(page.navLabel)}</a>)}</div></nav>
    <div className="hero__index">{t("PORTFOLIO / 2026")}<br />{t("FRAME / 000")}</div>
    <img className="hero__portrait" src={assetPath(siteConfig.profileImage)} alt={t(`Portrait of ${siteConfig.name}`)} fetchPriority="high" decoding="async" width="1000" height="1832" />
    <h1 className="hero__name"><span className="hero__name--first">{t("Demiralp")}</span><span className="hero__name--last">{t("Demirel")}</span></h1>
    <p className="hero__role">{siteConfig.title.toUpperCase()}</p><p className="hero__scroll">{t("SCROLL TO ADVANCE")}<span aria-hidden="true">↓</span></p>
  </header>
}
