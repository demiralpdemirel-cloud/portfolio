import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { catalog } from '../src/data/catalog.js'
import { archiveProductions, productionPresentation } from '../src/utils/productionArchive.js'
import { translate } from '../src/i18n/translations.js'
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('professional archive keeps all twelve canonical records, roles, media and detail identities', () => {
  assert.equal(archiveProductions.length, 12)
  assert.equal(new Set(archiveProductions.map(item => item.id)).size, 12)
  assert.deepEqual(archiveProductions.slice(0, 4).map(item => item.title), ['KURULUŞ ORHAN','TEŞKİLAT','TURKCELL / SHAQ DİYE 5G','ZAFERİN RENGİ'])
  for (const item of archiveProductions) {
    assert.equal(item, catalog.find(entry => entry.id === item.id))
    assert.equal(productionPresentation(item).poster, item.detail.video?.poster || item.image)
  }
  assert.deepEqual(productionPresentation(archiveProductions[0]).contribution, [])
  assert.equal(productionPresentation(archiveProductions[0]).contributionCopy, null)
  assert.ok(archiveProductions.find(item => item.title === 'KARDEŞ TAKIMI 1–3').detail.creditNote)
})

test('archive selection and dossier reuse real player and existing modal callback without autoplay or duplicate decoders', () => {
  const component = read('src/components/ProductionShowcase.jsx')
  assert.equal((component.match(/<VideoPlayer /g) || []).length, 1)
  assert.match(component, /key=\{entry.id\} videoRef=\{video\}/)
  assert.match(component, /video.current\?\.pause\(\)/)
  assert.match(component, /onOpen\(event, entry\)/)
  assert.match(component, /durationHint=\{entry.detail.video.duration\}/)
  assert.doesNotMatch(component, /autoPlay=|<canvas|requestAnimationFrame|setInterval/)
  assert.ok(component.indexOf('<div className="credits-contribution">') < component.indexOf('<dl className="credits-facts">'))
})

test('selection is cancellable, reduced-motion aware, keyboard navigable and local to the strip', () => {
  const component = read('src/components/ProductionShowcase.jsx')
  assert.match(component, /transition.current\?\.kill\(\)/)
  assert.match(component, /requested.current === selected/)
  assert.match(component, /mounted.current = false/)
  assert.match(component, /context.revert\(\)/)
  assert.match(component, /prefers-reduced-motion/)
  assert.match(component, /rail.scrollTo/)
  assert.match(component, /focus\(\{ preventScroll: true \}\)/)
  for (const key of ['ArrowLeft','ArrowRight','Home','End']) assert.ok(component.includes(key))
  assert.match(component, /aria-pressed=\{selected === item.id\}/)
  assert.match(component, /hashchange/)
  const css = read('src/styles/production-showcase.css')
  assert.match(css, /pointer-events:none/)
  assert.doesNotMatch(css, /backdrop-filter|filter:blur|animation:.*infinite/)
  assert.match(css, /overflow-x:auto/)
})

test('showcase replacement is confined to the professional world with bilingual labels', () => {
  assert.match(read('src/components/CreativeWorlds.jsx'), /world.id === 'production' \? <ProductionShowcase/)
  for (const label of ['SCREEN CREDITS','A CINEMATIC PRODUCTION ARCHIVE','PRODUCTION DOSSIER','THE PRODUCTION INDEX','Previous production','Next production','SELECT PRODUCTION']) assert.notEqual(translate(label,'tr'),label)
  const app = read('src/App.jsx')
  assert.ok(app.indexOf('id="final-shot"') < app.indexOf('id="contact"'))
})
