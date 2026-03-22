import { useState, useEffect, useCallback } from 'react'
import { getAllEvenings, saveEvening, getTodayEvening } from '../lib/db'
import type { EveningCheckin } from '../types'

export function useCheckins() {
  const [checkins, setCheckins] = useState<EveningCheckin[]>([])
  const [todayCheckin, setTodayCheckin] = useState<EveningCheckin | undefined>()
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [all, today] = await Promise.all([getAllEvenings(), getTodayEvening()])
      setCheckins(all)
      setTodayCheckin(today)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (entry: EveningCheckin) => {
    await saveEvening(entry)
    await load()
  }, [load])

  return { checkins, todayCheckin, loading, save, reload: load }
}
