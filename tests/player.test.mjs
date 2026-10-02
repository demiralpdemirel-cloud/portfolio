import test from 'node:test'
import assert from 'node:assert/strict'
import { playbackRates, clamp, timeLabel, edgeColors } from '../src/utils/playerMath.js'
test('time, seek boundaries and speed choices', () => {
  assert.equal(timeLabel(68.9), '1:08')
  assert.equal(timeLabel(Infinity), '0:00')
  assert.equal(clamp(-5, 0, 30), 0)
  assert.equal(clamp(40, 0, 30), 30)
  assert.deepEqual(playbackRates, [.5, .75, 1, 1.25, 1.5, 1.75, 2])
})
test('ambient ignores centre pixels and dims/desaturates edge light', () => {
  const pixels = new Uint8ClampedArray(32 * 18 * 4)
  for (let y = 2; y < 16; y++) for (let x = 2; x < 30; x++) pixels.set([255, 255, 255, 255], (y * 32 + x) * 4)
  assert.deepEqual(edgeColors(pixels, 32, 18), ['0 0 0', '0 0 0', '0 0 0', '0 0 0'])
  for (let i = 0; i < pixels.length; i += 4) pixels.set([255, 0, 0, 255], i)
  assert.equal(edgeColors(pixels, 32, 18)[0], '127 19 19')
})
