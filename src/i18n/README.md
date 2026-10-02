# Portfolio localization

`LanguageProvider` owns the language, defaults to English, and persists manual
selection under `portfolio-language`. No geolocation, router or extra dependency.

Use `useLanguage()` and `t(copy)` for UI, labels, descriptions, fallback copy and
accessibility text. `translations.js` contains the single Turkish catalog and
dynamic accessibility patterns. Existing English content is preserved as source
copy. Long-form data uses `bilingual(englishCopy)` to expose `{ en, tr }` fields.
Add the Turkish counterpart to the catalog when adding a new bilingual field.
Production/project titles, software names, IDs and asset paths are not translated.
`formatDate()` uses Intl with the selected locale.

Keep React keys and animation dependencies language-independent. Language changes
update copy in place, refresh ScrollTrigger measurements once, and retain scroll
position. Do not remount chapters or add language to reveal-effect dependencies.
Native dialogs and portal viewers include their own switcher so it stays within
the focus trap and top layer. The global switcher is hidden while a modal is open.

Run `node --test tests/i18n.test.mjs`, `npm run build`, and test both languages in
the production preview, including open modals, refresh and mobile wrapping.
