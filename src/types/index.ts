export type FurnitureType = 'shelf' | 'wardrobe'
export type MaterialPreset = 'wood' | 'lacquer' | 'metal'

export interface Design {
  id: string
  name: string
  type: FurnitureType
  width: number
  depth: number
  height: number
  panelThickness: number
  shelvesCount: number
  backPanel: boolean
  toeKick: number
  material: MaterialPreset
  createdAt: number
  updatedAt: number
}

export interface RoomItem {
  designId: string
  x: number
  y: number
  rotation: number
}

export interface Room {
  id: string
  name: string
  length: number
  width: number
  height: number
  items: RoomItem[]
  createdAt: number
  updatedAt: number
}

export type PanelType = 'MDF' | 'MELAMINE'
export type PanelColor = 'WOOD' | 'WHITE' | 'BROWN' | 'BLACK' | 'GRAY' | 'BLUE' | 'GREEN' | 'RED'
export type CabinetVariant = 'base' | 'wall' | 'tall'

export type FrontConfig = 'none' | 'doors' | 'drawers' | 'mixed'
export type DoorOption = 'single' | 'double'
export type DoorSide = 'left' | 'right'
export type HandleType = 'none' | 'handle' | 'push_to_open'

export interface FrontsConfig {
  type: FrontConfig
  doorOption?: DoorOption
  doorSide?: DoorSide
  drawersCount?: number
  drawersEqualHeight?: boolean
  drawerHeights?: number[]
  mixedDoorsCount?: number
  mixedDrawersCount?: number
  overlayMm: number
  gapMm: number
  handleType: HandleType
}

export interface CabinetTemplate {
  id: string
  name: string
  variant: CabinetVariant
  widthMm: number
  depthMm: number
  heightMm: number
  panelThicknessMm: number
  shelvesCount: number
  panelType: PanelType
  panelColor: PanelColor
  backPanelThicknessMm: number
  backPanelEnabled: boolean
  fronts: FrontsConfig
  toeKickMm: number
  createdAt: number
  updatedAt: number
}

export interface Cabinet {
  id: string
  projectId: string
  templateId?: string
  name: string
  variant: CabinetVariant
  widthMm: number
  depthMm: number
  heightMm: number
  panelThicknessMm: number
  shelvesCount: number
  panelType: PanelType
  panelColor: PanelColor
  backPanelThicknessMm: number
  backPanelEnabled: boolean
  fronts: FrontsConfig
  toeKickMm: number
  quantity: number
  createdAt: number
  updatedAt: number
}

export interface KitchenProject {
  id: string
  name: string
  roomLengthMm: number
  roomWidthMm: number
  createdAt: number
  updatedAt: number
}

export interface WardrobeProject {
  id: string
  name: string
  roomLengthMm: number
  roomWidthMm: number
  createdAt: number
  updatedAt: number
}

export interface CutListItem {
  partName: string
  qty: number
  lengthMm: number
  widthMm: number
  thicknessMm: number
  panelType: PanelType
  panelColor: PanelColor
  cabinetName: string
}

export interface BomItem {
  ref: string
  description: string
  qty: number
  cabinetName: string
}

export interface ProjectRoomItem {
  cabinetId: string
  x: number
  y: number
  rotation: number
}
