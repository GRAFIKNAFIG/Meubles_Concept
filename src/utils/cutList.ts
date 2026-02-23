import type { Cabinet, CutListItem } from '../types'

// Must match MIXED_DOOR_ZONE_RATIO in bom.ts: drawer zone is the remaining fraction
const MIXED_DRAWER_ZONE_RATIO = 1 / 3

export function generateCutList(cabinets: Cabinet[]): CutListItem[] {
  const items: CutListItem[] = []

  for (const cab of cabinets) {
    const qty = cab.quantity || 1
    const { widthMm: W, depthMm: D, heightMm: H,
            panelThicknessMm: T, shelvesCount,
            backPanelEnabled, backPanelThicknessMm: BT,
            panelType, panelColor, name } = cab

    const add = (partName: string, lengthMm: number, widthMm: number, thicknessMm: number, partQty: number) => {
      items.push({ partName, qty: partQty * qty, lengthMm, widthMm, thicknessMm, panelType, panelColor, cabinetName: name })
    }

    // Sides
    add('Côté', H, D, T, 2)
    // Bottom
    add('Fond bas', W - 2 * T, D, T, 1)
    // Top
    add('Fond haut', W - 2 * T, D, T, 1)
    // Shelves
    if (shelvesCount > 0) {
      add('Tablette', W - 2 * T, D - 10, T, shelvesCount)
    }
    // Back panel
    if (backPanelEnabled) {
      add('Fond arrière', W, H, BT, 1)
    }

    // Fronts
    const fronts = cab.fronts
    const gap = fronts.gapMm ?? 2

    if (fronts.type === 'doors' || fronts.type === 'mixed') {
      const doorH = H - 2 * gap
      if (fronts.doorOption === 'double') {
        const doorW = (W - 3 * gap) / 2
        add('Porte', doorH, doorW, T, 2)
      } else {
        const doorW = W - 2 * gap
        add('Porte', doorH, doorW, T, 1)
      }
    }

    if (fronts.type === 'drawers') {
      const n = fronts.drawersCount || 1
      const drawerW = W - 2 * gap
      if (fronts.drawersEqualHeight) {
        const drawerH = (H - (n + 1) * gap) / n
        add('Façade tiroir', drawerH, drawerW, T, n)
      } else if (fronts.drawerHeights && fronts.drawerHeights.length === n) {
        fronts.drawerHeights.forEach((dh, i) => {
          add(`Façade tiroir ${i + 1}`, dh, drawerW, T, 1)
        })
      } else {
        const drawerH = (H - (n + 1) * gap) / n
        add('Façade tiroir', drawerH, drawerW, T, n)
      }
    }

    if (fronts.type === 'mixed') {
      const nDrawers = fronts.mixedDrawersCount || 1
      const drawerW = W - 2 * gap
      // Mixed: lower 1/3 for drawers, upper 2/3 for doors
      const drawerZoneH = H * MIXED_DRAWER_ZONE_RATIO
      const drawerH = (drawerZoneH - (nDrawers + 1) * gap) / nDrawers
      add('Façade tiroir', drawerH, drawerW, T, nDrawers)
    }
  }

  return items
}
