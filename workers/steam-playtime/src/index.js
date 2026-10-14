export const STEAM_ID = '76561198324240680'
export const APP_ID = 365670
export const FRESH_MS = 10 * 60 * 1000
const KEEP_MS = 24 * 60 * 60 * 1000
const RETRY_MS = 60 * 1000
const inFlight = new Map()

export function extractBlender(payload, now = Date.now()) {
  const games = payload?.response?.games
  if (!Array.isArray(games)) throw new Error('unavailable')
  const app = games.find(game => game.appid === APP_ID)
  // Missing software/privacy is not zero playtime. Accept only explicit minutes.
  if (!app || !Number.isSafeInteger(app.playtime_forever) || app.playtime_forever < 0) throw new Error('unavailable')
  return { appId: APP_ID, minutes: app.playtime_forever, hours: app.playtime_forever / 60, updatedAt: new Date(now).toISOString(), source: 'steam' }
}

export function createHandler({ fetchSteam = fetch, now = Date.now, cacheFor = () => caches.default } = {}) {
  return async function handle(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)
    const cors = origin && allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}
    const reply = (body, status = 200, extra = {}) => new Response(body === null ? null : JSON.stringify(body), {
      status, headers: { ...cors, Vary: 'Origin', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
    })
    if (origin && !allowed.includes(origin)) return reply({ error: 'origin_not_allowed' }, 403)
    if (url.pathname !== '/blender-playtime') return reply({ error: 'not_found' }, 404)
    if (url.search) return reply({ error: 'query_not_allowed' }, 400)
    if (request.method === 'OPTIONS') return reply(null, 204, { 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Accept', 'Access-Control-Max-Age': '600' })
    if (request.method !== 'GET') return reply({ error: 'method_not_allowed' }, 405, { Allow: 'GET, OPTIONS' })
    // Fail closed if production bindings/secrets are missing. Never expose details.
    if (!env.STEAM_API_KEY || !env.CLIENT_LIMITER || !env.STEAM_LIMITER) return reply({ error: 'steam_unavailable' }, 503)
    try {
      const client = request.headers.get('CF-Connecting-IP') || 'anonymous'
      if (!(await env.CLIENT_LIMITER.limit({ key: client })).success) return reply({ error: 'rate_limited' }, 429, { 'Retry-After': '60' })
      const cache = cacheFor()
      const cacheKey = new Request(`${url.origin}/__cache/blender-v1`)
      const stamp = now()
      const saved = await cache.match(cacheKey)
      const record = saved ? await saved.json() : null
      const age = record?.value ? stamp - Date.parse(record.value.updatedAt) : Infinity
      const retained = age >= 0 && age < KEEP_MS ? record?.value : null
      const responseFor = (value, cached, stale) => reply({ ...value, cached, stale })
      if (retained && age < FRESH_MS) return responseFor(retained, true, false)
      if (record && stamp - record.lastAttemptAt < RETRY_MS) return retained ? responseFor(retained, true, true) : reply({ error: 'steam_unavailable' }, 503)
      // Coalesce simultaneous misses within an isolate; limiter also gates misses
      // from other isolates in this location. Cache is shared per data center.
      const key = cacheKey.url
      let pending = inFlight.get(key)
      if (!pending) {
        pending = (async () => {
          if (!(await env.STEAM_LIMITER.limit({ key: 'fixed-blender-account' })).success) return null
          let value = null
          try {
            const api = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/')
            api.searchParams.set('key', env.STEAM_API_KEY)
            api.searchParams.set('input_json', JSON.stringify({ steamid: STEAM_ID, include_played_free_games: true, include_appinfo: true, appids_filter: [APP_ID] }))
            const result = await fetchSteam(api, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000), redirect: 'error' })
            if (!result.ok) throw new Error('unavailable')
            value = extractBlender(await result.json(), now())
          } catch { /* No logging of URLs, upstream bodies, keys or exceptions. */ }
          await cache.put(cacheKey, new Response(JSON.stringify({ value: value || retained, lastAttemptAt: now() }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' } }))
          return value
        })().finally(() => inFlight.delete(key))
        inFlight.set(key, pending)
      }
      const value = await pending
      return value ? responseFor(value, false, false) : retained ? responseFor(retained, true, true) : reply({ error: 'steam_unavailable' }, 503)
    } catch { return reply({ error: 'steam_unavailable' }, 503) }
  }
}

export default { fetch: createHandler() }
