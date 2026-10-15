import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { tools, toolCategories } from '../src/data/tools.js'
import { softwareIdentity } from '../src/data/softwareIdentity.js'
import { buildSoftwareTimeline } from '../src/motion/useSoftwareMotion.js'
import { translate } from '../src/i18n/translations.js'

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

function recordTimeline() {
  const calls = []
  return { calls, to(target, values, position) { calls.push({ method: 'to', target, values, position }); return this }, fromTo(target, from, values, position) { calls.push({ method: 'fromTo', target, from, values, position }); return this } }
}

test('software showcase keeps exactly eleven real tools and removes the four requested entries', () => {
  assert.equal(tools.length, 11)
  assert.equal(Object.keys(softwareIdentity).length, 11)
  assert.equal(new Set(tools.map(tool => softwareIdentity[tool.name].id)).size, 11)
  assert.ok(tools.every(tool => tool.tags.length > 0 && softwareIdentity[tool.name]))
  assert.equal(toolCategories.flatMap(category => category.tools).length, 11)
  assert.ok(tools.every(tool => !/Upsca|Encoder|HandBrake|Keying Suite/i.test(tool.name)))
})

test('all eleven logos are locally hosted real files, small and free of SVG scripts/external dependencies', () => {
  let total = 0
  for (const identity of Object.values(softwareIdentity)) {
    const path = new URL(`../public/media/tools/logos/${identity.logo}`, import.meta.url)
    const bytes = statSync(path).size
    assert.ok(bytes > 100 && bytes < 40000)
    total += bytes
    if (identity.logo.endsWith('.svg')) {
      const svg = readFileSync(path, 'utf8')
      assert.match(svg, /<svg/)
      assert.match(svg, /viewBox=/)
      assert.doesNotMatch(svg, /<script|<foreignObject|onload=|(?:href|xlink:href)=["']https?:/i)
    }
    assert.notEqual(translate(identity.cue, 'tr'), identity.cue)
  }
  assert.ok(total < 100000)
})

test('every app builds a distinct finite real choreography with actual geometry targets', () => {
  const geometry = source('src/components/ToolStudy.jsx')
  const signatures = new Set()
  for (const identity of Object.values(softwareIdentity)) {
    const timeline = recordTimeline()
    buildSoftwareTimeline(identity.id, timeline, target => target)
    assert.ok(timeline.calls.length >= 2, identity.id)
    const targets = timeline.calls.map(call => call.target)
    signatures.add(targets.join('|'))
    for (const { target, values } of timeline.calls) {
      // Not a generic card transform: each selector maps to app-specific DOM.
      const selector = target.split(' ')[0].slice(1).replace(/^micro-burst--(?:left|right)$/, 'micro-burst--')
      assert.ok(geometry.includes(selector), `${identity.id}: ${target}`)
      assert.ok(Number.isFinite(values.duration) && values.duration > 0 && values.duration <= 2)
      assert.ok(!['left', 'top', 'width', 'height', 'filter', 'boxShadow', 'repeat'].some(property => property in values))
    }
  }
  assert.equal(signatures.size, 11)
})

test('Blender has a six-face cube orbit; AE bursts alternate by half a second and evade both sides', () => {
  const blender = recordTimeline()
  buildSoftwareTimeline('blender', blender, target => target)
  assert.ok(blender.calls.some(call => call.target === '.cube-orbit' && call.values.rotation === 360))
  assert.match(source('src/components/ToolStudy.jsx'), /'front', 'back', 'right', 'left', 'top', 'bottom'/)
  const ae = recordTimeline()
  buildSoftwareTimeline('after-effects', ae, target => target)
  const bursts = ae.calls.filter(call => call.method === 'fromTo' && call.target.startsWith('.micro-burst'))
  assert.equal(bursts.length, 2)
  assert.equal(Number((bursts[1].position - bursts[0].position).toFixed(2)), 0.5)
  assert.ok(ae.calls.some(call => call.values.x > 0))
  assert.ok(ae.calls.some(call => call.values.x < 0))
})

test('shared lifecycle prevents idle work, stacking and offscreen animations; full cleanup exists', () => {
  const motion = source('src/motion/useSoftwareMotion.js')
  assert.equal((motion.match(/new IntersectionObserver/g) || []).length, 1)
  assert.match(motion, /paused: true/)
  assert.match(motion, /timeline\.pause\(0\)/)
  assert.match(motion, /document\.hidden/)
  assert.match(motion, /observer\.disconnect\(\)/)
  assert.match(motion, /context\.revert\(\)/)
  assert.match(motion, /removeEventListener\('visibilitychange'/)
  assert.doesNotMatch(motion, /requestAnimationFrame|setInterval|setTimeout|createElement|appendChild|onUpdate|repeat:|getBoundingClientRect/)
})

test('whole-card tap state, keyboard focus, reduced motion and coarse device paths are explicit', () => {
  const component = source('src/components/ToolStudy.jsx')
  const motion = source('src/motion/useSoftwareMotion.js')
  const css = source('src/components/software.css')
  assert.match(component, /aria-pressed=\{pinned\}/)
  assert.match(component, /onFocus=\{interaction.focus\}/)
  assert.match(component, /onPointerEnter=\{interaction.enter\}/)
  assert.match(component, /onClick=.*interaction.toggle/)
  assert.match(motion, /prefers-reduced-motion/)
  assert.match(motion, /focused && !hovering && !pinned/)
  assert.match(css, /@media\(pointer:coarse\)/)
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/)
  assert.match(css, /grid-template-columns:repeat\(2/)
  assert.doesNotMatch(css, /will-change|backdrop-filter|filter:|box-shadow|infinite/)
  assert.match(component, /loading="lazy" decoding="async"/)
  assert.match(css, /object-fit:contain/)
})
