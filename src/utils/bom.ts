import type { Cabinet, BomItem } from '../types'

// Hinge count rules based on door height (per manufacturer standards)
const HINGE_THRESHOLD_LOW = 900    // <= 900mm: 2 hinges
const HINGE_THRESHOLD_MID = 1400   // 901–1400mm: 3 hinges; > 1400mm: 4 hinges

function hingesPerDoor(doorHeightMm: number): number {
  if (doorHeightMm <= HINGE_THRESHOLD_LOW) return 2
  if (doorHeightMm <= HINGE_THRESHOLD_MID) return 3
  return 4
}

// Fraction of cabinet height used as door zone in mixed layout
const MIXED_DOOR_ZONE_RATIO = 2 / 3

export function generateBOM(cabinets: Cabinet[]): BomItem[] {
  const items: BomItem[] = []

  for (const cab of cabinets) {
    const qty = cab.quantity || 1
    const fronts = cab.fronts
    const gap = fronts.gapMm ?? 2
    const H = cab.heightMm

    const add = (ref: string, labelKey: string, count: number) => {
      items.push({ ref, labelKey, qty: count * qty, cabinetName: cab.name })
    }

    if (fronts.type === 'none') {
      // no hardware for fronts
    } else if (fronts.type === 'doors') {
      const doorsCount = fronts.doorOption === 'double' ? 2 : 1
      const doorH = H - 2 * gap
      add('HINGE_110', 'bom.hinge110', doorsCount * hingesPerDoor(doorH))
      add('HINGE_PLATE', 'bom.hingePlate', doorsCount * hingesPerDoor(doorH))
      if (fronts.handleType === 'handle') {
        add('HANDLE', 'bom.handle', doorsCount)
      } else if (fronts.handleType === 'push_to_open') {
        add('PUSH_OPEN', 'bom.pushToOpen', doorsCount)
      }
    } else if (fronts.type === 'drawers') {
      const n = fronts.drawersCount || 1
      add('DRAWER_SLIDE', 'bom.drawerSlide', n)
      if (fronts.handleType === 'handle') {
        add('HANDLE', 'bom.handle', n)
      } else if (fronts.handleType === 'push_to_open') {
        add('PUSH_OPEN', 'bom.pushToOpen', n)
      }
    } else if (fronts.type === 'mixed') {
      const doorsCount = fronts.mixedDoorsCount || 1
      const doorH = H * MIXED_DOOR_ZONE_RATIO - 2 * gap
      const mixedHinges = hingesPerDoor(doorH)
      add('HINGE_110', 'bom.hinge110', doorsCount * mixedHinges)
      add('HINGE_PLATE', 'bom.hingePlate', doorsCount * mixedHinges)
      const nDrawers = fronts.mixedDrawersCount || 1
      add('DRAWER_SLIDE', 'bom.drawerSlide', nDrawers)
      if (fronts.handleType === 'handle') {
        add('HANDLE', 'bom.handle', doorsCount + nDrawers)
      } else if (fronts.handleType === 'push_to_open') {
        add('PUSH_OPEN', 'bom.pushToOpen', doorsCount + nDrawers)
      }
    }

    // Legs for base cabinets
    if (cab.variant === 'base' && cab.toeKickMm > 0) {
      add('ADJ_LEG', 'bom.adjLeg', 4)
    }
  }

  return items
}
