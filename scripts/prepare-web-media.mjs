import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const backgrounds = [
  'backgrounds/hero.webp', 'backgrounds/about.webp', 'backgrounds/selected-work.webp',
  'backgrounds/contact.webp', 'backgrounds/archive.webp', 'backgrounds/disciplines.webp',
  'projects/evga-rtx-3090/poster.webp', 'projects/keyboard-study/poster.webp',
  'projects/interior-study/living-room.webp', 'projects/mario-arcade/poster.webp',
  'projects/star-wars-vfx/poster.webp', 'showreel/main/showreel-poster.webp',
]
const videos = [
  ['projects/evga-rtx-3090/evga-rtx-3090.mp4', 'evga-rtx-3090'],
  ['projects/keyboard-study/keyboard-study.mp4', 'keyboard'],
  ['projects/mario-arcade/mario-arcade.mp4', 'mario-arcade'],
  ['projects/star-wars-vfx/star-wars-vfx.mp4', 'star-wars-vfx'],
  ['showreel/breakdowns/kurulus-orhan/breakdown.mp4', 'kurulus-orhan-breakdown'],
  ['showreel/breakdowns/teskilat/breakdown.mp4', 'teskilat-breakdown'],
  ['showreel/breakdowns/turkcell-shaq/breakdown.mp4', 'turkcell-shaq-breakdown'],
  ['showreel/breakdowns/zaferin-rengi/breakdown.mp4', 'zaferin-rengi-breakdown'],
]
const outputRoot = resolve('public/media/web')
mkdirSync(outputRoot, { recursive: true })

function encode(source, output, options) {
  const input = resolve('public/media', source)
  if (!existsSync(input)) throw new Error(`Missing source: ${input}`)
  if (existsSync(output)) { console.log(`Kept existing proxy: ${output}`); return }
  const before = statSync(input)
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-n', '-i', input, ...options, output], { stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`FFmpeg failed: ${source}`)
  const after = statSync(input)
  if (before.size !== after.size || before.mtimeMs !== after.mtimeMs) throw new Error(`Source changed: ${source}`)
  console.log(`${source}: ${(before.size / 1048576).toFixed(2)} MB → ${(statSync(output).size / 1048576).toFixed(2)} MB`)
}

for (const source of backgrounds) {
  const name = source.replaceAll('/', '--').replace('.webp', '')
  for (const width of [1280, 640]) {
    encode(source, resolve(outputRoot, `${name}-${width}.webp`), [
      '-vf', `scale=w='min(${width},iw)':h=-2,boxblur=20:2,eq=saturation=0.55`,
      '-frames:v', '1', '-c:v', 'libwebp', '-quality', '65',
    ])
  }
}
for (const [source, name] of videos) {
  encode(source, resolve(outputRoot, `${name}-web.mp4`), [
    '-map', '0:v:0', '-map', '0:a?',
    '-vf', "scale=w='min(1920,iw)':h='min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-threads', '4',
    '-fps_mode', 'passthrough', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
  ])
}
