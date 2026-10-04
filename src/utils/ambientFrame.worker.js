// Downsample on the worker before GPU readback. Never copy full HD YUV planes.
let canvas, context
self.onmessage = ({ data: { frame, width, height } }) => {
  try {
    if (!canvas || canvas.width !== width || canvas.height !== height) {
      canvas = new OffscreenCanvas(width, height)
      context = canvas.getContext('2d', { willReadFrequently: true })
      context.imageSmoothingEnabled = false
    }
    const started = performance.now()
    context.drawImage(frame, 0, 0, width, height)
    const pixels = context.getImageData(0, 0, width, height).data
    self.postMessage({ pixels, captureMs: performance.now() - started }, [pixels.buffer])
  } catch (error) {
    self.postMessage({ error: { name: error.name, message: error.message } })
  } finally { frame.close() }
}
