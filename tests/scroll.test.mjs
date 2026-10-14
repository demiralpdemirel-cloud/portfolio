import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {catalog} from '../src/data/catalog.js'
import {webVideoSource} from '../src/data/webMedia.js'
test('scroll architecture is centrally owned, reversible, responsive and reduced-motion gated',()=>{
  const source=readFileSync(new URL('../src/motion/useScrollWorld.js',import.meta.url),'utf8')
  for(const id of ['about','profile','showreel','work','education','capabilities','contact']) assert.ok(source.replace(/\s/g,'').includes(`id==='${id}'`))
  assert.match(source,/gsap\.matchMedia/);assert.match(source,/conditions\.reduced/);assert.match(source,/context\.revert/)
  assert.match(source,/scrub:/);assert.doesNotMatch(source,/setState|setSelected|setCategory|pin:true/)
})
test('delivery mapping preserves canonical data and avoids alternative retired hosts',()=>{
  assert.equal(webVideoSource('media/projects/xpomatch/xpomatch-v02-faststart.mp4'),'media/projects/xpomatch/xpomatch-v02-faststart.mp4')
  for(const entry of catalog){for(const video of [entry.detail.video,entry.detail.breakdownVideo].filter(Boolean)) assert.doesNotMatch(webVideoSource(video.src),/portfolio-motion|portfolio-universe/)}
  assert.match(webVideoSource(catalog.find(entry=>entry.id==='project-001').detail.video.src),/portfolio\/media\/web\/evga/)
})
test('tool interactions use verified tool names and illustrative workflows, stopped offscreen',()=>{
  const source=readFileSync(new URL('../src/components/ToolStudy.jsx',import.meta.url),'utf8')
  assert.match(source,/IntersectionObserver/);assert.match(source,/observer\.disconnect/);assert.match(source,/Illustrative workflow/)
  assert.doesNotMatch(source,/requestAnimationFrame|setInterval/)
})
