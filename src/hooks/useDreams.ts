import { useState, useEffect, useCallback } from 'react'
import { getAllDreams, saveDream, deleteDream } from '../lib/db'
import type { DreamEntry } from '../types'

export function useDreams() {
  const [dreams, setDreams] = useState<DreamEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllDreams()
      setDreams(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (entry: DreamEntry) => {
    await saveDream(entry)
    await load()
  }, [load])

  const remove = useCallback(async (id: string) => {
    await deleteDream(id)
    await load()
  }, [load])

  const streak = (() => {
    if (dreams.length === 0) return 0
    let count = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const hasEntry = dreams.some(dr => dr.createdAt.startsWith(dateStr))
      if (hasEntry) count++
      else if (i > 0) break
    }
    return count
  })()

  return { dreams, loading, save, remove, streak, reload: load }
}
