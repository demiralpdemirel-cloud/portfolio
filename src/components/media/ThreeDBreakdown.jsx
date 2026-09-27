import { forwardRef, useImperativeHandle, useRef } from 'react'
import MediaPlaceholder from './MediaPlaceholder'

const ThreeDBreakdown = forwardRef(function ThreeDBreakdown({ stages, placeholder }, ref) {
  const layerRefs = useRef([])
  const labelRefs = useRef([])
  const countRef = useRef(null)
  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      const count = Math.max(stages.length, 1)
      const exact = Math.min(count - 1, Math.max(0, progress * count - 0.18))
      const active = Math.min(count - 1, Math.floor(progress * count))
      layerRefs.current.forEach((layer, index) => {
        const distance = index - exact
        const visible = Math.abs(distance) < 1.05
        layer.style.opacity = visible ? Math.max(0, 1 - Math.abs(distance)) : '0.001'
        layer.style.transform = `translate3d(0, ${distance * 12}%, 0) scale(${1 - Math.min(Math.abs(distance), 1) * 0.025})`
        layer.setAttribute('aria-hidden', String(index !== active))
      })
      labelRefs.current.forEach((label, index) => label.classList.toggle('is-active', index === active))
      if (countRef.current) countRef.current.textContent = `${String(active + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`
    },
  }), [stages.length])
  return <div className="breakdown-stage" data-breakdown-viewport>
    <div className="breakdown-stage__media" data-breakdown-media>
      {stages.map((stage, index) => <div key={stage.label} ref={node => { layerRefs.current[index] = node }} className="breakdown-stage__layer" aria-hidden={index !== 0}>
        <MediaPlaceholder label={stage.label} path={stage.media} placeholder={placeholder} />
      </div>)}
    </div>
    <ol className="stage-list" aria-label="3D breakdown stage">{stages.map((stage, index) => <li key={stage.label} ref={node => { labelRefs.current[index] = node }} className={index === 0 ? 'is-active' : ''}>{stage.label}</li>)}</ol>
    <p ref={countRef} className="breakdown-stage__count" aria-hidden="true">01 / {String(Math.max(stages.length, 1)).padStart(2, '0')}</p>
  </div>
})

export default ThreeDBreakdown
