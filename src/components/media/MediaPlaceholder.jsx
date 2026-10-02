import { assetPath } from '../../utils/assetPath'

export default function MediaPlaceholder({ label, path, variant = '', placeholder = true }) {
  if (!placeholder) return <img className={`project-image ${variant}`} src={assetPath(path)} alt={label} loading="lazy" decoding="async" />
  return <div className={`media-placeholder ${variant}`} role="img" aria-label={`${label} placeholder. Replace ${path}.`}><span className="media-placeholder__axis media-placeholder__axis--x" aria-hidden="true"/><span className="media-placeholder__axis media-placeholder__axis--y" aria-hidden="true"/><span className="media-placeholder__mark" aria-hidden="true">+</span><div className="media-placeholder__label"><strong>{label}</strong><small>{path}</small></div></div>
}
