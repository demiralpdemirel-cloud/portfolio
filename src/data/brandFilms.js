import { projects } from './projects'
import { productionDetails } from './productionDetails'
import { experience } from './experience'
import { xpomatch } from './xpomatch'

// Curated presentation, not a second copy of production credits or media.
const aselsan = productionDetails.ASELSAN
const aselsanCredit = experience.find(entry => entry.title === 'ASELSAN')
export const brandFilms = [
  projects.find(project => project.id === 'project-001'),
  projects.find(project => project.id === 'project-002'),
  xpomatch,
  {
    id: 'aselsan-film', number: '010', title: 'ASELSAN',
    primaryCategory: 'COMMERCIAL FILM', type: 'CLIENT / COMMERCIAL WORK', personal: false,
    brand: aselsan.brand, year: aselsan.broadcastYears, role: aselsanCredit.role,
    description: aselsan.productionDescription, presentation: 'video',
    cover: aselsan.image, media: [], video: aselsan.video,
  },
]
