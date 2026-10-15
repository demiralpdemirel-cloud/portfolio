import { useState } from 'react'
import { worlds } from '../data/worlds.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { assetPath } from '../utils/assetPath.js'
import { CafeProcess, TopologyStudy, ArchitectureStudy, VfxLab } from './ProcessLab.jsx'

function Stage({ entry, world, onOpen, tilt, reset }) {
  const { t } = useLanguage()
  const [pass, setPass] = useState(0)
  const stages = entry.detail.breakdownStages || []
  const current = stages[pass]
  const image = current?.media || entry.image
  const topology = entry.id === 'sofa-modeling' ? entry.detail.media[4] : null
  return <article id={entry.id} className={`world-entry ${world}-entry`} data-work={entry.id}>
    <div className="world-entry-media">
      {world === 'compositing' && <div className="layer-stack" aria-hidden="true"><i/><i/><i/><span className="tracking-marker">+</span><span className="tracking-marker">+</span></div>}
      {entry.id === 'cafe-environment' ? <CafeProcess className="world-art" /> : <>
      <button className="world-art" type="button" onPointerMove={tilt} onPointerLeave={reset} onBlur={reset} onClick={event => onOpen(event, entry)} aria-haspopup="dialog" aria-label={t('OPEN PROJECT') + ' — ' + t(entry.title)}>
        {image ? <img src={assetPath(image)} alt={t(current?.alt || entry.title)} loading="lazy" decoding="async" width="1920" height="1080" style={{objectPosition:entry.objectPosition}}/> : <span className="world-type-art">{t(entry.title)}</span>}
        <span className="world-art-action">{t(entry.detail.video ? 'PLAY / DETAILS' : 'IMAGES / DETAILS')} ↗</span>
      </button>
      </>}
      {stages.length > 0 && entry.id !== 'cafe-environment' && <div className="world-passes" role="group" aria-label={t('Breakdown stages')}>{stages.map((stage,index)=><button key={stage.label} type="button" aria-pressed={index===pass} onClick={()=>setPass(index)}>{stage.label}</button>)}</div>}
      {world === 'compositing' && <p className="graphic-disclaimer">{t('Illustrative layer structure — not a project breakdown.')}</p>}
      {topology && <TopologyStudy project={entry.detail} />}
      {entry.id === 'beylikduzu-kultur-merkezi' && <ArchitectureStudy project={entry.detail} />}
      {world === 'modeling' && entry.detail.breakdownVideo && <p className="graphic-disclaimer">{t('ARTIST-MADE BREAKDOWN IN DETAILS')}</p>}
    </div>
    <div className="world-entry-copy">
      <p className="world-coordinate">{entry.number}{entry.year ? ' / '+t(entry.year) : ''} · {t(entry.detail.type || entry.discipline)}</p>
      <h3>{t(entry.title)}</h3>
      <p className="world-role">{t(entry.discipline)}</p>
      {world !== 'production' && <p className="world-description">{t(entry.detail.productionDescription || entry.detail.myWork || entry.detail.description || '')}</p>}
      <button className="editorial-link" type="button" onClick={event=>onOpen(event,entry)} aria-haspopup="dialog">{t('VIEW PROJECT')} ↗</button>
    </div>
  </article>
}

function WorldGeometry({ id }) {
  return <div className={`world-geometry geometry-${id}`} aria-hidden="true">
    <div className="world-grid"/>
    {id==='compositing' && <svg className="node-lines" viewBox="0 0 1200 500"><path d="M0 100H270V240H600V370H920V190H1200 M0 420H400V240H600"/><g><rect x="260" y="75" width="150" height="70"/><rect x="550" y="205" width="190" height="70"/><rect x="850" y="330" width="160" height="70"/></g></svg>}
    {id==='product' && <><span className="studio-light"/><span className="studio-plinth"/><span className="studio-light secondary-light"/></>}
    {id==='modeling' && <><span className="viewport-axis axis-x">X</span><span className="viewport-axis axis-y">Y</span><span className="viewport-axis axis-z">Z</span></>}
    {id==='production' && <><span className="projector-beam"/><div className="film-perforations"/></>}
  </div>
}

export default function CreativeWorlds({ onOpen, tilt, reset }) {
  const {t}=useLanguage()
  return worlds.map((world,index)=><section id={world.id} key={world.id} className={`camera-scene creative-world world-${world.id}`} data-scene data-world={world.id}>
    <div className="world-seam" aria-hidden="true"><span/><span/><span/><span/><span/></div>
    <WorldGeometry id={world.id}/>
    <header className="world-heading"><p className="scene-number">{world.number} / {t(world.label)}</p><h2>{t(world.title)}</h2><p className="world-cue">{t(world.cue)}</p></header>
    {world.id==='compositing' && <VfxLab />}
    <div className="world-stage-list">{world.entries.map(entry=><Stage key={entry.id} entry={entry} world={world.id} {...{onOpen,tilt,reset}}/>)}</div>
    <div className="world-exit"><span>{t('NEXT WORLD')}</span><a href={'#'+(worlds[index+1]?.id || 'capabilities')}>{t(worlds[index+1]?.label || 'CAPABILITIES')} ↗</a></div>
    <span className="light-rail"/>
  </section>)
}
