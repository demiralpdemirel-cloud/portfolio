import { siteConfig } from '../../data/siteConfig'
import { assetPath } from '../../utils/assetPath'
import { pageRegistry } from '../../data/pageRegistry'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

export default function Hero() {
  return <header className="hero" id="home">
    <AtmosphericBackground src="media/backgrounds/hero.webp" className="hero__atmosphere" opacity={.28} brightness={.52} critical />
    <nav aria-label="Primary navigation"><a href={`#${pageRegistry[0].id}`} className="wordmark">{siteConfig.name}</a><div>{pageRegistry.filter(page => page.navLabel).map(page => <a key={page.id} href={`#${page.id}`}>{page.navLabel}</a>)}</div></nav>
    <div className="hero__index">PORTFOLIO / 2026<br />FRAME / 000</div>
    <img className="hero__portrait" src={assetPath(siteConfig.profileImage)} alt={`Portrait of ${siteConfig.name}`} fetchPriority="high" decoding="async" width="1000" height="1832" />
    <h1 className="hero__name"><span className="hero__name--first">Demiralp</span><span className="hero__name--last">Demirel</span></h1>
    <p className="hero__role">{siteConfig.title.toUpperCase()}</p><p className="hero__scroll">SCROLL TO ADVANCE <span aria-hidden="true">↓</span></p>
  </header>
}
