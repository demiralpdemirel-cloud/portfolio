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
  if (typeof VideoFrame === 'undefined' || typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return null
  let worker
  try { worker = new Worker(new URL('./ambientFrame.worker.js', import.meta.url), { type: 'module' }) }
  catch { return null }
  let pending = null, disposed = false
  const fail = error => { pending?.reject(error); pending = null }
  worker.onerror = () => fail(new Error('Ambient worker unavailable'))
  worker.onmessage = ({ data }) => {
    if (!pending) return
    if (data.error) { const error = new Error(data.error.message); error.name = data.error.name; fail(error); return }
    pending.resolve(data.pixels); pending = null
  }
  return {
    sample(video) {
      if (disposed || pending) return Promise.reject(new Error('Ambient sampler unavailable'))
      // Origin security is checked once on the existing decoded frame. Tainted
      // sources switch permanently to the shared visual strip path in the hook.
      const frame = new VideoFrame(video, { timestamp: Math.round(video.currentTime * 1e6) })
      return new Promise((resolve, reject) => {
        pending = { resolve, reject }
        try { worker.postMessage({ frame, width, height }, [frame]) }
        catch (error) { frame.close(); fail(error) }
      })
    },
    dispose() { disposed = true; worker.terminate(); fail(new Error('Ambient sampler stopped')) },
  }
}
