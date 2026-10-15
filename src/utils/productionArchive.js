import { catalog } from '../data/catalog.js'

const screeningOrder = ['KURULUŞ ORHAN', 'TEŞKİLAT', 'TURKCELL / SHAQ DİYE 5G', 'ZAFERİN RENGİ']
// Same canonical objects and media as the existing detail routes. No copied credits.
export const archiveProductions = catalog.filter(entry => entry.kind === 'production').sort((a, b) => {
  const rank = entry => screeningOrder.includes(entry.title) ? screeningOrder.indexOf(entry.title) : screeningOrder.length
  return rank(a) - rank(b)
})

export function productionPresentation(entry) {
  const detail = entry.detail
  const contribution = detail.role?.length ? detail.role : []
  return {
    contribution,
    contributionCopy: contribution.length ? detail.myWork || detail.description : null,
    year: detail.broadcastYears || detail.firstReleaseYear || entry.year,
    // Three restrained editorial palettes, derived only from existing genre/type metadata.
    atmosphere: /HISTOR|HISTORY/.test(detail.genre || '') ? 'amber' : /COMMERCIAL|AD CAMPAIGN/.test(detail.type || '') ? 'studio' : 'steel',
    poster: detail.video?.poster || entry.image,
  }
}
