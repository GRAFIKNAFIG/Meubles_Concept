import * as THREE from 'three'
import type { Design } from '../types'

const MAT_PRESETS: Record<string, { color: number; roughness: number; metalness: number }> = {
  wood:    { color: 0xc8a46e, roughness: 0.8, metalness: 0.0 },
  lacquer: { color: 0xf0f0f0, roughness: 0.15, metalness: 0.05 },
  metal:   { color: 0x8a9ab0, roughness: 0.3, metalness: 0.85 },
}

export function buildFurnitureGroup(design: Design): THREE.Group {
  const group = new THREE.Group()
  const { width: W, depth: D, height: H, panelThickness: T,
          shelvesCount, backPanel, toeKick, material } = design

  const scale = 0.1
  const w = W * scale
  const d = D * scale
  const h = H * scale
  const t = T * scale
  const tk = toeKick * scale

  const preset = MAT_PRESETS[material] ?? MAT_PRESETS['wood']
  const mat = new THREE.MeshStandardMaterial(preset)

  function addPanel(sx: number, sy: number, sz: number, px: number, py: number, pz: number) {
    const geo = new THREE.BoxGeometry(sx, sy, sz)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(px, py, pz)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  addPanel(w - 2*t, t, d, 0, tk + t/2, 0)
  addPanel(w - 2*t, t, d, 0, h - t/2, 0)
  addPanel(t, h, d, -(w/2 - t/2), h/2, 0)
  addPanel(t, h, d,  (w/2 - t/2), h/2, 0)

  if (toeKick > 0) {
    addPanel(w - 2*t, tk, t, 0, tk/2, d/2 - t/2)
  }

  if (backPanel) {
    addPanel(w - 2*t, h - t - tk, t * 0.5, 0, (h + tk + t) / 2 - t/2, -(d/2 - t/4))
  }

  if (shelvesCount > 0) {
    const usableH = h - 2*t - tk
    const gap = usableH / (shelvesCount + 1)
    for (let i = 1; i <= shelvesCount; i++) {
      const y = tk + t + gap * i
      addPanel(w - 2*t, t, d - (backPanel ? t * 0.5 : 0), 0, y, backPanel ? t * 0.25 : 0)
    }
  }

  group.position.y = 0
  return group
}
