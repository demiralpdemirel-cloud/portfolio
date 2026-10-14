import { memo } from 'react'
import { assetPath } from '../utils/assetPath.js'

// Independent physical planes: a hinged lid, rear shell and removable insert.
export default memo(function JewelCase({ entry, title }) {
  return <span className="jewel-face" aria-hidden="true">
    <span className="case-back case-material"/>
    <span className="case-bottom case-material"/>
    <span className="case-side case-material"/>
    <span className="case-tray case-material"><span className="case-hub"/></span>
    <span className="case-insert case-art">
      <img src={assetPath(entry.thumbnail)} srcSet={`${assetPath(entry.thumbnail)} 480w, ${assetPath(entry.thumbnailLarge)} 960w`} sizes="300px" loading="lazy" decoding="async" alt="" style={{ objectPosition: entry.objectPosition }}/>
      <span className="case-insert__label"><small>{entry.number} / DIGITAL EDITION</small><strong>{title}</strong></span>
    </span>
    <span className="case-lid case-material"><span className="case-gloss"/><span className="case-latches"/></span>
    <span className="case-spine case-material"><i/><b>{entry.number}</b><strong>{title}</strong><i/></span>
    <svg className="case-outline" viewBox="0 0 300 280" preserveAspectRatio="none"><path pathLength="1" d="M18 2H298V278H2V2H18V278M8 20H14M8 260H14"/></svg>
  </span>
})
