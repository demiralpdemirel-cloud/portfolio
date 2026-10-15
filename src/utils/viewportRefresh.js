// Ignore browser-chrome/keyboard jitter, not genuine width/breakpoint/orientation changes.
// Compare against the last accepted layout, so a substantial height change still refreshes.
export function createViewportRefreshGate(width, height) {
  let accepted = { width, height }
  return (nextWidth, nextHeight, orientation = false) => {
    const breakpointChanged = [600, 1024].some(point => (nextWidth <= point) !== (accepted.width <= point))
    const widthChanged = Math.abs(nextWidth - accepted.width) > 1 || breakpointChanged
    const heightChanged = Math.abs(nextHeight - accepted.height)
    const compact = nextWidth <= 1024 && accepted.width <= 1024
    const needsRefresh = orientation || widthChanged || (heightChanged > 1 && (!compact || heightChanged >= accepted.height * .25))
    if (needsRefresh) accepted = { width: nextWidth, height: nextHeight }
    return needsRefresh
  }
}

export function allowInitialAnchor({ initialized, interacted, initialY, currentY, initialHash, currentHash, modalOpen }) {
  return !initialized && !interacted && !modalOpen && initialY < 10 && Math.abs(currentY - initialY) < 2 && initialHash === currentHash
}
