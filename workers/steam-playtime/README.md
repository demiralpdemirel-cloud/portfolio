# Steam Blender playtime

Status: source and frontend prepared; **real account playtime is not yet verified**. No Steam key or Cloudflare login was available during implementation. The Worker is not deployed. The frontend can be published safely in its unavailable state until the public endpoint is configured.

## Architecture

The existing Profile / Status card fetches a fixed read-only `/blender-playtime` Worker endpoint once per page load. It never calls Steam directly. The secret stays inside the Worker. Only Blender app 365670 for Steam ID 76561198324240680 can be queried. No other account or app parameter is accepted.

Worker calls the official `IPlayerService/GetOwnedGames/v1/` endpoint using `input_json`, `include_played_free_games`, `include_appinfo` and a Blender app filter. `playtime_forever` must be an explicit non-negative integer. Missing Blender, private data or invalid payload means unavailable, **not zero**. A successful real response is still required to prove that this account's software record is included. Do not enable a scraper or guessed fallback if it is absent.

The API exposes only appId, minutes, hours, updatedAt, source, cached and stale. Hours retain full conversion precision; the UI displays one decimal. This is Steam-recorded usage only, not total Blender experience.

## Current real-data checks

On 2026-10-14 the unauthenticated official API request returned 401. The public Community games/XML attempt returned a Sign In HTML page without app 365670. Neither result proves that the account has zero Blender minutes or that an authenticated GetOwnedGames response cannot include Blender. Actual total minutes/hours remain UNVERIFIED.

`GetSingleGamePlaytime` is not an automatic substitute: Valve documents that its key must be associated with the app. A regular portfolio key cannot be assumed to have Blender-publisher privileges.

## Setup — secret never enters chat, source or browser

Run from this directory using a supported Node version and the official npm `wrangler` package:

```powershell
npx wrangler login
npx wrangler secret put STEAM_API_KEY
npx wrangler deploy
```

Enter the Steam Web API key only into the CLI secret prompt (or Cloudflare's encrypted Worker secret UI). Never send the key, Steam password or Steam Guard code in chat. If the Worker must first exist, deploy the configuration without a key, then add the secret: it safely returns 503 until configured.

The profile owner can obtain a regular Web API key via https://steamcommunity.com/dev/apikey while signed into Steam themselves. The site never needs visitor Steam login. Do not create paid infrastructure without approval; no paid resource was provisioned here. Review account plan/quotas before deploying.

Wrangler config fixes the GitHub Pages origin. CORS allows that exact origin, not `*`; CORS is browser enforcement, not authentication for this deliberately public read-only endpoint. Requests without Origin remain usable for CLI health checks. Per-client rate limiting (30/minute) and upstream protection (1/minute per location) are configured with account-unique namespace IDs: confirm these two IDs do not conflict with other account Workers before deployment. Client IP is used transiently as a rate-limit key, not returned or logged.

## Verify the real software record BEFORE claiming success

```powershell
Invoke-RestMethod 'https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/blender-playtime'
```

A success must show appId 365670, real minutes, hours exactly minutes/60 and an actual updatedAt. A second request should show cached true with the same updatedAt. After ten minutes, a successful refresh should advance updatedAt. If unavailable, check the real upstream response privately in a trusted local/server environment; do not log the API URL or paste a key-bearing response. Missing software remains unavailable. Do not invent a fallback total.

After successful verification set the **public URL only** in root `.env.local`:

```dotenv
VITE_STEAM_PLAYTIME_URL=https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/blender-playtime
```

Then rebuild the frontend. For GitHub Pages configure the public endpoint as the repository Actions variable `STEAM_PLAYTIME_URL`. The existing Pages build step now passes this public URL as `VITE_STEAM_PLAYTIME_URL`; an absent variable safely leaves the card unavailable. The rest of the Pages workflow is unchanged. Never create `VITE_STEAM_API_KEY` or put the private key in GitHub frontend build variables.

## Cache and failure behavior

- Shared Cloudflare Cache API record: fresh for 600 seconds, retained up to 24h for explicitly stale fallback. Cache contents are per data center, **not a single globally serialized cache**. A first visitor in another region can trigger another Steam request.
- Concurrent misses coalesce within an isolate; upstream limiter protects other isolates in the location. Failure metadata suppresses repeated upstream attempts for 60s. Cache eviction can still cause a new fetch, subject to limiter.
- Frontend fetch uses `no-store`, no cookies and a timeout. Every reload checks the Worker; language/theme/scroll do not refetch. No idle polling.
- Browser localStorage retains only validated last-good public playtime, at most 24h, as an explicitly stale fallback when fetch fails. The original sync timestamp is preserved. No cached entry means unavailable, not 0.
- No endpoint configured: unavailable state and no request. The old static 3914.9 value was removed rather than relabeled live.
- 1.05s GSAP number animation uses a DOM ref, never React state per frame. IntersectionObserver starts it once on visibility. Language switching reformats the existing displayed value without restarting. Reduced motion displays the value directly.

## Local testing

Copy `.dev.vars.example` to `.dev.vars` and enter the real key locally, or use the CLI secret setup. Both `.dev.vars` and environment files are ignored; examples contain no secret.

```powershell
npx wrangler dev --var ALLOWED_ORIGINS:http://127.0.0.1:4183
```

Use `http://127.0.0.1:8787/blender-playtime` as root `VITE_STEAM_PLAYTIME_URL` for that local build only. Never deploy a localhost endpoint. Cache API behavior in preview/local environments is not proof of deployed edge caching.

Root `npm test` includes synthetic Worker/cache/error/CORS/rate-limit/schema tests. Their fixture numbers are never production data or evidence of this account's actual usage.

## Official references

- https://partner.steamgames.com/doc/webapi/iplayerservice
- https://partner.steamgames.com/doc/webapi_overview
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/workers/runtime-apis/cache/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
