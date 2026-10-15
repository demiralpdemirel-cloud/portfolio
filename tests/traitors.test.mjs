import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { catalog, personalCatalog, filterCatalog } from '../src/data/catalog.js'
import { traitorsCredit, traitorsDetails } from '../src/data/traitorsTurkiye.js'
import { translate } from '../src/i18n/translations.js'
const read = file => readFileSync(new URL('../src/'+file,import.meta.url),'utf8')

test('Traitors is one professional credit, not a personal case; existing production IDs remain stable',()=>{
  const entries=catalog.filter(entry=>entry.title==='THE TRAITORS TÜRKİYE')
  assert.equal(entries.length,1)
  assert.equal(entries[0].id,'production-11')
  assert.equal(entries[0].kind,'production')
  assert.ok(filterCatalog('production').includes(entries[0]))
  assert.ok(filterCatalog('vfx').includes(entries[0]))
  assert.equal(personalCatalog.length,9)
  assert.ok(!personalCatalog.includes(entries[0]))
  assert.equal(catalog.find(entry=>entry.title==='KURULUŞ ORHAN').id,'production-09')
  assert.deepEqual(traitorsCredit.role,['COMPOSITING ARTIST'])
  assert.deepEqual(traitorsCredit.highlights,['COMPOSITING'])
})

test('official production credits, host and 19 contestants stay distinct from the artist role',()=>{
  assert.equal(traitorsDetails.director,'Tamer İpek')
  assert.deepEqual(traitorsDetails.producers,['Adil Şentekin','Timuçin Güner'])
  assert.equal(traitorsDetails.productionCompany,'Shine Medya')
  assert.equal(traitorsDetails.studio,'IDTV ant RTL')
  assert.equal(traitorsDetails.host,'Giray Altınok')
  assert.equal(new Set(traitorsDetails.contestants).size,19)
  assert.equal(traitorsDetails.releaseStart,'2026-03-26')
  assert.equal(traitorsDetails.premiereLabel,'KANAL D PREMIERE')
  assert.equal(traitorsDetails.broadcaster,'Kanal D')
  assert.equal(traitorsDetails.platform,'Prime Video')
  assert.ok(traitorsDetails.sourceNotes.every(source=>source.url.startsWith('https://')))
  for(const label of ['HOST','CONTESTANTS','REALITY COMPETITION','OFFICIAL TRAILER','PRODUCERS','COUNTRY','LANGUAGE']) assert.notEqual(translate(label,'tr'),label)
})

test('artwork references the verified official producer, no local derivative or pretend vertical poster',()=>{
  assert.equal(traitorsDetails.remoteArtwork,true)
  assert.equal(new URL(traitorsDetails.image).hostname,'shinemedya.com')
  assert.equal(traitorsDetails.imageWidth / traitorsDetails.imageHeight,16/9)
  assert.match(traitorsDetails.imageSrcSet,/640w.*1080w.*1920w/)
  assert.match(traitorsDetails.artworkRights,/permission not verified/)
})

test('official trailer iframe is click-gated, privacy-enhanced, no autoplay and always has external fallback',()=>{
  assert.equal(traitorsDetails.officialTrailer.youtubeId,'KvXFaC8L7H4')
  const component=read('components/media/OfficialTrailer.jsx')
  assert.match(component,/loaded && valid && !failed \? <iframe/)
  assert.match(component,/youtube-nocookie.com\/embed/)
  assert.doesNotMatch(component,/autoplay=1|autoPlay|setInterval/)
  assert.match(component,/href=\{trailer.watchUrl\}/)
  assert.match(component,/IntersectionObserver/)
  assert.match(component,/document.hidden/)
  assert.match(component,/observer.disconnect/)
  const modal=read('components/experience/ProductionDetailModal.jsx')
  assert.match(modal,/production.officialTrailer && <section/)
  assert.match(modal,/production.contestants.map/)
  assert.ok(modal.indexOf('className="contribution-summary"') < modal.indexOf('<ProductionMetadata production={production}'))
})
