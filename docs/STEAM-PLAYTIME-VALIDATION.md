# Steam Blender integration — validation, 2026-10-14

STEAM PROFILE: 76561198324240680

BLENDER APP ID: 365670

STEAM DATA ACCESS: NOT VERIFIED / blocked by missing API key. The real unauthenticated GetOwnedGames request returned HTTP 401. The public games/XML attempt returned Sign In HTML, not a Blender record. Neither means zero playtime.

ACTUAL PLAYTIME: UNVERIFIED — no real hours/minutes claimed or fabricated.

DATA SOURCE: official Steam IPlayerService/GetOwnedGames/v1, playtime_forever minutes. The real authenticated response must still confirm that this account's Blender software entry is included. No publisher-only endpoint or public-page scraping is assumed to work.

WORKER STATUS: source ready; official Wrangler 4.151.0 dry-run packaging PASS. Not deployed; no configured Steam secret or Cloudflare authenticated deployment was available. No paid infrastructure was created.

CACHE: synthetic automated tests PASS for 600-second shared cache, expiry, concurrent-request coalescing, negative cooldown, explicit stale fallback and 24-hour discard. Cache API is per Cloudflare data center, not globally replicated. Deployed edge behavior remains unverified until setup.

API KEY SECURITY: PASS for implemented architecture and build scan. No real key was provided or stored. Worker secret is server-only; frontend receives only a public endpoint URL. CORS allowlist, fixed account/app/path, rejected queries, read-only methods, client/upstream rate limits, bounded fetches, safe errors and ignored secret files are implemented. Public response excludes other profile/game data.

FRONTEND INTEGRATION: PASS for local build and browser error state. Existing Profile / Status panel reused; removed old hardcoded 3914.9 hours. No new section, CD/catalog changes or media changes. Without a configured endpoint, card shows unavailable and no numeric fallback. Last-good data, when available, keeps its original timestamp and is explicitly labeled cached on failure.

TR/EN: PASS — browser-tested translations and locale formatting tests. Switching language does not remount/restart the number animation; formatter uses the current locale.

DARK/LIGHT: PASS — existing theme controls tested against the new card locally.

MOBILE: PASS — 390x844, card width 339px, no page horizontal overflow. Normal desktop viewport also had no horizontal overflow.

ANIMATION: 1.05-second GSAP ease-out implemented on a DOM ref, once on visibility; no per-frame React state, idle loop or scroll replay. Reduced-motion branch and locale behavior audited. Actual real-data success animation could not be browser-validated without the configured endpoint; automated fixtures are not real Steam evidence.

LOADING / SUCCESS / STALE / ERROR: implemented. Unconfigured error state browser-tested; cache/schema/error success-path logic tested with clearly synthetic unit fixtures. Do not interpret synthetic fixtures as actual playtime.

CONSOLE: no errors captured in the local card browser check.

BUILD: PASS — npm run build.

TESTS: 81/81 PASS (64 existing plus 17 Steam integration tests).

DIFF CHECK: PASS.

WORKER DEPLOYMENT: NOT PERFORMED. This document records the integration-stage checks; subsequent frontend publication is separate. Until a real Worker endpoint is configured, the published card correctly shows unavailable rather than fabricated hours. portfolio-backup and original backup artifacts were untouched.

REQUIRED USER ACTIONS:

1. Configure the owner's Steam Web API key privately as Worker secret STEAM_API_KEY using the CLI secret prompt or encrypted Cloudflare secret UI. Never send the key, password or Steam Guard code in chat.
2. Authenticate Cloudflare locally, confirm rate-limit namespace IDs are unused in that account, and deploy the prepared Worker.
3. Verify its real response explicitly contains Blender app 365670 and total minutes. If absent, investigate privately; do not treat it as zero or relabel static hours as live.
4. Set the verified public URL as .env.local VITE_STEAM_PLAYTIME_URL for local use and repository Actions variable STEAM_PLAYTIME_URL for Pages. Rebuild and validate refresh/cache/success animation, then publish the frontend.

Detailed commands, cache limitations, security notes and official documentation links: workers/steam-playtime/README.md.

FINAL STATUS: IMPLEMENTATION READY LOCALLY; LIVE STEAM DATA AND DEPLOYMENT PENDING SECURE CREDENTIAL SETUP.
