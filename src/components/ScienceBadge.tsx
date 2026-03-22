import { useState } from 'react'
import { CaretDown, Warning, Flask } from '@phosphor-icons/react'
import type { Insight, EpistemicStatus } from '../lib/scienceFacts'

interface ScienceBadgeProps {
  insight: Insight
  researchMode: boolean
}

const EPISTEMIC_CONFIG: Record<EpistemicStatus, { label: string; color: string; bg: string; border: string }> = {
  fact:        { label: 'FACT',        color: 'text-[#4F7CFF]', bg: 'bg-[rgba(79,124,255,0.10)]',   border: 'border-[rgba(79,124,255,0.28)]' },
  inference:   { label: 'INFERENCE',   color: 'text-[#C9A7FF]', bg: 'bg-[rgba(201,167,255,0.10)]', border: 'border-[rgba(201,167,255,0.25)]' },
  speculation: { label: 'SPECULATION', color: 'text-[#FF6B6B]', bg: 'bg-[rgba(255,107,107,0.10)]', border: 'border-[rgba(255,107,107,0.25)]' },
}

function confidenceColor(c: number): string {
  if (c >= 0.80) return 'text-[#7CF2D3]'
  if (c >= 0.65) return 'text-[#C9A7FF]'
  return 'text-[#FF6B6B]'
}

export function ScienceBadge({ insight, researchMode }: ScienceBadgeProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false)

  const ep = insight.epistemic ?? 'inference'
  const epCfg = EPISTEMIC_CONFIG[ep]
  const confidence = insight.confidence

  return (
    <div className="rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] overflow-hidden">

      {/* Research Mode header bar */}
      {researchMode && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/[0.08]">
          <Flask size={11} weight="duotone" className="text-zinc-500 shrink-0" />
          <span
            className={`text-[9px] font-mono font-medium tracking-widest uppercase px-2 py-0.5 rounded-full border ${epCfg.color} ${epCfg.bg} ${epCfg.border}`}
          >
            {epCfg.label}
          </span>
          {confidence !== undefined && (
            <span className={`text-[10px] font-mono ml-auto ${confidenceColor(confidence)}`}>
              {Math.round(confidence * 100)}% confidence
            </span>
          )}
        </div>
      )}

      {/* Body: insight text */}
      <div className="px-4 py-4">
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{insight.text}</p>
      </div>

      {/* Citation */}
      <div className="px-4 pb-3">
        <p className={`text-xs leading-relaxed ${researchMode ? 'font-mono text-zinc-500' : 'text-zinc-600'}`}>
          {insight.citation}
        </p>
      </div>

      {/* Research Mode: reasoning + bias warning */}
      {researchMode && (insight.reasoning || insight.biasWarning) && (
        <div className="border-t border-white/[0.08]">

          {insight.reasoning && (
            <>
              <button
                onClick={() => setReasoningOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-white/[0.06] transition-colors"
              >
                <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                  Reasoning chain
                </span>
                <CaretDown
                  size={12}
                  weight="light"
                  className={`text-zinc-600 transition-transform duration-200 ${reasoningOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {reasoningOpen && (
                <div className="px-4 pb-4">
                  <p className="text-xs font-mono text-zinc-400 leading-relaxed border-l border-white/[0.15] pl-3">
                    {insight.reasoning}
                  </p>
                </div>
              )}
            </>
          )}

          {insight.biasWarning && (
            <div className="mx-4 mb-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[rgba(255,107,107,0.08)] border border-[rgba(255,107,107,0.20)]">
              <Warning size={12} weight="duotone" className="text-[#FF6B6B] shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-[#FF6B6B] leading-relaxed">
                {insight.biasWarning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
