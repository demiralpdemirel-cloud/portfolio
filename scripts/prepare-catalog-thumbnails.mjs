import { mkdirSync,existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { catalog } from '../src/data/catalog.js'
const directory = resolve('public/media/catalog')
mkdirSync(directory,{recursive:true})
for(const entry of catalog.filter(entry=>entry.image)) {
  if(/^https?:/.test(entry.image)) throw new Error(`Remote source requires review: ${entry.id}`)
  const source = resolve('public',entry.image.replace(/^\//,''))
  if(!existsSync(source)) throw new Error(`Missing source: ${source}`)
  for(const width of [480,960]) {
    const destination = resolve(directory,`${entry.id}-${width}.webp`)
    // Resize only; existing derivatives and originals are never overwritten.
    if(existsSync(destination)) continue
    const result = spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-i',source,'-vf',`scale=${width}:-2`,'-frames:v','1','-c:v','libwebp','-quality','84',destination],{encoding:'utf8'})
    if(result.status!==0) throw new Error(result.stderr || `Thumbnail failed: ${entry.id}`)
  }
}
console.log(`Prepared thumbnails for ${catalog.filter(entry=>entry.image).length} works; originals untouched.`)
