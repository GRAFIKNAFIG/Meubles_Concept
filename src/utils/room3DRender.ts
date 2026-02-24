import * as THREE from 'three'
import type { Room, Design } from '../types'

type Options = {
  width?: number
  height?: number
  background?: number
}

// Returns PNG dataURL
export function renderRoomIsometricPNG(
  room: Room,
  designs: Design[],
  opts: Options = {}
): string {
  const W = opts.width ?? 1200
  const H = opts.height ?? 800
  const background = opts.background ?? 0xf1f5f9

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(background)

  const camera = new THREE.PerspectiveCamera(45, W / H, 1, 200000)

  // Isometric-ish camera: angled view from above
  const maxDim = Math.max(room.length, room.width, room.height)
  camera.position.set(room.length * 0.7, maxDim * 0.9, room.width * 1.2)
  camera.lookAt(room.length / 2, 0, room.width / 2)

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(W, H)

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  const dir1 = new THREE.DirectionalLight(0xffffff, 0.7)
  dir1.position.set(1, 2, 1)
  scene.add(dir1)

  const dir2 = new THREE.DirectionalLight(0xffffff, 0.35)
  dir2.position.set(-1, 1.5, -0.5)
  scene.add(dir2)

  // Room floor
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 })
  const floorGeo = new THREE.BoxGeometry(room.length, 10, room.width)
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.position.set(room.length / 2, -5, room.width / 2)
  scene.add(floor)

  // Room border lines (nice)
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(room.length, 10, room.width))
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 1 }))
  line.position.copy(floor.position)
  scene.add(line)

  // Furniture blocks (simple extrusions)
  const cabinetMat = new THREE.MeshLambertMaterial({ color: 0xd4a96a })
  const outlineMat = new THREE.LineBasicMaterial({ color: 0x1e293b })

  for (const it of room.items) {
    const d = designs.find(x => x.id === it.designId)
    if (!d) continue

    // Use design dimensions (mm). Depth maps to Z, width maps to X, height to Y.
    const w = d.width
    const dep = d.depth
    const h = d.height

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, dep), cabinetMat)

    // In 2D planner, y increases downward. We'll map:
    // x => X, y => Z
    mesh.position.set(it.x + w / 2, h / 2, it.y + dep / 2)

    // Rotation: SVG rotate is degrees; in 3D rotate around Y
    const rotRad = (it.rotation * Math.PI) / 180
    mesh.rotation.y = -rotRad

    scene.add(mesh)

    const e = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, dep))
    const o = new THREE.LineSegments(e, outlineMat)
    o.position.copy(mesh.position)
    o.rotation.copy(mesh.rotation)
    scene.add(o)
  }

  renderer.render(scene, camera)

  const dataUrl = renderer.domElement.toDataURL('image/png')

  renderer.dispose()
  // geometries/materials are GC’d, acceptable for one-off export.

  return dataUrl
}