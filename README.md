# iPhone Spotter

Spin a 3D iPhone, pick its name from four Choices. Ten Questions per Game. Domain language lives in [CONTEXT.md](CONTEXT.md).

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
On Netlify: "Add new site" → import this repo; `netlify.toml` sets the build command and publish folder.

## Adding an Asset

Download the glTF/GLB (Sketchfab: "Download 3D model" → glTF), then:

```bash
npm run import-asset -- path/to/scene.gltf --phone iphone-x \
  --creator "Creator Name" --source https://sketchfab.com/3d-models/... --license "CC-BY-4.0"
```

The script stands the phone upright, scales it to the Phone's real height, compresses it, writes `public/assets/<phone>.glb` and records its Credit. It warns if proportions don't match the Catalog or no body material was found for repainting. Then check by hand: printed text or model numbers that give the answer away, and whether the back faces the camera (set `yawDeg` in `assets.json`).
