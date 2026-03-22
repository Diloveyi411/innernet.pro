import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, ChartLineUp, Flask, ArrowRight, Lightning, Check } from '@phosphor-icons/react'

const FEATURES = [
  {
    icon: Brain,
    tag: 'Capture',
    headline: '60 seconds each morning',
    body: 'Describe what you dreamed in your own words. No templates, no structure. Just raw recall before it fades.',
  },
  {
    icon: Flask,
    tag: 'Science',
    headline: 'Evidence-backed analysis',
    body: 'Every insight is linked to peer-reviewed research. We cite our sources. No interpretation, no symbolism.',
  },
  {
    icon: ChartLineUp,
    tag: 'Patterns',
    headline: 'Your brain has recurring themes',
    body: 'Over weeks, patterns emerge: recurring emotions, people, places. Your data, not ours.',
  },
]

const STATS = [
  { value: '95%', label: 'of dreams forgotten within 10 minutes of waking' },
  { value: '2h', label: 'average nightly REM sleep. Your brain\'s processing time.' },
  { value: '100%', label: 'stored locally on your device. Private by design.' },
]

function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
        <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
          <Check size={16} weight="bold" className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-100">You are in.</p>
          <p className="text-xs text-zinc-500">We will reach out when something worth sharing happens.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm tracking-tight transition-opacity disabled:opacity-50 active:opacity-80 shrink-0"
        >
          {status === 'loading' ? '...' : 'Join'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-400 font-mono">Something went wrong. Try again.</p>
      )}
      <p className="text-[11px] font-mono text-zinc-600">No spam. Updates only when they matter.</p>
    </form>
  )
}

export function LandingScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-dvh bg-transparent text-zinc-100">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-[70vh] ambient-glow opacity-60" />
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-[50vh]"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 60% 0%, rgba(201,167,255,0.05) 0%, transparent 70%)' }}
      />

      {/* Nav */}
      <header className="relative px-6 pt-8 pb-4 flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-500 tracking-[0.2em] uppercase">Innernet</span>
        <button
          onClick={() => navigate('/home')}
          className="text-xs font-mono text-zinc-400 tracking-widest uppercase border border-white/[0.10] bg-white/[0.03] px-4 py-2 rounded-lg active:bg-white/[0.07] transition-colors"
        >
          Open App
        </button>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.03]">
          <Lightning size={11} weight="fill" className="text-accent" />
          <span className="text-[10px] font-mono text-zinc-400 tracking-[0.15em] uppercase">Dream intelligence</span>
        </div>

        <h1 className="text-[2.75rem] leading-[1.1] font-semibold tracking-tight mb-6 max-w-xs">
          <span className="text-gradient">Your brain never stops working.</span>
        </h1>

        <p className="text-zinc-400 text-base leading-relaxed mb-3 max-w-xs">
          Most people ignore eight hours of cognitive activity every night.
        </p>
        <p className="text-zinc-300 text-base leading-relaxed mb-12 max-w-xs">
          Innernet turns your dreams into a data layer you can actually read.
        </p>

        <button
          onClick={() => navigate('/home')}
          className="group flex items-center gap-3 px-7 py-4 rounded-xl bg-accent text-white font-semibold text-base tracking-tight transition-opacity active:opacity-80"
        >
          Start logging dreams
          <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
        </button>

        <p className="mt-4 text-[11px] font-mono text-zinc-600 tracking-wide">
          Free. Private. No account required.
        </p>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16">
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ value, label }) => (
            <div
              key={value}
              className="flex flex-col items-center text-center px-3 py-5 rounded-xl bg-white/[0.03] border border-white/[0.07]"
            >
              <span className="text-xl font-semibold text-zinc-100 mb-2">{value}</span>
              <span className="text-[10px] font-mono text-zinc-500 leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 pb-16">
        <p className="text-[10px] font-mono text-zinc-600 tracking-[0.2em] uppercase mb-6">How it works</p>
        <div className="flex flex-col gap-4">
          {FEATURES.map(({ icon: Icon, tag, headline, body }) => (
            <div
              key={tag}
              className="flex gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.07]"
            >
              <div className="shrink-0 w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mt-0.5">
                <Icon size={18} weight="light" className="text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-accent tracking-widest uppercase mb-1">{tag}</p>
                <p className="text-sm font-semibold text-zinc-100 mb-1.5 leading-snug">{headline}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Science callout */}
      <section className="px-6 pb-16">
        <div className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.07] px-5 py-6">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,124,255,0.06) 0%, transparent 70%)' }}
          />
          <p className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase mb-4">Research basis</p>
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">
            Sleep science has made significant advances in the last decade. We read the papers so you don't have to, and surface what's actually relevant to your patterns.
          </p>
          <div className="flex flex-col gap-2">
            {[
              'Nature Reviews Neuroscience',
              'Journal of Sleep Research',
              'Frontiers in Sleep',
            ].map(source => (
              <div key={source} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-accent/60 shrink-0" />
                <span className="text-[11px] font-mono text-zinc-500">{source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-16">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold text-zinc-100 leading-tight mb-3">
            Eight hours.<br />Zero data.
          </h2>
          <p className="text-zinc-500 text-sm mb-8 max-w-xs leading-relaxed">
            Every night your brain processes memory, emotion, and experience. Most of it disappears by 7am.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-base tracking-tight transition-opacity active:opacity-80"
          >
            Start now. It takes 2 minutes.
          </button>
        </div>
      </section>

      {/* Email capture */}
      <section className="px-6 pb-16">
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
          <p className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase mb-3">Stay in the loop</p>
          <p className="text-sm text-zinc-300 mb-5 leading-relaxed">
            Early access updates, new research, and product releases. One email at a time.
          </p>
          <EmailCapture />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-4 border-t border-white/[0.05]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-700 tracking-widest uppercase">Innernet</span>
          <span className="text-[10px] font-mono text-zinc-700">innernet.pro</span>
        </div>
      </footer>

    </div>
  )
}
