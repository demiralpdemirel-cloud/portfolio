import { useEffect, useRef } from 'react'
import { assetPath } from '../../utils/assetPath'

export default function ImageSequenceCanvas({ config, progress=0, label='IMAGE SEQUENCE', enabled=true }) {
  const canvasRef=useRef(null), cacheRef=useRef(new Map())
  const frame=Math.min(config.frameCount-1,Math.max(0,Math.round(progress*(config.frameCount-1))))
  useEffect(()=>{
    const canvas=canvasRef.current, context=canvas.getContext('2d'), ratio=Math.min(window.devicePixelRatio||1,2), rect=canvas.getBoundingClientRect()
    canvas.width=Math.max(1,Math.floor(rect.width*ratio)); canvas.height=Math.max(1,Math.floor(rect.height*ratio)); context.setTransform(ratio,0,0,ratio,0,0)
    const drawFallback=()=>{ const w=rect.width,h=rect.height; context.fillStyle='#11110f';context.fillRect(0,0,w,h);context.strokeStyle='#34342f';context.lineWidth=1;const inset=24+progress*Math.min(w,h)*.18;context.strokeRect(inset,inset,w-inset*2,h-inset*2);context.beginPath();context.moveTo(0,h*progress);context.lineTo(w,h*(1-progress));context.stroke();context.fillStyle='#8c8c84';context.font='11px Space Mono, monospace';context.fillText(`${label} / ${String(frame+1).padStart(config.zeroPadding,'0')}`,24,h-24) }
    const drawImage=image=>{ const scale=Math.max(rect.width/image.width,rect.height/image.height),width=image.width*scale,height=image.height*scale;context.drawImage(image,(rect.width-width)/2,(rect.height-height)/2,width,height) }
    const load=index=>{ if(index<0||index>=config.frameCount||cacheRef.current.has(index))return;const image=new Image();cacheRef.current.set(index,image);image.onload=()=>{if(index===frame)drawImage(image)};image.onerror=()=>{cacheRef.current.delete(index);if(index===frame)drawFallback()};const file=String(index+1).padStart(config.zeroPadding,'0');image.src=assetPath(`${config.path}/${file}.${config.extension}`) }
    const current=cacheRef.current.get(frame);if(current?.complete&&current.naturalWidth)drawImage(current);else drawFallback();if(enabled){load(frame);for(let offset=1;offset<=(config.buffer||3);offset+=1){load(frame+offset);load(frame-offset)}}
  },[config,frame,progress,label,enabled])
  return <canvas ref={canvasRef} className="sequence-canvas" aria-label={`${label}, frame ${frame+1} of ${config.frameCount}`}/>
}
