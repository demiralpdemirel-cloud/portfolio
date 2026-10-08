import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { projects, personalWorkOrder, projectMediaDimensions } from '../src/data/projects.js'
import { translations } from '../src/i18n/translations.js'

test('Beylikduzu includes nine original views and nine full-resolution assets', () => {
  const project = projects.find(item => item.id === 'beylikduzu-kultur-merkezi')
  assert.equal(project.media.length, 9)
  assert.equal(project.fullResolutionMedia.length, 9)
  for (const path of [...project.media, ...project.fullResolutionMedia]) assert.ok(existsSync(new URL(`../public/${path}`, import.meta.url)), path)
  assert.ok(project.media.every(path => projectMediaDimensions[path][0] === 1920))
  assert.deepEqual(project.mediaGroups.flatMap(group => group.indices), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.equal(project.cover, project.media[0])
  assert.equal(personalWorkOrder.at(-1), project.id)
  assert.equal(project.sceneStats, undefined)
  assert.equal(project.software.length, 0)
  assert.equal(translations.tr[project.title], 'BEYLİKDÜZÜ KÜLTÜR MERKEZİ')
})

test('Real-world references stay source-linked and separate from artist renders', () => {
  const project = projects.find(item => item.id === 'beylikduzu-kultur-merkezi')
  assert.equal(project.references.length, 1)
  assert.equal(project.references[0].image, 'https://www.beylikduzu.istanbul/Content/facility/gallery/img-2b6614a6.jpg')
  assert.ok(project.references.every(item => new URL(item.source).hostname === 'www.beylikduzu.istanbul' && item.image.startsWith('https://')))
  assert.equal(project.structureInfo.length, 4)
  assert.equal(project.projectFacts.length, 3)
  assert.notEqual(project.description.en, project.description.tr)
})
