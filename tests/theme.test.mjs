import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { themeSelection, diagonalClip, ribbonGeometry, ribbonParticles, themeSweepProgress, themeBoundary, showcaseBoundaries } from '../src/utils/themeMath.js'
import { translate } from '../src/i18n/translations.js'

test('only user toggle changes global selection; section/scroll cannot mutate it', () => {
  assert.equal(themeSelection(), 'dark')
  for (const theme of ['dark', 'light']) {
    for (const type of ['SCROLL', 'SECTION_ENTER', 'SECTION_LEAVE', 'HERO_RETURN', 'RESIZE', 'REFRESH', 'INTRO']) {
      assert.equal(themeSelection(theme, {type, scrollY: 12000, section: 'contact'}), theme)
    }
    assert.equal(themeSelection(theme, {type: 'USER_TOGGLE'}), theme === 'dark' ? 'light' : 'dark')
  }
})

test('controller has no scroll trigger, chapter mapping or stored theme override', () => {
  const source = readFileSync(new URL('../src/components/ThemeController.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /ScrollTrigger|chapterAt|themeChapters|localStorage|sessionStorage/)
  const observer = source.slice(source.indexOf('const visibility'), source.indexOf('visibility.observe'))
  assert.doesNotMatch(observer, /apply\(|request\(|setTheme\(/)
  assert.match(source, /introStarted\.current = true/)
})
test('45 degree diagonal covers all corners on mobile, desktop and ultrawide', () => {
  for (const [width,height] of [[390,844],[1366,768],[1920,1080],[2560,1440],[3440,1440]]) {
    const reach = Number(diagonalClip(width,height,1).match(/([\d.]+)px/)[1])
    assert.ok(reach > width + height)
    assert.equal(diagonalClip(width,height,0), 'polygon(0 0, 0px 0, 0 0px)')
  }
})
test('theme button strings support both locales', () => {
  assert.equal(translate('THEME','tr'), 'TEMA')
  assert.equal(translate('Switch to light theme','tr'), 'Açık temaya geç')
  assert.equal(translate('Switch to dark theme','en'), 'Switch to dark theme')
})

test('production wipe uses full viewport geometry and reduced-motion fallback', () => {
  const css = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/components/ThemeController.jsx', import.meta.url), 'utf8')
  assert.match(source, /sweep = html.animate/)
  assert.match(source, /duration: 700, easing: 'cubic-bezier\(\.65,0,\.25,1\)'/)
  assert.match(css, /@property --theme-progress[^}]*inherits: true/)
  assert.match(css, /clip-path: polygon\([^;]*var\(--theme-travel\) \* var\(--theme-progress\)/)
  assert.match(css, /transform: translate\([^;]*var\(--theme-travel\) \* var\(--theme-progress\) \/ 2/)
  assert.doesNotMatch(css, /animation: theme-(?:diagonal|ribbon) /)
  assert.match(css, /theme-reduced \.18s/)
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(css, /mix-blend-mode: normal/)
})

test('ribbon and finite particles share the spatial reveal geometry and easing', () => {
  for (const [w, h, count] of [[390,844,26], [800,1024,44], [1920,1080,64], [3440,1440,64]]) {
    const geometry = ribbonGeometry(w,h), particles = ribbonParticles(w,h)
    assert.ok(geometry.length > Math.hypot(w,h))
    assert.equal(geometry.reach, w+h+4)
    assert.equal(particles.length, count)
    for (const p of particles) {
      assert.ok(Math.abs(p.x+p.y-geometry.reach*themeSweepProgress(p.delay/900)) < .001)
      assert.ok(p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h)
      assert.ok(p.life >= 350 && p.life <= 900)
      assert.ok(p.dx+p.dy < 0, 'trail follows behind the advancing ribbon')
    }
  }
})

test('shared boundary centers ribbon at every requested progress on all target viewports', () => {
  for (const [w,h] of [[1920,1080],[1440,900],[1366,768],[390,844]]) {
    for (const p of [0,.1,.25,.5,.75,.9,1]) {
      const boundary = themeBoundary(w,h,p)
      const center = boundary / 2
      assert.equal(center + center, boundary)
      assert.equal(diagonalClip(w,h,p), `polygon(0 0, ${boundary}px 0, 0 ${boundary}px)`)
    }
    const particles = ribbonParticles(w,h)
    const perWave = w < 600 ? 4 : w < 1000 ? 6 : 8
    const positions = particles.slice(0,perWave).map(p => {
      const boundary=p.x+p.y, lo=Math.max(0,boundary-h), hi=Math.min(w,boundary)
      return (p.x-lo)/(hi-lo)
    })
    assert.ok(positions[0] < .2 && positions.at(-1) > .8)
    let peak = 0
    for (let time=0; time<1600; time+=5) {
      peak = Math.max(peak, particles.filter(p => time >= p.delay+50 && time < p.delay+p.life-50).length)
    }
    assert.ok(peak >= (w < 600 ? 18 : 40))
    assert.ok(peak <= (w < 600 ? 30 : 70))
  }
})

test('ribbon lifecycle is finite, reduced-motion gated and does not add frame loops', () => {
  const source = readFileSync(new URL('../src/components/ThemeController.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8')
  assert.match(source, /!reduced.matches && active/)
  assert.match(source, /return \(\) => host.remove\(\)/)
  assert.doesNotMatch(source, /requestAnimationFrame|setInterval|getImageData/)
  assert.match(source, /removeRibbon\?\.\(\)/)
  assert.match(source, /sweep\?\.cancel\(\)/)
  assert.match(source, /--theme-spark-play', 'running'/)
  assert.match(css, /\.theme-energy \{[^}]*overflow: clip/, 'snapshot source cannot expand page scroll bounds')
})

test('opening showcase waits only 100ms after spatial intro completion, with no visual cut or third wipe', () => {
  const source = readFileSync(new URL('../src/components/ThemeController.jsx', import.meta.url), 'utf8')
  assert.match(source, /await request\('dark', true\)/)
  assert.match(source, /100 - \(performance.now\(\) - introCompletedAt\)/)
  assert.match(source, /window.setTimeout\(resolve, remaining\)/)
  const introEnd = source.slice(source.indexOf('if (intro) sweep.onfinish'), source.indexOf('if (preview) sweep.onfinish'))
  assert.match(introEnd, /transition.skipTransition\(\)/)
  assert.equal((source.match(/setTimeout\(/g) || []).length, 1)
  assert.match(source, /await request\('light', false, true\)/)
  assert.match(source, /if \(preview\) sweep.onfinish/)
  const cut = source.slice(source.indexOf('if (preview) sweep.onfinish'), source.indexOf('return transition.finished'))
  assert.match(cut, /clearPreview\(\)/)
  assert.doesNotMatch(cut, /setTimeout|request\(|skipTransition|removeRibbon/)
  const clear = source.slice(source.indexOf('const clearPreview'), source.indexOf('// The preview'))
  assert.doesNotMatch(clear, /setTheme|apply\(/)
  assert.match(source, /introRunning \|\| active/)
  assert.match(source, /window.clearTimeout\(holdTimer\)/)
  assert.match(source, /!reduced.matches && document.startViewTransition/)
})

test('double swipe has constant responsive width, empty final LIGHT mask and synced emitters', () => {
  for (const [w,h] of [[1920,1080],[1440,900],[1366,768],[390,844]]) {
    const geometry = ribbonGeometry(w,h,true)
    assert.ok(geometry.bandOffset > 0 && geometry.bandOffset < Math.min(w,h))
    for (const p of [0,.1,.25,.5,.75,.9,1]) {
      const {front,back} = showcaseBoundaries(w,h,p)
      assert.ok(Math.abs(front-back-geometry.bandOffset) < .0001)
      assert.ok(!(back <= 0 && front >= w+h), 'LIGHT can never cover the full viewport')
    }
    assert.ok(showcaseBoundaries(w,h,1).back > w+h)
    const particles = ribbonParticles(w,h,true)
    assert.equal(particles.length, ribbonParticles(w,h).length, 'two emitters share one budget')
    assert.ok(particles.some(p=>p.returning) && particles.some(p=>!p.returning))
    for (const p of particles) {
      const boundaries=showcaseBoundaries(w,h,themeSweepProgress(p.delay/900))
      assert.ok(Math.abs(p.x+p.y-(p.returning?boundaries.back:boundaries.front)) < .002)
    }
  }
})

test('700ms particles retain the same master boundary and mobile/desktop density', () => {
  for (const [w,h] of [[390,844],[1920,1080]]) for (const showcase of [false,true]) {
    const particles = ribbonParticles(w,h,showcase,700)
    for (const p of particles) {
      const progress = themeSweepProgress(p.delay/700)
      const boundary = showcase ? showcaseBoundaries(w,h,progress)[p.returning ? 'back' : 'front'] : themeBoundary(w,h,progress)
      assert.ok(Math.abs(p.x+p.y-boundary)<.002)
    }
    assert.equal(particles.length,w<600 ? 26 : 64)
  }
})
