/**
 * Converts a 3D-printing or CAD file into a plain GLB that import-asset can take.
 *
 *   npx tsx scripts/convert-to-glb.ts <in.stl|in.step|in.stp|in.iges|in.igs> <out.glb>
 *
 * These files carry shape only, so every part gets one material named "Body".
 * Import with bodyMaterials ["Body"] and the Phone can be shown in any Finish.
 */
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { Document, NodeIO } from '@gltf-transform/core'
import { weld } from '@gltf-transform/functions'
import occtImportJs from 'occt-import-js'

interface Mesh {
  positions: Float32Array
  indices?: Uint32Array
}

// Faces meeting at a sharper angle than this keep a hard edge; gentler ones are smoothed.
const CREASE_DEG = 35

/**
 * Smooth per-corner normals for a triangle list. Without normals the viewer
 * shades every facet flat, which makes print/CAD meshes look rough.
 * Returns an unindexed triangle soup: positions and matching normals.
 */
function smoothNormals({ positions, indices }: Mesh): { positions: Float32Array; normals: Float32Array } {
  const corners = indices ? indices.length : positions.length / 3
  const pos = new Float32Array(corners * 3)
  for (let c = 0; c < corners; c++) {
    const v = indices ? indices[c] : c
    pos.set(positions.subarray(v * 3, v * 3 + 3), c * 3)
  }
  const faceNormals = new Float32Array(corners) // one normal per triangle, stored at [t*3..t*3+2]
  for (let t = 0; t < corners / 3; t++) {
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = pos.subarray(t * 9, t * 9 + 9)
    const ux = bx - ax, uy = by - ay, uz = bz - az
    const vx = cx - ax, vy = cy - ay, vz = cz - az
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx
    const len = Math.hypot(nx, ny, nz) || 1
    faceNormals.set([nx / len, ny / len, nz / len], t * 3)
  }
  // Group corners that share a position (rounded, since STL repeats vertices per face).
  const key = (c: number) => `${Math.round(pos[c * 3] * 1e4)},${Math.round(pos[c * 3 + 1] * 1e4)},${Math.round(pos[c * 3 + 2] * 1e4)}`
  const groups = new Map<string, number[]>()
  for (let c = 0; c < corners; c++) {
    const k = key(c)
    const g = groups.get(k)
    if (g) g.push(c)
    else groups.set(k, [c])
  }
  const cos = Math.cos((CREASE_DEG * Math.PI) / 180)
  const normals = new Float32Array(corners * 3)
  for (const group of groups.values()) {
    for (const c of group) {
      const f = Math.floor(c / 3) * 3
      let sx = 0, sy = 0, sz = 0
      for (const o of group) {
        const g = Math.floor(o / 3) * 3
        const d = faceNormals[f] * faceNormals[g] + faceNormals[f + 1] * faceNormals[g + 1] + faceNormals[f + 2] * faceNormals[g + 2]
        if (d < cos) continue
        sx += faceNormals[g]; sy += faceNormals[g + 1]; sz += faceNormals[g + 2]
      }
      const len = Math.hypot(sx, sy, sz) || 1
      normals.set([sx / len, sy / len, sz / len], c * 3)
    }
  }
  return { positions: pos, normals }
}

function readStl(buf: Buffer): Mesh[] {
  const triangles = buf.readUInt32LE(80)
  if (84 + triangles * 50 === buf.length) {
    const positions = new Float32Array(triangles * 9)
    for (let t = 0; t < triangles; t++) {
      const base = 84 + t * 50 + 12 // skip the facet normal
      for (let k = 0; k < 9; k++) positions[t * 9 + k] = buf.readFloatLE(base + k * 4)
    }
    return [{ positions }]
  }
  // ASCII STL: every "vertex x y z" line, in order.
  const nums = [...buf.toString('utf8').matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)].flatMap((m) => [m[1], m[2], m[3]].map(Number))
  return [{ positions: new Float32Array(nums) }]
}

async function readCad(buf: Buffer, ext: string): Promise<Mesh[]> {
  const occt = await occtImportJs()
  const read = ext === '.iges' || ext === '.igs' ? occt.ReadIgesFile : occt.ReadStepFile
  // Finer than the library default, so rounded corners and camera rings come out smooth.
  const result = read(new Uint8Array(buf), {
    linearDeflectionType: 'bounding_box_ratio',
    linearDeflection: 0.0004,
    angularDeflection: 0.1,
  })
  if (!result.success) throw new Error('could not read CAD file')
  return result.meshes.map((m: { attributes: { position: { array: number[] } }; index: { array: number[] } }) => ({
    positions: new Float32Array(m.attributes.position.array),
    indices: new Uint32Array(m.index.array),
  }))
}

const [input, output] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: convert-to-glb.ts <in.stl|in.step|in.iges> <out.glb>')
  process.exit(1)
}
const ext = extname(input).toLowerCase()
const buf = readFileSync(input)
const meshes = ext === '.stl' ? readStl(buf) : await readCad(buf, ext)

const doc = new Document()
const buffer = doc.createBuffer()
const body = doc.createMaterial('Body').setBaseColorFactor([0.8, 0.8, 0.8, 1]).setRoughnessFactor(0.4)
const mesh = doc.createMesh()
for (const m of meshes) {
  const { positions, normals } = smoothNormals(m)
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(normals).setBuffer(buffer))
    .setMaterial(body)
  mesh.addPrimitive(prim)
}
doc.createScene().addChild(doc.createNode('phone').setMesh(mesh))
// Weld merges corners whose position and normal both match, to shrink the file.
await doc.transform(weld())
await new NodeIO().write(output, doc)
console.log(`wrote ${output} (${meshes.length} mesh${meshes.length === 1 ? '' : 'es'})`)
