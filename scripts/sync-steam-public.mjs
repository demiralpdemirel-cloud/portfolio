import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { extractPublicBlender, validatePublicPlaytime, PUBLIC_STEAM_PROFILE } from '../src/utils/publicSteam.js'

const destination = new URL('../public/data/steam-blender.json', import.meta.url)
let lastGood
const remember = value => {
  const valid = validatePublicPlaytime(value)
  if (!lastGood || Date.parse(valid.updatedAt) > Date.parse(lastGood.updatedAt)) lastGood = valid
}
try { remember(JSON.parse(await readFile(destination, 'utf8'))) } catch { /* First setup has no snapshot. */ }
// A scheduled Pages build carries forward the last deployed observation even
// though scheduled data updates do not create repository commits.
try {
  const response = await fetch('https://demiralpdemirel-cloud.github.io/portfolio/data/steam-blender.json', { signal: AbortSignal.timeout(10000), redirect: 'error' })
  if (response.ok) remember(await response.json())
} catch { /* Local verified snapshot remains available. */ }
let fresh = false
try {
  const response = await fetch(PUBLIC_STEAM_PROFILE + '?l=english', { signal: AbortSignal.timeout(15000), redirect: 'error', headers: { Accept: 'text/html', 'User-Agent': 'PortfolioPublicPlaytime/1.0 (public profile observation)' } })
  if (!response.ok) throw new Error('Steam unavailable')
  const declared = Number(response.headers.get('content-length'))
  if (declared > 2000000) throw new Error('Oversize page')
  remember(extractPublicBlender(await response.text()))
  fresh = true
} catch {
  // Do not turn sign-in pages, missing recent activity, privacy changes or
  // temporary upstream failures into zero; preserve the last genuine reading.
  if (!lastGood) throw new Error('No verified public Blender reading available')
}
await mkdir(new URL('.', destination), { recursive: true })
await writeFile(destination, JSON.stringify(lastGood, null, 2) + '\n')
console.log(JSON.stringify({ source: 'public-steam-profile', fresh, hours: lastGood.hours, observedAt: lastGood.updatedAt, file: fileURLToPath(destination) }))
