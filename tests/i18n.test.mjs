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

test('Cafe stays one non-featured personal project with aligned passes and exact scene statistics', () => {
  const source = readFileSync(new URL('../src/data/projects.js', import.meta.url), 'utf8')
  const record = source.slice(source.indexOf("id: 'cafe-environment'"))
  assert.equal((source.match(/title: 'CAFE ENVIRONMENT'/g) || []).length, 1)
  assert.equal((source.match(/featured: true/g) || []).length, 3)
  assert.match(record, /featured: false, personal: true/)
  assert.match(record, /categoryIds: \['archviz', 'cgi', 'personal'\]/)
  assert.match(record, /year: null, date: null/)
  assert.match(record, /role: \[\], software: \[\]/)
  assert.match(record, /objects: 981, vertices: 1539667, edges: 3049726, faces: 1505809, triangles: 2921827/)
  assert.deepEqual([...record.matchAll(/label: '(FINAL|SOLID|MIST)'/g)].map(match => match[1]), ['FINAL', 'SOLID', 'MIST'])
  for (const stage of ['final', 'clay', 'mist']) {
    for (const suffix of ['', '-full']) assert.ok(readFileSync(new URL(`../public/media/projects/cafe-environment/${stage}${suffix}.webp`, import.meta.url)).length > 0)
  }
  assert.equal(translate('PERSONAL PROJECT', 'tr'), 'KİŞİSEL PROJE')
  assert.doesNotMatch(readFileSync(new URL('../src/data/experience.js', import.meta.url), 'utf8'), /CAFE ENVIRONMENT/)
})

test('Modal breakdown loads requested passes only and reuses the full-resolution lightbox', () => {
  const switcher = readFileSync(new URL('../src/components/media/BreakdownSwitcher.jsx', import.meta.url), 'utf8')
  const modal = readFileSync(new URL('../src/components/project/ProjectDetail.jsx', import.meta.url), 'utf8')
  assert.match(switcher, /useState\(\[0\]\)/)
  assert.match(switcher, /visited.map/)
  assert.match(switcher, /if \(requestedRef.current === index\) setActive\(index\)/)
  assert.match(switcher, /onOpen\(active\)/)
  assert.match(switcher, /aria-pressed=/)
  assert.match(modal, /stage.fullResolution \|\| stage.media/)
  assert.match(modal, /!switcher && images.length > 1/)
  assert.match(modal, /!switcher && project.breakdownStages/)
  const stats = readFileSync(new URL('../src/components/project/SceneStatistics.jsx', import.meta.url), 'utf8')
  assert.match(modal, /<SceneStatistics stats=\{project.sceneStats\}/)
  assert.match(stats, /value.toLocaleString\('en-US'\)/)
})

test('Onbeşliler uses exact user roles, optional metadata and official sources only', () => {
  const experience = readFileSync(new URL('../src/data/experience.js', import.meta.url), 'utf8')
  const details = readFileSync(new URL('../src/data/productionDetails.js', import.meta.url), 'utf8')
  const record = details.slice(details.indexOf("'ONBEŞLİLER':"), details.indexOf("'ASELSAN':"))
  assert.ok(experience.indexOf("title: 'ONBEŞLİLER'") < experience.indexOf("title: 'EŞREF RÜYA'"))
  assert.match(experience, /role: \['3D ARTIST', 'COMPOSITING ARTIST'\], highlights: \[\]/)
  assert.match(record, /seasons: 1, episodes: 16/)
  assert.match(record, /hideUnknownFields: true, hidePersonalWork: true, hideWorkPeriod: true/)
  assert.doesNotMatch(record, /releaseStart:|company:|imdb\(/)
  assert.match(record, /https:\/\/www.trt1.com.tr\/diziler\/onbesliler/)
  assert.match(record, /https:\/\/www.tabii.com\/tr\/detail\/626502/)
  assert.equal(translate('DIGITAL SERIES','tr'),'DİJİTAL DİZİ')
  assert.equal(translate('DRAMA / ACTION / HISTORY','tr'),'DRAMA / AKSİYON / TARİH')
  assert.equal(translate('3D ARTIST / COMPOSITING ARTIST','tr'),'3D ARTIST / COMPOSITING ARTIST')
})

test('ASELSAN keeps user credit, commercial metadata and release-only source', () => {
  const experience = readFileSync(new URL('../src/data/experience.js', import.meta.url), 'utf8')
  const details = readFileSync(new URL('../src/data/productionDetails.js', import.meta.url), 'utf8')
  const record = details.slice(details.indexOf("'ASELSAN':"), details.indexOf("'AŞK VE TAHT':"))
  assert.ok(experience.indexOf("title: 'ONBEŞLİLER'") < experience.indexOf("title: 'ASELSAN'"))
  assert.ok(experience.indexOf("title: 'ASELSAN'") < experience.indexOf("title: 'EŞREF RÜYA'"))
  assert.match(experience, /title: 'ASELSAN', period: '2025', summary: '3D ARTIST \/ COMPOSITING ARTIST', role: \['3D ARTIST', 'COMPOSITING ARTIST'\], highlights: \[\]/)
  assert.match(record, /broadcastYears: '2025', brand: 'ASELSAN'/)
  assert.match(record, /releases\/download\/media-v1\/aselsan.mp4/)
  assert.match(record, /youtube.com\/watch\?v=lnNqWgMphtk/)
  assert.doesNotMatch(record, /TV SERIES|company:|releaseStart:|seasons:|episodes:|imdb\(/)
  const en = record.match(/productionDescription: bilingual\("(.+)"\)/)[1]
  assert.ok(translate(en, 'tr').startsWith("ASELSAN'ın 50. yılı"))
  assert.equal(translate('COMMERCIAL / ADVERTISEMENT', 'tr'), 'REKLAM FİLMİ')
  assert.equal(translate('BRAND', 'tr'), 'MARKA')
  const modal = readFileSync(new URL('../src/components/experience/ProductionDetailModal.jsx', import.meta.url), 'utf8')
  assert.match(modal, /<VideoPlayer[^>]*lazy/)
  assert.match(modal, /'RELEASE DATE \/ TURKEY': production.releaseStart/)
  for (const file of ['../.gitignore', '../vite.config.js']) assert.ok(readFileSync(new URL(file, import.meta.url), 'utf8').includes('media/productions/aselsan/aselsan.mp4'))
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
