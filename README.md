# Portfolio Scroll

An independent scroll-driven portfolio for Demiralp Demirel. React / Vite / GSAP / ScrollTrigger. Native scrolling with art-directed CSS 3D layers; this is not a WebGL character or an actual 3D model viewer.

Portrait-led identity and Hero dolly; About as the second scene with continuing Profile; approaching cinema screen; compact exploration index; five exclusive primary creative worlds; expanding modal presentation; fifteen verified software workflow studies; education timeline; cinematic contact.

The creative worlds have independent compositions and scroll vocabularies: directed-light Product Studio, architectural line/plane/render reveal, illustrative compositing Z-planes, real Sofa topology-to-shaded presentation, and theatrical production posters/credits. Each of the 20 works belongs to exactly one primary presentation; the small index provides navigation without repeating its artwork. Category selection navigates after layout refresh. Cafe FINAL/SOLID/MIST and all existing media/detail/reference data remain authoritative. Decorative composition planes are explicitly illustrative, not invented project breakdowns or real 3D geometry.

20 unique canonical works, 9 project records and 11 production records. All verified descriptions, software, credits, passes, geometry statistics, references, external links and education/profile information are retained. Unknown roles remain unknown. Source: original portfolio at `db0b7c3f76be50e25017ad7ed178c3b01b6dfb3e`.

## Run

```sh
npm ci
npm run dev
npm run build
npm run preview
npm test
```

Dev port 5180. Vite production base `/portfolio/`. For a separate production preview, run `npm run preview -- --host 127.0.0.1 --port 4182` and open `http://127.0.0.1:4182/portfolio/`.

## Motion and accessibility

One `useScrollWorld` owner manages responsive GSAP timelines and cleanup. No animation-frame React state, pin spacers or scroll hijacking. Reverse scroll reverses timelines. Base markup remains visible if animation never initializes. System reduced motion returns a stable layout; `?reduced-motion=1` is an explicit QA fallback branch, not a hidden performance shortcut. Native dialogs preserve Escape, keyboard focus and scroll position. Video playback lifecycle and localized Ambient Light are reused.

Tools are lightweight illustrative workflow diagrams, not embedded software or invented proficiency claims. Open/click or keyboard focus works without hover; CSS playback suspends offscreen/hidden.

## Media and independence boundary

Images, responsive thumbnails and full-resolution stills are local copies. XpoMatch's faststart MP4 and all existing `/portfolio/media/` delivery derivatives are retained in this repository. Large originals remain in this repository's public `media-v1` release. No runtime video depends on portfolio-scroll, portfolio-motion, portfolio-universe or the private backup repository. Ignored local release mirrors are omitted from Pages builds.

Language preferences and Ambient preferences use this project's own storage keys. Dark is the default; scrolling does not change theme. The existing manual Liquid Glass theme renderer is independently copied.

`?qa=1` exposes a finite eight-second RAF/long-task probe. Results are RAF cadence, **not GPU-rendered FPS**. No 60/120 FPS guarantee is asserted without hardware-level measurements.

The 2026-10-14 migration retains this repository and its history at the existing `/portfolio/` URL. The previous site is independently preserved in the private `demiralpdemirel-cloud/portfolio-backup` repository at `db0b7c3f76be50e25017ad7ed178c3b01b6dfb3e`, with all ten release videos, SHA-256 inventories and a production ZIP in its `media-v1` release. See `docs/MIGRATION-20261014.md` for rollback and validation. Earlier design evidence remains in `docs/QA.md`.

The current portrait/world revision is documented separately in `docs/CREATIVE-WORLDS-QA.md`.
