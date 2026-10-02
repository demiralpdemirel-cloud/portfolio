import { useLanguage } from '../../i18n/LanguageContext'
import { assetPath } from '../../utils/assetPath'
import MediaPlaceholder from './MediaPlaceholder'
import VideoPlayer from '../showreel/VideoPlayer'

// Featured chapters share the player, retaining their frame and ratio callback.
export default function LazyVideo({ video, title, detail = false, muted = !detail, placeholder = false, onAspectRatio }) {
  const { t } = useLanguage()
  if (!video?.src) {
    if (!placeholder && video?.poster) return <img className="video-poster-fallback" src={assetPath(video.poster)} alt={t(`${title} poster`)} />
    return <MediaPlaceholder label={t('VIDEO ASSET')} path={video?.src || 'Add a video source in projects.js'} variant="media-placeholder--motion" />
  }
  return <VideoPlayer className="lazy-video" src={video.src} poster={video.poster} label={title} autoPlay lazy loop initialMuted={muted} onAspectRatio={onAspectRatio} />
}
