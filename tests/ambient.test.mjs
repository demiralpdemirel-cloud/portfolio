import test from 'node:test'
import assert from 'node:assert/strict'
import { ambientEdgeCrop, sampleAmbientEdges, smoothAmbientEdges } from '../src/utils/ambientColors.js'

const width = 64, height = 36
test('visual fallback crops only the matching outer edge, including portrait video', () => {
  for (const [w, h] of [[1920, 1080], [1080, 1920]]) {
    for (const edge of ['top', 'right', 'bottom', 'left']) {
      const [x, y, cw, ch] = ambientEdgeCrop(edge, w, h)
      assert.ok(x >= 0 && y >= 0 && x + cw <= w && y + ch <= h)
      assert.ok(!(x <= w / 2 && x + cw >= w / 2 && y <= h / 2 && y + ch >= h / 2), 'centre must not become a light source')
      if (edge === 'top') assert.equal(y, 0)
      if (edge === 'right') assert.equal(x + cw, w)
      if (edge === 'bottom') assert.equal(y + ch, h)
      if (edge === 'left') assert.equal(x, 0)
    }
  }
})
function image(pixel) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data.set([...pixel(x, y), 255], (y * width + x) * 4)
  return data
}

test('ambient sampling ignores the centre and preserves directional hues', () => {
  const data = image((x, y) => y < 4 ? [180, 30, 140] : y >= 32 ? [30, 180, 40] : x < 8 ? [20, 40, 180] : x >= 56 ? [180, 80, 20] : [255, 255, 255])
  const [top, right, bottom, left] = sampleAmbientEdges(data, width, height)
  assert.ok(top[0] > top[1] * 2 && top[2] > top[1] * 2)
  assert.ok(right[0] > right[2] * 2)
  assert.ok(bottom[1] > bottom[0] * 2)
  assert.ok(left[2] > left[0] * 2)
  const darkCentre = image((x, y) => x >= 8 && x < 56 && y >= 4 && y < 32 ? [0, 0, 0] : Array.from(data.slice((y * width + x) * 4, (y * width + x) * 4 + 3)))
  assert.deepEqual(sampleAmbientEdges(darkCentre, width, height), [top, right, bottom, left])
})

test('black stays black and dim monochrome gets a neutral exposure lift', () => {
  assert.deepEqual(sampleAmbientEdges(image(() => [0, 0, 0]), width, height), Array.from({ length: 4 }, () => [0, 0, 0]))
  for (const rgb of sampleAmbientEdges(image(() => [24, 24, 24]), width, height)) {
    assert.ok(rgb[0] > 24 && rgb[0] < 48)
    assert.equal(rgb[0], rgb[1]); assert.equal(rgb[1], rgb[2])
  }
})

test('dark pixels do not erase coloured edge detail or amplify one hot pixel', () => {
  const sparse = sampleAmbientEdges(image((x, y) => y < 4 && x % 2 === 0 ? [0, 50, 100] : [0, 0, 0]), width, height)[0]
  assert.ok(sparse[2] > 60 && sparse[2] > sparse[1])
  const isolated = sampleAmbientEdges(image((x, y) => x === 32 && y === 0 ? [255, 255, 255] : [0, 0, 0]), width, height)[0]
  assert.ok(isolated[0] < 20)
})

test('smoothing interpolates every edge without inventing hues', () => {
  const previous = Array.from({ length: 4 }, () => [20, 20, 20])
  const next = [[100, 40, 20], [40, 40, 40], [0, 0, 0], [20, 80, 100]]
  assert.deepEqual(smoothAmbientEdges(previous, next), [[40, 25, 20], [25, 25, 25], [15, 15, 15], [20, 35, 40]])
  assert.deepEqual(previous, Array.from({ length: 4 }, () => [20, 20, 20]))
})
