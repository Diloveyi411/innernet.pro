import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MagnifyingGlass, Trash } from '@phosphor-icons/react'
import { useDreams } from '../hooks/useDreams'
import { useResearchMode } from '../hooks/useResearchMode'
import { ScienceBadge } from '../components/ScienceBadge'
import { MagicCard } from '../components/MagicCard'
import { getInsightForEntry } from '../lib/scienceFacts'
import { formatDate, formatTime, EMOTION_LABELS, EMOTION_COLORS } from '../lib/utils'
import type { MorningEntryDraft } from '../types'

export function JournalScreen() {
  const [query, setQuery] = useState('')
  const { dreams } = useDreams()
  const navigate = useNavigate()

  const filtered = query.trim()
    ? dreams.filter(d =>
        d.rawText.toLowerCase().includes(query.toLowerCase()) ||
        d.emotions.some(e => EMOTION_LABELS[e].toLowerCase().includes(query.toLowerCase())) ||
        d.objects.some(o => o.toLowerCase().includes(query.toLowerCase())) ||
        d.people.some(p => p.toLowerCase().includes(query.toLowerCase()))
      )
    : dreams

  return (
    <div className="flex flex-col min-h-dvh bg-transparent pb-24">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-5">Journal</h1>
        <div className="relative">
          <MagnifyingGlass size={16} weight="light" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search dreams, emotions, objects..."
            className="w-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-accent/60"
          />
        </div>
      </div>

      <div className="flex-1 px-5">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-zinc-600 text-sm text-center">
              {query ? 'No dreams match this search.' : 'No dreams logged yet.'}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {filtered.map(dream => {
            const tag = getInsightForEntry(dream as unknown as MorningEntryDraft).tag
            return (
              <MagicCard key={dream.id} className="rounded-xl bg-white/[0.04] border border-white/[0.08] transition-colors">
              <button
                onClick={() => navigate(`/journal/${dream.id}`)}
                className="w-full text-left px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed flex-1">
                    {dream.rawText || 'No text recorded.'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {dream.emotions.slice(0, 2).map(e => (
                      <span key={e} className={`text-[10px] px-2 py-0.5 rounded-full border ${EMOTION_COLORS[e]}`}>
                        {EMOTION_LABELS[e]}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-accent-border bg-accent-dim text-accent">
                      {tag}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[10px] font-mono text-zinc-600">{formatDate(dream.createdAt)}</p>
                    <p className="text-[10px] font-mono text-zinc-700">{formatTime(dream.createdAt)}</p>
                  </div>
                </div>
              </button>
              </MagicCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function DreamDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { dreams, remove } = useDreams()
  const { researchMode } = useResearchMode()
  const dream = dreams.find(d => d.id === id)

  if (!dream) return (
    <div className="flex flex-col min-h-dvh bg-transparent items-center justify-center">
      <p className="text-zinc-600">Dream not found.</p>
    </div>
  )

  async function handleDelete() {
    if (!confirm('Delete this dream?')) return
    await remove(dream!.id)
    navigate('/journal', { replace: true })
  }

  const lucidityLabel = ['None', 'Brief awareness', 'Sustained', 'Controlled'][dream.lucidity]
  const insight = getInsightForEntry(dream as unknown as MorningEntryDraft)

  return (
    <div className="flex flex-col min-h-dvh bg-transparent pb-10">
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 active:text-zinc-200">
          <ArrowLeft size={20} weight="light" />
        </button>
        <button onClick={handleDelete} className="p-2 -mr-2 text-zinc-600 active:text-red-400">
          <Trash size={18} weight="light" />
        </button>
      </div>

      <div className="px-5">
        <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-1">
          {formatDate(dream.createdAt)} · {formatTime(dream.createdAt)}
        </p>

        <p className="text-base text-zinc-200 leading-relaxed mt-4 whitespace-pre-wrap">
          {dream.rawText}
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {dream.emotions.length > 0 && (
            <div>
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">Emotions</p>
              <div className="flex flex-wrap gap-2">
                {dream.emotions.map(e => (
                  <span key={e} className={`text-xs px-3 py-1.5 rounded-full border ${EMOTION_COLORS[e]}`}>
                    {EMOTION_LABELS[e]}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-6">
            <div>
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-1">Vividness</p>
              <p className="text-2xl font-semibold text-zinc-200">{dream.vividness}<span className="text-zinc-600 text-sm font-normal">/5</span></p>
            </div>
            <div>
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-1">Lucidity</p>
              <p className="text-sm text-zinc-300 mt-1">{lucidityLabel}</p>
            </div>
          </div>

          {dream.objects.length > 0 && (
            <div>
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">Objects & places</p>
              <div className="flex flex-wrap gap-2">
                {dream.objects.map(o => (
                  <span key={o} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">{o}</span>
                ))}
              </div>
            </div>
          )}

          {dream.people.length > 0 && (
            <div>
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">People</p>
              <div className="flex flex-wrap gap-2">
                {dream.people.map(p => (
                  <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">{p}</span>
                ))}
              </div>
            </div>
          )}

          {dream.reflection && (
            <div className="pt-2">
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">Reflection</p>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-4">
                {dream.reflection}
              </p>
            </div>
          )}

          {/* Analysis */}
          <div className="pt-2">
            <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">Analysis</p>
            <span className="inline-block text-[10px] font-mono text-accent tracking-widest uppercase px-2.5 py-1 rounded-full border border-accent-border bg-accent-dim mb-3">
              {insight.tag}
            </span>
            <p className="text-sm font-semibold text-zinc-100 leading-snug mb-3">
              {insight.headline}
            </p>
            <ScienceBadge insight={insight} researchMode={researchMode} />
          </div>
        </div>
      </div>
    </div>
  )
}
