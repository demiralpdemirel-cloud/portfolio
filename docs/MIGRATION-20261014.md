# Portfolio migration — 2026-10-14

Production repository and URL remain `demiralpdemirel-cloud/portfolio` and `https://demiralpdemirel-cloud.github.io/portfolio/`.

Source is the current local `portfolio-scroll` worktree, including the uncommitted jewel-case collection, reversible left-slide/hinged-cover reveal and Collection-before-In-Motion ordering. A separate immutable local source snapshot retains those changes. The original `portfolio-scroll` folder and repository remain available.

## Verified backup before integration

- Private repository: https://github.com/demiralpdemirel-cloud/portfolio-backup
- Original and backup main: `db0b7c3f76be50e25017ad7ed178c3b01b6dfb3e`.
- All original branches/tags and full reachable Git history copied and checked.
- Every tracked file restored from an independent clone and compared; canonical Git blobs also checked where Windows LF/CRLF normalization changes text bytes.
- All ten original release videos uploaded, downloaded again and SHA-256 verified.
- The backup `media-v1` release also contains `original-production.zip`, local site validation documents, release metadata, tracked-file/media inventories and restore verification.
- Restored original build and all 51 original tests passed.
- Backup Actions disabled; no backup Pages publication required.
- Unrelated user files, IMDb research, generated covers, caches and credentials were not copied into the migrated application. The original local user files remain in place. No credentials are stored in this repository.

## Delivery

Vite base is `/portfolio/`. Existing public media files and public `media-v1` release URLs are preserved, including all web-video derivatives, XpoMatch and breakdowns. The production application does not require the private backup or the portfolio-scroll repository at runtime. Video loading remains lazy.

The existing Pages workflow remains on main and runs dependency installation, the current tests, production build and diff checks before deployment. No repository rename, remote replacement or history rewrite is used.

## Rollback without force push

The pre-migration production commit is tagged `pre-scroll-migration-20261014`. To restore the original application, revert the migration commit on a normal rollback branch, run `npm ci`, `npm run build`, the original `node --test tests/*.test.mjs`, and `git diff --check`, then merge and push normally to main. This recreates the original tracked source and workflow while retaining later history.

The original release URLs remain intact, so rollback does not require media relocation. If an original media file ever needs recovery, download it from the authenticated private backup release and validate its SHA-256 using `media-inventory.json`. The saved `original-production.zip` can also reproduce the archived static build. Never force-push or mirror-push to production.
