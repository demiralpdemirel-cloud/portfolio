export function themeSelection(current = 'dark', event) {
  // Navigation, section entry, resize and refresh are not theme actions.
  return event?.type === 'USER_TOGGLE' ? (current === 'dark' ? 'light' : 'dark') : current
}

// x + y = reach is a true 45-degree boundary in physical viewport pixels.
// The triangle deliberately extends past both axes to cover every corner.
export function diagonalClip(width, height, progress) {
  const reach = themeBoundary(width, height, progress)
  return `polygon(0 0, ${reach}px 0, 0 ${reach}px)`
}

export function themeBoundary(width, height, progress) {
  return ribbonGeometry(width, height).reach * Math.max(0, Math.min(1, progress))
}

export function ribbonGeometry(width, height, showcase = false) {
  const reach = width + height + 4
  const bandOffset = showcase ? Math.min(220, Math.min(width, height) * .21) * Math.SQRT2 : 0
  return { reach, bandOffset, travel: reach + bandOffset, length: Math.hypot(width, height) * 2 + 128, thickness: width < 600 ? 10 : 14 }
}

export function showcaseBoundaries(width, height, progress) {
  const { travel, bandOffset } = ribbonGeometry(width, height, true)
  const front = travel * Math.max(0, Math.min(1, progress))
  return { front, back: front - bandOffset }
}

// Same cubic-bezier(.65,0,.25,1) as the snapshot reveal. Invert its time axis
// once when constructing particles, never during a frame.
export function themeSweepProgress(time) {
  const cubic = (a, b, t) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3
  let lo = 0, hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (cubic(.65, .25, mid) < time) lo = mid; else hi = mid
  }
  return cubic(0, 1, (lo + hi) / 2)
}

// Inverse of the master easing, used only to schedule boundary-born particles.
function themeSweepTime(progress) {
  let lo = 0, hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (themeSweepProgress(mid) < progress) lo = mid; else hi = mid
  }
  return (lo + hi) / 2
}

export function ribbonParticles(width, height, showcase = false, duration = 900) {
  const count = width < 600 ? 26 : width < 1000 ? 44 : 64
  const perWave = width < 600 ? 4 : width < 1000 ? 6 : 8
  const waves = Math.ceil(count / perWave)
  return Array.from({ length: count }, (_, i) => {
    const slot = i % perWave, wave = Math.floor(i / perWave)
    // Stratified jitter covers every visible ribbon region at each emission wave.
    const jitter = ((i * 17 + 7) % 37) / 37
    let delay = (115 + wave / (waves - 1) * 530 + jitter * 12) * duration / 900
    const boundary = themeBoundary(width, height, themeSweepProgress(delay / duration))
    const minX = Math.max(0, boundary - height), maxX = Math.min(width, boundary)
    const along = (slot + .15 + jitter * .7) / perWave
    const x = minX + (maxX - minX) * along, y = boundary - x
    const lateral = (along - .5) * 46, drift = 18 + i % 5 * 9
    const kind = i % 20
    const returning = showcase && i % 5 >= 3
    if (showcase) {
      const { travel, bandOffset } = ribbonGeometry(width, height, true)
      delay = duration * themeSweepTime((boundary + (returning ? bandOffset : 0)) / travel)
    }
    return { x, y, dx: -drift + lateral, dy: -drift - lateral, delay, returning, life: 350 + i % 8 * 70, size: kind < 12 ? 1 + i % 2 * .5 : kind < 17 ? 2 + i % 2 : 1.5, streak: kind >= 17 }
  })
}
