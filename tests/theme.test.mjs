import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { themeSelection, diagonalClip } from '../src/utils/themeMath.js'
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
  assert.match(css, /calc\(100vw \+ 100vh \+ 4px\)/)
  assert.match(css, /theme-diagonal \.9s cubic-bezier/)
  assert.match(css, /theme-reduced \.18s/)
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(css, /mix-blend-mode: normal/)
})
