export const caseStates = Object.freeze({
  idle: { select: 'selected' },
  selected: { hinge: 'opening', cancel: 'closing' },
  opening: { extract: 'extracting', cancel: 'closing' },
  extracting: { expand: 'expanding', cancel: 'closing' },
  expanding: { present: 'open', cancel: 'closing' },
  open: { close: 'closing' },
  closing: { restore: 'idle' },
})
export const nextCaseState = (state, event) => caseStates[state]?.[event] || state

// Endpoints are measured once; only transforms/opacity are animated.
export function caseDestination(box, viewport) {
  const scale = Math.min((viewport.width - 40) / box.width, (viewport.height - 100) / box.height, 1.28)
  return { x: (viewport.width - box.width) / 2 - box.left, y: (viewport.height - box.height) / 2 - box.top, scale: Math.max(.4, scale) }
}
