import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { personalProjects, personalWorkOrder, projects } from '../src/data/projects.js'
import { pageRegistry } from '../src/data/pageRegistry.js'
import { education } from '../src/data/education.js'

test('personal chapters have exact home order, unique IDs, and retain original records', () => {
  assert.deepEqual(personalProjects.map(project => project.title), ['EVGA RTX 3090', 'KEYBOARD', 'CAFE ENVIRONMENT', 'INTERIOR', 'MARIO / ARCADE', 'STAR WARS / IMPACT'])
  assert.equal(new Set(personalWorkOrder).size, 6)
  assert.ok(personalProjects.every(project => project.personal && projects.includes(project)))
  assert.deepEqual(pageRegistry.filter(page => page.type === 'project').map(page => page.id), personalWorkOrder)
})
test('home sections and navigation follow the new architecture without archive/experience', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /<main><Hero \/><About \/><Showreel \/><Work \/><Education \/><Capabilities \/><Contact \/><\/main>/)
  assert.doesNotMatch(app, /<Experience|<PortfolioArchive/)
  assert.deepEqual(pageRegistry.filter(page => page.navLabel).map(page => page.id), ['about', 'showreel', 'work', 'education', 'capabilities', 'contact'])
})
test('Cafe stages/stats, Interior gallery/video and Mario secondary film survive', () => {
  const cafe = personalProjects[2]
  assert.deepEqual(cafe.breakdownStages.map(stage => stage.label), ['FINAL', 'SOLID', 'MIST'])
  assert.deepEqual(Object.values(cafe.sceneStats), [981, 1539667, 3049726, 1505809, 2921827])
  assert.equal(personalProjects[3].media.length, 4)
  assert.ok(personalProjects[3].video.src)
  assert.ok(personalProjects[4].video.src && personalProjects[4].breakdownVideo.src)
  assert.equal(projects.filter(project => project.title === 'MARIO / ARCADE').length, 1)
  assert.equal(education.program, 'AÇIK ÖĞRETİM GRAFİK TASARIM')
})
