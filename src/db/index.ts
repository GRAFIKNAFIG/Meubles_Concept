import { openDB, IDBPDatabase } from 'idb'
import type { Design, Room, KitchenProject, WardrobeProject, Cabinet, CabinetTemplate } from '../types'

const DB_NAME = 'meubles-concept'
const DB_VERSION = 3

type MeublesDB = {
  designs: { key: string; value: Design; indexes: { 'by-updatedAt': number } }
  rooms: { key: string; value: Room; indexes: { 'by-updatedAt': number } }
  kitchenProjects: { key: string; value: KitchenProject; indexes: { 'by-updatedAt': number } }
  wardrobeProjects: { key: string; value: WardrobeProject; indexes: { 'by-updatedAt': number } }
  cabinets: { key: string; value: Cabinet; indexes: { 'by-projectId': string; 'by-updatedAt': number } }
  cabinetTemplates: { key: string; value: CabinetTemplate; indexes: { 'by-updatedAt': number } }
}

let dbPromise: Promise<IDBPDatabase<MeublesDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MeublesDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const designStore = db.createObjectStore('designs', { keyPath: 'id' })
          designStore.createIndex('by-updatedAt', 'updatedAt')
          const roomStore = db.createObjectStore('rooms', { keyPath: 'id' })
          roomStore.createIndex('by-updatedAt', 'updatedAt')
        }
        if (oldVersion < 2) {
          const projectStore = db.createObjectStore('kitchenProjects', { keyPath: 'id' })
          projectStore.createIndex('by-updatedAt', 'updatedAt')
          const cabinetStore = db.createObjectStore('cabinets', { keyPath: 'id' })
          cabinetStore.createIndex('by-projectId', 'projectId')
          cabinetStore.createIndex('by-updatedAt', 'updatedAt')
        }
        if (oldVersion < 3) {
          const wardrobeStore = db.createObjectStore('wardrobeProjects', { keyPath: 'id' })
          wardrobeStore.createIndex('by-updatedAt', 'updatedAt')
          const templateStore = db.createObjectStore('cabinetTemplates', { keyPath: 'id' })
          templateStore.createIndex('by-updatedAt', 'updatedAt')
        }
      }
    })
  }
  return dbPromise
}

export const designRepo = {
  async getAll(): Promise<Design[]> {
    const db = await getDB()
    return db.getAllFromIndex('designs', 'by-updatedAt')
  },
  async get(id: string): Promise<Design | undefined> {
    const db = await getDB()
    return db.get('designs', id)
  },
  async save(design: Design): Promise<void> {
    const db = await getDB()
    await db.put('designs', design)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('designs', id)
  }
}

export const roomRepo = {
  async getAll(): Promise<Room[]> {
    const db = await getDB()
    return db.getAllFromIndex('rooms', 'by-updatedAt')
  },
  async get(id: string): Promise<Room | undefined> {
    const db = await getDB()
    return db.get('rooms', id)
  },
  async save(room: Room): Promise<void> {
    const db = await getDB()
    await db.put('rooms', room)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('rooms', id)
  }
}

export const kitchenProjectRepo = {
  async getAll(): Promise<KitchenProject[]> {
    const db = await getDB()
    return db.getAllFromIndex('kitchenProjects', 'by-updatedAt')
  },
  async get(id: string): Promise<KitchenProject | undefined> {
    const db = await getDB()
    return db.get('kitchenProjects', id)
  },
  async save(project: KitchenProject): Promise<void> {
    const db = await getDB()
    await db.put('kitchenProjects', project)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('kitchenProjects', id)
  }
}

export const wardrobeProjectRepo = {
  async getAll(): Promise<WardrobeProject[]> {
    const db = await getDB()
    return db.getAllFromIndex('wardrobeProjects', 'by-updatedAt')
  },
  async get(id: string): Promise<WardrobeProject | undefined> {
    const db = await getDB()
    return db.get('wardrobeProjects', id)
  },
  async save(project: WardrobeProject): Promise<void> {
    const db = await getDB()
    await db.put('wardrobeProjects', project)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('wardrobeProjects', id)
  }
}

export const cabinetRepo = {
  async getAll(): Promise<Cabinet[]> {
    const db = await getDB()
    return db.getAllFromIndex('cabinets', 'by-updatedAt')
  },
  async getByProject(projectId: string): Promise<Cabinet[]> {
    const db = await getDB()
    return db.getAllFromIndex('cabinets', 'by-projectId', projectId)
  },
  async get(id: string): Promise<Cabinet | undefined> {
    const db = await getDB()
    return db.get('cabinets', id)
  },
  async save(cabinet: Cabinet): Promise<void> {
    const db = await getDB()
    await db.put('cabinets', cabinet)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('cabinets', id)
  }
}

export const cabinetTemplateRepo = {
  async getAll(): Promise<CabinetTemplate[]> {
    const db = await getDB()
    return db.getAllFromIndex('cabinetTemplates', 'by-updatedAt')
  },
  async get(id: string): Promise<CabinetTemplate | undefined> {
    const db = await getDB()
    return db.get('cabinetTemplates', id)
  },
  async save(template: CabinetTemplate): Promise<void> {
    const db = await getDB()
    await db.put('cabinetTemplates', template)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('cabinetTemplates', id)
  }
}
