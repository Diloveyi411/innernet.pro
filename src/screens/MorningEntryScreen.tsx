import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Flask } from '@phosphor-icons/react'
import { useDreams } from '../hooks/useDreams'
import { useResearchMode } from '../hooks/useResearchMode'
import { ScienceBadge } from '../components/ScienceBadge'
import { getInsightForEntry, getInsightsForEntry, getIPAQuestion } from '../lib/scienceFacts'
import { generateId, ALL_EMOTIONS, EMOTION_LABELS, EMOTION_COLORS, todayKey } from '../lib/utils'
import type { MorningEntryDraft, Emotion } from '../types'

const STEPS = [
  { id: 'Capture', label: 'Capture', next: 'How did it feel?' },
  { id: 'Feel',    label: 'Feel',    next: 'What appeared?' },
  { id: 'Explore', label: 'Explore', next: 'See insight' },
  { id: 'Insight', label: 'Insight', next: 'Reflect' },
  { id: 'Reflect', label: 'Reflect', next: null },
] as const

type StepId = typeof STEPS[number]['id']

const EMPTY_DRAFT: MorningEntryDraft = {
  rawText: '',
  emotions: [],
  objects: [],
  people: [],
  lucidity: 0,
  vividness: 3,
}

export function MorningEntryScreen() {
  const navigate = useNavigate()
  const { save, dreams } = useDreams()
  const { researchMode } = useResearchMode()
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<MorningEntryDraft>(EMPTY_DRAFT)
  const [objectInput, setObjectInput] = useState('')
  const [personInput, setPersonInput] = useState('')
  const [saving, setSaving] = useState(false)
  // Progressive reveal: 0=scanning, 1=pattern label, 2=headline, 3=full card
  const [revealStage, setRevealStage] = useState(0)

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0

  // Trigger progressive reveal when entering Insight step
  useEffect(() => {
    if (step.id !== 'Insight') return
    setRevealStage(0)
    const t1 = setTimeout(() => setRevealStage(1), 700)
    const t2 = setTimeout(() => setRevealStage(2), 1200)
    const t3 = setTimeout(() => setRevealStage(3), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [step.id])

  function goNext() { if (!isLast) setStepIndex(i => i + 1) }
  function goBack() {
    if (isFirst) navigate(-1)
    else setStepIndex(i => i - 1)
  }

  function toggleEmotion(e: Emotion) {
    setDraft(d => ({
      ...d,
      emotions: d.emotions.includes(e) ? d.emotions.filter(x => x !== e) : [...d.emotions, e],
    }))
  }

  function addTag(field: 'objects' | 'people') {
    const val = (field === 'objects' ? objectInput : personInput).trim()
    if (!val) return
    setDraft(d => ({ ...d, [field]: [...d[field], val] }))
    if (field === 'objects') setObjectInput('')
    else setPersonInput('')
  }

  function removeTag(field: 'objects' | 'people', val: string) {
    setDraft(d => ({ ...d, [field]: d[field].filter(x => x !== val) }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await save({
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...draft,
      })
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const insights = getInsightsForEntry(draft, 3)
  const insight = insights[0]
  const secondaryInsights = insights.slice(1)
  const ipaQuestion = getIPAQuestion(draft)
  const isLast = step.id === 'Reflect'
  const canNext = step.id === 'Capture' ? draft.rawText.trim().length > 0 : true

  // How many recent dreams share this insight tag (last 14 days)
  const patternCount = (() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 14)
    return dreams.filter(d => {
      if (new Date(d.createdAt) < cutoff) return false
      return getInsightForEntry(d).tag === insight.tag
    }).length
  })()

  return (
    <div className="flex flex-col min-h-dvh bg-transparent">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-5">
        <button onClick={goBack} className="p-2 -ml-2 text-zinc-400 active:text-zinc-200" aria-label="Back">
          <ArrowLeft size={20} weight="light" />
        </button>
        {/* Tidwell Wizard: progress with step names, not just dots */}
        <div className="flex items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className={`h-1 rounded-full transition-all duration-200 ${
                i < stepIndex ? 'w-4 bg-accent opacity-40' :
                i === stepIndex ? 'w-6 bg-accent' : 'w-3 bg-white/[0.15]'
              }`} />
            </div>
          ))}
        </div>
        <div className="w-8" />
      </div>

      {/* Step header */}
      <div className="px-5 mb-6">
        <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-1">
          {step.label} · {stepIndex + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 overflow-y-auto">

        {/* CAPTURE: UX Writing: textarea placeholder is an example, not an instruction */}
        {step.id === 'Capture' && (
          <div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-1">Describe your dream</h2>
            <p className="text-zinc-500 text-sm mb-5">Write freely. Details fade in minutes.</p>
            <textarea
              autoFocus
              value={draft.rawText}
              onChange={e => setDraft(d => ({ ...d, rawText: e.target.value }))}
              // UX Writing: placeholder is a concrete example, not generic "Type here..."
              placeholder="I was in a building I didn't recognize. There was someone from work, but they looked different..."
              rows={7}
              className="w-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-4 text-zinc-200 placeholder-zinc-600 text-base leading-relaxed resize-none focus:outline-none focus:border-accent/60"
            />
          </div>
        )}

        {/* FEEL */}
        {step.id === 'Feel' && (
          <div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-1">How did it feel?</h2>
            <p className="text-zinc-500 text-sm mb-5">Select all that apply. Negative emotions are data too.</p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {ALL_EMOTIONS.map(e => {
                const selected = draft.emotions.includes(e)
                return (
                  <button
                    key={e}
                    onClick={() => toggleEmotion(e)}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      selected
                        ? 'bg-accent-dim border-accent text-accent'
                        : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 active:bg-white/[0.08]'
                    }`}
                  >
                    {EMOTION_LABELS[e]}
                  </button>
                )
              })}
            </div>

            <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">Vividness</p>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setDraft(d => ({ ...d, vividness: v }))}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    draft.vividness === v
                      ? 'bg-accent-dim border-accent text-accent'
                      : 'bg-white/[0.04] border-white/[0.08] text-zinc-500 active:bg-white/[0.08]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              <span className="text-[10px] text-zinc-600">Blurry</span>
              <span className="text-[10px] text-zinc-600">Vivid</span>
            </div>
          </div>
        )}

        {/* EXPLORE: UX Writing: labels name the content category, not the action */}
        {step.id === 'Explore' && (
          <div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-1">What was there?</h2>
            <p className="text-zinc-500 text-sm mb-5">
              Tag things that appeared. These build your pattern data over time.
            </p>

            {/* Objects: separate state, separate input */}
            <div className="mb-6">
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">Objects & places</p>
              <div className="flex gap-2 mb-3">
                <input
                  value={objectInput}
                  onChange={e => setObjectInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('objects') } }}
                  // UX Writing: placeholder is an example
                  placeholder="e.g. car, old office, bridge"
                  className="flex-1 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-accent/60"
                />
                <button
                  onClick={() => addTag('objects')}
                  className="px-4 py-3 rounded-xl bg-white/[0.08] border border-white/10 text-zinc-300 text-sm font-medium active:bg-white/[0.12] shrink-0"
                >
                  Add
                </button>
              </div>
              {draft.objects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {draft.objects.map(tag => (
                    <button key={tag} onClick={() => removeTag('objects', tag)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs active:opacity-70">
                      {tag} <span className="text-zinc-500 text-sm leading-none">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* People: separate state */}
            <div className="mb-6">
              <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">People</p>
              <div className="flex gap-2 mb-3">
                <input
                  value={personInput}
                  onChange={e => setPersonInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('people') } }}
                  placeholder="e.g. mother, stranger, old colleague"
                  className="flex-1 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-accent/60"
                />
                <button
                  onClick={() => addTag('people')}
                  className="px-4 py-3 rounded-xl bg-white/[0.08] border border-white/10 text-zinc-300 text-sm font-medium active:bg-white/[0.12] shrink-0"
                >
                  Add
                </button>
              </div>
              {draft.people.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {draft.people.map(tag => (
                    <button key={tag} onClick={() => removeTag('people', tag)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs active:opacity-70">
                      {tag} <span className="text-zinc-500 text-sm leading-none">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lucidity */}
            <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">Lucidity</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                [0, 'None: normal dream'],
                [1, 'Brief: moment of awareness'],
                [2, 'Sustained: knew I was dreaming'],
                [3, 'Controlled: influenced the dream'],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setDraft(d => ({ ...d, lucidity: val }))}
                  className={`py-3 px-3 rounded-xl border text-xs font-medium text-left transition-all leading-snug ${
                    draft.lucidity === val
                      ? 'bg-accent-dim border-accent text-accent'
                      : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 active:bg-white/[0.08]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* REFLECT: IPA: bridge dream emotion to waking life */}
        {step.id === 'Reflect' && (
          <div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-1">Now, your waking life</h2>
            <p className="text-zinc-500 text-sm mb-6">
              The IPA approach asks one question: where does this feeling exist outside the dream?
            </p>

            {/* The IPA question */}
            <div className="px-4 py-5 rounded-xl bg-accent-dim backdrop-blur-sm border border-accent-border mb-6">
              <p className="text-xs font-mono text-accent tracking-widest uppercase mb-3">Reflection question</p>
              <p className="text-base font-medium text-zinc-100 leading-snug mb-1">
                {ipaQuestion.prompt}
              </p>
              <p className="text-xs text-zinc-500 mt-2">{ipaQuestion.subtext}</p>
            </div>

            {/* Optional reflection input */}
            <textarea
              value={draft.reflection ?? ''}
              onChange={e => setDraft(d => ({ ...d, reflection: e.target.value }))}
              placeholder="Write freely: or just sit with the question. This is for you, not analysis."
              rows={5}
              className="w-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-4 text-zinc-200 placeholder-zinc-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-accent/60"
            />
            <p className="text-[11px] text-zinc-600 mt-2 px-1">Optional. Saved privately with this entry.</p>
          </div>
        )}

        {/* INSIGHT: progressive reveal, dopamine loop */}
        {step.id === 'Insight' && (
          <div>
            {/* Stage 0: scanning state */}
            {revealStage === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-breathe" />
                <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase animate-fade-in">
                  Scanning pattern
                </p>
              </div>
            )}

            {/* Stage 1+: header */}
            {revealStage >= 1 && (
              <div className="flex items-start justify-between mb-5 animate-fade-up">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100 mb-1">Pattern detected</h2>
                  {researchMode && (
                    <p className="text-zinc-500 text-sm">Research Mode: confidence, reasoning, bias warnings.</p>
                  )}
                </div>
                {researchMode && (
                  <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-[rgba(79,124,255,0.10)] border border-[rgba(79,124,255,0.25)]">
                    <Flask size={11} weight="duotone" className="text-[#4F7CFF]" />
                    <span className="text-[9px] font-mono text-[#4F7CFF] tracking-widest uppercase">Research</span>
                  </div>
                )}
              </div>
            )}

            {/* Stage 1: tag + personal signal */}
            {revealStage >= 1 && (
              <div className="flex items-center gap-3 mb-4 animate-fade-up-1">
                <span className="inline-block text-[10px] font-mono text-accent tracking-widest uppercase px-2.5 py-1 rounded-full border border-accent-border bg-accent-dim">
                  {insight.tag}
                </span>
                {patternCount > 0 && (
                  <span className="text-[10px] font-mono text-[#7CF2D3] px-2.5 py-1 rounded-full border border-[rgba(124,242,211,0.25)] bg-[rgba(124,242,211,0.08)]">
                    {patternCount}x in last 14 days
                  </span>
                )}
              </div>
            )}

            {/* Stage 2: headline */}
            {revealStage >= 2 && (
              <h3 className="text-base font-semibold text-zinc-100 leading-snug mb-5 animate-fade-up-2">
                {insight.headline}
              </h3>
            )}

            {/* Stage 3: full card */}
            {revealStage >= 3 && (
              <div className="animate-fade-up-3">
                <ScienceBadge insight={insight} researchMode={researchMode} />

                {/* Secondary pattern matches */}
                {secondaryInsights.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-3">Also detected</p>
                    <div className="flex flex-col gap-3">
                      {secondaryInsights.map(ins => (
                        <div key={ins.tag}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block text-[10px] font-mono text-zinc-500 tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/[0.10] bg-white/[0.04]">
                              {ins.tag}
                            </span>
                          </div>
                          <ScienceBadge insight={ins} researchMode={researchMode} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(draft.emotions.length > 0 || draft.objects.length > 0 || draft.people.length > 0) && (
                  <div className="mt-4 px-4 py-4 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]">
                    <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">This entry</p>
                    <div className="flex flex-wrap gap-2">
                      {draft.emotions.map(e => (
                        <span key={e} className={`text-xs px-2.5 py-1 rounded-full border ${EMOTION_COLORS[e]}`}>
                          {EMOTION_LABELS[e]}
                        </span>
                      ))}
                      {[...draft.objects, ...draft.people].map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom action: UX Writing: button says what happens next, not just "Continue" */}
      <div className="px-5 py-6">
        {isLast ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-base flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 active:opacity-80"
          >
            <Check size={18} weight="light" />
            {saving ? 'Saving...' : 'Save dream'}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canNext}
            className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-base transition-opacity disabled:opacity-30 active:opacity-80"
          >
            {/* Tidwell Wizard: next button tells you what step is coming */}
            Next: {step.next}
          </button>
        )}
      </div>
    </div>
  )
}
