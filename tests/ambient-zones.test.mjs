import test from 'node:test'
import assert from 'node:assert/strict'
import { createAmbientZoneMap, sampleAmbientZones, smoothAmbientZones, interpolateAmbientZones } from '../src/utils/ambientZones.js'
import { createAmbientScheduler } from '../src/utils/ambientScheduler.js'
import { convertAmbientYuv } from '../src/utils/ambientNativeFrame.js'
import { ambientFeather, renderAmbientStrip } from '../src/utils/ambientColors.js'
import { readFileSync } from 'node:fs'

test('spatial renderer feathers both orientations, keeps local colour and makes black transparent', () => {
  const feather = ambientFeather(16)
  assert.equal(feather[0], 0); assert.equal(feather[15], 0)
  assert.ok(feather[7] > .98)
  const line = new Uint8ClampedArray(64 * 4)
  for (let i = 28; i < 36; i++) line.set([0, 200, 255, 255], i * 4)
  for (const horizontal of [true, false]) {
    const w = horizontal ? 64 : 16, h = horizontal ? 16 : 64
    const output = new Uint8ClampedArray(w * h * 4)
    renderAmbientStrip(line, output, w, h, horizontal, feather)
    const at = (along, cross) => ((horizontal ? cross * w + along : along * w + cross) * 4)
    assert.equal(output[at(0, 7) + 3], 0)
    assert.equal(output[at(32, 0) + 3], 0)
    assert.ok(output[at(32, 7) + 3] > 250)
    assert.deepEqual(Array.from(output.slice(at(32, 7), at(32, 7) + 3)), [0,200,255])
  }
})

test('pixel and CORS strip surfaces share static elliptical masks, without zone-sized filters', () => {
  const css = readFileSync(new URL('../src/styles/player.css', import.meta.url), 'utf8')
  assert.match(css, /\.player-ambient__edge \.player-ambient__visual \{ mask-image: radial-gradient/)
  assert.match(css, /ellipse 50% 85%/)
  assert.match(css, /overflow: visible/)
  assert.match(css, /\[data-mode="fallback"\] \.player-ambient__edge \.player-ambient__visual \{ mix-blend-mode: screen/)
  assert.match(css, /background: var\(--ambient-backdrop\); isolation: isolate/)
})

const width = 64, height = 36, mapping = createAmbientZoneMap(width, height)
function image(color) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data.set([...color(x, y), 255], (y * width + x) * 4)
  return data
}
test('52 zones keep a small right-middle source independent of other edges and dark zones', () => {
  assert.deepEqual(mapping.map(m => m.zones.length), [16, 10, 16, 10])
  const colors = sampleAmbientZones(image((x, y) => x >= 59 && y >= 18 && y < 21 ? [0, 200, 255] : [0, 0, 0]), mapping)
  for (const edge of [0, 2, 3]) assert.ok(colors[edge].every(c => c.every(v => v === 0)))
  const lit = colors[1].map((c, i) => Math.max(...c) > 0 ? i : -1).filter(i => i >= 0)
  assert.deepEqual(lit, [5])
  const output = new Uint8ClampedArray(36 * 4)
  interpolateAmbientZones(colors[1], output)
  for (const y of [0, 5, 30, 35]) assert.deepEqual(Array.from(output.slice(y * 4, y * 4 + 3)), [0, 0, 0])
  assert.ok(output[19 * 4 + 2] > 150)
})
test('bright centre does not light edges; corner sources affect only matching local zones', () => {
  const centre = sampleAmbientZones(image((x, y) => x > 12 && x < 50 && y > 8 && y < 27 ? [255, 255, 255] : [0, 0, 0]), mapping)
  assert.ok(centre.flat(2).every(v => v === 0))
  const corner = sampleAmbientZones(image((x, y) => x < 4 && y < 3 ? [255, 0, 0] : [0, 0, 0]), mapping)
  assert.ok(corner[0][0][0] > 200 && corner[3][0][0] > 200)
  assert.ok(corner[1].flat().every(v => v === 0) && corner[2].flat().every(v => v === 0))
})
test('soft dark suppression and fast attack/slower release preserve hue', () => {
  const dark = sampleAmbientZones(image(() => [2, 2, 2]), mapping)
  const medium = sampleAmbientZones(image(() => [30, 30, 30]), mapping)
  assert.ok(dark[0][0][0] < 1 && medium[0][0][0] > 30)
  const black = mapping.map(m => m.zones.map(() => [0, 0, 0]))
  const cyan = mapping.map(m => m.zones.map(() => [0, 100, 200]))
  const attack = smoothAmbientZones(black, cyan)
  const release = smoothAmbientZones(cyan, black)
  assert.ok(Math.abs(attack[0][0][2] - 140) < .001)
  assert.ok(Math.abs(release[0][0][2] - 130) < .001)
  assert.equal(attack[0][0][0], 0); assert.equal(release[0][0][0], 0)
})
test('frame scheduler samples new presented frames at video cadence and caps 60 fps at 30 Hz', () => {
  for (const fps of [24, 25, 30, 50, 60]) {
    const scheduler = createAmbientScheduler()
    let updates = 0
    for (let frame = 0; frame < fps * 5; frame++) {
      const now = frame * 1000 / fps, metadata = { presentedFrames: frame, mediaTime: frame / fps }
      if (scheduler.shouldSample(now, metadata)) updates++
      assert.equal(scheduler.shouldSample(now + 1, metadata), false)
    }
    assert.ok(updates / 5 >= 20 && updates / 5 <= 30, `${fps} fps yielded ${updates / 5} Hz`)
  }
})
test('scheduler respects mobile/reduced limits, recovers after reset and prioritizes CPU budget', () => {
  for (const [options, expected] of [[{ mobile: true }, 24], [{ reduced: true }, 12]]) assert.equal(createAmbientScheduler(options).rate, expected)
  const scheduler = createAmbientScheduler()
  scheduler.shouldSample(0, { presentedFrames: 1, mediaTime: 0 })
  scheduler.reset()
  assert.equal(scheduler.shouldSample(1, { presentedFrames: 1, mediaTime: 0 }), true)
  for (let i = 0; i < 30; i++) scheduler.record(5, i * 1000)
  assert.ok(scheduler.rate < 20)
  assert.equal(scheduler.stats.averageMs, 5)
  assert.equal(scheduler.stats.maxMs, 5)
})

test('native low-resolution conversion respects planar strides, range and neutral black/white', () => {
  const bytes = new Uint8Array(32).fill(128)
  bytes[0] = 16; bytes[1] = 235; bytes[8] = 16; bytes[9] = 235
  const positions = new Uint32Array([0, 0, 1, 0, 0, 1, 1, 1])
  for (const [format, layout] of [['I420', [{ offset: 0, stride: 8 }, { offset: 16, stride: 4 }, { offset: 24, stride: 4 }]], ['NV12', [{ offset: 0, stride: 8 }, { offset: 16, stride: 4 }]]]) {
    const output = new Uint8ClampedArray(16)
    convertAmbientYuv(bytes, positions, layout, format, 'bt709', false, output)
    assert.deepEqual(Array.from(output), [0,0,0,255,255,255,255,255,0,0,0,255,255,255,255,255])
  }
})
