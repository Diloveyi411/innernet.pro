import { useNavigate } from 'react-router-dom'
import { Moon, Lightning, CaretRight } from '@phosphor-icons/react'
import { useDreams } from '../hooks/useDreams'
import { useCheckins } from '../hooks/useCheckins'
import { MagicCard } from '../components/MagicCard'
import { formatDate, todayKey, EMOTION_LABELS } from '../lib/utils'

// Krug: time-aware greeting reduces cognitive load; user doesn't need to decide what to do
function getTimeContext(): { greeting: string; subtitle: string; primaryAction: 'dream' | 'evening' | null } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return { greeting: 'Good morning.', subtitle: 'What did you dream?', primaryAction: 'dream' }
  if (hour >= 20 || hour < 5)  return { greeting: 'Good evening.', subtitle: 'How was today?', primaryAction: 'evening' }
  return { greeting: 'Good afternoon.', subtitle: 'Check in before tonight.', primaryAction: 'evening' }
}

export function HomeScreen() {
  const navigate = useNavigate()
  const { dreams, streak, loading } = useDreams()
  const { todayCheckin } = useCheckins()

  const todayDreams = dreams.filter(d => d.createdAt.startsWith(todayKey()))
  const todayDream = todayDreams[0]
  const recentDreams = dreams.slice(0, 3)
  const { greeting, subtitle, primaryAction } = getTimeContext()

  const showEveningCTA = !todayCheckin && primaryAction === 'evening'

  return (
    <div className="flex flex-col min-h-dvh bg-transparent pb-24">
      {/* Ambient glow: alive interface */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-64 ambient-glow" />

      {/* Header */}
      <div className="px-5 pt-14 pb-6 relative">
        <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-semibold text-gradient leading-tight">
          {greeting}
        </h1>
        <p className="text-zinc-400 mt-1 text-base">
          {todayDream ? `${todayDreams.length} dream${todayDreams.length > 1 ? 's' : ''} logged today.` : subtitle}
        </p>
      </div>

      {/* Streak: only shown when meaningful */}
      {streak > 1 && (
        <div className="mx-5 mb-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] animate-fade-up-1">
          <Lightning size={14} weight="fill" className="text-accent" />
          <span className="text-sm text-zinc-300">
            <span className="font-semibold text-zinc-100">{streak}</span>-day streak
          </span>
        </div>
      )}

      {/* CTAs */}
      {!loading && (
        <div className="px-5 mb-8 flex flex-col gap-3 animate-fade-up-2">
          {/* Dream CTA: primary in morning if none logged yet, secondary otherwise */}
          {!todayDream && primaryAction === 'dream' ? (
            <button
              onClick={() => navigate('/entry')}
              className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-base tracking-tight transition-opacity active:opacity-80"
            >
              Log this morning's dream
            </button>
          ) : (
            <button
              onClick={() => navigate('/entry')}
              className="w-full py-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-zinc-400 font-medium text-sm tracking-tight transition-opacity active:opacity-80"
            >
              {todayDream ? '+ Log another dream' : 'Log a dream'}
            </button>
          )}

          {/* Evening CTA: primary in evening, secondary in morning */}
          {!todayCheckin && (
            <button
              onClick={() => navigate('/evening')}
              className={`w-full py-4 rounded-xl font-medium text-base tracking-tight transition-opacity active:opacity-80 flex items-center justify-center gap-2 ${
                primaryAction === 'evening'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-zinc-400'
              }`}
            >
              <Moon size={16} weight="light" className={primaryAction === 'evening' ? 'text-white/70' : 'text-zinc-600'} />
              {primaryAction === 'evening' ? 'Log tonight\'s check-in' : 'Evening check-in'}
            </button>
          )}
        </div>
      )}

      {/* Recent dreams */}
      {recentDreams.length > 0 && (
        <div className="px-5 animate-fade-up-3">
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-4">
            Recent
          </p>
          <div className="flex flex-col gap-3">
            {recentDreams.map(dream => (
              <MagicCard key={dream.id} className="rounded-xl bg-white/[0.04] border border-white/[0.08] transition-colors active:bg-white/[0.07]">
                <button
                  onClick={() => navigate(`/journal/${dream.id}`)}
                  className="w-full text-left px-4 py-4"
                >
                  <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed mb-3">
                    {dream.rawText || 'No text recorded.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {dream.emotions.slice(0, 3).map(e => (
                        <span key={e} className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded-full border border-white/[0.10] bg-white/[0.04]">
                          {EMOTION_LABELS[e]}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-zinc-600">
                      <span className="text-[10px] font-mono">{formatDate(dream.createdAt)}</span>
                      <CaretRight size={12} weight="light" />
                    </div>
                  </div>
                </button>
              </MagicCard>
            ))}
          </div>
        </div>
      )}

      {/* Empty state: UX Writing: explain value, not absence */}
      {!loading && dreams.length === 0 && (
        <div className="flex-1 flex flex-col justify-center px-8 pt-4">
          <div className="rounded-xl px-5 py-5 bg-white/[0.03] backdrop-blur-md border border-white/[0.07]">
            <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-3">How it works</p>
            <div className="flex flex-col gap-3">
              {[
                ['Morning', 'Describe your dream in your own words'],
                ['Feel', 'Tag emotions and vividness'],
                ['Patterns', 'See what your brain keeps returning to'],
              ].map(([step, desc]) => (
                <div key={step} className="flex gap-3 items-start">
                  <span className="text-[10px] font-mono text-accent shrink-0 mt-0.5">{step}</span>
                  <span className="text-sm text-zinc-400 leading-snug">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
