import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { observeVideoMetadata, prepareVideoSource } from '../src/utils/videoPlayback.js'

test('nearby metadata is one-shot, does not play and cleans up observers', () => {
  const oldWindow = globalThis.window, oldObserver = globalThis.IntersectionObserver
  const observers = []
  class Observer {
    constructor(callback, options) { Object.assign(this, { callback, options, targets: new Set() }); observers.push(this) }
    observe(video) { this.targets.add(video) }
    unobserve(video) { this.targets.delete(video) }
    disconnect() { this.disconnected = true; this.targets.clear() }
  }
  globalThis.window = { IntersectionObserver: Observer }
  globalThis.IntersectionObserver = Observer
  const video = { loads: 0, getAttribute() { return this.src }, setAttribute(_, src) { this.src = src }, load() { this.loads++ } }
  const distant = { ...video }
  let stop, stopDistant
  try {
    stop = observeVideoMetadata(video, '/portfolio/movie.mp4')
    stopDistant = observeVideoMetadata(distant, '/portfolio/distant.mp4')
    assert.equal(observers.length, 1)
    const observer = observers[0]
    assert.equal(observer.options.rootMargin, '1000px 0px')
    observer.callback([{ target: video, isIntersecting: false }])
    assert.equal(video.loads, 0)
    observer.callback([{ target: video, isIntersecting: true }])
    assert.equal(video.preload, 'metadata')
    assert.equal(video.loads, 1)
    assert.equal(distant.loads, 0)
    assert.equal(observer.targets.has(video), false)
    prepareVideoSource(video, '/portfolio/movie.mp4')
    observer.callback([{ target: video, isIntersecting: true }])
    assert.equal(video.loads, 1)
    stop(); stopDistant()
    assert.equal(observer.disconnected, true)
    stop = observeVideoMetadata(video, '/portfolio/next.mp4')
    assert.equal(observers.length, 2)
    stop()
    assert.equal(observers[1].disconnected, true)
  } finally {
    stop?.(); stopDistant?.()
    globalThis.window = oldWindow; globalThis.IntersectionObserver = oldObserver
  }
})

test('XpoMatch published MP4 is faststart, with no old delivery reference', () => {
  const source = readFileSync(new URL('../src/data/xpomatch.js', import.meta.url), 'utf8')
  assert.match(source, /xpomatch-v02-faststart\.mp4/)
  assert.doesNotMatch(source, /xpomatch-v02\.mp4/)
  const bytes = readFileSync(new URL('../public/media/projects/xpomatch/xpomatch-v02-faststart.mp4', import.meta.url))
  const atoms = []
  for (let offset = 0; offset < bytes.length;) {
    const size = bytes.readUInt32BE(offset)
    assert.ok(size >= 8 && offset + size <= bytes.length)
    atoms.push(bytes.toString('ascii', offset + 4, offset + 8))
    offset += size
  }
  assert.ok(atoms.indexOf('moov') < atoms.indexOf('mdat'))
})
