export const zoneCounts = { top: 16, right: 10, bottom: 16, left: 10 }

export function createAmbientZoneMap(width, height) {
  const bandX = Math.max(1, Math.round(width * .08)), bandY = Math.max(1, Math.round(height * .08))
  return Object.entries(zoneCounts).map(([edge, count]) => {
    const horizontal = edge === 'top' || edge === 'bottom'
    const length = horizontal ? width : height
    const zones = Array.from({ length: count }, (_, index) => {
      const start = Math.floor(index * length / count), end = Math.floor((index + 1) * length / count)
      const offsets = []
      const x0 = horizontal ? start : edge === 'left' ? 0 : width - bandX
      const x1 = horizontal ? end : x0 + bandX
      const y0 = horizontal ? edge === 'top' ? 0 : height - bandY : start
      const y1 = horizontal ? y0 + bandY : end
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) offsets.push((y * width + x) * 4)
      return Uint32Array.from(offsets)
    })
    return { edge, zones }
  })
}

export function sampleAmbientZones(pixels, mapping) {
  return mapping.map(({ zones }) => zones.map(offsets => {
    let red = 0, green = 0, blue = 0, weights = 0, lit = 0
    for (const offset of offsets) {
      const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2]
      const luminance = r * .2126 + g * .7152 + b * .0722
      if (luminance <= 1) continue
      const max = Math.max(r, g, b), saturation = (max - Math.min(r, g, b)) / Math.max(1, max)
      const weight = Math.sqrt(luminance / 255) * (1 + saturation * .75)
      red += r * weight; green += g * weight; blue += b * weight; weights += weight; lit++
    }
    if (!weights) return [0, 0, 0]
    const rgb = [red / weights, green / weights, blue / weights]
    const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
    const threshold = Math.min(1, luminance / 8)
    const intensity = threshold * threshold * (3 - 2 * threshold) * Math.sqrt(lit / offsets.length)
    const exposure = (1 + .6 * (1 - Math.min(1, luminance / 128))) * intensity
    return rgb.map(value => Math.min(255, value * exposure))
  }))
}

export function smoothAmbientZones(previous, sampled, elapsedMs = 1000 / 24) {
  return sampled.map((zones, edge) => zones.map((rgb, index) => {
    const before = previous[edge][index]
    const luminance = c => c[0] * .2126 + c[1] * .7152 + c[2] * .0722
    const base = luminance(rgb) >= luminance(before) ? .7 : .35
    const amount = 1 - Math.pow(1 - base, Math.min(100, elapsedMs) / (1000 / 24))
    return rgb.map((value, channel) => before[channel] + (value - before[channel]) * amount)
  }))
}

export function interpolateAmbientZones(zones, output) {
  // Cached one-pixel-wide edge surfaces interpolate between LED centres.
  // Only immediate neighbours contribute; colour cannot flood an entire edge.
  for (let pixel = 0; pixel < output.length / 4; pixel++) {
    const position = (pixel + .5) / (output.length / 4) * zones.length - .5
    const low = Math.floor(position), fraction = position - low
    for (let channel = 0; channel < 3; channel++) {
      const local = index => {
        const i = Math.max(0, Math.min(zones.length - 1, index))
        return zones[i][channel] * .84 + zones[Math.max(0, i - 1)][channel] * .08 + zones[Math.min(zones.length - 1, i + 1)][channel] * .08
      }
      output[pixel * 4 + channel] = local(low) * (1 - fraction) + local(low + 1) * fraction
    }
    output[pixel * 4 + 3] = 255
  }
}
