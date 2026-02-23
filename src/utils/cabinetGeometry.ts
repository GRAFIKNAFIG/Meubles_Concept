import * as THREE from 'three'
import type { Cabinet, PanelColor } from '../types'

const COLOR_MAP: Record<PanelColor, number> = {
  WOOD:  0xc8a46e,
  WHITE: 0xf5f5f5,
  BROWN: 0x8B4513,
  BLACK: 0x2c2c2c,
  GRAY:  0x9ca3af,
  BLUE:  0x3b82f6,
  GREEN: 0x22c55e,
  RED:   0xef4444,
}

export function buildCabinetGroup(cabinet: Cabinet): THREE.Group {
  const group = new THREE.Group()
  const { widthMm: W, depthMm: D, heightMm: H, panelThicknessMm: T,
          shelvesCount, backPanelEnabled, backPanelThicknessMm: BT, panelColor } = cabinet

  const scale = 0.1
  const w = W * scale
  const d = D * scale
  const h = H * scale
  const t = T * scale
  const bt = BT * scale

  const color = COLOR_MAP[panelColor] ?? COLOR_MAP['WOOD']
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.0 })
  const backMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 })

  function addPanel(sx: number, sy: number, sz: number, px: number, py: number, pz: number, useMat = mat) {
    const geo = new THREE.BoxGeometry(sx, sy, sz)
    const mesh = new THREE.Mesh(geo, useMat)
    mesh.position.set(px, py, pz)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  // Bottom
  addPanel(w - 2*t, t, d, 0, t/2, 0)
  // Top
  addPanel(w - 2*t, t, d, 0, h - t/2, 0)
  // Left side
  addPanel(t, h, d, -(w/2 - t/2), h/2, 0)
  // Right side
  addPanel(t, h, d,  (w/2 - t/2), h/2, 0)

  // Back panel
  if (backPanelEnabled) {
    addPanel(w - 2*t, h - 2*t, bt, 0, h/2, -(d/2 - bt/2), backMat)
  }

  // Shelves
  if (shelvesCount > 0) {
    const usableH = h - 2*t
    const gap = usableH / (shelvesCount + 1)
    for (let i = 1; i <= shelvesCount; i++) {
      const y = t + gap * i
      const shelfD = backPanelEnabled ? d - bt : d
      addPanel(w - 2*t, t, shelfD, 0, y, backPanelEnabled ? bt/2 : 0)
    }
  }

  return group
}
