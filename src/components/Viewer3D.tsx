import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Design } from '../types'
import { buildFurnitureGroup } from '../utils/geometry'

interface Props {
  design: Design
  onSceneReady?: (group: THREE.Group) => void
}

type CameraView = 'front' | 'side' | 'top' | 'iso'

const CAMERA_PRESETS: Record<CameraView, [number, number, number]> = {
  front: [0, 0, 1],
  side:  [1, 0, 0],
  top:   [0, 1, 0.001], // tiny Z offset prevents gimbal lock when looking straight down
  iso:   [1, 1, 1],
}

export default function Viewer3D({ design, onSceneReady }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f4f8)

    const w = mount.clientWidth || 600
    const h = mount.clientHeight || 400
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controlsRef.current = controls

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.4)
    fillLight.position.set(-5, 2, -5)
    scene.add(fillLight)

    const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xe5e5e5)
    scene.add(gridHelper)

    const group = buildFurnitureGroup(design)
    scene.add(group)
    groupRef.current = group
    if (onSceneReady) onSceneReady(group)

    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const dist = maxDim * 2.0

    const isoDir = new THREE.Vector3(1, 1, 1).normalize()
    camera.position.copy(center).addScaledVector(isoDir, dist)
    camera.lookAt(center)
    controls.target.copy(center)
    controls.update()

    const ro = new ResizeObserver(() => {
      const w2 = mount.clientWidth
      const h2 = mount.clientHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
    })
    ro.observe(mount)

    const animate = () => {
      animRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [design, onSceneReady])

  const setView = (view: CameraView) => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    const group = groupRef.current
    if (!camera || !controls || !group) return
    const box = new THREE.Box3().setFromObject(group)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const dist = maxDim * 2.2
    const dir = new THREE.Vector3(...CAMERA_PRESETS[view]).normalize()
    camera.position.copy(center).addScaledVector(dir, dist)
    camera.lookAt(center)
    controls.target.copy(center)
    controls.update()
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 300 }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: 300 }} />
      <div style={{
        position: 'absolute', top: 8, right: 8,
        display: 'flex', flexDirection: 'column', gap: 4
      }}>
        {(['iso','front','side','top'] as CameraView[]).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '4px 8px', fontSize: '0.75rem',
            background: 'rgba(255,255,255,.9)', border: '1px solid #ccc',
            borderRadius: 4, cursor: 'pointer'
          }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
