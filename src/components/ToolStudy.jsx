import { useLanguage } from '../i18n/LanguageContext'
import { useRef, useState } from 'react'
import { assetPath } from '../utils/assetPath.js'
import { softwareIdentity } from '../data/softwareIdentity.js'
import useSoftwareMotion from '../motion/useSoftwareMotion.js'
import './software.css'

function Burst({ side }) {
  return <span className={`micro-burst micro-burst--${side}`}><span className="burst-ring" />{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ '--ray': `${i * 60}deg` }} />)}</span>
}

function ToolGeometry({ id }) {
  switch (id) {
    case 'blender': return <><span className="viewport-orbit" /><span className="cube-orbit"><span className="default-cube">{['front', 'back', 'right', 'left', 'top', 'bottom'].map(face => <i key={face} className={`cube-${face}`} />)}</span></span><span className="viewport-axes">X <i /> Y</span></>
    case 'after-effects': return <><Burst side="left" /><Burst side="right" /><span className="impact-line" /></>
    case 'premiere': return <span className="micro-timeline"><i className="timeline-ruler" /><i className="clip-left" /><i className="clip-right" /><i className="audio-strip" /><i className="edit-playhead" /><i className="edit-cut" /></span>
    case 'photoshop': return <><span className="image-layer layer-back" /><span className="image-layer layer-front" /><svg className="crop-selection" viewBox="0 0 160 120"><path d="M25 40V18H48 M112 18H135V40 M135 80V102H112 M48 102H25V80" /><rect x="25" y="18" width="110" height="84" strokeDasharray="2 5" /></svg></>
    case 'illustrator': return <svg className="bezier-study" viewBox="0 0 200 140"><path className="bezier-handles" d="M26 105 45 25 M174 105 155 25" /><path className="bezier-curve" d="M26 105C45 0 155 0 174 105" pathLength="1" />{[[26,105],[45,25],[155,25],[174,105]].map(([x,y]) => <rect className="vector-node" key={x} x={x-3} y={y-3} width="6" height="6" />)}</svg>
    case 'octane': return <><span className="spectral-ring ring-a" /><span className="spectral-ring ring-b" /><span className="render-sweep" /><span className="sample-points">{Array.from({length:8},(_,i)=><i key={i} style={{'--sample':i}} />)}</span></>
    case 'cinema': return <span className="mograph-array">{Array.from({length:6},(_,i)=><i key={i} />)}</span>
    case 'corona': return <><span className="arch-portal portal-back" /><span className="arch-portal portal-front" /><span className="daylight-patch" /><span className="light-aperture" /></>
    case 'mocha': return <><span className="planar-grid" /><svg className="planar-track" viewBox="0 0 180 120"><path d="M25 38V20H43 M137 20H155V38 M155 82V100H137 M43 100H25V82" />{[[25,20],[155,20],[155,100],[25,100]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="3" />)}</svg><span className="track-crosshair" /></>
    case 'silhouette': return <svg className="roto-study" viewBox="0 0 180 140"><path className="roto-outline" pathLength="1" d="M52 124C41 102 49 86 60 74C44 54 61 17 89 15C118 12 133 40 123 64L136 80L121 85C122 107 109 111 107 126Z" />{[[52,124],[60,74],[89,15],[123,64],[121,85],[107,126]].map(([x,y])=><circle className="roto-node" key={y} cx={x} cy={y} r="2.5" />)}<path className="roto-pen" d="m120 98 9-20 5 5-14 15 2-7" /></svg>
    case 'topaz': return <><span className="restoration-grid" /><span className="recovered-detail" /><span className="recovery-scan" /></>
    default: return null
  }
}

export default function ToolStudy({ tool }) {
  const { t } = useLanguage()
  const identity = softwareIdentity[tool.name]
  const root = useRef(null)
  const [pinned, setPinned] = useState(false)
  const interaction = useSoftwareMotion(root, identity.id)
  return <article ref={root} className={`software-card software-card--${identity.id}`} data-visible="false" style={{ '--software-accent': identity.accent }}>
    <button type="button" className="software-trigger" aria-label={tool.name} aria-describedby={`software-usage-${identity.id}`} aria-pressed={pinned}
      onPointerEnter={interaction.enter} onPointerLeave={interaction.leave}
      onFocus={interaction.focus} onBlur={() => { setPinned(false); interaction.blur() }}
      onClick={() => setPinned(interaction.toggle())}>
      <span className="software-card__header"><span>{tool.category}</span><span className="software-action" aria-hidden="true">↗</span></span>
      <span className="software-stage" aria-hidden="true">
        <span className="software-floor" />
        <span className="software-geometry"><ToolGeometry id={identity.id} /></span>
        <span className={`software-logo${identity.wide ? ' software-logo--wide' : ''}`}><img src={assetPath(`media/tools/logos/${identity.logo}`)} alt="" loading="lazy" decoding="async" width="96" height="96" /></span>
      </span>
      <span className="software-name">{tool.name}</span>
      <span id={`software-usage-${identity.id}`} className="software-usage">{tool.tags.map(tag => t(tag)).join(' / ')}</span>
      <span className="software-cue">{t(identity.cue)}</span>
      <span className="software-footnote">{t('Illustrative workflow')}</span>
    </button>
  </article>
}
