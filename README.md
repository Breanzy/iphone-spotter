# iPhone Spotter

**Live:** https://iphone-spotter.netlify.app/

Spin a 3D iPhone, pick its name from four Choices. Ten Questions per Game. Domain language lives in [CONTEXT.md](CONTEXT.md).

This is a hobby mock project, built for a brief requirement: practise telling every iPhone apart by its physical looks alone. It is not a product and is not maintained as one.

> **Not for redistribution.** The 3D models in `public/assets/` were made by third parties and are **not** covered by any license this repo could grant. Several are non-commercial (CC BY-NC), share-alike, Sketchfab "Free Standard", or under GrabCAD's community terms. Do not reuse, resell or redistribute them. Each model's creator, source and license are listed in [`src/catalog/assets.json`](src/catalog/assets.json) and on the in-game Credits screen.
>
> Not affiliated with or endorsed by Apple. iPhone is a trademark of Apple Inc.

## Limitations

- **Two Phones have no 3D model.** No usable free model of the original iPhone (2007) or the iPhone 3G could be found; they appear as plain true-size boxes.
- **Uneven model quality.** Models come from different creators and sites. Some are 3D-print or CAD dummies with little surface detail (the 3GS camera is barely visible).
- **Most colours are fixed.** Only a few models can be repainted, so most Phones always appear in the colour their model was made in rather than a random official Finish.
- **Catalog data is unverified.** Dimensions, Finishes and Tells in `src/catalog/phones.ts` were written from memory and not checked against Apple's spec pages.
- **Look-alikes are hard on purpose.** Near-identical Phones (X vs XS, 6 vs 6s) can appear as each other's Distractors.
- **Heavy download.** The models total ~70 MB; each Game loads about 10–20 MB.
- **No accounts or saved scores.** Everything resets on reload.
- **Catalog ends at the iPhone 17 line-up** (no 17e or later).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # game logic + Catalog sanity checks
npm run build
```

## Layout

- `src/catalog/phones.ts` — the Catalog: every Phone with dimensions, Finishes and Tells. **Written from memory; verify against Apple's spec pages.**
- `src/catalog/assets.json` — Asset manifest (file, Credit, repaintable materials, yaw). Written by the import script.
- `src/game/game.ts` — builds a Game from the Catalog.
- `src/viewer/PhoneStage.tsx` — 3D stage: cm grid, true-scale Phone, free rotation, stand-in box when no Asset exists.
- `src/config.ts` — `ALLOW_STAND_INS`, Game size.

## Deploying

Static site, no backend. Assets ship as plain files in `public/assets/` and are committed with the code.
Deployed on Netlify at https://iphone-spotter.netlify.app/ — every push to `main` redeploys. `netlify.toml` sets the build command and publish folder.

## Adding an Asset

Download the glTF/GLB (Sketchfab: "Download 3D model" → glTF), then:

```bash
npm run import-asset -- path/to/scene.gltf --phone iphone-x \
  --creator "Creator Name" --source https://sketchfab.com/3d-models/... --license "CC-BY-4.0"
```

For 3D-print or CAD files (STL, STEP, IGES), convert first with `npx tsx scripts/convert-to-glb.ts in.stl out.glb`. Import options: `--drop Part1,Part2` removes stray parts such as a floor or stand; `--align` straightens a phone modelled at an angle.

The script stands the phone upright, scales it to the Phone's real height, compresses it, writes `public/assets/<phone>.glb` and records its Credit. It warns if proportions don't match the Catalog or no body material was found for repainting. Then check by hand: printed text or model numbers that give the answer away, and whether the back faces the camera (set `yawDeg` in `assets.json`).
