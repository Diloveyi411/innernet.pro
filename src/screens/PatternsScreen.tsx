import { useDreams } from '../hooks/useDreams'
import { useCheckins } from '../hooks/useCheckins'
import { useResearchMode } from '../hooks/useResearchMode'
import { EMOTION_LABELS, EMOTION_COLORS } from '../lib/utils'
import { getInsightForEntry } from '../lib/scienceFacts'
import { MagicCard } from '../components/MagicCard'
import type { Emotion } from '../types'
import type { MorningEntryDraft } from '../types'

function getLast28Days(): string[] {
  const days: string[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function PatternsScreen() {
  const { dreams, streak } = useDreams()
  const { checkins } = useCheckins()
  const { researchMode } = useResearchMode()
  const days = getLast28Days()

  const dreamDates = new Set(dreams.map(d => d.createdAt.split('T')[0]))
  const today = new Date().toISOString().split('T')[0]

  // Emotion frequency
  const emotionCount: Record<string, number> = {}
  for (const dream of dreams) {
    for (const e of dream.emotions) {
      emotionCount[e] = (emotionCount[e] ?? 0) + 1
    }
  }
  const topEmotions = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [Emotion, number][]

  // Insight tag frequency (what patterns your brain keeps returning to)
  const tagCount: Record<string, number> = {}
  for (const dream of dreams) {
    const insight = getInsightForEntry(dream as unknown as MorningEntryDraft)
    tagCount[insight.tag] = (tagCount[insight.tag] ?? 0) + 1
  }
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Avg vividness
  const avgVividness = dreams.length > 0
    ? (dreams.reduce((s, d) => s + d.vividness, 0) / dreams.length).toFixed(1)
    : null

  // Lucidity breakdown
  const lucidCount = dreams.filter(d => d.lucidity >= 2).length

  // Continuity score
  let continuityMatches = 0
  let continuityTotal = 0
  for (const checkin of checkins) {
    const nextDay = new Date(checkin.date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    const nextDream = dreams.find(d => d.createdAt.startsWith(nextDayStr))
    if (nextDream) {
      continuityTotal++
      if (nextDream.emotions.includes(checkin.dayEmotion)) continuityMatches++
    }
  }
  const continuityScore = continuityTotal >= 3
    ? Math.round((continuityMatches / continuityTotal) * 100)
    : null

  // Recurring objects/people (appear in 2+ dreams)
  const elementCount: Record<string, number> = {}
  for (const dream of dreams) {
    for (const o of [...dream.objects, ...dream.people]) {
      if (o.trim()) elementCount[o] = (elementCount[o] ?? 0) + 1
    }
  }
  const recurringElements = Object.entries(elementCount)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const dreamsInLast28 = dreams.filter(d => {
    const date = d.createdAt.split('T')[0]
    return days.includes(date)
  }).length

  if (dreams.length === 0) {
    return (
      <div className="flex flex-col min-h-dvh bg-transparent pb-24 items-center justify-center px-8">
        <div className="rounded-xl px-5 py-6 bg-white/[0.03] backdrop-blur-md border border-white/[0.07] text-center">
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">No data yet</p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Log your first dream to start seeing patterns. The more you log, the more your brain's recurring themes become visible.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-transparent pb-24">
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Patterns</h1>
        <p className="text-zinc-500 text-sm mt-1">{dreams.length} dream{dreams.length !== 1 ? 's' : ''} logged</p>
      </div>

      <div className="px-5 flex flex-col gap-8">

        {/* Activity heatmap */}
        <div>
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-4">Last 28 days</p>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 36px))' }}>
            {days.map(day => {
              const hasDream = dreamDates.has(day)
              const isToday = day === today
              return (
                <div
                  key={day}
                  title={day}
                  className={`w-full rounded-md transition-colors ${
                    hasDream
                      ? 'bg-accent'
                      : isToday
                      ? 'bg-accent/20 ring-1 ring-accent/50'
                      : 'bg-white/[0.03] border border-white/[0.06]'
                  }`}
                  style={{ aspectRatio: '1' }}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
              <span className="text-[10px] font-mono text-zinc-600">Dream logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.03] border border-white/[0.06]" />
              <span className="text-[10px] font-mono text-zinc-600">No entry</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 ml-auto">{dreamsInLast28} this period</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <MagicCard className="px-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Streak</p>
            <p className="text-2xl font-semibold text-zinc-100">{streak}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">days</p>
          </MagicCard>
          <MagicCard className="px-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Vividness</p>
            <p className="text-2xl font-semibold text-zinc-100">{avgVividness ?? 'N/A'}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">avg / 5</p>
          </MagicCard>
          <MagicCard className="px-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Lucid</p>
            <p className="text-2xl font-semibold text-zinc-100">{lucidCount}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">dreams</p>
          </MagicCard>
        </div>

        {/* Recurring pattern tags */}
        {topTags.length > 0 && (
          <div>
            <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-1">Recurring patterns</p>
            <p className="text-xs text-zinc-600 mb-4">What your brain keeps returning to</p>
            <div className="flex flex-col gap-2">
              {topTags.map(([tag, count], i) => {
                const pct = Math.round((count / dreams.length) * 100)
                const isTop = i === 0
                return (
                  <MagicCard key={tag} className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono tracking-widest uppercase ${isTop ? 'text-accent' : 'text-zinc-500'}`}>
                        {tag}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600">{count}× · {pct}%</span>
                    </div>
                    <div className="h-0.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isTop ? 'bg-accent' : 'bg-zinc-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </MagicCard>
                )
              })}
            </div>
          </div>
        )}

        {/* Emotion frequency */}
        {topEmotions.length > 0 && (
          <div>
            <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-1">Emotional signature</p>
            <p className="text-xs text-zinc-600 mb-4">Emotions present across all dreams</p>
            <div className="flex flex-col gap-2.5">
              {topEmotions.map(([emotion, count]) => {
                const pct = Math.round((count / dreams.length) * 100)
                const colorClass = EMOTION_COLORS[emotion]
                return (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className={`text-xs w-24 shrink-0 ${colorClass.split(' ')[1] ?? 'text-zinc-400'}`}>
                      {EMOTION_LABELS[emotion]}
                    </span>
                    <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                      <div className="h-full bg-accent/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 w-8 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Continuity score */}
        {continuityScore !== null && (
          <MagicCard className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-4">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Continuity signal</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-3xl font-semibold text-zinc-100">{continuityScore}%</p>
              <p className="text-xs text-zinc-500 mb-1">of evening emotions carried into next-day dreams</p>
            </div>
            {researchMode && (
              <p className="text-[10px] font-mono text-zinc-600 mt-2 leading-relaxed">
                Schredl (2003, 2024): the continuity hypothesis predicts waking emotional state directly shapes dream content. Your score tracks how strongly this holds for you personally.
              </p>
            )}
          </MagicCard>
        )}

        {/* Recurring elements */}
        {recurringElements.length > 0 && (
          <div>
            <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-1">Recurring elements</p>
            <p className="text-xs text-zinc-600 mb-4">Objects and people appearing in multiple dreams</p>
            <div className="flex flex-wrap gap-2">
              {recurringElements.map(([el, count]) => (
                <span key={el} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.10] text-zinc-300">
                  {el}
                  <span className="text-zinc-600 font-mono text-[10px]">{count}×</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Needs more data nudge */}
        {dreams.length < 5 && (
          <div className="px-4 py-4 rounded-xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">More data = clearer signal</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Patterns become statistically meaningful around 7 entries. Keep logging and this page will reveal what your brain keeps returning to.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
