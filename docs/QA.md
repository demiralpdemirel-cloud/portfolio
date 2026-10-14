# Portfolio Scroll — QA and independence

## Original protected

Source snapshot: original portfolio HEAD `db0b7c3f76be50e25017ad7ed178c3b01b6dfb3e`. No original source, branch, remote, workflow, release or user file is modified. The new folder was absent before creation; the remote name was checked absent. No predecessor alternate site is reused.

Twelve canonical data files are byte-identical to the original, verified with SHA-256 in `source-inventory.json`. Nine project records and eleven production records; all twenty catalog entries retained. Cafe exact statistics and FINAL/SOLID/MIST, Sofa five views, Interior gallery/film, Mario main/secondary film, Beylikdüzü exterior references, production metadata/roles/source links and every verified tool/profile/education record are preserved. Orhan's null personal role stays null, not invented.

## Motion architecture

CSS 3D perspective, not a WebGL scene or real model viewer. A single GSAP/ScrollTrigger owner creates reversible responsive scene timelines and cleans them on revision/unmount. No pin spacers, animation-frame React state or independent scroll RAF loop. Scenes: Hero dolly/fragments; About portrait/word depth; Profile panels; cinema approach; catalog entry/metadata depth; education line; capabilities/workflow diagrams; final contact assembly.

Mouse tilt caches geometry instead of measuring every pointer event. Hover reset, focus and tap feedback are available. All fifteen tool previews are explicitly illustrative, not actual software embeds or proficiency claims. Their CSS animation stops offscreen and when the tab is hidden. English is default; language and Ambient preferences are isolated from the original site's storage. Themes are user-controlled at any section; scroll cannot change them.

Base markup remains visible without timelines. System reduced motion is supported; `?reduced-motion=1` permits direct browser QA of that branch without claiming the physical OS setting was tested. Normal users do not enter reduced motion as a performance shortcut.

## Local runtime evidence

Production preview: http://localhost:4181/portfolio-scroll/

- All twenty dialogs were opened with keyboard Enter and closed with Escape; final measured restoration difference **0 px** for every entry and focus returned to the same card. Mouse opening exercised too. An initial keyboard/scroll-anchor interaction was corrected in the new project's modal hook only.
- Canonical Orhan null-role startup rendering issue caught and corrected without adding a role.
- Actual Showreel playback (420.053 seconds), fullscreen view entered and exited; screenshot retained.
- Actual EVGA, Keyboard, XpoMatch, Mario, Star Wars, ASELSAN and Turkcell playback. ASELSAN reached its 58.8-second end with readyState 4. Other first-frame playback confirmed through real currentTime/readyState.
- Four primary workflow controls: Blender, After Effects, Premiere, Photoshop responded to click; hover/focus/tap are implemented without layout expansion.
- TR/EN exercised, including mobile Cafe detail with exact numbers. Dark/light exercised at depth after removing the original Hero-only manual-toggle guard from this independent copy.
- Viewport checks: 1920x1080, 1440x900, 1280x800, 1024x768, 768x1024, 430x932, 390x844, 375x812, 320x640. No steady-state horizontal overflow; responsive catalog 5/4/3/3/2/1/1/1/1 columns.
- Build PASS; full suite 54/54 PASS; dependency audit zero vulnerabilities. A transitive source-map-js security patch was applied to this new lockfile only.

## Media evidence

All thirteen effective video URLs returned HTTP **206** to an actual `bytes=0-1023` request. Exact content ranges, redirected URLs and types are recorded in `source-inventory.json`; no range support is assumed. The original's Pages/Release hosting is an explicit read-only video-delivery dependency. Images and XpoMatch MP4 are independent copies. No retired portfolio-motion/universe video URL is used. Masters were not transcoded or altered.

## Performance evidence / limits

Finite eight-second production-preview probe: 1,441 samples, mean RAF interval 5.55 ms, p95 5.7 ms, >25 ms intervals 0, >=50 ms long tasks 0. Showreel playback sample: 1,440 intervals, mean 5.56 ms, p95 5.7 ms, >25 ms 0, long tasks 0.

These are **RAF cadence measurements, not GPU-rendered FPS**. A full GPU/Layers trace, physical touch hardware, physical 120 Hz certification and exhaustive heap-cycle profiling are not available and are not claimed. Responsive testing is browser viewport testing. Initial startup errors belong to a superseded local bundle; final live console is checked separately after deployment.

## Design guidance

Sites presentation guidance informed artwork-first composition and differing chapter motion, while the explicit React/Vite/GitHub requirements determine implementation/hosting. No generated or invented project artwork is used.

## Live Pages verification

Initial deployment: `ba8983f11b4fbb9a0e61e22b58b53301d2eadb25`, Actions run `38184061574` SUCCESS. Live: https://demiralpdemirel-cloud.github.io/portfolio-scroll/

- All twenty live catalog dialogs opened and closed with keyboard controls: restoration 0 px and focus returned for every entry. Six filter counts: 20 / 5 / 3 / 7 / 3 / 11.
- Live playback confirmed for XpoMatch, EVGA, Keyboard, Mario, Star Wars, ASELSAN and Turkcell. All reached readyState 3 or 4 with advancing currentTime. Showreel reached 20.5 seconds, readyState 4; fullscreen entered/exited. A subsequent language switch preserved playback (20.52 to 20.83 seconds), paused=false and exact scrollY 3432. Offscreen playback arbitration pauses films intentionally.
- New independent XpoMatch live MP4 returned actual HTTP 206, video/mp4, 1024 bytes for requested range. Original videos remain explicit read-only hosting dependencies.
- Mobile Cafe MIST selected, full-resolution viewer opened, nested Escape returned to the parent dialog. Turkish statistics and description checked; no scene numbers changed.
- Live nine-width matrix repeated: 1920, 1440, 1280, 1024, 768, 430, 390, 375, 320; all twenty cards retained, no horizontal overflow. Columns: 5 / 4 / 3 / 3 / 2 / 1 / 1 / 1 / 1. Mobile production modal width matched viewport.
- Manual Light and Dark switch checked; native navigation/scroll left theme unchanged. Four software controls returned aria-pressed=true. Fast native End/Home traversal reached Contact and returned Hero to scrollY 0 and translate(0px, 0px).
- Live eight-second probe: 1440 RAF intervals, mean 5.56 ms, p95 5.7 ms, >25 ms 0, >=50 ms long tasks 0. This is not a GPU FPS certification.
- Original HEAD, remote and full worktree/untracked listing exactly match the pre-task captured baseline. Original live page returned HTTP 200. No original release or deployment was changed.
- Final build PASS, full suite 54/54 PASS, diff whitespace check PASS. Final live console checked separately; evidence screenshots retained under `docs/qa/`.
- Live mobile menu opened and navigated to Works. Live explicit reduced-motion QA branch returned mode=reduced, all twenty cards, no transform-driven Hero and no overflow; this does not claim a physical OS preference test. Final live console errors: zero.
