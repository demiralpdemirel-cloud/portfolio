import { useRef } from 'react'
import useReveal from '../../hooks/useReveal'
import { siteConfig } from '../../data/siteConfig'
import AtmosphericBackground from '../../components/media/AtmosphericBackground'
import ProfessionalSnapshot from './ProfessionalSnapshot'

export default function About() {
  const root = useRef(null)
  useReveal(root)
  return <section ref={root} className="about" id="about" aria-labelledby="about-title">
    <AtmosphericBackground src="media/backgrounds/about.webp" className="about__atmosphere" opacity={.07} blur={34} brightness={.24} />
    <div className="about__content" data-reveal-group>
      <p className="section-index" data-reveal>ABOUT</p>
      <div className="about__copy">
        <h2 id="about-title" className="motion-mask" data-reveal-mask><span data-reveal>{siteConfig.about}</span></h2>
      </div>
      <ProfessionalSnapshot />
    </div>
  </section>
}
