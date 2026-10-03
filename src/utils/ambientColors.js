export const ambientEdges = ['top', 'right', 'bottom', 'left']

// The visual CORS path uses the same outer bands without reading their pixels.
export function ambientEdgeCrop(edge, width, height) {
  const bandX = Math.max(1, Math.round(width * .08))
  const bandY = Math.max(1, Math.round(height * .08))
  if (edge === 'top') return [0, 0, width, bandY]
  if (edge === 'right') return [width - bandX, 0, bandX, height]
  if (edge === 'bottom') return [0, height - bandY, width, bandY]
  return [0, 0, bandX, height]
}

// Black backgrounds must not dilute visible edge detail into a black average.
export function sampleAmbientEdges(pixels, width, height) {
  const bandX = Math.max(2, Math.round(width * .12))
  const bandY = Math.max(2, Math.round(height * .12))
  return ambientEdges.map(edge => {
    const sum = [0, 0, 0]
    let weightSum = 0, lit = 0, count = 0
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (!(edge === 'top' ? y < bandY : edge === 'bottom' ? y >= height - bandY : edge === 'left' ? x < bandX : x >= width - bandX)) continue
      count++
      const offset = (y * width + x) * 4
      const rgb = [pixels[offset], pixels[offset + 1], pixels[offset + 2]]
      const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
      if (luminance <= 2) continue
      const max = Math.max(...rgb), saturation = (max - Math.min(...rgb)) / Math.max(1, max)
      const weight = Math.sqrt(luminance / 255) * (1 + saturation * .75)
      rgb.forEach((value, channel) => { sum[channel] += value * weight })
      weightSum += weight; lit++
    }
    if (!weightSum) return [0, 0, 0]
    const rgb = sum.map(value => value / weightSum)
    const neutral = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
    // Modest exposure lift preserves hue; true black stays black. Coverage
    // weighting prevents an isolated highlight from lighting the entire edge.
    const exposure = (1 + .7 * (1 - Math.min(1, neutral / 128))) * Math.sqrt(lit / count)
    return rgb.map(value => Math.min(255, (value * .92 + neutral * .08) * exposure))
  })
}

export function smoothAmbientEdges(previous, sampled, amount = .25) {
  return sampled.map((rgb, edge) => rgb.map((value, channel) => previous[edge][channel] * (1 - amount) + value * amount))
}
