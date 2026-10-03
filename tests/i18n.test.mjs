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

test('Orhan production copy is bilingual and unknown personal credits stay empty', () => {
  const source = readFileSync(new URL('../src/data/productions.js', import.meta.url), 'utf8')
  const orhan = source.slice(source.indexOf("'kurulus-orhan':"), source.indexOf('  teskilat:'))
  assert.match(orhan, /myRole: null/)
  assert.match(orhan, /seasons: 1/)
  assert.match(orhan, /release: '2025-10-29'/)
  assert.equal(translate('2025 — PRESENT', 'tr'), '2025 — GÜNÜMÜZ')
  assert.equal(translate('ACTION / DRAMA', 'tr'), 'AKSİYON / DRAMA')
  const en = orhan.match(/description: bilingual\("(.+)"\)/)[1]
  assert.ok(translate(en, 'tr').startsWith("Osman Bey'in mirasını"))
  const detail = readFileSync(new URL('../src/data/productionDetails.js', import.meta.url), 'utf8')
  assert.match(detail, /imdb\('tt38607251'\)/)
  assert.match(detail, /hideUnknownFields: true/)
  assert.match(detail, /productionDescription: productions\['kurulus-orhan'\]\.description/)
})

test('Ask ve Taht separates bilingual production context from existing personal crowd work', () => {
  const source = readFileSync(new URL('../src/data/productionDetails.js', import.meta.url), 'utf8')
  const record = source.slice(source.indexOf("'AŞK VE TAHT':"), source.indexOf("'KURULUŞ ORHAN':"))
  const en = record.match(/productionDescription: bilingual\("(.+)"\)/)[1]
  assert.ok(translate(en, 'tr').startsWith('Anadolu Selçuklu Sultanı'))
  assert.match(record, /imdb\('tt45351792'\)/)
  assert.match(record, /releaseStart: '2026-09-09'/)
  assert.match(record, /hideUnknownFields: true/)
  assert.doesNotMatch(record, /company:|episodes:|image:/)
  assert.equal(translate('2026 — PRESENT', 'tr'), '2026 — GÜNÜMÜZ')
  const experience = readFileSync(new URL('../src/data/experience.js', import.meta.url), 'utf8')
  assert.match(experience, /title: 'AŞK VE TAHT', summary: bilingual\('Created CGI army and crowd work for production shots\.'\), highlights: \['CG CROWD \/ ARMY'\]/)
})

test('Osman artwork uses the full-size official poster and retains uncropped modal rendering', () => {
  const data = readFileSync(new URL('../src/data/productionDetails.js', import.meta.url), 'utf8')
  const osman = data.slice(data.indexOf("'KURULUŞ OSMAN':"), data.indexOf('// Additional existing rows'))
  assert.match(osman, /image: '\/media\/productions\/kurulus-osman-key-art.jpg'/)
  assert.match(osman, /imageWidth: 1433, imageHeight: 2047/)
  assert.match(osman, /atv.com.tr\/haberler\/2020\/09\/02\/kurulus-osmanin-yeni-sezon-afisi/)
  assert.ok(readFileSync(new URL('../public/media/productions/kurulus-osman-key-art.jpg', import.meta.url)).length > 500000)
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
  assert.match(css, /\.production-modal__visual img \{[^}]*object-fit: contain/)
})
