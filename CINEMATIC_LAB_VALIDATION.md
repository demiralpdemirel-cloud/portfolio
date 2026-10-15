# Cinematic Production Lab — local delivery

Date: 2026-10-15. Source baseline: c4414bc on main. No commit, push or deployment.
Backup repository and existing unrelated untracked files were not modified.

## Implementation

- Stage A: artwork-led Hero, smaller retained artist portrait, finite Cafe pass assembly,
  compact Collection/Showreel headers and profile panels.
- Stage B: keyboard/native-range Cafe SOLID/FINAL comparison and MIST mode; independent
  Sofa topology/material views; original Beylikduzu view selection; VFX breakdown selection.
- Stage C: local double-edge/hinge/gloss jewel-case accents, unchanged reversible extraction
  timeline and fixed hit lanes; Showreel breakdown thumbnails; Blender shading, AE layer
  assembly and Photoshop final-layer convergence extend the existing software timelines.
- Stage D: verified personal contribution above general production metadata; calm poster
  illumination; studio, spatial and compositing atmospheres. Unrelated illustrative
  architectural/topology wireframes removed in favor of actual project images.
- Stage E: one-scene Final Shot assembly followed immediately by Contact with the same
  original image as a subdued background. Contact is the last main section.

## Real source assets / limitations

- Cafe: public/media/projects/cafe-environment/{final,clay,mist}.webp. Same camera.
- Sofa: existing sofa-5 wireframe, sofa-4 shaded view, sofa-3 detail. Cameras differ:
  deliberately no pixel-registered wipe or morph between these images.
- Beylikduzu: existing artist renders, not fabricated construction-stage passes.
- VFX Lab: existing Teskilat, Turkcell/Shaq and Zaferin Rengi breakdown clips, canonical
  source mapping through the existing VideoPlayer. Clip choice is not a timecode chapter.
- Star Wars has no separately supplied source plate/matte. No fake before/after created.
- No isolated Cafe material/lighting passes, exported scene wireframe, tracked point data,
  cleanup plates or separate CG integration passes were supplied. Full per-pass laboratories
  require those real assets. Presentation guides are not claimed as project geometry.

## Browser QA

Production preview: http://localhost:4185/portfolio/
Dev: http://localhost:5180/portfolio/

Desktop/browser viewport checks: 1920x1080, 1440x900, 1280x800, 768x1024,
390x844, 375x812. Document horizontal overflow: false at all six sizes.
These are responsive viewport tests, not real mobile hardware/decode benchmarks.

Verified during this run:

- Hero real images decoded; About/Profile retained.
- Cafe range Home/End/ArrowRight changes the comparison CSS property and output.
- Follow-up: moved the native range thumb onto the image's central handle; removed
  the separate lower track. Browser mouse drags moved 51→77% and 77→21%, with
  the image boundary following. A narrow transparent on-image input lane preserves
  continuous native dragging; keyboard access and no React frame renders remain.
- MIST switch, TR/EN without reload, retained mode and translated controls.
- Collection filter, next arrow and ArrowRight navigation.
- All nine visible CD hit lanes reached their own button via elementFromPoint.
- Mobile Cafe CD opening reached open phase; detail/pass controls present.
- Closing reversed to the shelf and restored document scrolling.
- Onbesliler dialog shows actual contribution before general production metadata.
- Teskilat Lab playback advanced, readyState 4; buffer ahead observed ~17.59 seconds.
- Leaving the video viewport stopped playback (0 playing videos at Final Shot).
- Dark/Light theme switch; Final Shot image; Contact email/social actions and last-section order.
- Forced reduced-motion QA path leaves the final image visible, solid layer hidden, Contact last.
- Fresh dev load had no captured warnings/errors. Earlier edit-time HMR context errors
  were transient and did not reproduce on clean load; no production-origin errors were observed.

## Performance scope

No Three.js dependency, new perpetual RAF engine, heavy particle loop or backdrop filter.
New assembly timelines pause outside viewport/hidden tab, are finite and clean up observers
and media contexts. Comparison input changes a local CSS property without React frame renders.
Existing video/ambient lifecycle, source mapping and software visibility arbitration retained.

An 8-second production-preview Hero idle probe reported mean RAF interval 5.63ms,
p95 5.6ms, 1 interval >25ms, 0 long tasks >=50ms. This is callback cadence in the
embedded browser, NOT measured GPU-presented FPS or a 120Hz hardware guarantee.
getVideoPlaybackQuality was not exposed in this browser: dropped-video-frame counts
and full Chrome compositor/GPU traces remain unverified.

Screenshots: .sites-runtime/production-lab-qa/ (ignored, not publication assets).

## Final checks

Build PASS, tests 91/91 PASS, diff check PASS. The suite includes production-lab
source/lifecycle, comparison semantics and Contact-last regression checks.
The build currently emits a >500kB main-chunk advisory; it is not a build failure.
