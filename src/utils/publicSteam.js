export const PUBLIC_STEAM_PROFILE = 'https://steamcommunity.com/profiles/76561198324240680/'
export const PUBLIC_STEAM_SOURCE = 'steam-community'
export const PUBLIC_FRESH_MS = 6 * 60 * 60 * 1000

export function validatePublicPlaytime(value, now = Date.now()) {
  const age = now - Date.parse(value?.updatedAt)
  if (value?.schemaVersion !== 1 || value?.appId !== 365670 || value?.steamId !== '76561198324240680' || value?.source !== PUBLIC_STEAM_SOURCE || value?.profileUrl !== PUBLIC_STEAM_PROFILE || value?.precision !== 'displayed-hours' || !Number.isFinite(value?.hours) || value.hours < 0 || value.hours > 10000000 || !Number.isFinite(age) || age < -60000) throw new Error('Invalid public Steam snapshot')
  // Public HTML is rounded by Steam. Never turn it into fictitious exact minutes.
  // An old verified value remains useful, but must keep its real timestamp.
  return { schemaVersion: 1, appId: 365670, steamId: value.steamId, hours: value.hours, source: PUBLIC_STEAM_SOURCE, profileUrl: PUBLIC_STEAM_PROFILE, precision: 'displayed-hours', updatedAt: value.updatedAt, cached: true, stale: age >= PUBLIC_FRESH_MS }
}

export function extractPublicBlender(html, now = Date.now()) {
  if (typeof html !== 'string' || html.length > 2000000) throw new Error('Invalid Steam page')
  const blocks = html.split(/<div\b[^>]*class=["'][^"']*\brecent_game\b[^"']*["'][^>]*>/i).slice(1)
  for (const block of blocks) {
    // Only the capsule link before this block's details can identify the app.
    // Later reviews/comments or other links must not re-label another game's hours.
    const parts = block.split(/<div\b[^>]*class=["']game_info_details["'][^>]*>/i)
    if (parts.length < 2 || !/href=["']https:\/\/steamcommunity\.com\/app\/365670\/?["']/i.test(parts[0])) continue
    const details = parts[1].split(/<\/div>/i)[0]
    const amount = details?.match(/^\s*(\d{1,3}(?:,\d{3})+(?:\.\d)?|\d+(?:\.\d)?)\s+hrs? on record\b/i)?.[1]
    if (!amount) throw new Error('Blender playtime not present')
    return validatePublicPlaytime({ schemaVersion: 1, appId: 365670, steamId: '76561198324240680', hours: Number(amount.replaceAll(',', '')), source: PUBLIC_STEAM_SOURCE, profileUrl: PUBLIC_STEAM_PROFILE, precision: 'displayed-hours', updatedAt: new Date(now).toISOString() }, now)
  }
  throw new Error('Blender not visible in public profile')
}
