import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { translate } from '../src/i18n/translations.js'
const read = name => readFileSync(new URL('../src/'+name, import.meta.url),'utf8')

test('production opener uses real Cafe passes, finite scoped motion and priority artwork',()=>{
  const frame=read('components/ProductionFrame.jsx')
  for(const name of ['final','clay','mist']) assert.ok(existsSync(new URL(`../public/media/projects/cafe-environment/${name}.webp`,import.meta.url)))
  assert.match(frame,/media.revert/)
  assert.match(frame,/prefers-reduced-motion/)
  assert.match(frame,/observer.disconnect/)
  assert.match(frame,/img.decode\(\)/)
  assert.doesNotMatch(frame,/repeat:|setInterval|requestAnimationFrame|setState/)
})
test('the final shot immediately precedes Contact, the last main section',()=>{
  const app=read('App.jsx')
  const sections=[...app.matchAll(/<section\s+id="([^"]+)"/g)].map(match=>match[1])
  assert.deepEqual(sections.slice(-2),['final-shot','contact'])
  assert.ok(app.indexOf('id="work"')<app.indexOf('id="showreel"'))
  assert.match(app,/<ProductionFrame closing/)
  assert.match(read('components/CaseReveal.jsx'),/dialog.current.dataset.phase = 'idle'/)
})
test('comparison uses an on-image native thumb with keyboard access and no React frame loop',()=>{
  const lab=read('components/ProcessLab.jsx')
  assert.match(lab,/className="comparison-drag" type="range" min="0" max="100"/)
  assert.match(lab,/onInput=\{compare\}/)
  assert.match(lab,/defaultValue=\{position.current\}/)
  assert.match(read('styles/production-lab.css'),/\.comparison-drag \{[^}]*position:absolute/)
  assert.doesNotMatch(lab,/comparison-control[^\n]*<input/)
  assert.match(lab,/style.setProperty\('--comparison'/)
  assert.match(lab,/Actual model views, different cameras/)
  assert.match(lab,/key=\{selected.id\}/)
  assert.match(lab,/selected \? <VideoPlayer/)
  assert.doesNotMatch(lab,/autoPlay|requestAnimationFrame|setInterval/)
  assert.match(read('styles/production-lab.css'),/clip-path:inset\(0 calc\(100% - var\(--comparison\)\) 0 0\)/)
})
test('new process controls and source limitations have Turkish counterparts',()=>{
  for(const text of ['GEOMETRY TO REALITY','Compare solid and final render','Cafe process modes','Topology study views','SELECT A BREAKDOWN BELOW','THE BREAKDOWN LAB.','ARCHITECTURAL VIEWS']) assert.notEqual(translate(text,'tr'),text)
})

test('Beylikduzu has one clickable home cover; architectural views live only in its detail hero',()=>{
  const world=read('components/CreativeWorlds.jsx')
  const detail=read('components/project/ProjectDetail.jsx')
  const lab=read('components/ProcessLab.jsx')
  assert.doesNotMatch(world,/ArchitectureStudy/)
  assert.match(world,/onClick=\{event => onOpen\(event, entry\)\}/)
  assert.match(detail,/project.id === 'beylikduzu-kultur-merkezi' \? <ArchitectureStudy project=\{project\} onOpen=\{setImageIndex\}/)
  assert.match(lab,/onOpen\(views\[view\].index\)/)
  assert.match(lab,/index:3, label:'SITE \/ CONTEXT'/)
})
