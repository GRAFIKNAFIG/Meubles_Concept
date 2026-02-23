import type { Design } from '../types'
import * as THREE from 'three'

export interface Panel {
  w: number; h: number; d: number
  x: number; y: number; z: number
}

export function buildDesignGeometry(design: Design): Panel[] {
  const { width: W, depth: D, height: H, panelThickness: T, shelvesCount, toeKick } = design
  const panels: Panel[] = []

  // Sides
  panels.push({ w: T, h: H - toeKick, d: D, x: 0, y: toeKick, z: 0 })
  panels.push({ w: T, h: H - toeKick, d: D, x: W - T, y: toeKick, z: 0 })
  // Bottom
  panels.push({ w: W - 2 * T, h: T, d: D, x: T, y: toeKick, z: 0 })
  // Top
  panels.push({ w: W - 2 * T, h: T, d: D, x: T, y: H - T, z: 0 })

  for (let i = 1; i <= shelvesCount; i++) {
    const sy = toeKick + ((H - toeKick) / (shelvesCount + 1)) * i - T / 2
    panels.push({ w: W - 2 * T, h: T, d: D - 10, x: T, y: sy, z: 0 })
  }

  if (design.backPanel) {
    panels.push({ w: W, h: H, d: 8, x: 0, y: 0, z: D - 8 })
  }

  return panels
}

export function panelToMesh(panel: Panel, material: THREE.Material): THREE.Mesh {
  const geo = new THREE.BoxGeometry(panel.w, panel.h, panel.d)
  const mesh = new THREE.Mesh(geo, material)
  mesh.position.set(panel.x + panel.w / 2, panel.y + panel.h / 2, panel.z + panel.d / 2)
  return mesh
}
