import { assetPath } from '../../utils/assetPath'

export default function AtmosphericBackground({ src, alt = '', opacity = .18, blur = 24, brightness = .28, className = '' }) {
  if (!src) return null
  return <div className={`atmospheric-background ${className}`} style={{ '--atmosphere-opacity': opacity, '--atmosphere-blur': `${blur}px`, '--atmosphere-brightness': brightness }} aria-hidden="true">
    <img src={assetPath(src)} alt={alt} loading="lazy" />
    <span className="atmospheric-background__overlay" />
  </div>
}
