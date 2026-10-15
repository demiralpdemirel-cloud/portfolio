import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { shelfIndex, shelfOffset } from '../src/utils/catalogShelf.js'
import { caseStates, nextCaseState, caseDestination } from '../src/utils/caseMotion.js'
import { catalog, personalCatalog, personalFilters, filterPersonalCatalog } from '../src/data/catalog.js'

test('shelf arrows advance exactly one item and clamp at both ends', () => {
  assert.equal(shelfIndex(1,20),1)
  assert.equal(shelfIndex(-1,20),0)
  assert.equal(shelfIndex(20,20),19)
  assert.equal(shelfOffset(1,250,20),250)
  assert.equal(shelfOffset(19,250,20),4750)
  assert.equal(shelfOffset(0,250,3),0)
})
test('shelf stays frontal and has no particle, video or continuous animation engine', () => {
  const component=readFileSync(new URL('../src/components/JewelCaseCatalog.jsx',import.meta.url),'utf8')
  const css=readFileSync(new URL('../src/styles/jewel-catalog.css',import.meta.url),'utf8')
  assert.doesNotMatch(css,/\.jewel-case\s*\{[^}]*rotate/)
  assert.doesNotMatch(component,/requestAnimationFrame|setInterval|onPointerMove|<video|<VideoPlayer/)
  for(const key of ['ArrowLeft','ArrowRight','Home','End']) assert.ok(component.includes(key))
  assert.match(component,/observer.disconnect\(\)/)
  assert.match(component,/onOpen\(event, entry\)/)
  assert.match(component,/cases.current\[shown.id\]/)
  assert.match(component,/selection.category === category/)
  assert.match(css,/prefers-reduced-motion/)
})
test('physical collection contains exactly the nine requested works; all professional records survive', () => {
  assert.deepEqual(personalCatalog.map(entry => entry.title), ['EVGA RTX 3090','KEYBOARD','XPOMATCH','CAFE ENVIRONMENT','INTERIOR','SOFA MODELING','MARIO / ARCADE','STAR WARS / IMPACT','BEYLİKDÜZÜ CULTURAL CENTER'])
  assert.equal(catalog.filter(entry => entry.kind === 'production').length,12)
  for (const filter of personalFilters) {
    const filtered = filterPersonalCatalog(filter.id)
    assert.ok(filtered.length)
    assert.ok(filtered.every(entry => personalCatalog.includes(entry)))
  }
})

test('filtering retains case identities and excludes hidden cases from focus and input', () => {
  const component=readFileSync(new URL('../src/components/JewelCaseCatalog.jsx',import.meta.url),'utf8')
  assert.match(component,/personalCatalog.map/)
  assert.doesNotMatch(component,/key=\{category\}/)
  assert.match(component,/inert=\{!included\}/)
  assert.match(component,/aria-hidden=\{!included\}/)
})

test('case state machine opens and returns, rejects double select, and supports cancellation at every opening phase', () => {
  let state = 'idle'
  for (const [event, expected] of [['select','selected'],['hinge','opening'],['extract','extracting'],['expand','expanding'],['present','open'],['close','closing'],['restore','idle']]) {
    state = nextCaseState(state,event)
    assert.equal(state,expected)
  }
  for (const state of ['selected','opening','extracting','expanding']) {
    assert.equal(nextCaseState(state,'select'),state)
    assert.equal(nextCaseState(state,'cancel'),'closing')
  }
  for (const state of Object.keys(caseStates)) assert.equal(nextCaseState(state,'unknown'),state)
})

test('physical extraction endpoint fits desktop and mobile without changing proportions', () => {
  for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:568}]) {
    const box = {left:24,top:300,width:300,height:280}
    const dest = caseDestination(box,viewport)
    assert.ok(box.width*dest.scale <= viewport.width-40)
    assert.ok(box.height*dest.scale <= viewport.height-100)
    assert.equal(box.left+dest.x+box.width/2,viewport.width/2)
  }
})

test('case reveal has reversible cleanup, reduced-motion bypass and no frame state writes', () => {
  const component=readFileSync(new URL('../src/components/CaseReveal.jsx',import.meta.url),'utf8')
  assert.match(component,/onReverseComplete: finish/)
  assert.match(component,/flight.current\?\.kill\(\)/)
  assert.match(component,/prefers-reduced-motion/)
  assert.match(component,/source.current.style.visibility = ''/)
  assert.doesNotMatch(component,/requestAnimationFrame|setInterval|useState|onUpdate/)
})
