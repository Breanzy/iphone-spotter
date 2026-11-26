import type { Asset } from './types'
import manifest from './assets.json'

// Written by `npm run import-asset`; edit `bodyMaterials` or `yawDeg` by hand if needed.
export const ASSETS: Asset[] = manifest as Asset[]

export const ASSETS_BY_PHONE: ReadonlyMap<string, Asset> = new Map(ASSETS.map((a) => [a.phoneId, a]))
