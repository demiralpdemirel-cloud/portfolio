# Demiralp Demirel — Portfolio

Production portfolio for 3D, VFX and compositing work.

- Live site: https://demiralpdemirel-cloud.github.io/portfolio/
- Stack: React, Vite, GSAP and ScrollTrigger
- Deployment: GitHub Actions to GitHub Pages (`main` branch)

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project structure

- `src/main.jsx` and `src/App.jsx`: application entry and composition
- `src/components/`: page sections, project presentations and reusable UI
- `src/data/`: project, showreel and personal-site data
- `src/hooks/` and `src/utils/`: scroll, animation, media and asset helpers
- `src/styles/`: global and component styling
- `public/`: optimized still images, posters and small static media
- `.github/workflows/deploy.yml`: build and Pages deployment workflow

Featured projects and archive entries are maintained in `src/data/projects.js`; showreel items are in `src/data/showreel.js`. Media paths are resolved with the Vite base path for the `/portfolio/` project site.

## Large videos

Videos larger than GitHub's per-file Git limit are stored as assets in the public GitHub Release `media-v1` (`Portfolio Media v1`), rather than in Git history or the Pages build. Their website URLs point to those release downloads. The original local source videos remain outside version control. If replacing one, upload the replacement with the same release-asset filename and preserve the URL, or update the matching data entry and the exclusion list in `vite.config.js` and `.gitignore` together.

## Deployment

Push to `main` to run **Deploy portfolio to GitHub Pages**. The workflow builds `dist/` and deploys it using GitHub Actions; repository Pages settings must use **GitHub Actions** as the source.
