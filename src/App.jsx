import { useRef, useState } from 'react'
import { useLanguage } from './i18n/LanguageContext'
import LanguageSwitcher from './i18n/LanguageSwitcher'
import ThemeController from './components/ThemeController'
import ScrollToTop from './components/ScrollToTop'
import VideoPlayer from './components/showreel/VideoPlayer'
import BreakdownViewer from './components/showreel/BreakdownViewer'
import ProjectDetail from './components/project/ProjectDetail'
import ProductionDetailModal from './components/experience/ProductionDetailModal'
import ToolStudy from './components/ToolStudy.jsx'
import PerformanceProbe from './components/PerformanceProbe.jsx'
import SteamPlaytime from './components/SteamPlaytime.jsx'
import ProfileBattle from './components/ProfileBattle.jsx'
import CreativeWorlds from './components/CreativeWorlds.jsx'
import JewelCaseCatalog from './components/JewelCaseCatalog.jsx'
import CaseReveal from './components/CaseReveal.jsx'
import ProductionFrame from './components/ProductionFrame.jsx'
import { worldFor, worlds } from './data/worlds.js'
import useScrollWorld from './motion/useScrollWorld.js'
import { catalog, filterPersonalCatalog } from './data/catalog.js'
import { siteConfig } from './data/siteConfig.js'
import { professionalProfile } from './data/professionalProfile.js'
import { showreel } from './data/showreel.js'
import { education } from './data/education.js'
import { capabilities } from './data/capabilities'
import { tools } from './data/tools.js'
import { assetPath } from './utils/assetPath.js'

function SceneHeader({ number, title, subtitle }) {
  const { t } = useLanguage()
  return (
    <header className="scene-heading">
      <p className="scene-number">
        {number} / {t(subtitle)}
      </p>
      <h2>{t(title)}</h2>
    </header>
  )
}
export default function App() {
  const { t } = useLanguage(),
    root = useRef(null),
    returnFocus = useRef(null),
    reelFocus = useRef(null)
  const [category, setCategory] = useState('all'),
    [selected, setSelected] = useState(null),
    [breakdown, setBreakdown] = useState(null),
    [menu, setMenu] = useState(false)
  useScrollWorld(root, category)
  const hoverRects = useRef(new WeakMap())
  const caseReveal = useRef(null)
  const entries = filterPersonalCatalog(category),
    active = catalog.find((entry) => entry.id === selected)
  const projectEntries = (active ? worlds.find(world=>world.id===worldFor(active)).entries : entries).filter((entry) => entry.kind === 'project')
  const open = (event, entry) => {
    returnFocus.current = event.currentTarget
    const box = event.currentTarget.getBoundingClientRect()
    document.documentElement.style.setProperty(
      '--detail-origin',
      `${((box.left + box.width / 2) / innerWidth) * 100}% ${((box.top + box.height / 2) / innerHeight) * 100}%`,
    )
    setSelected(entry.id)
  }
  const tilt = (event) => {
    if (
      !matchMedia('(hover:hover)').matches ||
      matchMedia('(prefers-reduced-motion:reduce)').matches
    )
      return
    let box = hoverRects.current.get(event.currentTarget)
    if (!box) {
      box = event.currentTarget.getBoundingClientRect()
      hoverRects.current.set(event.currentTarget, box)
    }
    event.currentTarget.style.setProperty(
      '--tilt-x',
      `${(-(event.clientY - box.top - box.height / 2) / box.height) * 5}deg`,
    )
    event.currentTarget.style.setProperty(
      '--tilt-y',
      `${((event.clientX - box.left - box.width / 2) / box.width) * 5}deg`,
    )
  }
  const reset = (event) => {
    hoverRects.current.delete(event.currentTarget)
    event.currentTarget.style.removeProperty('--tilt-x')
    event.currentTarget.style.removeProperty('--tilt-y')
  }
  return (
    <>
      <LanguageSwitcher />
      <ThemeController />
      <a className="skip-link" href="#work">
        {t('Skip to selected work')}
      </a>
      <nav className="scroll-nav" aria-label={t('Primary navigation')}>
        <a className="scroll-logo" href="#home">
          D
          <span>
            DEMİRALP
            <br />
            DEMİREL
          </span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
        >
          {t('MENU')}
        </button>
        <div className={menu ? 'is-open' : ''}>
          {[
            ['work', 'WORKS'],
            ['showreel', 'SHOWREEL'],
            ['about', 'ABOUT'],
            ['capabilities', 'CAPABILITIES'],
            ['contact', 'CONTACT'],
          ].map(([id, label]) => (
            <a key={id} href={'#' + id} onClick={() => setMenu(false)}>
              {t(label)}
            </a>
          ))}
        </div>
      </nav>
      <main
        ref={root}
        className={`scroll-world${active || breakdown !== null ? ' has-dialog' : ''}`}
      >
        <section id="home" className="hero scroll-hero camera-scene" data-scene>
          <div className="hero-depth" aria-hidden="true">
            <div className="perspective-floor" />
            <span className="horizon-orbit" />
          </div>
          <div className="hero-lab-art"><ProductionFrame /><a className="hero-lab-inspect" href="#cafe-environment">{t('INSPECT THE PROCESS')} ↗</a></div>
          <div className="hero-identity">
            <p className="scene-number">01 / CINEMATIC PRODUCTION LAB</p>
            <h1 className="scroll-title">
              <span>DEMİRALP</span>
              <span>DEMİREL</span>
            </h1>
            <p className="hero-discipline">{t(siteConfig.title)}</p>
            <a className="editorial-link" href="#work">
              {t('EXPLORE WORKS')} ↗
            </a>
          </div>
          <figure className="hero-portrait">
            <img src={assetPath(siteConfig.profileImage)} alt={siteConfig.name} loading="lazy" decoding="async" width="1000" height="1832" />
            <figcaption>{t('THE ARTIST / DEMİRALP DEMİREL')}</figcaption>
          </figure>
          <div className="hero-process-index" aria-label={t('Production disciplines')}><span>{t('GEOMETRY')}</span><i>→</i><span>{t('LIGHTING')}</span><i>→</i><span>{t('COMPOSITING')}</span><i>→</i><span>{t('FINAL FRAME')}</span></div>
          <div className="hero-bottom">
            <span>{t('DEPTH / MOTION / REAL WORK')}</span>
            <a href="#about">{t('SCROLL TO ENTER')} ↓</a>
          </div>
          <span className="light-rail" />
        </section>
        <section id="about" className="camera-scene about-scene" data-scene>
          <SceneHeader number="02" title="ABOUT THE ARTIST" subtitle="ABOUT" />
          <div className="about-composition">
            <figure className="portrait-depth">
              <img
                src={assetPath(siteConfig.profileImage)}
                alt={siteConfig.name}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{siteConfig.name}</figcaption>
            </figure>
            <div className="about-editorial">
              <p>
                {String(t(siteConfig.about))
                  .split(' ')
                  .map((word, index) => (
                    <span className="about-word" key={index}>
                      {word}{' '}
                    </span>
                  ))}
              </p>
              <a className="editorial-link" href="#profile">
                {t('PROFILE / STATUS')} ↗
              </a>
            </div>
          </div>
          <span className="light-rail" />
        </section>
        <section id="profile" className="camera-scene profile-scene" data-scene>
          <SceneHeader
            number="02 / B"
            title="PROFILE / STATUS"
            subtitle="PROFESSIONAL PROFILE"
          />
          <ProfileBattle>
            <article className="profile-panel">
              <span>{t('CURRENT STUDIO')}</span>
              <a
                href={professionalProfile.currentCompany.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <strong>{professionalProfile.currentCompany.name}</strong> ↗
              </a>
              <p>{t(professionalProfile.currentCompany.period)}</p>
            </article>
            {professionalProfile.professionalLinks.map((link) => (
              <article className="profile-panel" key={link.id}>
                <span>{t(link.subtitle)}</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <strong>{link.name}</strong> ↗
                </a>
              </article>
            ))}
            <article className="profile-panel">
              <span>Instagram</span>
              <a
                href={professionalProfile.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <strong>{professionalProfile.instagram.handle}</strong> ↗
              </a>
            </article>
            <SteamPlaytime />
          </ProfileBattle>
          <span className="light-rail" />
        </section>
        <section id="work" className="camera-scene works-scene" data-scene>
          <JewelCaseCatalog entries={entries} category={category} onCategoryChange={setCategory} onOpen={(event, entry) => {
            const trigger = event.currentTarget
            caseReveal.current.open(trigger, () => open({ currentTarget: trigger }, entry))
          }}/>
        </section>
        <section id="showreel" className="camera-scene cinema-scene" data-scene>
          <SceneHeader
            number="03"
            title="IN MOTION."
            subtitle="SHOWREEL & BREAKDOWNS"
          />
          <div className="cinema-shell">
            <VideoPlayer
              src={showreel.video}
              poster={showreel.poster}
              durationHint={showreel.duration}
              label="Showreel"
              lazy
            />
          </div>
          <div className="breakdown-index">
            {showreel.breakdowns.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={(event) => {
                  reelFocus.current = event.currentTarget
                  setBreakdown(index)
                }}
              >
                <img className="breakdown-thumb" src={assetPath(item.poster)} alt="" width="320" height="180" loading="lazy" decoding="async" />
                <span>
                  {item.number} / {t(item.kind)}
                </span>
                <strong>{t(item.title)}</strong>
                <p>
                  {t(
                    item.production.myRole?.join(' / ') ||
                      'PRODUCTION BREAKDOWN',
                  )}
                </p>
                <b>↗</b>
              </button>
            ))}
          </div>
          <span className="light-rail" />
        </section>
        <CreativeWorlds onOpen={open} tilt={tilt} reset={reset}/>
        <section
          id="capabilities"
          className="camera-scene capabilities-scene"
          data-scene
        >
          <SceneHeader
            number="10"
            title="THE MAKING OF."
            subtitle="CAPABILITIES"
          />
          <div className="discipline-grid">
            {capabilities.map((item) => (
              <article key={item.id} className="discipline-panel">
                <span>{item.id}</span>
                <h3>{t(item.title)}</h3>
                <p>{t(item.description)}</p>
              </article>
            ))}
          </div>
          <h3 className="tools-label">{t('TOOLS / SOFTWARE')}</h3>
          <div className="software-grid">
            {tools.map((tool) => (
              <ToolStudy key={tool.name} tool={tool} />
            ))}
          </div>
          <span className="light-rail" />
        </section>
        <section id="education" className="camera-scene education-scene" data-scene>
          <SceneHeader number="11" title="EDUCATION" subtitle="EDUCATION" />
          <div className="education-composition"><span className="education-line"/><div className="education-copy"><p>{t(education.institutionPeriod)}</p><h3>{t(education.program)}</h3></div></div>
          <span className="light-rail"/>
        </section>
        <section id="final-shot" className="camera-scene final-shot" data-scene aria-labelledby="final-shot-title">
          <header className="final-shot__heading"><p className="scene-number">12 / {t('CINEMATIC FINAL SHOT')}</p><h2 id="final-shot-title">{t('EVERY LAYER.')}<br/><span>{t('ONE FINAL FRAME.')}</span></h2><p>{t('Geometry, light and compositing. One scene, brought together.')}</p></header>
          <ProductionFrame closing />
          <div className="final-shot__disciplines" aria-label={t('Production disciplines')}>{['GEOMETRY','SHADING','LIGHTING','RENDERING','COMPOSITING','VFX','FINAL FRAME'].map((label,index)=><span key={label}><small>0{index+1}</small>{t(label)}</span>)}</div>
          <p className="final-shot__source">{t('Presentation sequence using original SOLID, MIST and FINAL renders. No isolated shading, lighting or VFX passes are claimed.')}</p>
          <a className="final-shot__next" href="#contact">{t('THE NEXT FRAME STARTS WITH A CONVERSATION.')} <span>↓</span></a>
          <span className="light-rail"/>
        </section>
        <section id="contact" className="camera-scene contact-scene" data-scene>
          <div className="contact-depth" aria-hidden="true">
            <img
              src={assetPath('media/projects/cafe-environment/final.webp')}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <p className="scene-number">13 / {t('CONTACT')}</p>
          <h2>
            {['LET’S CREATE', 'SOMETHING.'].map((word) => (
              <span className="contact-word" key={word}>
                {t(word)}
              </span>
            ))}
          </h2>
          <div className="contact-actions">
            <p>{siteConfig.name}</p>
            <a href={'mailto:' + siteConfig.email}>{siteConfig.email} ↗</a>
            <a href={'tel:' + siteConfig.phone}>0532 572 76 87 ↗</a>
          </div>
          <div className="contact-social">
            {professionalProfile.professionalLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name} ↗
              </a>
            ))}
            <a
              href={siteConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram ↗
            </a>
          </div>
          <span className="light-rail" />
        </section>
      </main>
      <footer className="scroll-footer">
        <span>DEMİRALP DEMİREL / CINEMATIC PRODUCTION LAB</span>
        <a href="#home">{t('BACK TO TOP')} ↑</a>
      </footer>
      <CaseReveal ref={caseReveal}/>
      {active?.kind === 'project' && (
        <ProjectDetail
          project={active.detail}
          onClose={() => caseReveal.current.close(() => setSelected(null))}
          returnFocus={returnFocus}
          onNext={() =>
            setSelected(
              projectEntries[
                (projectEntries.findIndex((entry) => entry.id === selected) +
                  1) %
                  projectEntries.length
              ].id,
            )
          }
        />
      )}
      {active?.kind === 'production' && (
        <ProductionDetailModal
          key={active.id}
          production={active.detail}
          onClose={() => caseReveal.current.close(() => setSelected(null))}
          returnFocus={returnFocus}
        />
      )}
      {breakdown !== null && (
        <BreakdownViewer
          items={showreel.breakdowns}
          index={breakdown}
          onNavigate={setBreakdown}
          onClose={() => setBreakdown(null)}
          returnFocusRef={reelFocus}
        />
      )}
      <ScrollToTop />
      <PerformanceProbe />
    </>
  )
}
