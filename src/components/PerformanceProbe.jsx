import { useEffect, useRef, useState } from 'react'
export default function PerformanceProbe() {
  const output = useRef(null),
    frame = useRef(0),
    observer = useRef(null),
    [busy, setBusy] = useState(false)
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      observer.current?.disconnect()
    },
    [],
  )
  if (!new URLSearchParams(location.search).has('qa')) return null
  const measure = () => {
    if (busy) return
    setBusy(true)
    const samples = [],
      start = performance.now()
    let previous = start,
      longTasks = 0
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      observer.current = new PerformanceObserver((list) => {
        longTasks += list.getEntries().length
      })
      observer.current.observe({ type: 'longtask', buffered: false })
    }
    const tick = (now) => {
      samples.push(now - previous)
      previous = now
      if (now - start < 8000) {
        frame.current = requestAnimationFrame(tick)
        return
      }
      observer.current?.disconnect()
      samples.sort((a, b) => a - b)
      output.current.textContent = JSON.stringify(
        {
          label: 'RAF cadence, not GPU-rendered FPS',
          samples: samples.length,
          meanMs: +(
            samples.reduce((a, b) => a + b, 0) / samples.length
          ).toFixed(2),
          p95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(2),
          over25ms: samples.filter((n) => n > 25).length,
          longTasks50ms: longTasks,
        },
        null,
        2,
      )
      setBusy(false)
    }
    frame.current = requestAnimationFrame(tick)
  }
  return (
    <aside className="scroll-probe">
      <button type="button" onClick={measure} disabled={busy}>
        {busy ? 'Measuring' : 'Measure 8s / QA only'}
      </button>
      <pre ref={output} />
    </aside>
  )
}
