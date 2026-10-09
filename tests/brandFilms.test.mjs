import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { projects, personalProjects } from '../src/data/projects.js'
import { xpomatch } from '../src/data/xpomatch.js'
import { pageRegistry } from '../src/data/pageRegistry.js'
import { translate } from '../src/i18n/translations.js'

test('brand films keep canonical personal records without duplicate personal chapters', () => {
  for (const id of ['project-001', 'project-002']) {
    const project = projects.find(entry => entry.id === id)
    assert.equal(project.personal, true)
    assert.equal(project.primaryCategory, 'PERSONAL PRODUCT FILM')
    assert.equal(project.type, 'PERSONAL PROJECT')
    assert.ok(!personalProjects.includes(project))
  }
  const ids = pageRegistry.map(page => page.id)
  assert.equal(ids.length, new Set(ids).size)
  const source = readFileSync(new URL('../src/data/brandFilms.js', import.meta.url), 'utf8')
  assert.match(source, /productionDetails.ASELSAN/)
  assert.match(source, /role: aselsanCredit.role/)
  assert.match(source, /video: aselsan.video/)
})

test('XpoMatch has one canonical film, exact software, bilingual copy and Pages-safe assets', () => {
  assert.equal(projects.filter(project => project.id === xpomatch.id).length, 1)
  assert.ok(projects.includes(xpomatch))
  assert.equal(xpomatch.personal, false)
  assert.deepEqual(xpomatch.software, ['BLENDER', 'AFTER EFFECTS', 'PREMIERE PRO', 'PHOTOSHOP'])
  assert.equal(xpomatch.primaryCategory, '3D SAAS LAUNCH FILM')
  assert.equal(xpomatch.externalLink, 'https://xpomatch.net')
  assert.equal(translate(xpomatch.primaryCategory, 'tr'), '3D SAAS TANITIM FİLMİ')
  assert.equal(translate(xpomatch.externalLinkLabel, 'tr'), "XPOMATCH'İ ZİYARET ET ↗")
  assert.match(xpomatch.description.en, /The project was produced using Blender, After Effects, Premiere Pro and Photoshop\.$/)
  assert.match(xpomatch.description.tr, /Çalışmada Blender, After Effects, Premiere Pro ve Photoshop kullanıldı\.$/)
  for (const path of [xpomatch.cover, xpomatch.video.src]) {
    assert.ok(!/^[A-Z]:/i.test(path))
    assert.ok(readFileSync(new URL(`../public/${path}`, import.meta.url)).length > 0)
  }
})
