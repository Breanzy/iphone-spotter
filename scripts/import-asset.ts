/**
 * Turns a downloaded glTF/GLB into an Asset the game can show.
 *
 *   npm run import-asset -- <file.glb|scene.gltf> --phone iphone-x \
 *     --creator "Jane Doe" --source https://sketchfab.com/3d-models/... --license "CC-BY-4.0" [--yaw 180] [--drop Floor,Stand] [--align]
 *
 * Stands the phone upright (longest axis -> +Y), scales it to the Phone's real
 * height in cm, puts its base on y=0, compresses with Meshopt, writes
 * public/assets/<phone>.glb and upserts src/catalog/assets.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { NodeIO, getBounds, type vec3, type vec4 } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import { PHONES_BY_ID } from '../src/catalog/phones'
import type { Asset } from '../src/catalog/types'

const MANIFEST = 'src/catalog/assets.json'
const BODY_MATERIAL_HINT = /body|frame|back|housing|chassis|shell|case|paint|color|colour/i

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    phone: { type: 'string' },
    creator: { type: 'string' },
    source: { type: 'string' },
    license: { type: 'string' },
    yaw: { type: 'string', default: '0' },
    // Comma-separated node names to delete first, e.g. a floor plane or display stand.
    drop: { type: 'string', default: '' },
    // Straighten a phone that was modelled tilted (e.g. leaning on a stand).
    align: { type: 'boolean', default: false },
  },
})

function fail(msg: string): never {
  console.error(`error: ${msg}`)
  process.exit(1)
}

const input = positionals[0] ?? fail('missing input file')
const phone = PHONES_BY_ID.get(values.phone ?? '') ?? fail(`unknown --phone "${values.phone}"; use an id from src/catalog/phones.ts`)
const creator = values.creator ?? fail('missing --creator')
const sourceUrl = values.source ?? fail('missing --source')
const license = values.license ?? fail('missing --license')
const yawDeg = Number(values.yaw)

await MeshoptEncoder.ready
await MeshoptDecoder.ready
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })

const doc = await io.read(input)
const root = doc.getRoot()
const scene = root.getDefaultScene() ?? root.listScenes()[0] ?? fail('file has no scene')

const dropNames = new Set(values.drop.split(',').map((s) => s.trim()).filter(Boolean))
for (const node of root.listNodes()) {
  if (!dropNames.delete(node.getName())) continue
  node.dispose()
}
if (dropNames.size) fail(`--drop names not found: ${[...dropNames].join(', ')}`)

// Wrap everything in one node so a single transform can orient, scale and place it.
const wrapper = doc.createNode('iphone-spotter-root')
for (const child of scene.listChildren()) {
  scene.removeChild(child)
  wrapper.addChild(child)
}
scene.addChild(wrapper)

if (values.align) {
  // The phone is posed at an angle: rotate its principal axes onto X/Y/Z first.
  const align = doc.createNode('iphone-spotter-align')
  for (const child of wrapper.listChildren()) {
    wrapper.removeChild(child)
    align.addChild(child)
  }
  wrapper.addChild(align)
  align.setRotation(principalAxesRotation(collectVertices()))
}

const size = (b: { min: vec3; max: vec3 }): vec3 => [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]]
const raw = size(getBounds(scene))
const longest = raw.indexOf(Math.max(...raw))
const S = Math.SQRT1_2
// Rotate the longest axis onto +Y: Z -> Y is -90deg about X, X -> Y is +90deg about Z.
const rotation: vec4 = longest === 2 ? [-S, 0, 0, S] : longest === 0 ? [0, 0, S, S] : [0, 0, 0, 1]
const heightCm = phone.dimensions.heightMm / 10
const scale = heightCm / raw[longest]
wrapper.setRotation(rotation).setScale([scale, scale, scale])

const placed = getBounds(scene)
wrapper.setTranslation([
  -(placed.min[0] + placed.max[0]) / 2,
  -placed.min[1],
  -(placed.min[2] + placed.max[2]) / 2,
])

const [w, h, d] = size(getBounds(scene)).map((v) => v * 10)
const expected = phone.dimensions
console.log(`size after import: ${h.toFixed(1)} x ${w.toFixed(1)} x ${d.toFixed(1)} mm (h x w x d)`)
console.log(`catalog says:      ${expected.heightMm} x ${expected.widthMm} x ${expected.depthMm} mm`)
// The thin side may land on X instead of Z; compare the two cross-section sides either way.
const [small, large] = [Math.min(w, d), Math.max(w, d)]
if (Math.abs(large - expected.widthMm) / expected.widthMm > 0.1 || (small < expected.depthMm * 0.75 || small > expected.depthMm * 1.8)) {
  console.warn('WARNING: proportions differ from the Catalog by more than expected; check the file is the right Phone.')
}
if (w < d) console.warn('WARNING: phone is edge-on to the camera (thin side on X). Set yawDeg to 90 in assets.json.')

await doc.transform(dedup(), prune(), weld(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))

const file = `assets/${phone.id}.glb`
await io.write(`public/${file}`, doc)

const materialNames = root.listMaterials().map((m) => m.getName())
const bodyMaterials = materialNames.filter((n) => BODY_MATERIAL_HINT.test(n))
console.log(`materials: ${materialNames.map((n) => n || '(unnamed)').join(', ')}`)
if (bodyMaterials.length === 0) {
  console.warn('WARNING: no body material found by name, so Finishes cannot be repainted. Either list the body parts in bodyMaterials, or set nativeFinish in assets.json to the Finish the file shows.')
} else {
  console.log(`repainting: ${bodyMaterials.join(', ')} (edit bodyMaterials in assets.json if wrong)`)
}

const assets: Asset[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))
const entry: Asset = { phoneId: phone.id, file, credit: { creator, sourceUrl, license }, bodyMaterials, yawDeg, rollDeg: 0 }
writeFileSync(MANIFEST, JSON.stringify([...assets.filter((a) => a.phoneId !== phone.id), entry], null, 2) + '\n')

console.log(`wrote public/${file}`)
console.log('CHECK BY HAND: printed text or model numbers on the back, and whether the back faces the starting camera (yawDeg) and the phone is upright (rollDeg).')

/** World-space vertex positions of every mesh, subsampled to at most ~200k points. */
function collectVertices(): vec3[] {
  const meshNodes = root.listNodes().filter((n) => n.getMesh())
  const total = meshNodes.reduce((sum, n) => sum + n.getMesh()!.listPrimitives().reduce((s, p) => s + (p.getAttribute('POSITION')?.getCount() ?? 0), 0), 0)
  const step = Math.max(1, Math.floor(total / 200_000))
  const out: vec3[] = []
  for (const node of meshNodes) {
    const m = node.getWorldMatrix()
    for (const prim of node.getMesh()!.listPrimitives()) {
      const pos = prim.getAttribute('POSITION')
      if (!pos) continue
      const p: vec3 = [0, 0, 0]
      for (let i = 0; i < pos.getCount(); i += step) {
        pos.getElement(i, p)
        out.push([0, 1, 2].map((r) => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r]) as vec3)
      }
    }
  }
  return out
}

/**
 * Quaternion turning the point cloud's principal axes onto the world axes:
 * largest spread -> Y (height), middle -> X (width), smallest -> Z (depth).
 */
function principalAxesRotation(points: vec3[]): vec4 {
  const mean = [0, 1, 2].map((k) => points.reduce((s, p) => s + p[k], 0) / points.length)
  const c = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (const p of points) {
    const d = [p[0] - mean[0], p[1] - mean[1], p[2] - mean[2]]
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c[i][j] += d[i] * d[j]
  }
  // Jacobi eigen-decomposition of the symmetric 3x3 covariance matrix.
  const a = c.map((r) => [...r])
  const v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  for (let sweep = 0; sweep < 50; sweep++) {
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(a[p][q]) < 1e-12) continue
      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q])
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
      const cs = 1 / Math.sqrt(t * t + 1)
      const sn = t * cs
      for (let k = 0; k < 3; k++) {
        const akp = a[k][p], akq = a[k][q]
        a[k][p] = cs * akp - sn * akq
        a[k][q] = sn * akp + cs * akq
      }
      for (let k = 0; k < 3; k++) {
        const apk = a[p][k], aqk = a[q][k]
        a[p][k] = cs * apk - sn * aqk
        a[q][k] = sn * apk + cs * aqk
      }
      for (let k = 0; k < 3; k++) {
        const vkp = v[k][p], vkq = v[k][q]
        v[k][p] = cs * vkp - sn * vkq
        v[k][q] = sn * vkp + cs * vkq
      }
    }
  }
  const order = [0, 1, 2].sort((i, j) => a[j][j] - a[i][i]) // largest variance first
  const axis = (i: number) => [v[0][i], v[1][i], v[2][i]]
  const y = axis(order[0]), x = axis(order[1])
  const z = [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]] // right-handed
  // Rows x, y, z form the rotation taking world coordinates into the phone's frame.
  const m = [x, y, z]
  const tr = m[0][0] + m[1][1] + m[2][2]
  let q: vec4
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2
    q = [(m[2][1] - m[1][2]) / s, (m[0][2] - m[2][0]) / s, (m[1][0] - m[0][1]) / s, s / 4]
  } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
    const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2
    q = [s / 4, (m[0][1] + m[1][0]) / s, (m[0][2] + m[2][0]) / s, (m[2][1] - m[1][2]) / s]
  } else if (m[1][1] > m[2][2]) {
    const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2
    q = [(m[0][1] + m[1][0]) / s, s / 4, (m[1][2] + m[2][1]) / s, (m[0][2] - m[2][0]) / s]
  } else {
    const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2
    q = [(m[0][2] + m[2][0]) / s, (m[1][2] + m[2][1]) / s, s / 4, (m[1][0] - m[0][1]) / s]
  }
  return q
}
