import * as THREE from 'three'
import type { Cabinet } from '../types'

export function exportCabinetGlb(_cabinet: Cabinet): void {
  // GLB export placeholder - requires GLTFExporter from three/addons
  console.warn('GLB export not yet implemented')
  void _cabinet
}

export function buildCabinetScene(cabinet: Cabinet): THREE.Scene {
  const scene = new THREE.Scene()
  const { widthMm: W, depthMm: D, heightMm: H, panelThicknessMm: T,
          shelvesCount, backPanelEnabled, backPanelThicknessMm: BT } = cabinet

  const mat = new THREE.MeshLambertMaterial({ color: 0xd4a96a })

  const addBox = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    mesh.position.set(x + w / 2, y + h / 2, z + d / 2)
    scene.add(mesh)
  }

  addBox(T, H, D, 0, 0, 0)
  addBox(T, H, D, W - T, 0, 0)
  addBox(W - 2 * T, T, D, T, 0, 0)
  addBox(W - 2 * T, T, D, T, H - T, 0)

  for (let i = 1; i <= shelvesCount; i++) {
    const sy = (H / (shelvesCount + 1)) * i - T / 2
    addBox(W - 2 * T, T, D, T, sy, 0)
  }

  if (backPanelEnabled) {
    addBox(W, H, BT, 0, 0, D - BT)
  }

  return scene
}
