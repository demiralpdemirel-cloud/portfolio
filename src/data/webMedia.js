// Original project data stays canonical; delivery-only proxies live here.
const backgroundSources = [
  'backgrounds/hero.webp', 'backgrounds/about.webp', 'backgrounds/selected-work.webp',
  'backgrounds/contact.webp', 'backgrounds/archive.webp', 'backgrounds/disciplines.webp',
  'projects/evga-rtx-3090/poster.webp', 'projects/keyboard-study/poster.webp',
  'projects/interior-study/living-room.webp', 'projects/mario-arcade/poster.webp',
  'projects/star-wars-vfx/poster.webp', 'showreel/main/showreel-poster.webp',
]
export const atmosphericMedia = Object.fromEntries(backgroundSources.map(source => {
  const name = source.replaceAll('/', '--').replace('.webp', '')
  return [`media/${source}`, { desktop: `media/web/${name}-1280.webp`, mobile: `media/web/${name}-640.webp` }]
}))

const videoNames = ['evga-rtx-3090', 'keyboard', 'mario-arcade', 'star-wars-vfx', 'kurulus-orhan-breakdown', 'teskilat-breakdown', 'turkcell-shaq-breakdown', 'zaferin-rengi-breakdown']
const videoProxies = Object.fromEntries(videoNames.map(name => [`${name}.mp4`, `media/web/${name}-web.mp4`]))
export function webVideoSource(source) {
  if (!source) return source
  // Only known release assets are replaced; unrelated filenames remain untouched.
  if (source.startsWith('https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/')) {
    return videoProxies[source.split('/').pop()] || source
  }
  return source
}
