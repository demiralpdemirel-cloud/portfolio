import { catalog } from './catalog.js'

// Exclusive PRIMARY presentation. The compact index remains navigation, not a second showcase.
export function worldFor(entry) {
  if (entry.categories.includes('brand')) return 'product'
  if (entry.kind === 'production') return 'production'
  if (entry.categories.includes('environment')) return 'architecture'
  if (entry.categories.includes('vfx')) return 'compositing'
  return 'modeling'
}
export const worlds = [
  { id: 'product', number: '05', title: 'PRODUCT STUDIO', label: 'BRAND & PRODUCT FILMS', cue: 'PRECISION / LIGHT / MOTION' },
  { id: 'architecture', number: '06', title: 'SPACES, BUILT.', label: 'ARCHVIZ & ENVIRONMENTS', cue: 'OUTLINE / PLANE / SPACE' },
  { id: 'compositing', number: '07', title: 'THE IMAGE, ASSEMBLED.', label: 'VFX & COMPOSITING', cue: 'LAYERS / DEPTH / FINAL' },
  { id: 'modeling', number: '08', title: 'FORM & TOPOLOGY.', label: 'MODELING & PERSONAL STUDIES', cue: 'GEOMETRY / SURFACE / FORM' },
  { id: 'production', number: '09', title: 'BEHIND THE FRAME.', label: 'PROFESSIONAL PRODUCTIONS', cue: 'PICTURE / PRODUCTION / CREDITS' },
].map(world => ({ ...world, entries: catalog.filter(entry => worldFor(entry) === world.id) }))
export const filterWorld = { brand: 'product', environment: 'architecture', vfx: 'compositing', modeling: 'modeling', production: 'production' }
