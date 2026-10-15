# The Traitors Türkiye — integration and source audit

Checked 2026-10-15. Local-only development; no commit, push, deploy, backup access,
unrelated file staging or cleanup. Earlier local showcase/Beylikdüzü changes retained.

## Canonical record

- Title: THE TRAITORS TÜRKİYE; year 2026; Reality Competition.
- Artist-supplied personal role: Compositing Artist. Contribution: Compositing only.
  No invented shot responsibilities, supervisor role or public crew-credit claim.
- Added once to experience → productionDetails → catalog → Screen Credits.
- Stable catalog ID `production-11`; previous experience IDs remain unchanged.
- Nine personal CD cases unchanged. Global production/VFX data filters include the new work.
- Archive now has twelve professional entries; all 21 canonical works remain accessible.

## Official sources and verification

1. Prime Video title details:
   https://www.primevideo.com/-/cs/detail/0GLLJ8FCA3CD8UWC34CVDJ660Q
   Confirms 2026, reality format, Tamer İpek (director), Adil Şentekin and Timuçin Güner
   (producers), host/participant names, and exact studio string **IDTV ant RTL**.
   The studio label is retained literally, not reinterpreted as the production company
   or the artist's VFX employer. Availability on this localized page is region-dependent.

2. Kanal D launch report:
   https://www.kanald.com.tr/the-traitors-turkiye/haber/the-traitors-turkiyenin-lansmani-yapildi
   Confirms Giray Altınok, the official participant list, format and Thursday TV launch
   context. Official KanalD first-episode video independently dates television launch
   to 26 March 2026: https://www.youtube.com/watch?v=vp8pCkug0sc
   This date is labeled **KANAL D PREMIERE**, not asserted as Prime Video's earliest release.
   Digital first-release date is intentionally not supplied.

3. Official broadcaster production-company attribution:
   https://www.kanald.com.tr/the-traitors-turkiye/haber/girayin-bu-yuzunu-hic-gormediniz
   https://www.kanald.com.tr/the-traitors-turkiye/haber/giray-altinokun-isiltili-sinavi
   Credits Shine Medya and identifies Kanal D / Prime Video distribution.

4. Official producer program listing:
   https://shinemedya.com/programlar
   Verified Turkey promotional artwork: https://shinemedya.com/uploads/traitors-hero.png
   Browser inspection confirmed 1920×1080, Giray Altınok, participants, Türkiye title
   and Prime Video branding. Kanal D's main page OG image was inspected and found to
   be a LOGO asset, not a full poster; it was not mislabeled as a poster. The Prime Video
   crawler image was a participant still, also rejected as key art.

5. Official trailer:
   https://www.youtube.com/watch?v=KvXFaC8L7H4
   YouTube's oEmbed confirms the title and owner KanalD (@kanald).
   Source: https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=KvXFaC8L7H4&format=json
   Browser iframe showed the matching official trailer and played with advancing
   currentTime, readyState 4, duration 95.261s. No trailer download or rehosting.

Country Türkiye and language Turkish use the supplied brief, consistent with the Turkish
adaptation and broadcaster; no separate audio-language asset inspection was performed.

## Participants (not fictional cast)

Host: Giray Altınok.

19 contestants: Yaren Alaca, Yiğit Poyraz, Pascal Nouma, Saadet Özsırkıntı, İlkay Buharalı,
Cem Avnayim, Mert Öztürk, Selim Yuhay, Ayliz Yaşar, Özgür Balakar, Öykü Berkan,
Hülya Uğur, Emre Uzunboy, Emir Elidemir, Yusuf Güney, Yasemin Yılmaz, Yasemin Yürük,
Melih Kunukçu, Tara de Vries. No identities of Traitors, eliminations or winner included.
Prime Video's diacritics are used where the broadcaster uses unaccented spellings.

## Artwork rights / known limitations

No explicit portfolio redistribution license was found. **No new local media assets**
or WebP/AVIF derivatives were created. The UI references the producer's external artwork,
links its official source and uses responsive URLs already published in that producer's
srcset (640/1080/1920). Original landscape aspect is retained; no fake vertical crop/AI art.
A distinct licensed vertical production poster remains unverified. Before locally hosting
or redistributing that artwork, obtain rights-holder permission or an approved press asset.
Remote-source availability and future YouTube embedding policy remain external dependencies.

## Implementation files

New:
- `src/data/traitorsTurkiye.js`: role, bilingual overview, verified metadata, participants,
  source audit notes, official art/trailer and rights limitations.
- `src/components/media/OfficialTrailer.jsx`: explicit click-to-load privacy-enhanced iframe,
  persistent external fallback, no autoplay, cleanup when hidden/offscreen/unmounted.
- `src/styles/official-trailer.css`: responsive player facade and compact contestant grid.
- `tests/traitors.test.mjs`: four focused regression checks.

Updated:
- `src/data/experience.js`, `src/data/productionDetails.js`, `src/data/catalog.js`:
  canonical integration and explicit external-thumbnail support, no duplicate card.
- `src/components/ProductionShowcase.jsx`: reuse stage selection, trailer label, year/type,
  source-backed responsive thumbnails, and reset stage iframe when opening details.
- `src/components/experience/ProductionDetailModal.jsx`: optional verified extended credits,
  trailer, host and contestants; previous productions retain their existing fields/layout.
- `src/i18n/translations.js`: Turkish presentation/accessibility labels.
- `scripts/prepare-catalog-thumbnails.mjs`: skip reviewed remote artwork without downloading
  it; unrelated unreviewed remote inputs still fail closed.
- `tests/catalog.test.mjs`, `tests/worlds.test.mjs`, `tests/jewel-catalog.test.mjs`,
  `tests/production-showcase.test.mjs`: intentional record-count updates (21 total / 12 pro).

## Validation

Local preview: http://localhost:4185/portfolio/#production-11

- One new entry, correct role, twelve-item archive, correct detail opening.
- Director/producers/studio/production/host and all 19 contestants present.
- Artwork loads from the official producer; no false local derivative request.
- Zero initial YouTube iframes; explicit click mounts the correct official embed.
- Real official YouTube playback confirmed. External watch links remain available even
  if a visitor's browser/region blocks the iframe. No autoplay promise.
- TR/EN copy switches; mobile detail at 390×844 has no horizontal overflow.
- Keyboard/selection, modal close, previous production selection and iframe cleanup checked.
- No new heavy dependency or continuous animation loop. Existing Contact-last order retained.
- Build PASS; 104/104 tests PASS; git diff --check PASS. Existing >500kB chunk advisory remains.

Sites skill used for bounded local implementation and build/browser validation only.
Ignored proof images under `.sites-runtime/production-lab-qa/`; none are distributed assets.
