import { forwardRef, useImperativeHandle, useRef } from 'react'
import MediaPlaceholder from './MediaPlaceholder'

const BeforeAfter = forwardRef(function BeforeAfter({ data, placeholder }, ref) {
  const finalRef = useRef(null)
  const splitRef = useRef(null)
  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      const reveal = Math.max(0, Math.min(100, (progress - 0.28) * 142))
      if (finalRef.current) finalRef.current.style.clipPath = `inset(0 ${100 - reveal}% 0 0)`
      if (splitRef.current) splitRef.current.style.left = `${reveal}%`
    },
  }), [])
  return <div className="before-after">
    <MediaPlaceholder label="ORIGINAL PLATE" path={data.before} variant="media-placeholder--plate" placeholder={placeholder} />
    <div ref={finalRef} className="before-after__final"><MediaPlaceholder label="FINAL COMPOSITE" path={data.after} variant="media-placeholder--final" placeholder={placeholder} /></div>
    <div ref={splitRef} className="before-after__split" aria-hidden="true" />
  </div>
})

export default BeforeAfter
