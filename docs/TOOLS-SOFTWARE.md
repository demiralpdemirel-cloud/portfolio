# TOOLS / SOFTWARE — local revision

## Scope

Only the software showcase was redesigned. Existing discipline cards, sections, CD catalog, project modals, Steam card and theme architecture were preserved. This report records local implementation checks; subsequent publication is handled separately.

Removed from the tool roster: **Upscayl** (called Upscally in the request), Adobe Media Encoder, HandBrake, and **Keying Suite** following the user's explicit clarification. Their unrelated mentions in project/software credits are not deleted.

## Eleven remaining tools

| Software | Distinct interaction |
|---|---|
| Blender | Six-face default cube orbits the logo once, with its own 3D rotation and a viewport orbit/axis guide. |
| OctaneRender | Counter-moving optical rings, finite convergence samples and a narrow light sweep. |
| Cinema 4D | Six staggered MoGraph clones rearrange, rotate and settle into their array. |
| Corona Renderer | Architectural portals separate and a warm local daylight patch opens across the floor. |
| Adobe After Effects | Left/right radial micro-bursts start 0.5 seconds apart; the logo evades right, then left, then settles. |
| Boris FX Mocha Pro | Four tracking corners and a crosshair follow the same two-stage planar trajectory over a tracking grid. |
| Boris FX Silhouette | A roto contour is drawn around a silhouette; spline control points appear and a pen shifts into position. |
| Topaz Video AI | Coarse tiles recede while fine detail appears, synchronized to a small recovery scan line. |
| Adobe Photoshop | Image planes separate behind the logo and crop/selection corners resolve around the composition. |
| Adobe Illustrator | A Bezier curve draws between anchors while tangent handles and control points appear. |
| Adobe Premiere Pro | Timeline lanes, playhead travel and a split cut separate adjacent clips; the logo clears room for the edit. |

Each logo remains a separate undistorted image. Animated geometry is an authored workflow illustration, not an embedded software interface or claimed project output.

## Interaction / performance

- One prebuilt paused GSAP timeline per card. No new timeline is created on hover; exit reverses that same timeline smoothly.
- Timelines are finite, roughly 0.8–1.85 seconds. No infinite idle loop, separate RAF loop, intervals, particle spawning or per-frame React state.
- A single shared IntersectionObserver and one shared tab-visibility listener suspend/reset offscreen or hidden cards. Observer/listener cleanup and GSAP context.revert run on unmount.
- React state changes only for deliberate tap/click pressed state. Pointer/focus motion is imperative and ref-driven.
- Mostly transform/opacity animation. The Illustrator and Silhouette paths additionally animate a small local SVG stroke dash offset. No per-frame layout reads, layout-size animation, full-screen effects, blur filters, shadow spam or permanent will-change layers.
- AE uses two preallocated six-ray bursts, not a runtime particle system. The entire showcase contains 244 descendant DOM nodes in the tested build; 20 repeated AE on/off cycles left that count unchanged and produced no console warnings/errors.
- All 11 logo files are local, approximately 67 kB total, lazy-loaded with async decode and object-fit:contain. No visitor requests to logo vendors/CDNs.
- The idle presentation uses restrained static reflections/geometry; it intentionally does not consume a continuous animation loop.

## Accessibility / responsive

- Whole-card native buttons: exact app name, associated usage text and aria-pressed tap state. Enter/Space works.
- Keyboard focus uses a visible outline and static emphasis, not the full choreography. Enter can explicitly activate the fuller motion.
- Reduced-motion preference keeps timelines at their base pose and uses static contrast/outline. Preference changes are listened to and cleaned up.
- Four columns desktop, three tablet, two mobile, one on very narrow screens. Coarse-pointer and low-core paths shorten motion; mobile geometry is scaled down.
- Tap toggles the finite animation/emphasis; blur releases selection. No hover prerequisite on mobile.
- All new workflow cues have TR/EN text. Existing usage labels are preserved.

## Logo provenance

Brand marks remain the property of their respective owners; presentation identifies software used, without endorsement. Artwork is not AI-generated or hand-redrawn. The Octane asset is a curated Simple Icons distribution, not a vendor download; all other assets below were obtained from vendor sites or official press packs.

| File under public/media/tools/logos | Source |
|---|---|
| blender.svg | https://www.blender.org/wp-content/themes/bthree/assets/icons/favicon.svg — official Blender icon; https://www.blender.org/about/logo/ |
| after-effects.svg | https://milo.adobe.com/libs/img/mnemonics/svg/after-effects.svg |
| photoshop.svg | https://milo.adobe.com/libs/img/mnemonics/svg/photoshop.svg |
| illustrator.svg | https://milo.adobe.com/libs/img/mnemonics/svg/illustrator.svg |
| premiere.svg | https://milo.adobe.com/libs/img/mnemonics/svg/premiere-pro.svg |
| cinema.svg | Cinema 4D/White/Maxon_Cinema_4D_Stacked_White.svg from https://mxwebnuxtprod01.blob.core.windows.net/media/images/Branding/Cinema_4D_202512.zip ; linked by https://www.maxon.net/en/about-maxon/branding |
| corona.svg | https://static.chaos.com/images/assets/000/024/296/original/generic-logo-color-white-corona.svg?1741255658 ; linked from https://www.chaos.com/corona |
| mocha.png | logos/MochaPro_Horizontal_dark_background.png in https://cdn.borisfx.com/download_files/boris-fx-mocha-pro-2026-5.zip |
| silhouette.png | logos/boris-fx-silhouette-horizontal-dark-background.png in https://cdn.borisfx.com/download_files/boris-fx-silhouette-2026.zip |
| topaz.svg | https://cdn.prod.website-files.com/6005fac27a49a9cd477afb63/668c28beecf1282db2ca4dd8_video-icon-new.svg ; linked from https://www.topazlabs.com/video-pro |
| octane.svg | https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/octanerender.svg ; brand identification checked against OTOY documentation. |

Boris press-pack source: https://borisfx.com/company/press-and-media/ . Initial low-contrast SVG variants were replaced with official dark-background PNGs; no user asset was deleted.

## Verification

- Production build: PASS.
- Full suite: 87/87 PASS (includes existing Steam tests and six new software tests).
- git diff --check: PASS.
- Browser: all 11 logos loaded; all 11 cards entered and exited their pressed/active state without errors. Actual Blender orbit/cube transforms and AE left-burst/positive evasive movement were observed during motion. AE's half-second alternate timing is also asserted in tests.
- Keyboard: Tab moved focus to Illustrator with a visible outline; Enter toggled its state.
- Mobile 390x844: two 163.5px columns, no horizontal page overflow, Blender tap toggled correctly.
- Desktop 1440x1250: four columns, all 11 cards visible in the inspected showcase view, no overflow.
- Dark and light themes plus TR/EN switching checked locally.
- 20 repeated AE activation/deactivation cycles: 244 nodes before and after, no warnings/errors captured.
- Reduced-motion and tab-hidden cleanup are covered by code-path/static assertions; an OS-level reduced-motion preference switch was not performed in the browser session. No instrumented hardware FPS guarantee is claimed.

Local production preview: http://127.0.0.1:4183/portfolio/#capabilities

## Changed files for THIS task

- src/App.jsx — only the tool grid class changed in this task; its prior Steam integration is retained.
- src/data/tools.js
- src/data/softwareIdentity.js (new)
- src/components/ToolStudy.jsx
- src/components/software.css (new)
- src/motion/useSoftwareMotion.js (new)
- src/i18n/translations.js — new software cue translations alongside retained Steam translations.
- tests/scroll.test.mjs — observer lifecycle assertion follows the extracted motion hook.
- tests/software.test.mjs (new)
- public/media/tools/logos/ — 11 local assets.
- docs/TOOLS-SOFTWARE.md (this report).

Pre-existing uncommitted Steam integration files, unrelated untracked user files and backup repositories were not staged, deleted or rewritten by this task.
