import { projects } from './projects.js'
import { experience } from './experience.js'
import { getProductionDetail } from './productionDetails.js'
import { showreel } from './showreel.js'

export const catalogFilters = [
  { id: 'all', label: 'ALL WORKS' },
  { id: 'brand', label: 'BRAND & PRODUCT' },
  { id: 'environment', label: 'ENVIRONMENTS' },
  { id: 'vfx', label: 'VFX & COMPOSITING' },
  { id: 'modeling', label: 'MODELING' },
  { id: 'production', label: 'PRODUCTION' },
]
// Presentation only: canonical project and production detail objects stay authoritative.
const projectOrder = ['project-001', 'project-002', 'xpomatch', 'cafe-environment', 'project-003', 'sofa-modeling', 'project-004', 'project-005', 'beylikduzu-kultur-merkezi']
const rank = id => projectOrder.includes(id) ? projectOrder.indexOf(id) : projectOrder.length
const personalEntries = [...projects].sort((a,b) => rank(a.id)-rank(b.id)).filter(project => !project.placeholder).map(project => ({
  id: project.id, kind: 'project', title: project.title, year: project.year,
  image: project.cover, fit: 'cover', objectPosition: '50% 50%', detail: project,
  discipline: project.role?.length ? project.role.join(' / ') : project.primaryCategory,
  categories: [
    ...(['project-001','project-002','xpomatch'].includes(project.id) ? ['brand'] : []),
    ...(project.categoryIds?.includes('archviz') ? ['environment'] : []),
    ...(project.categoryIds?.includes('vfx') ? ['vfx'] : []),
    ...(project.categoryIds?.includes('modeling') ? ['modeling'] : []),
  ],
}))
const productionEntries = experience.map((credit,index) => {
  const detail = getProductionDetail(credit)
  const breakdown = showreel.breakdowns.find(record => record.title === credit.title)
  if (!detail.video && breakdown) {
    detail.video = { src:breakdown.src, poster:detail.image || breakdown.poster, duration:breakdown.duration }
    detail.videoLabel = 'BREAKDOWN'
  }
  return {
    id: `production-${String(index+1).padStart(2,'0')}`, kind:'production', title:credit.title,
    year:credit.period || detail.broadcastYears || detail.firstReleaseYear,
    image:detail.image, fit:detail.imageWidth < detail.imageHeight ? 'cover' : 'contain',
    objectPosition:credit.title === 'KURULUŞ OSMAN' ? '50% 20%' : '50% 50%',
    discipline:detail.role.length ? detail.role.join(' / ') : 'PRODUCTION BREAKDOWN',
    categories:['production',...(credit.title === 'ASELSAN' ? ['brand'] : []),...(detail.role.some(role => /COMPOSIT|VFX|CLEANUP|FX/i.test(role)) ? ['vfx'] : [])], detail,
  }
})
// Index verified breakdown-only work too, without duplicating productions already listed.
const additionalProductions = showreel.breakdowns.filter(record => !productionEntries.some(entry => entry.title === record.title)).map(record => ({
  id:record.id, kind:'production', title:record.title, year:record.production.release,
  image:record.poster, fit:'contain', objectPosition:'50% 50%',
  discipline:record.production.myRole.join(' / '), categories:['production','brand','vfx'],
  detail:{...record.production, title:record.title, hideUnknownFields:true, company:record.production.vfxStudio,
    role:record.production.myRole, disciplines:record.production.myRole, description:record.production.roleDetail,
    image:record.poster, broadcastYears:record.production.release, videoLabel:'BREAKDOWN',
    video:{src:record.src,poster:record.poster,duration:record.duration}},
}))
export const catalog = [...personalEntries,...productionEntries,...additionalProductions].map((entry,index) => ({
  ...entry, number:String(index+1).padStart(2,'0'),
  thumbnail:entry.image ? `media/catalog/${entry.id}-480.webp` : null,
  thumbnailLarge:entry.image ? `media/catalog/${entry.id}-960.webp` : null,
}))
export const filterCatalog = category => category === 'all' ? catalog : catalog.filter(entry => entry.categories.includes(category))
