import type { Cabinet, CutListItem, PanelType, PanelColor } from '../types'

export function generateCutList(cabinets: Cabinet[]): CutListItem[] {
  const items: CutListItem[] = []

  for (const cab of cabinets) {
    const { widthMm: W, depthMm: D, heightMm: H,
            panelThicknessMm: T, shelvesCount,
            backPanelEnabled, backPanelThicknessMm: BT,
            panelType, panelColor, name } = cab

    const push = (partName: string, qty: number, lengthMm: number, widthMm: number, thicknessMm: number,
                  pt: PanelType = panelType, pc: PanelColor = panelColor) => {
      items.push({ partName, qty, lengthMm, widthMm, thicknessMm, panelType: pt, panelColor: pc, cabinetName: name })
    }

    push('Left Side', 1, H, D, T)
    push('Right Side', 1, H, D, T)
    push('Bottom', 1, W - 2*T, D, T)
    push('Top', 1, W - 2*T, D, T)
    if (shelvesCount > 0) {
      const shelfW = W - 2*T
      const shelfD = backPanelEnabled ? D - BT : D
      push('Shelf', shelvesCount, shelfW, shelfD, T)
    }
    if (backPanelEnabled) {
      push('Back Panel', 1, W, H, BT, panelType, panelColor)
    }
  }

  return items
}

export interface GroupedCutListItem {
  partName: string
  qty: number
  lengthMm: number
  widthMm: number
  thicknessMm: number
  panelType: PanelType
  panelColor: PanelColor
  cabinetNames: string[]
}

export function groupCutList(items: CutListItem[]): GroupedCutListItem[] {
  const map = new Map<string, GroupedCutListItem>()
  for (const item of items) {
    const key = `${item.partName}|${item.lengthMm}|${item.widthMm}|${item.thicknessMm}|${item.panelType}|${item.panelColor}`
    const existing = map.get(key)
    if (existing) {
      existing.qty += item.qty
      if (!existing.cabinetNames.includes(item.cabinetName)) {
        existing.cabinetNames.push(item.cabinetName)
      }
    } else {
      map.set(key, {
        partName: item.partName,
        qty: item.qty,
        lengthMm: item.lengthMm,
        widthMm: item.widthMm,
        thicknessMm: item.thicknessMm,
        panelType: item.panelType,
        panelColor: item.panelColor,
        cabinetNames: [item.cabinetName],
      })
    }
  }
  return Array.from(map.values())
}
