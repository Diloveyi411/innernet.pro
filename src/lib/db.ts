import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { DreamEntry, EveningCheckin } from '../types'

interface InnernetDB extends DBSchema {
  dreams: {
    key: string
    value: DreamEntry
    indexes: { 'by-date': string }
  }
  evenings: {
    key: string
    value: EveningCheckin
    indexes: { 'by-date': string }
  }
}

let _db: IDBPDatabase<InnernetDB> | null = null

async function getDB(): Promise<IDBPDatabase<InnernetDB>> {
  if (_db) return _db
  _db = await openDB<InnernetDB>('innernet', 1, {
    upgrade(db) {
      const dreamStore = db.createObjectStore('dreams', { keyPath: 'id' })
      dreamStore.createIndex('by-date', 'createdAt')

      const eveningStore = db.createObjectStore('evenings', { keyPath: 'id' })
      eveningStore.createIndex('by-date', 'date')
    },
  })
  return _db
}

// ── Dreams ──────────────────────────────────────────────────────────────────

export async function getAllDreams(): Promise<DreamEntry[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('dreams', 'by-date')
  return all.reverse()
}

export async function saveDream(entry: DreamEntry): Promise<void> {
  const db = await getDB()
  await db.put('dreams', entry)
}

export async function deleteDream(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('dreams', id)
}

// ── Evenings ─────────────────────────────────────────────────────────────────

export async function getAllEvenings(): Promise<EveningCheckin[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('evenings', 'by-date')
  return all.reverse()
}

export async function saveEvening(entry: EveningCheckin): Promise<void> {
  const db = await getDB()
  await db.put('evenings', entry)
}

export async function getTodayEvening(): Promise<EveningCheckin | undefined> {
  const today = new Date().toISOString().split('T')[0]
  const db = await getDB()
  const all = await db.getAllFromIndex('evenings', 'by-date')
  return all.find(e => e.date === today)
}

// ── Export ───────────────────────────────────────────────────────────────────

export async function exportAllData(): Promise<string> {
  const dreams = await getAllDreams()
  const evenings = await getAllEvenings()
  return JSON.stringify({ exportedAt: new Date().toISOString(), dreams, evenings }, null, 2)
}
