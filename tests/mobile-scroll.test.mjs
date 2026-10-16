import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createViewportRefreshGate, allowInitialAnchor } from '../src/utils/viewportRefresh.js'

test('mobile toolbar height cycles do not enter the GSAP refresh path',()=>{
  for (const [width,height] of [[390,844],[375,812],[412,915]]) {
    const gate=createViewportRefreshGate(width,height)
    for(const next of [height-64,height-90,height,height-55,height]) assert.equal(gate(width,next),false)
  }
})

test('real layout, orientation and desktop resizes are not suppressed',()=>{
  const gate=createViewportRefreshGate(390,844)
  assert.equal(gate(390,780),false)
  assert.equal(gate(412,915),true)
  assert.equal(gate(915,412,true),true)
  assert.equal(gate(915,412),false)
  assert.equal(createViewportRefreshGate(390,844)(390,600),true)
  assert.equal(createViewportRefreshGate(1440,900)(1440,850),true)
  assert.equal(createViewportRefreshGate(1024,900)(1025,900),true) // breakpoint wins over jitter tolerance
  assert.equal(createViewportRefreshGate(390,844)(391,844),false)
  assert.equal(createViewportRefreshGate(1024,900)(1026,900),true)
})

test('late fonts cannot replay home/deep anchors after user scrolling or restored navigation',()=>{
  const start={initialized:false,interacted:false,initialY:0,currentY:0,initialHash:'#home',currentHash:'#home',modalOpen:false}
  assert.equal(allowInitialAnchor(start),true)
  for(const change of [{initialized:true},{interacted:true},{currentY:1200},{initialY:1600,currentY:1600},{currentHash:'#contact'},{modalOpen:true}]) assert.equal(allowInitialAnchor({...start,...change}),false)
})

test('resize refresh is safe and gated; language changes never replay a stale window scroll',()=>{
  const read=path=>readFileSync(new URL('../src/'+path,import.meta.url),'utf8')
  const world=read('motion/useScrollWorld.js')
  assert.match(world,/ignoreMobileResize: true/)
  assert.match(world,/needsViewportRefresh\(innerWidth, innerHeight\)/)
  assert.match(world,/orientationchange/)
  assert.match(world,/ScrollTrigger.refresh\(true\)/)
  assert.doesNotMatch(world,/ScrollTrigger.refresh\(\)/)
  assert.match(world,/allowInitialAnchor/)
  assert.match(world,/removeStartupInputs\(\)/)
  assert.doesNotMatch(world,/normalizeScroll|ScrollSmoother|pin: true/)
  const language=read('i18n/LanguageContext.jsx')
  assert.doesNotMatch(language,/window.scrollTo|window.scrollY|location.hash/)
  assert.match(language,/ScrollTrigger.refresh\(true\)/)
})
