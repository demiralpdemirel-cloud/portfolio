import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { assetPath } from '../utils/assetPath.js'
import { cafeFrames } from './ProductionFrame.jsx'
import { showreel } from '../data/showreel.js'
import VideoPlayer from './showreel/VideoPlayer.jsx'

export function CafeProcess({ className = '' }) {
  const { t } = useLanguage()
  const [mode, setMode] = useState('compare')
  const root = useRef(null), value = useRef(null)
  const position = useRef(50)
  // The native thumb is on the image, not in a separate control below it.
  // Browser-owned dragging handles pointer capture, touch, cancel and keyboard.
  const compare = event => {
    const percent = Number(event.currentTarget.value)
    position.current = percent
    root.current.style.setProperty('--comparison', `${percent}%`)
    if (value.current) value.current.textContent = `${percent}%`
  }
  return <div ref={root} className={`process-lab cafe-process ${className}`} data-mode={mode} style={{ '--comparison': '50%' }}>
    <div className="process-lab__top"><span>CAFE / 01</span><span>{t('GEOMETRY TO REALITY')}</span></div>
    <div className="process-compare">
      <img className="process-solid" src={assetPath(cafeFrames.solid)} alt={t('Solid render showing the geometry and layout of the cafe environment.')} width="1920" height="1080" loading="lazy" decoding="async" />
      <img className="process-final" src={assetPath(cafeFrames.final)} alt={t('Cafe environment — final artist render')} width="1920" height="1080" loading="lazy" decoding="async" />
      {mode === 'mist' && <img className="process-mist" src={assetPath(cafeFrames.mist)} alt={t('Mist render pass showing scene depth and atmospheric separation.')} width="1920" height="1080" loading="lazy" decoding="async" />}
      <div className="comparison-line" aria-hidden="true"><span>↔</span></div>
      {mode==='compare' && <><input className="comparison-drag" type="range" min="0" max="100" defaultValue={position.current} aria-label={t('Compare solid and final render')} onInput={compare} /><span className="comparison-handle" aria-hidden="true"><span>↔</span></span></>}
      <div className="comparison-labels" aria-hidden="true"><span>{mode === 'mist' ? 'MIST' : 'FINAL'}</span><span>SOLID</span></div>
    </div>
    <div className="process-controls" role="group" aria-label={t('Cafe process modes')}>
      {[['compare','COMPARE'],['solid','SOLID'],['mist','MIST'],['final','FINAL']].map(([id,label]) => <button type="button" key={id} aria-pressed={mode===id} onClick={() => setMode(id)}>{t(label)}</button>)}
    </div>
    <div className="comparison-control" hidden={mode!=='compare'}><span>{t('SOLID → FINAL')} <output ref={value}>{position.current}%</output></span></div>
    <p className="process-note">{t(mode==='mist' ? 'Actual depth pass. Brightness represents distance; this is not a lighting pass.' : 'Same camera. Real SOLID and FINAL renders. Material and lighting are combined in the final image.')}</p>
  </div>
}

export function TopologyStudy({ project }) {
  const { t } = useLanguage()
  const [wire, setWire] = useState(true)
  return <div className="process-lab topology-study">
    <div className="process-lab__top"><span>SOFA / 02</span><span>{t('FORM / SURFACE')}</span></div>
    <div className="topology-study__views">
      <figure><img src={assetPath(project.media[wire ? 4 : 3])} alt={t(project.mediaViews[wire ? 4 : 3].alt)} width="2560" height="1440" loading="lazy" decoding="async" /><figcaption>{t(wire ? 'WIREFRAME' : 'THREE-QUARTER VIEW')}</figcaption></figure>
      <figure><img src={assetPath(project.media[2])} alt={t(project.mediaViews[2].alt)} width="2560" height="1440" loading="lazy" decoding="async" /><figcaption>{t('DETAIL CLOSE-UP')}</figcaption></figure>
    </div>
    <div className="process-controls" role="group" aria-label={t('Topology study views')}><button type="button" aria-pressed={wire} onClick={()=>setWire(true)}>{t('WIREFRAME')}</button><button type="button" aria-pressed={!wire} onClick={()=>setWire(false)}>{t('FINAL MATERIAL')}</button></div>
    <p className="process-note">{t('Actual model views, different cameras. No registered overlay or synthetic morph.')}</p>
  </div>
}

export function ArchitectureStudy({ project, onOpen }) {
  const { t } = useLanguage()
  const [view, setView] = useState(0)
  const views = [{ index:0, label:'BUILDING / OVERVIEW' }, { index:1, label:'FACADE / DETAIL' }, { index:3, label:'SITE / CONTEXT' }]
  return <div className="process-lab architecture-study">
    <div className="process-lab__top"><span>BEYLİKDÜZÜ / 03</span><span>{t('ARCHITECTURAL VIEWS')}</span></div>
    <button className="architecture-study__image" type="button" onClick={() => onOpen(views[view].index)} aria-label={t(`Open ${project.title} — view ${views[view].index + 1} fullscreen`)}>
      <img src={assetPath(project.media[views[view].index])} alt={t(project.mediaViews?.[views[view].index]?.alt || project.title)} width="1920" height="1080" loading="lazy" decoding="async" />
    </button>
    <div className="process-controls" role="group" aria-label={t('Architectural views')}>{views.map((item,index)=><button type="button" key={item.index} aria-pressed={view===index} onClick={()=>setView(index)}>{t(item.label)}</button>)}</div>
    <p className="process-note">{t('Original artist renders — view study, not construction-stage passes.')}</p>
  </div>
}

export function VfxLab() {
  const { t } = useLanguage()
  const [selected, setSelected] = useState(null)
  const clips = showreel.breakdowns.filter(item => item.id !== 'kurulus-orhan')
  return <div className="vfx-lab process-lab" aria-labelledby="vfx-lab-title">
    <div className="vfx-lab__intro"><p className="scene-number">{t('BEHIND THE SHOT')}</p><h3 id="vfx-lab-title">{t('THE BREAKDOWN LAB.')}</h3><p>{t('Explore the existing artist breakdown films. Source plates and isolated mattes are not supplied as separate passes.')}</p></div>
    <div className="vfx-lab__screen">
      {selected ? <VideoPlayer key={selected.id} src={selected.src} poster={selected.poster} durationHint={selected.duration} label={t(selected.title)+' — '+t('BREAKDOWN')} lazy /> : <div className="vfx-lab__poster"><img src={assetPath(clips[0].poster)} alt={t(clips[0].title)} width="1920" height="1080" loading="lazy" decoding="async" /><span>{t('SELECT A BREAKDOWN BELOW')} ↓</span></div>}
    </div>
    <div className="vfx-lab__shots" role="group" aria-label={t('Shot breakdown selection')}>{clips.map((clip,index)=><button key={clip.id} type="button" aria-pressed={selected?.id===clip.id} onClick={()=>setSelected(clip)}><img src={assetPath(clip.poster)} alt="" width="160" height="90" loading="lazy" decoding="async" /><span><small>0{index+1} / {t('BREAKDOWN')}</small><strong>{t(clip.title)}</strong><em>{t(clip.production.myRole?.join(' / ') || 'PRODUCTION BREAKDOWN')}</em></span><b>↗</b></button>)}</div>
    <p className="process-note">{t('Clip selection, not showreel timecode chapters. Only the selected player is mounted.')}</p>
  </div>
}
