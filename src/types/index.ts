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
