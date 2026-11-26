import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls, RoundedBox, useGLTF } from '@react-three/drei'
import { Box3, Mesh, type Material, MeshStandardMaterial, Vector3 } from 'three'
import type { Asset, Finish, Phone } from '../catalog/types'

// World units are centimetres. Phones stand upright on the grid with the
// screen facing +Z, so the camera starts behind and slightly to the side.
const MM_PER_UNIT = 10
const TARGET: [number, number, number] = [0, 8, 0]
const CAMERA_START: [number, number, number] = [-14, 15, -36]

interface Props {
  phone: Phone
  finish: Finish
  asset: Asset | undefined
}

export function PhoneStage({ phone, finish, asset }: Props) {
  return (
    <Canvas camera={{ position: CAMERA_START, fov: 35 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-10, 20, -15]} intensity={2} />
      <directionalLight position={[12, 10, 15]} intensity={1} />
      <Suspense fallback={null}>
        {asset ? (
          <AssetPhone key={asset.phoneId} asset={asset} finish={finish} />
        ) : (
          <StandIn key={phone.id} phone={phone} finish={finish} />
        )}
      </Suspense>
      <Grid
        cellSize={1}
        sectionSize={5}
        infiniteGrid
        fadeDistance={90}
        cellColor="#8a8a8a"
        sectionColor="#5a5a5a"
      />
      <OrbitControls target={TARGET} enablePan={false} minDistance={14} maxDistance={60} />
    </Canvas>
  )
}

/** Plain rounded box at the Phone's true size, used until a real Asset exists. */
function StandIn({ phone, finish }: { phone: Phone; finish: Finish }) {
  const w = phone.dimensions.widthMm / MM_PER_UNIT
  const h = phone.dimensions.heightMm / MM_PER_UNIT
  const d = phone.dimensions.depthMm / MM_PER_UNIT
  return (
    <group position={[0, h / 2, 0]}>
      <RoundedBox args={[w, h, d]} radius={d * 0.45} smoothness={6}>
        <meshStandardMaterial color={finish.hex} roughness={0.35} metalness={0.2} />
      </RoundedBox>
      {/* Screen, so front and back can be told apart. */}
      <mesh position={[0, 0, d / 2 + 0.001]}>
        <planeGeometry args={[w * 0.9, h * 0.9]} />
        <meshStandardMaterial color="#050505" roughness={0.1} />
      </mesh>
    </group>
  )
}

/** A processed Asset (already in cm, bottom at y=0), repainted in the chosen Finish. */
function AssetPhone({ asset, finish }: { asset: Asset; finish: Finish }) {
  const { scene } = useGLTF(`/${asset.file}`)
  const painted = useMemo(() => {
    const root = scene.clone(true)
    const body = new Set(asset.bodyMaterials)
    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const repaint = (m: Material) => {
        if (!body.has(m.name) || !(m instanceof MeshStandardMaterial)) return m
        const copy = m.clone()
        // Tinting multiplies into the texture, so a dark baked-in colour would stay dark.
        copy.map = null
        copy.color.set(finish.hex)
        // There is no environment map, so fully metallic paint would render black.
        copy.metalness = Math.min(copy.metalness, 0.4)
        copy.metalnessMap = null
        return copy
      }
      obj.material = Array.isArray(obj.material) ? obj.material.map(repaint) : repaint(obj.material)
    })
    return root
  }, [scene, asset.bodyMaterials, finish.hex])
  const deg = Math.PI / 180
  // Yaw first so the back faces the camera, then roll in the plane the camera sees.
  // Roll spins around the phone's centre height, so lift it back onto the grid afterwards.
  const height = asset.rollDeg ? new Box3().setFromObject(painted).getSize(new Vector3()).y : 0
  return (
    <group position={[0, height / 2, 0]} rotation={[0, 0, asset.rollDeg * deg]}>
      <group position={[0, -height / 2, 0]} rotation={[0, asset.yawDeg * deg, 0]}>
        <primitive object={painted} />
      </group>
    </group>
  )
}

export function preloadAsset(asset: Asset | undefined) {
  if (asset) useGLTF.preload(`/${asset.file}`)
}
