import { assetPath } from '../../utils/assetPath'
import { atmosphericMedia } from '../../data/webMedia'

export default function AtmosphericBackground({ src, alt = '', opacity = .18, brightness = .28, className = '', critical = false }) {
  if (!src) return null
  const optimized = atmosphericMedia[src]
  return <div className={`atmospheric-background ${className}`} style={{ '--atmosphere-opacity': opacity * brightness }} aria-hidden="true">
    <picture>{optimized && <source media="(max-width: 900px)" srcSet={assetPath(optimized.mobile)} />}<img src={assetPath(optimized?.desktop || src)} alt={alt} loading={critical ? 'eager' : 'lazy'} decoding="async" width="1280" height="720" /></picture>
    <span className="atmospheric-background__overlay" />
  </div>
}
