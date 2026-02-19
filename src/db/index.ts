import { openDB, IDBPDatabase } from 'idb'
import type { Design, Room } from '../types'

const DB_NAME = 'meubles-concept'
const DB_VERSION = 1

type MeublesDB = {
  designs: {
    key: string
    value: Design
    indexes: { 'by-updatedAt': number }
  }
  rooms: {
    key: string
    value: Room
    indexes: { 'by-updatedAt': number }
  }
}

let dbPromise: Promise<IDBPDatabase<MeublesDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MeublesDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const designStore = db.createObjectStore('designs', { keyPath: 'id' })
        designStore.createIndex('by-updatedAt', 'updatedAt')
        const roomStore = db.createObjectStore('rooms', { keyPath: 'id' })
        roomStore.createIndex('by-updatedAt', 'updatedAt')
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
