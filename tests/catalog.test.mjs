import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { catalog, catalogFilters, filterCatalog } from '../src/data/catalog.js'
import { projects } from '../src/data/projects.js'
import { experience } from '../src/data/experience.js'
import { showreel } from '../src/data/showreel.js'
import { translate } from '../src/i18n/translations.js'

test('catalog retains all nine projects, eleven experience records and verified breakdown-only work', () => {
  assert.equal(catalog.length,21)
  assert.equal(new Set(catalog.map(entry=>entry.id)).size,21)
  assert.deepEqual(catalog.filter(entry=>entry.kind==='project').map(entry=>entry.detail).sort((a,b)=>a.id.localeCompare(b.id)), [...projects].sort((a,b)=>a.id.localeCompare(b.id)))
  assert.deepEqual(catalog.filter(entry=>entry.kind==='production').slice(0,experience.length).map(entry=>entry.title),experience.map(entry=>entry.title))
  for(const breakdown of showreel.breakdowns) assert.ok(catalog.some(entry=>entry.title===breakdown.title && entry.detail.video.src===breakdown.src))
  assert.equal(catalog.filter(entry=>entry.title==='ASELSAN').length,1)
  assert.equal(catalog.filter(entry=>entry.title==='MARIO / ARCADE').length,1)
})
test('filters are bilingual subsets with canonical ordering', () => {
  for(const filter of catalogFilters) {
    const entries=filterCatalog(filter.id)
    assert.ok(entries.length)
    assert.ok(entries.every(entry=>catalog.includes(entry)))
    assert.notEqual(translate(filter.label,'tr'),filter.label)
  }
  assert.equal(filterCatalog('production').length,12)
  assert.equal(filterCatalog('brand').length,5)
  assert.equal(filterCatalog('environment').length,3)
})
test('poster derivatives exist without replacing originals; no fabricated role/poster', () => {
  for(const entry of catalog.filter(entry=>entry.image)) {
    if (entry.detail.remoteArtwork) {
      for (const path of [entry.image,entry.thumbnail,entry.thumbnailLarge]) assert.equal(new URL(path).hostname,'shinemedya.com')
      continue
    }
    for(const path of [entry.image,entry.thumbnail,entry.thumbnailLarge]) assert.ok(existsSync(new URL('../public/'+path.replace(/^\//,''),import.meta.url)),path)
  }
  assert.equal(catalog.find(entry=>entry.title==='AŞK VE TAHT').thumbnail,null)
  const orhan=catalog.find(entry=>entry.title==='KURULUŞ ORHAN')
  assert.deepEqual(orhan.detail.role,[])
  assert.equal(orhan.discipline,'PRODUCTION BREAKDOWN')
  assert.equal(catalog.find(entry=>entry.title==='KURULUŞ OSMAN').objectPosition,'50% 20%')
})
test('catalog uses on-demand existing dialogs, no chapter or eager player', () => {
  const source=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
  const grid=readFileSync(new URL('../src/components/JewelCaseCatalog.jsx',import.meta.url),'utf8')
  const caseObject=readFileSync(new URL('../src/components/JewelCase.jsx',import.meta.url),'utf8')
  assert.doesNotMatch(grid,/<VideoPlayer|autoPlay|ProjectChapter/)
  assert.match(source,/active\?\.kind\s*===\s*'project'/)
  assert.match(source,/active\?\.kind\s*===\s*'production'/)
  assert.match(source,/loading="lazy"/)
  assert.match(grid,/aria-pressed/)
  assert.match(caseObject,/loading="lazy"/)
  assert.match(source,/<JewelCaseCatalog/)
})
