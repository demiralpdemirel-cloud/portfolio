export function convertAmbientYuv(bytes, positions, layout, format, matrix, fullRange, output) {
  const scale = fullRange ? 1 : 255 / 219, offset = fullRange ? 0 : 16
  const chroma = fullRange ? 1 : 255 / 224
  const kr = matrix === 'bt709' ? .2126 : matrix === 'bt2020-ncl' ? .2627 : .299
  const kb = matrix === 'bt709' ? .0722 : matrix === 'bt2020-ncl' ? .0593 : .114
  const kg = 1 - kr - kb
  for (let i = 0; i < positions.length; i += 2) {
    const x = positions[i], y = positions[i + 1], cx = x >> 1, cy = y >> 1
    const luminance = (bytes[layout[0].offset + y * layout[0].stride + x] - offset) * scale
    const u = (bytes[layout[1].offset + cy * layout[1].stride + (format === 'NV12' ? cx * 2 : cx)] - 128) * chroma
    const v = (bytes[format === 'NV12' ? layout[1].offset + cy * layout[1].stride + cx * 2 + 1 : layout[2].offset + cy * layout[2].stride + cx] - 128) * chroma
    const target = i * 2
    output[target] = luminance + 2 * (1 - kr) * v
    output[target + 1] = luminance - 2 * kb * (1 - kb) / kg * u - 2 * kr * (1 - kr) / kg * v
    output[target + 2] = luminance + 2 * (1 - kb) * u
    output[target + 3] = 255
  }
}

export function createNativeAmbientSampler(width, height) {
  if (typeof VideoFrame === 'undefined') return null
  let bytes = null, positions = null, dimensions = ''
  const output = new Uint8ClampedArray(width * height * 4)
  return {
    async sample(video) {
      // VideoFrame enforces origin security: tainted media cannot enter this
      // pixel-readable path. It reuses the decoder's native planes, not a new
      // decoder. Copy bytes once; analyse only the small downsampled buffer.
      const frame = new VideoFrame(video, { timestamp: Math.round(video.currentTime * 1e6) })
      try {
        if (!['I420', 'I420A', 'NV12'].includes(frame.format) || frame.rotation || frame.flip) return null
        const w = frame.visibleRect.width, h = frame.visibleRect.height
        const key = `${w}/${h}/${frame.format}`
        if (dimensions !== key) {
          dimensions = key; bytes = new Uint8Array(frame.allocationSize())
          positions = new Uint32Array(width * height * 2)
          for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 2
            positions[index] = Math.min(w - 1, Math.floor((x + .5) * w / width))
            positions[index + 1] = Math.min(h - 1, Math.floor((y + .5) * h / height))
          }
        }
        const layout = await frame.copyTo(bytes)
        convertAmbientYuv(bytes, positions, layout, frame.format, frame.colorSpace.matrix, frame.colorSpace.fullRange, output)
        return output
      } finally { frame.close() }
    },
    dispose() { bytes = null; positions = null; dimensions = '' },
  }
}
