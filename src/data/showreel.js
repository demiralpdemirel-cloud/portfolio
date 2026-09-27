import { productions } from './productions'

export const showreel = {
  video: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/showreel-v7.mp4',
  poster: 'media/showreel/main/showreel-poster.webp',
  duration: 420.053,
  breakdowns: [
    {
      id: 'kurulus-orhan', number: '01', title: productions['kurulus-orhan'].title,
      kind: productions['kurulus-orhan'].type, duration: 69.16,
      src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/kurulus-orhan-breakdown.mp4',
      poster: 'media/showreel/breakdowns/kurulus-orhan/poster.webp',
      production: productions['kurulus-orhan'],
    },
    {
      id: 'teskilat', number: '02', title: productions.teskilat.title,
      kind: productions.teskilat.type, duration: 49.72,
      src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/teskilat-breakdown.mp4',
      poster: 'media/showreel/breakdowns/teskilat/poster.webp',
      production: productions.teskilat,
    },
    {
      id: 'turkcell-shaq', number: '03', title: productions['turkcell-shaq'].title,
      kind: productions['turkcell-shaq'].type, duration: 33.52,
      src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/turkcell-shaq-breakdown.mp4',
      poster: 'media/showreel/breakdowns/turkcell-shaq/poster.webp',
      production: productions['turkcell-shaq'],
    },
    {
      id: 'zaferin-rengi', number: '04', title: productions['zaferin-rengi'].title,
      kind: productions['zaferin-rengi'].type, duration: 72.28,
      src: 'https://github.com/demiralpdemirel-cloud/portfolio/releases/download/media-v1/zaferin-rengi-breakdown.mp4',
      poster: 'media/showreel/breakdowns/zaferin-rengi/poster.webp',
      production: productions['zaferin-rengi'],
    },
  ],
}
