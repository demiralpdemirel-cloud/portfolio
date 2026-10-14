# Portrait / Creative Worlds revision

## Scope and source

Only `portfolio-scroll` is edited and deployed. The original portfolio is read-only. Starting new repository HEAD was `435ed30f1b4bcf319822756cc4b3d7525fa9bf12`, exactly matching origin/main, with a clean worktree. Original HEAD remains `db0b7c3f76be50e25017ad7ed178c3b01b6dfb3e`; its full status/remote/untracked baseline is compared at completion.

The Hero uses the existing real `images/profile-portrait.png` without face generation, replacement or asset modification. It is eagerly loaded and is the primary right-hand visual. All nine viewport checks keep the portrait inside the first viewport (320x640 through 1920x1080). Its scroll tween has no opacity change: sampled opacity 1 during departure. About is the second direct section. Profile continues it, then Showreel and exploration. Capabilities precedes Education.

## Primary worlds — not duplicate projects

The index retains filters and modal access but no second poster showcase. Twenty verified entries are partitioned into exactly one primary world using canonical source objects:

| World | Primary entries | Visual and motion language |
| --- | --- | --- |
| Product | 5 | Studio light bands, offset mechanical frames, depth approach, alternating product composition, highlight hover |
| Architecture | 3 | Structural path drawing, perspective floor/planes, broad actual renders, sequential clip reveal/dolly |
| Compositing | 1 | Node paths, tracking marks, Z-separated illustrative layer planes, final assembly |
| Modeling / Personal studies | 2 | Axes/grid/topology outline, actual Sofa wireframe under actual shaded render; Mario 3D/motion study with its real secondary breakdown |
| Production | 9 | Theatrical beam, film edges, portrait poster strip, genuine roles/year, frame-window reveal |

Each scene has scroll-linked incoming seams and outgoing geometry movement. Native scroll and reverse remain available, without pin traps. Decorative VFX planes are explicitly labelled illustrative; no fabricated before/after footage or real 3D scene is claimed. Cafe FINAL/SOLID/MIST uses source assets. Sofa uses its verified fifth topology image. Beylikdüzü references, personal statistics and production credit data remain in the existing detail components without alteration.

Fifteen verified software studies remain. Renderers now use light/material sphere studies, Illustrator Bezier handles, Topaz/Upscayl pixel restoration, Encoder/HandBrake encoding bars; Blender, AE, Premiere and Photoshop retain their specific workflows. These are illustrative interactive graphics, not software embeds or proficiency claims.

## Local browser checks

Production preview: http://127.0.0.1:4181/portfolio-scroll/

- All twenty primary-world art buttons opened the correct detail. Escape was awaited through the real 180ms closing animation; all twenty returned focus to the originating button and exact scroll position (0px difference). A too-rapid initial test was discarded because it inspected the still-closing dialog.
- Category navigation initially raced the filtered layout; corrected with a post-refresh two-frame navigation. Environment and Modeling arrived at their section scroll margin (~90px). Category updates refresh measurements once; they no longer rebuild every world timeline.
- Cafe SOLID/MIST buttons loaded the correct real pass paths. Mobile Modeling, menu navigation, TR/EN and Light/Dark controls exercised. Light palette accents darkened for readable cues.
- Viewports: 1920x1080, 1440x900, 1280x800, 1024x768, 768x1024, 430x932, 390x844, 375x812, 320x640. No steady-state horizontal overflow, twenty primary entries retained, real portrait present in every first viewport. Transient View Transition snapshot width was not mistaken for permanent layout overflow.
- Fast native End/Home traversal reaches Contact and reverses Hero; portrait sampled opacity 1 at scrollY 945 with its perspective transform active. No React animation-frame state, unbounded scroll RAF, eager multi-video stage or global blur added.
- Initial finite eight-second probe during category rebuild: 1417 RAF intervals, mean 5.65ms, p95 5.6ms, >25ms 1, >=50ms tasks 1. After stable-shell/refresh-only changes: 1435 intervals, mean 5.57ms, p95 5.6ms, >25ms 1, >=50ms tasks 0. These are representative browser RAF cadence samples, not GPU FPS or a hardware frame-rate guarantee; they are not a controlled GPU trace.

Build PASS; full test suite 57/57 PASS; whitespace diff check PASS. Explicit reduced-motion and final live browser evidence are recorded below after verification. Hover variants are implemented in CSS; keyboard/tap controls are exercised. Physical touch hardware and GPU-level FPS are not certified.

## Final local evidence

Explicit reduced-motion branch returned mode=reduced, 20 primary entries, portrait opacity 1 and no horizontal overflow. This exercises the branch, not a physical OS preference switch. XpoMatch playback reached 66.94 seconds with readyState 4, paused=false; fullscreen entered/exited. Next Project stayed in its Product world and opened EVGA. Final console errors: zero. The portrait SHA-256 is byte-identical to the original asset.

Mario remains a 3D/Motion personal study, not an invented VFX credit. VFX presentation uses Star Wars with explicitly illustrative decoration. The stable primary-world articles own all 20 unique canonical anchors; filtered index rows do not remove deep-link targets. World entrances were diversified further: split studio/compositor headers, technical viewport entry and a smaller theatrical title strip, keeping artwork prominent.

## GitHub Pages verification

Implementation commit `5952803a7f3211fcba36771d5277dc73776d7b98` deployed successfully in Actions run `38471688450`. Actual live DOM shows the new portrait, correct Hero/About order, five worlds and 20 unique primary entries. Portrait loaded at naturalWidth 1000 from this site's own asset.

All 20 live primary dialogs opened their correct content; every close restored exact scroll position and originating focus. Live nine-width matrix repeated without horizontal overflow and with portrait within each first viewport. Category index retained filtering; a settled Product navigation arrived at top 89.72px. Cafe MIST loaded its real asset. Manual Light/Dark and mobile TR/EN exercised, with no scroll reset on language change. XpoMatch reached its full 80-second duration, readyState 4, through the independent Pages MP4; fullscreen entered/exited. The explicit live reduced-motion branch retained all 20 entries and no overflow. Final live console errors: zero.

Original full HEAD/status/remote/untracked snapshot still exactly matches the initial capture; original live site HTTP 200. No original release or deployment was modified. Only this repository's intended source and QA evidence were committed.
