import type { Design } from '../types'

export interface CutPart {
  part: string
  qty: number
  length: number
  width: number
  thickness: number
}

export function computeCutList(design: Design): CutPart[] {
  const { width: W, depth: D, height: H, panelThickness: T, shelvesCount, toeKick } = design
  const parts: CutPart[] = []

  parts.push({ part: 'Côté', qty: 2, length: H - toeKick, width: D, thickness: T })
  parts.push({ part: 'Fond bas', qty: 1, length: W - 2 * T, width: D, thickness: T })
  parts.push({ part: 'Fond haut', qty: 1, length: W - 2 * T, width: D, thickness: T })

  if (shelvesCount > 0) {
    parts.push({ part: 'Tablette', qty: shelvesCount, length: W - 2 * T, width: D - 10, thickness: T })
  }

  if (design.backPanel) {
    parts.push({ part: 'Fond arrière', qty: 1, length: W, width: H, thickness: 8 })
  }

  return parts
}
