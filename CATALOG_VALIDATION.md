# Project catalog — 2026-10-12

Only the original portfolio application was redesigned. Hero, About, Profile/Status, Showreel, Education, Capabilities, Contact, ThemeController, Liquid Glass and Ambient implementations are retained. Work now renders one catalog instead of duplicate large project chapters. Navigation WORKS points to #work; cards retain persistent project IDs and open existing dialogs.

## Canonical content

20 unique works: 9 project records (8 personal, XpoMatch commercial) and 11 production records (10 Experience entries plus the verified Turkcell breakdown). ASELSAN and Mario appear once. All original data records are retained. Production roles derive from existing verified sources. Orhan has no invented personal role; Kardeş Takımı 2 remains series context, not a personal credit. Poster-less AŞK VE TAHT uses typography, not fabricated artwork.

Six bilingual filters. Production breakdowns remain accessible within the corresponding production modal. Original project descriptions, passes, gallery, references, software, credits and links remain in existing project details.

## Images / performance

38 480/960 px WebP derivatives for 19 existing covers; source files untouched. Lazy responsive images; catalog contains zero video players. Wide production art is contained to avoid cutting faces; portrait Osman key art uses 50% 20% focal metadata. Modal images retain object-fit: contain and full-quality media on demand. No new animation-frame React updates or expensive full-screen effect introduced.

## Local browser QA

Production preview: http://localhost:4180/portfolio/

- All original 19 cards: modal opens, Escape close, exact scroll restoration, focus returned to originating card. Additional Turkcell modal checked separately on mobile.
- Six filters exercised; final production 11, brand 5, environment 3. Both languages exercised.
- Actual playback: XpoMatch, EVGA, Keyboard, ASELSAN, Mario, Star Wars, Turkcell. ReadyState 4 and paused=false observed; ASELSAN uses the original repository release.
- Dark and manual light theme exercised without changing theme machinery.
- 1920x1080 / 1440x900 / 1280x800 / 1024x768 / 768x1024 / 390x844 / 320x640: 5 / 4 / 3 / 3 / 2 / 1 / 1 columns. A pre-existing body min-width/scrollbar conflict at 320 px was corrected; final 320 px document scrollWidth equals clientWidth (305 px).
- Fresh preview console: no captured errors. Browser viewport emulation, not a claim of seven physical device tests.
- Build PASS; complete test suite 51/51 PASS; git diff --check PASS.

## Source protection / publication order

Before change: original HEAD and origin/main both 2a9e0d945072ba08167580eb4180e33b07900abb; main branch, tracked tree clean, unrelated user untracked files preserved.

Motion local HEAD d286fad09b55148049afbd6b0d3f2f831382190e; origin/main 3c364d01320c6dbc62867aba2b7ad7a2939dfd31. Its three existing modified files were preserved. Universe local/origin HEAD 8a55bcb6f5982910c71848638d16a6a792637056; clean.

Verified complete Git bundle backups: C:/Users/demiralp/Documents/ChatGPT/portfolio-backups/catalog-2026-10-12/. Motion's existing modified source files were separately copied into that backup directory. Local folders and GitHub repositories are retained. Main source/public/workflow/config search found no dependency on alternative repository or Pages URLs.

Main publication and live verification must precede disabling portfolio-motion and portfolio-universe Pages. No repository deletion is authorized without separate user approval; no local folders are deleted. Disabling Pages does not delete releases or source backups.

Reference: supplied production catalog screenshot informed five-column poster/metadata composition. Sites presentation guidance was used only for composition/QA; the existing React/Vite/GitHub hosting is retained.
