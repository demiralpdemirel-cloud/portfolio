import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import { bilingual, translate, translations } from '../src/i18n/translations.js'

test('every bilingual data field has a central Turkish counterpart', () => {
  let count = 0
  for (const file of readdirSync(new URL('../src/data/', import.meta.url)).filter(name => name.endsWith('.js'))) {
    const source = readFileSync(new URL(`../src/data/${file}`, import.meta.url), 'utf8')
    for (const [, text] of source.matchAll(/bilingual\('([^']*)'\)/g)) {
      assert.ok(translations.tr[text], `${file}: missing Turkish copy for ${text}`)
      assert.equal(translate(bilingual(text), 'en'), text)
      assert.equal(translate(bilingual(text), 'tr'), translations.tr[text])
      count++
    }
  }
  assert.ok(count >= 24)
})

test('project names, asset paths, IDs and industry terms are preserved', () => {
  for (const name of ['EVGA RTX 3090', 'KEYBOARD', 'INTERIOR', 'EŞREF RÜYA', 'KURULUŞ OSMAN', 'Blender', 'VFX', 'project-003', 'media/projects/interior-study/poster.webp']) {
    assert.equal(translate(name, 'tr'), name)
  }
})

test('UI and dynamic accessibility strings translate without changing names', () => {
  assert.equal(translate('Scroll to top', 'tr'), 'Sayfanın başına dön')
  assert.equal(translate('View EŞREF RÜYA production details', 'tr'), 'EŞREF RÜYA prodüksiyon detaylarını görüntüle')
  assert.equal(translate('Open INTERIOR view 01 fullscreen', 'tr'), 'INTERIOR görünüm 01 tam ekran aç')
  assert.equal(translate('TV SERIES · 2025', 'tr'), 'TV DİZİSİ · 2025')
  assert.equal(translate('Green Screen Cleanup / 3D Traffic Simulation', 'tr'), 'Green Screen Cleanup / 3D Trafik Simülasyonu')
})

test('plain layout/time helpers never call React hooks', () => {
  for (const file of ['components/project/FullscreenImageViewer.jsx', 'components/showreel/VideoPlayer.jsx']) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
    for (const helper of source.matchAll(/^function [a-z]\w*\([^]*?\n\}/gm)) {
      assert.ok(!helper[0].includes('useLanguage('), `${file}: hook inside a plain helper`)
    }
  }
})
