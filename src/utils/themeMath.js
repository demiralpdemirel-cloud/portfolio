export function themeSelection(current = 'dark', event) {
  // Navigation, section entry, resize and refresh are not theme actions.
  return event?.type === 'USER_TOGGLE' ? (current === 'dark' ? 'light' : 'dark') : current
}

// x + y = reach is a true 45-degree boundary in physical viewport pixels.
// The triangle deliberately extends past both axes to cover every corner.
export function diagonalClip(width, height, progress) {
  const reach = (width + height + 4) * Math.max(0, Math.min(1, progress))
  return `polygon(0 0, ${reach}px 0, 0 ${reach}px)`
}
