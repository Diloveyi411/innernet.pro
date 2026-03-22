import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from '@phosphor-icons/react'
import { useCheckins } from '../hooks/useCheckins'
import { generateId, ALL_EMOTIONS, EMOTION_LABELS } from '../lib/utils'
import { ScienceBadge } from '../components/ScienceBadge'
import type { Emotion } from '../types'

export function EveningScreen() {
  const navigate = useNavigate()
  const { todayCheckin, save } = useCheckins()
  const [dayEmotion, setDayEmotion] = useState<Emotion | null>(todayCheckin?.dayEmotion ?? null)
  const [intention, setIntention] = useState(todayCheckin?.sleepIntention ?? '')
  const [stressLevel, setStressLevel] = useState<1 | 2 | 3 | 4 | 5>(todayCheckin?.stressLevel ?? 3)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!dayEmotion) return
    setSaving(true)
    try {
      await save({
        id: todayCheckin?.id ?? generateId(),
        date: new Date().toISOString().split('T')[0],
        dayEmotion,
        sleepIntention: intention.trim(),
        stressLevel,
      })
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-transparent">
      <div className="flex items-center px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 active:text-zinc-200">
          <ArrowLeft size={20} weight="light" />
        </button>
      </div>

      <div className="flex-1 px-5">
        <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-2">
          Evening check-in
        </p>
        <h2 className="text-xl font-semibold text-zinc-100 mb-1">
          How was today?
        </h2>
        {/* UX Writing: describe the mechanism, not just a vague benefit */}
        <p className="text-zinc-500 text-sm mb-8">
          What you experience before sleep directly shapes what your brain processes during it.
        </p>

        {/* Day emotion */}
        <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">
          Dominant feeling today
        </p>
        <div className="grid grid-cols-2 gap-2 mb-8">
          {ALL_EMOTIONS.map(e => (
            <button
              key={e}
              onClick={() => setDayEmotion(e)}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                dayEmotion === e
                  ? 'bg-accent-dim border-accent text-accent'
                  : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 active:bg-white/[0.08]'
              }`}
            >
              {EMOTION_LABELS[e]}
            </button>
          ))}
        </div>

        {/* Stress level */}
        <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">
          Stress level
        </p>
        <div className="flex gap-2 mb-8">
          {([1, 2, 3, 4, 5] as const).map(v => (
            <button
              key={v}
              onClick={() => setStressLevel(v)}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                stressLevel === v
                  ? 'bg-accent-dim border-accent text-accent'
                  : 'bg-white/[0.04] border-white/[0.08] text-zinc-500 active:bg-white/[0.08]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Sleep intention */}
        <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">
          Tonight's intention <span className="text-zinc-600 normal-case font-normal">(optional)</span>
        </p>
        <textarea
          value={intention}
          onChange={e => setIntention(e.target.value)}
          // UX Writing: placeholder is a concrete example that shows the format
          placeholder="e.g. rest well, let go of the meeting, process the conversation with Anna"
          rows={3}
          className="w-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-accent/60 mb-6"
        />

        <ScienceBadge
          text="Brief positive intention-setting before sleep measurably shifts dream emotional content over two weeks."
          citation="Frontiers in Sleep (2025)"
        />
      </div>

      <div className="px-5 py-6">
        <button
          onClick={handleSave}
          disabled={!dayEmotion || saving}
          className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-base flex items-center justify-center gap-2 transition-opacity disabled:opacity-30 active:opacity-80"
        >
          <Check size={18} weight="light" />
          {saving ? 'Saving...' : 'Save tonight\'s check-in'}
        </button>
      </div>
    </div>
  )
}
