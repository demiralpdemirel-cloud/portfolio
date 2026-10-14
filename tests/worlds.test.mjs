import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
import {worlds,worldFor} from '../src/data/worlds.js'
import {catalog} from '../src/data/catalog.js'
import {siteConfig} from '../src/data/siteConfig.js'
import {translate} from '../src/i18n/translations.js'

test('all 20 works have exactly one primary world; canonical details are reused',()=>{
  const entries=worlds.flatMap(w=>w.entries)
  assert.equal(entries.length,catalog.length)
  assert.equal(new Set(entries.map(e=>e.id)).size,catalog.length)
  assert.ok(entries.every(e=>catalog.includes(e)))
  assert.deepEqual(worlds.map(w=>[w.id,w.entries.length]),[['product',5],['architecture',3],['compositing',1],['modeling',2],['production',9]])
  assert.equal(worldFor(catalog.find(e=>e.id==='sofa-modeling')),'modeling')
  assert.equal(worldFor(catalog.find(e=>e.id==='project-004')),'modeling')
})
test('portrait is real local source, eager in Hero, retained during scroll; About remains second',()=>{
  const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
  const motion=readFileSync(new URL('../src/motion/useScrollWorld.js',import.meta.url),'utf8')
  assert.ok(existsSync(new URL('../public/'+siteConfig.profileImage,import.meta.url)))
  assert.ok(app.indexOf('className="hero-portrait"')<app.indexOf('id="about"'))
  assert.match(app,/profileImage\)} alt=\{siteConfig.name\} fetchPriority="high"/)
  const sections=[...app.matchAll(/<section\s+id="([^"]+)"/g)].map(m=>m[1])
  assert.deepEqual(sections.slice(0,2),['home','about'])
  assert.ok(app.indexOf('id="capabilities"')<app.indexOf('id="education"'))
  const portraitTween=motion.match(/flight\.to\('\.hero-portrait'[^\n]+/)[0]
  assert.doesNotMatch(portraitTween,/opacity/)
})
test('five worlds have unique actual geometry/motion and bilingual presentation labels',()=>{
  const jsx=readFileSync(new URL('../src/components/CreativeWorlds.jsx',import.meta.url),'utf8')
  const motion=readFileSync(new URL('../src/motion/useScrollWorld.js',import.meta.url),'utf8')
  for(const world of worlds) {
    assert.notEqual(translate(world.title,'tr'),world.title)
    assert.notEqual(translate(world.label,'tr'),world.label)
    assert.ok(motion.includes(`world==='${world.id}'`))
  }
  assert.match(jsx,/Illustrative layer structure/)
  assert.match(jsx,/breakdownStages/)
  assert.match(jsx,/mediaViews\[4\]/)
  assert.match(jsx,/<article id=\{entry.id\}/)
  assert.doesNotMatch(jsx,/<VideoPlayer|requestAnimationFrame|setInterval/)
  assert.match(motion,/\}, \[root\]\)/)
  assert.match(motion,/\}, \[revision\]\)/)
})
