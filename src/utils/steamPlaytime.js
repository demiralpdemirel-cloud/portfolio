export const STEAM_PROFILE = 'https://steamcommunity.com/profiles/76561198324240680/'
export const PLAYTIME_TTL = 600000
export const LAST_GOOD_TTL = 86400000

export function validatePlaytime(value, now = Date.now()) {
  if (value?.source === PUBLIC_STEAM_SOURCE) return validatePublicPlaytime(value, now)
  const age = now - Date.parse(value?.updatedAt)
  if (value?.appId !== 365670 || value?.source !== 'steam' || !Number.isSafeInteger(value.minutes) || value.minutes < 0 || !Number.isFinite(value.hours) || Math.abs(value.hours - value.minutes / 60) > 0.000001 || !Number.isFinite(age) || age < -60000 || age > LAST_GOOD_TTL || typeof value.cached !== 'boolean' || typeof value.stale !== 'boolean') throw new Error('Invalid Steam response')
  return { appId: 365670, minutes: value.minutes, hours: value.minutes / 60, updatedAt: value.updatedAt, source: 'steam', cached: value.cached, stale: value.stale || age >= PLAYTIME_TTL }
}

export function endpointURL(raw) {
  if (!raw) return null
  try {
    const url = new URL(raw)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash || url.pathname !== '/blender-playtime') return null
    return url.href
  } catch { return null }
}

export const hoursFormatter = (language, roundedPublic = false) => new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: roundedPublic ? 0 : 1, maximumFractionDigits: 1 })

export async function requestPlaytime(endpoint, fetcher = fetch) {
  const result = await fetcher(endpoint, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } })
  if (!result.ok) throw new Error('Steam unavailable')
  return validatePlaytime(await result.json())
}

// One request per page lifetime (including React StrictMode and language renders).
// A browser reload recreates the module and checks the endpoint again.
let pageRequest
export function loadPlaytime(endpoint) {
  if (!pageRequest) pageRequest = requestPlaytime(endpoint)
  return pageRequest
}
import { validatePublicPlaytime, PUBLIC_STEAM_SOURCE } from './publicSteam.js'
