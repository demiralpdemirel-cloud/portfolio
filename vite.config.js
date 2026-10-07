import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const releaseOnlyVideos = [
  'media/productions/aselsan/aselsan.mp4',
  'media/projects/evga-rtx-3090/evga-rtx-3090.mp4',
  'media/projects/keyboard-study/keyboard-study.mp4',
  'media/projects/mario-arcade/mario-arcade.mp4',
  'media/projects/star-wars-vfx/star-wars-vfx.mp4',
  'media/showreel/main/showreel.mp4',
  'media/showreel/breakdowns/kurulus-orhan/breakdown.mp4',
  'media/showreel/breakdowns/teskilat/breakdown.mp4',
  'media/showreel/breakdowns/turkcell-shaq/breakdown.mp4',
  'media/showreel/breakdowns/zaferin-rengi/breakdown.mp4',
]

const omitReleaseOnlyVideos = {
  name: 'omit-release-only-videos-from-pages-build',
  apply: 'build',
  closeBundle() {
    for (const video of releaseOnlyVideos) {
      rmSync(resolve('dist', video), { force: true })
    }
  },
}

export default defineConfig({
  plugins: [react(), omitReleaseOnlyVideos],
  base: '/portfolio/',
})
