# Screen Credits — local validation (2026-10-15)

## Scope and files

Local only. No commit, push, deployment, backup-repository access or user-file cleanup.

- `src/components/ProductionShowcase.jsx`: professional screening room, real player, compact ProductionDossier, eleven-button film strip, arrows, keyboard selection and cancellable projection wipe.
- `src/styles/production-showcase.css`: section-scoped metallic frame, local glass highlights, three restrained atmosphere layers, editorial hierarchy, hover/focus sweep and responsive strip.
- `src/utils/productionArchive.js`: presentation ordering and derived metadata; references canonical catalog entries without cloning or changing roles/media.
- `src/components/CreativeWorlds.jsx`: replace only the professional world's grid with ProductionShowcase.
- `src/motion/useScrollWorld.js`: exclude production from the old world-grid animation owner; the archive owns its finite entrance.
- `src/i18n/translations.js`: new presentation and accessibility labels in Turkish.
- `tests/production-showcase.test.mjs`: four regression tests covering complete data identity, media/details reuse, cancellation/accessibility contracts and confined integration.

IN MOTION, personal jewel-case code, original media/credit data, modal implementation,
Steam integration, Hero, tools, final shot and Contact are unchanged. Contact remains last.
ASELSAN and Turkcell remain in their existing brand section as well as being accessible
in the professional index. Nine original professional-world anchors are retained;
brand-item IDs are not duplicated. Deep links select the matching production without
locking subsequent user selections back to the original hash.

## Interaction and motion

The active production is the only stage player. Changing selection pauses the old video,
covers the old preview with a 160ms projection wipe, mounts the selected source/poster,
then uncovers it over 380ms with a compact dossier reveal. Pending requests replace
earlier timelines. Returning to the current production also uncovers the screen.
No autoplay is requested. Poster-only records have no fake player. Aşk ve Taht has no
supplied image and displays an explicitly labeled typographic dossier, not invented art.

Arrows advance one production. Left/Right/Home/End work on the strip and move focus.
Only the rail scrolls when selection goes outside its visible bounds; no scrollIntoView
page jumps. Touch browsers can use native horizontal rail scrolling. Hover/focus uses
300–350ms local sweep, thumbnail emphasis, corner markings and underline; no overlap
or enlarged hit areas. View Project opens the existing production modal for the exact entry.

Contribution tags come only from canonical role fields. Unknown Kuruluş Orhan personal
credits stay empty and show the existing Production Breakdown label. Kardeş Takımı's
personal-credit clarification remains visible. Year uses production dates when present;
the original detail still preserves work-period context. No new production facts researched
or invented. Atmosphere uses existing genre/type, not inferred or fabricated shot palettes.

Finite GSAP entrance with one-shot ScrollTrigger, transform/opacity transition, cleanup on
unmount and visibility handling. Reduced-motion preference and existing debug query are
respected. No new dependency, continuous RAF, WebGL, fullscreen blur or backdrop-filter.
No measured 60/120 FPS guarantee is made.

## Browser checks — local production build

Preview: http://localhost:4185/portfolio/#production

- All 11 entries selected; selected indicator and dossier title matched each record.
- All 11 View Project actions opened their own existing modal, including the extended
  ASELSAN title. Close returned to the archive.
- All five supplied stage videos played with readyState 3–4 and advancing currentTime:
  Kuruluş Orhan 69.16s, Teşkilat 49.72s, Turkcell 33.52s, Zaferin Rengi 72.28s,
  ASELSAN 58.8s. Sources remained canonical / existing web derivatives.
- Mute, seek input, playback speed menu and 1.25x rate tested. Fullscreen button was
  exercised, but this embedded browser did not enter fullscreen; native fullscreen
  success is not claimed. Shared player code was not modified.
- Rapid successive selections, returning to current item, ArrowRight and End tested.
- Deep link `#production-07` opened Teşkilat; selecting Turkcell afterward remained possible.
- Reduced-motion debug path immediately changed selection with the wipe uncovered.
- TR/EN labels and long titles checked. No broken loaded images in the professional section.
- 1920x1080, 1440x900, 1280x800, 768x1024, 390x844, 375x812 inspected through viewport
  overrides: no horizontal page overflow. Desktop has four visible strip items, tablet three,
  mobile approximately one plus a next-item preview. Mobile Turkish stage was visually checked.
- Physical touchscreen swipe was not available in this desktop embedded-browser session;
  native overflow scrolling is implemented, not claimed as real-device touch validation.
- No captured console errors/warnings during selection/detail/media checks.
- Hover/focus styles audited; no automated mouse-hover API was available in this session.

## Checks and evidence

Full suite: 99/99 PASS (95 existing + 4 new). Production build PASS.
Existing >500kB main-chunk advisory remains non-fatal. Diff whitespace check PASS.

Ignored local proof images (not production assets):
`.sites-runtime/production-lab-qa/screen-credits-desktop.jpg`,
`.sites-runtime/production-lab-qa/screen-credits-film-strip.jpg`,
`.sites-runtime/production-lab-qa/screen-credits-mobile-tr.jpg`.

Sites skill used for the bounded local-only implementation and browser/build validation;
no hosting registration, packaging or publication was performed.
