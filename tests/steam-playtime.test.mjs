import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHandler, extractBlender, APP_ID, FRESH_MS, STEAM_ID } from '../workers/steam-playtime/src/index.js'
import { endpointURL, validatePlaytime, requestPlaytime, hoursFormatter, LAST_GOOD_TTL } from '../src/utils/steamPlaytime.js'
import { translate } from '../src/i18n/translations.js'

// Synthetic fixtures only, never site content or a claimed real Steam reading.
const stamp = Date.parse('2026-10-14T10:00:00Z')
const fixture = minutes => ({ response: { games: [{ appid: APP_ID, playtime_forever: minutes }] } })
const snapshot = (minutes = 123, now = stamp) => ({ ...extractBlender(fixture(minutes), now), cached: false, stale: false })
const pass = { limit: async () => ({ success: true }) }
const env = { STEAM_API_KEY: 'unit-test-sentinel-not-a-real-key', ALLOWED_ORIGINS: 'https://demiralpdemirel-cloud.github.io', CLIENT_LIMITER: pass, STEAM_LIMITER: pass }
const req = (suffix = '', init = {}) => new Request(`https://unit.example/blender-playtime${suffix}`, { headers: { Origin: env.ALLOWED_ORIGINS }, ...init })

function setup() {
  let time = stamp
  let calls = 0
  let upstream = async () => Response.json(fixture(123))
  const entries = new Map()
  const cache = { match: async key => entries.get(key.url)?.clone(), put: async (key, value) => { entries.set(key.url, value.clone()) } }
  const handle = createHandler({ now: () => time, cacheFor: () => cache, fetchSteam: async (...args) => { calls++; return upstream(...args) } })
  return { handle, calls: () => calls, advance: ms => { time += ms }, upstream: next => { upstream = next } }
}

test('explicit Blender record converts minutes to fractional hours without rounding source', () => {
  assert.equal(extractBlender(fixture(123), stamp).hours, 2.05)
  assert.equal(extractBlender(fixture(0), stamp).minutes, 0)
})

test('missing software/private/empty/malformed payload is not interpreted as zero', () => {
  for (const payload of [{}, { response: {} }, { response: { games: [] } }, { response: { games: [{ appid: 999, playtime_forever: 100 }] } }]) assert.throws(() => extractBlender(payload))
  for (const minutes of [-1, 1.2, '120', null, undefined, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => extractBlender(fixture(minutes)))
})

test('owned-games query is fixed, includes free software and only returns minimal fields', async () => {
  const s = setup()
  s.upstream(async (url, options) => {
    assert.equal(url.hostname, 'api.steampowered.com')
    assert.equal(url.searchParams.get('key'), env.STEAM_API_KEY)
    assert.deepEqual(JSON.parse(url.searchParams.get('input_json')), { steamid: STEAM_ID, include_played_free_games: true, include_appinfo: true, appids_filter: [APP_ID] })
    assert.equal(options.redirect, 'error')
    return Response.json(fixture(123))
  })
  const result = await s.handle(req(), env)
  assert.equal(result.status, 200)
  const body = await result.json()
  assert.deepEqual(Object.keys(body).sort(), ['appId', 'cached', 'hours', 'minutes', 'source', 'stale', 'updatedAt'])
  assert.equal(body.cached, false)
  assert.equal(JSON.stringify(body).includes(env.STEAM_API_KEY), false)
})

test('ten-minute shared cache avoids one Steam call per visitor and refreshes at expiration', async () => {
  const s = setup()
  await s.handle(req(), env)
  s.advance(FRESH_MS - 1)
  assert.equal((await (await s.handle(req(), env)).json()).cached, true)
  assert.equal(s.calls(), 1)
  s.advance(1)
  await s.handle(req(), env)
  assert.equal(s.calls(), 2)
})

test('simultaneous cache misses coalesce into one upstream request', async () => {
  const s = setup()
  const results = await Promise.all(Array.from({ length: 12 }, () => s.handle(req(), env)))
  assert.equal(s.calls(), 1)
  assert.ok(results.every(result => result.status === 200))
})

test('Steam failure returns stale verified data with original timestamp, never fresh fiction', async () => {
  const s = setup()
  await s.handle(req(), env)
  s.advance(FRESH_MS)
  s.upstream(async () => { throw new Error(`do-not-leak-${env.STEAM_API_KEY}`) })
  const result = await (await s.handle(req(), env)).json()
  assert.equal(result.stale, true)
  assert.equal(result.cached, true)
  assert.equal(result.updatedAt, new Date(stamp).toISOString())
  assert.equal(result.minutes, 123)
  await s.handle(req(), env)
  assert.equal(s.calls(), 2)
})

test('first failure and missing Blender produce safe unavailable, with negative cache', async () => {
  for (const response of [() => new Response('private-upstream-body', { status: 401 }), () => Response.json({ response: { games: [] } }), () => new Response('not-json')]) {
    const s = setup()
    s.upstream(async () => response())
    const result = await s.handle(req(), env)
    assert.equal(result.status, 503)
    assert.deepEqual(await result.json(), { error: 'steam_unavailable' })
    await s.handle(req(), env)
    assert.equal(s.calls(), 1)
  }
})

test('old cache beyond 24h is not served', async () => {
  const s = setup()
  await s.handle(req(), env)
  s.advance(LAST_GOOD_TTL + 1)
  s.upstream(async () => new Response('', { status: 500 }))
  assert.equal((await s.handle(req(), env)).status, 503)
})

test('read-only endpoint rejects account overrides, query cache-busting, other paths and writes', async () => {
  const s = setup()
  for (const suffix of ['?steamid=someone', '?appId=1', '?v=1']) assert.equal((await s.handle(req(suffix), env)).status, 400)
  assert.equal((await s.handle(new Request('https://unit.example/other'), env)).status, 404)
  for (const method of ['POST', 'PUT', 'DELETE', 'HEAD']) assert.equal((await s.handle(req('', { method }), env)).status, 405)
  assert.equal(s.calls(), 0)
})

test('CORS is exact allowlist, varies by origin, and responses cannot browser-cache stale state', async () => {
  const s = setup()
  const result = await s.handle(req(), env)
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), env.ALLOWED_ORIGINS)
  assert.equal(result.headers.get('Vary'), 'Origin')
  assert.equal(result.headers.get('Cache-Control'), 'no-store')
  const blocked = await s.handle(req('', { headers: { Origin: `${env.ALLOWED_ORIGINS}.evil.example` } }), env)
  assert.equal(blocked.status, 403)
  assert.equal(blocked.headers.has('Access-Control-Allow-Origin'), false)
  assert.equal((await s.handle(req('', { method: 'OPTIONS' }), env)).status, 204)
})

test('missing secret/bindings fail closed without outgoing requests', async () => {
  for (const key of ['STEAM_API_KEY', 'CLIENT_LIMITER', 'STEAM_LIMITER']) {
    const s = setup()
    assert.equal((await s.handle(req(), { ...env, [key]: undefined })).status, 503)
    assert.equal(s.calls(), 0)
  }
})

test('client and upstream limits prevent abuse without leaking Steam data', async () => {
  const s = setup()
  const deny = { limit: async () => ({ success: false }) }
  assert.equal((await s.handle(req(), { ...env, CLIENT_LIMITER: deny })).status, 429)
  assert.equal((await s.handle(req(), { ...env, STEAM_LIMITER: deny })).status, 503)
  assert.equal(s.calls(), 0)
})

test('frontend verifies app, source, integer minutes, hours consistency, timestamp and freshness', () => {
  assert.equal(validatePlaytime(snapshot(), stamp).hours, 2.05)
  assert.equal(validatePlaytime(snapshot(), stamp + FRESH_MS).stale, true)
  for (const patch of [{ appId: 1 }, { source: 'example' }, { minutes: -1 }, { minutes: '123' }, { hours: 99 }, { updatedAt: 'bad' }, { cached: undefined }, { stale: undefined }]) assert.throws(() => validatePlaytime({ ...snapshot(), ...patch }, stamp))
  assert.throws(() => validatePlaytime(snapshot(), stamp + LAST_GOOD_TTL + 1))
  assert.throws(() => validatePlaytime(snapshot(), stamp - 60001))
})

test('public endpoint configuration rejects credentials, insecure remote URLs and overrides', () => {
  assert.equal(endpointURL('https://worker.example/blender-playtime'), 'https://worker.example/blender-playtime')
  assert.ok(endpointURL('http://127.0.0.1:8787/blender-playtime'))
  for (const url of ['', 'bad', 'http://worker.example/blender-playtime', 'https://key:secret@worker.example/blender-playtime', 'https://worker.example/blender-playtime?key=secret', 'https://worker.example/blender-playtime#x', 'https://worker.example/other']) assert.equal(endpointURL(url), null)
})

test('frontend fetch is credentialless, no-store, bounded and rejects unavailable', async () => {
  await assert.rejects(requestPlaytime('https://worker.example/blender-playtime', async (_url, options) => {
    assert.equal(options.cache, 'no-store')
    assert.equal(options.credentials, 'omit')
    assert.equal(options.referrerPolicy, 'no-referrer')
    assert.ok(options.signal)
    return new Response('', { status: 503 })
  }))
  await assert.rejects(requestPlaytime('https://worker.example/blender-playtime', async () => Response.json({ appId: 1 })))
})

test('localized hours use locale separators and all operational UI states are translated', () => {
  assert.equal(hoursFormatter('tr').format(1234.5), '1.234,5')
  assert.equal(hoursFormatter('en').format(1234.5), '1,234.5')
  for (const copy of ['HOURS', 'Steam Recorded Playtime', 'Steam playtime unavailable', 'STEAM SYNCED', 'Last synced', 'Last updated', 'Steam profile', 'Checking Steam playtime…', 'Cached playtime — Steam sync unavailable']) assert.notEqual(translate(copy, 'tr'), copy)
})

test('integration has no hardcoded playtime, per-frame React writes, scroll restart or secret config', () => {
  const ui = readFileSync(new URL('../src/components/SteamPlaytime.jsx', import.meta.url), 'utf8')
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const profile = readFileSync(new URL('../src/data/professionalProfile.js', import.meta.url), 'utf8')
  assert.match(app, /<SteamPlaytime \/>/)
  assert.doesNotMatch(profile, /hours:|3914/)
  assert.match(ui, /duration: 1.05/)
  assert.match(ui, /prefers-reduced-motion/)
  assert.match(ui, /observer.disconnect\(\); animate/)
  assert.doesNotMatch(ui, /STEAM_API_KEY|onUpdate:\s*set|addEventListener\(['"]scroll/)
  const ignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8')
  assert.match(ignore, /\.dev.vars/)
  assert.match(ignore, /\.wrangler\//)
})
