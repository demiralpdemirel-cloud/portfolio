import { siteConfig } from '../../data/siteConfig'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'

export default function About() {
  return <section className="about" id="about" aria-labelledby="about-title">
    <AtmosphericBackground src="media/backgrounds/about.webp" className="about__atmosphere" opacity={.14} blur={30} brightness={.38} />
    <div className="about__content">
      <p className="section-index">ABOUT</p>
      <div className="about__copy">
        <h2 id="about-title">{siteConfig.about}</h2>
      </div>
    </div>
  </section>
}
