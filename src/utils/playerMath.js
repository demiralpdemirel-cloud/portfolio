export const playbackRates = [.5, .75, 1, 1.25, 1.5, 1.75, 2]
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
export function timeLabel(time) {
  const seconds = Math.max(0, Math.floor(Number.isFinite(time) ? time : 0))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
// Only the outside two rows/columns influence the spill, never the centre.
export function edgeColors(pixels, width, height) {
  return ['top', 'right', 'bottom', 'left'].map(edge => {
    const sums = [0, 0, 0]
    let count = 0
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (!(edge === 'top' ? y < 2 : edge === 'bottom' ? y >= height - 2 : edge === 'left' ? x < 2 : x >= width - 2)) continue
      const offset = (y * width + x) * 4
      sums.forEach((_, channel) => { sums[channel] += pixels[offset + channel] })
      count++
    }
    const averages = sums.map(value => value / count)
    const neutral = averages.reduce((a, b) => a + b, 0) / 3
    return averages.map(value => Math.round((value * .65 + neutral * .35) * .65)).join(' ')
  })
}
