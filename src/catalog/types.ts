/** One official colour a Phone was sold in. `hex` is an approximation used for repainting. */
export interface Finish {
  name: string
  hex: string
}

export interface Dimensions {
  heightMm: number
  widthMm: number
  depthMm: number
}

/** One distinct iPhone release. See CONTEXT.md. */
export interface Phone {
  /** Stable slug, also the Asset filename stem: `public/assets/<id>.glb`. */
  id: string
  name: string
  year: number
  dimensions: Dimensions
  finishes: Finish[]
  /** Physical features that set this Phone apart, shown after the player answers. */
  tells: string[]
}

export interface Credit {
  creator: string
  sourceUrl: string
  license: string
}

/** A processed 3D file for one Phone, written by `npm run import-asset`. */
export interface Asset {
  phoneId: string
  /** Path under `public/`, e.g. `assets/iphone-x.glb`. */
  file: string
  credit: Credit
  /**
   * Material names repainted with the chosen Finish. Empty means the Asset
   * can't be repainted and is always shown in `nativeFinish`.
   */
  bodyMaterials: string[]
  /** The Finish this Asset was modelled in; required when `bodyMaterials` is empty. */
  nativeFinish?: string
  /** Extra turn around the vertical axis, in degrees, if the import faced the wrong way. */
  yawDeg: number
  /** Turn around the front-to-back axis, in degrees; 180 fixes an upside-down import. */
  rollDeg: number
}
