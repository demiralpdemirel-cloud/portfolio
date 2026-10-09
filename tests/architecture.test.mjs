import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { personalProjects, personalWorkOrder, projects } from '../src/data/projects.js'
import { pageRegistry } from '../src/data/pageRegistry.js'
import { education } from '../src/data/education.js'

test('personal chapters have exact home order, unique IDs, and retain original records', () => {
  assert.deepEqual(personalProjects.map(project => project.title), ['SOFA MODELING', 'CAFE ENVIRONMENT', 'INTERIOR', 'MARIO / ARCADE', 'STAR WARS / IMPACT', 'BEYLİKDÜZÜ CULTURAL CENTER'])
  assert.equal(new Set(personalWorkOrder).size, 6)
  assert.ok(personalProjects.every(project => project.personal && projects.includes(project)))
  assert.deepEqual(pageRegistry.filter(page => page.type === 'project').map(page => page.id), ['project-001', 'project-002', 'xpomatch', 'aselsan-film', ...personalWorkOrder])
})
test('home sections and navigation follow the new architecture without archive/experience', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /<main><Hero \/><About \/><Showreel \/><Work \/><Education \/><Capabilities \/><Contact \/><\/main>/)
  assert.doesNotMatch(app, /<Experience|<PortfolioArchive/)
  assert.deepEqual(pageRegistry.filter(page => page.navLabel).map(page => page.id), ['about', 'showreel', 'brand-films', 'work', 'education', 'capabilities', 'contact'])
})
test('Cafe stages/stats, Interior gallery/video and Mario secondary film survive', () => {
  const cafe = personalProjects.find(project => project.id === 'cafe-environment')
  assert.deepEqual(cafe.breakdownStages.map(stage => stage.label), ['FINAL', 'SOLID', 'MIST'])
  assert.deepEqual(Object.values(cafe.sceneStats), [981, 1539667, 3049726, 1505809, 2921827])
  assert.equal(projects.find(project => project.id === 'project-003').media.length, 4)
  assert.ok(projects.find(project => project.id === 'project-003').video.src)
  assert.ok(projects.find(project => project.id === 'project-004').video.src && projects.find(project => project.id === 'project-004').breakdownVideo.src)
  assert.equal(projects.filter(project => project.title === 'MARIO / ARCADE').length, 1)
  assert.equal(education.program, 'AÇIK ÖĞRETİM GRAFİK TASARIM')
})
