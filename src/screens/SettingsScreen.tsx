import { DownloadSimple, ShieldCheck, Flask } from '@phosphor-icons/react'
import { useExport } from '../hooks/useExport'
import { useDreams } from '../hooks/useDreams'
import { useResearchMode } from '../hooks/useResearchMode'
import { MagicCard } from '../components/MagicCard'

export function SettingsScreen() {
  const { exportPDF } = useExport()
  const { dreams } = useDreams()
  const { researchMode, toggleResearchMode } = useResearchMode()

  return (
    <div className="flex flex-col min-h-dvh bg-transparent pb-24">
      <div className="px-5 pt-14 pb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Settings</h1>
      </div>

      <div className="px-5 flex flex-col gap-6">
        {/* Research Mode */}
        <div>
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-4">Analysis</p>
          <MagicCard className="rounded-xl bg-white/[0.04] border border-white/[0.08] transition-colors" gradientColor="rgba(79,124,255,0.22)">
            <button
              onClick={toggleResearchMode}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <Flask size={16} weight="duotone" className={researchMode ? 'text-[#4F7CFF]' : 'text-zinc-500'} />
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-200">Research Mode</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {researchMode
                      ? 'ON: confidence scores, reasoning chains, bias warnings'
                      : 'OFF: clean insight summaries'}
                  </p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${researchMode ? 'bg-[#4F7CFF]' : 'bg-zinc-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${researchMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </button>
          </MagicCard>
          {researchMode && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-[rgba(79,124,255,0.08)] border border-[rgba(79,124,255,0.20)]">
              <p className="text-[11px] font-mono text-[#4F7CFF] leading-relaxed">
                Each insight now shows: epistemic status (FACT / INFERENCE / SPECULATION), confidence %, reasoning chain, and bias warnings where applicable.
              </p>
            </div>
          )}
        </div>

        {/* Privacy */}
        <MagicCard className="rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <div className="px-4 py-4 flex items-start gap-3">
            <ShieldCheck size={16} weight="light" className="text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-200 mb-1">Privacy-first storage</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                All data is stored locally on this device. No dream text is sent to any server or external API. Your data never leaves your browser.
              </p>
            </div>
          </div>
        </MagicCard>

        {/* Export */}
        <div>
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-4">Data</p>
          <MagicCard className="rounded-xl bg-white/[0.04] border border-white/[0.08] transition-colors">
            <button
              onClick={exportPDF}
              className="w-full flex items-center gap-3 px-4 py-4"
            >
              <DownloadSimple size={18} weight="light" className="text-zinc-400 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-200">Export dream journal</p>
                <p className="text-xs text-zinc-500 mt-0.5">{dreams.length} dreams · PDF with analysis</p>
              </div>
            </button>
          </MagicCard>
        </div>

        {/* Science sources */}
        <div>
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-4">
            Science sources
          </p>
          <div className="flex flex-col gap-3">
            {[
              ['Continuity hypothesis', 'Schredl (2003, 2024) · Dreaming, APA'],
              ['Overnight emotional memory processing', 'Walker et al. · Scientific Reports (2024)'],
              ['Threat Simulation Theory', 'Revonsuo (2000) · Behavioral and Brain Sciences'],
              ['Neurocognitive model of dreaming', 'Domhoff (2003, 2022) · UCSC DreamBank'],
              ['Central Image Theory', 'Hartmann (1995, 2010) · Tufts University'],
              ['Chase dreams: 81.5% lifetime prevalence', 'Nielsen et al. (2003) · Dreaming'],
              ['Exam dreams predict better performance', 'Arnulf et al. (2014) · Consciousness and Cognition'],
              ['Teeth dreams: bruxism correlation', 'Rozen & Soffer-Dudek (2018) · Frontiers in Psychology'],
              ['Sleep paralysis: 30% lifetime prevalence', 'Sharpless & Barber (2011) · Sleep Medicine Reviews'],
              ['Recurring dreams signal unresolved concerns', 'Schredl et al. (2022) · International Journal of Dream Research'],
              ['Continuing bonds: deceased person dreams', 'Penberthy et al. (2023) · UVA Division of Perceptual Studies'],
              ['Lucid dreaming: text and mirror instability', 'LaBerge (1985-2000) · Stanford Sleep Research'],
              ['REM creative problem-solving (42% vs 17%)', 'Northwestern University (2024)'],
              ['Autobiographical memory = future simulation', 'Schacter & Addis (2007) · Nature Reviews Neuroscience'],
              ['House as psychological structure', 'Roesler (2020, 2025) · Journal of Analytical Psychology'],
              ['Pregnancy dream content across contexts', 'PMC12075439 (2025)'],
              ['Religious dream content: 28% of all adults', 'Bulkeley (2016) · Big Dreams'],
              ['Social rejection activates pain circuits', 'Eisenberger et al. (2009) · SCAN / Oxford'],
              ['Combat dreams: never literal replays', 'Hartmann · International Journal of Dream Research'],
              ['COVID lockdown and trapped dream surge', 'PLOS ONE (2021) · 10.1371/journal.pone.0259040'],
              ['Celebrity dreams: parasocial attachment', 'McCutcheon et al. (2021) · International Journal of Dream Research'],
              ['Alien abduction as sleep paralysis variant', 'McNally & Clancy (2005) · Harvard · Psychological Science'],
              ['Pre-sleep intention shifts dream content', 'Frontiers in Sleep (2025)'],
              ['Erotic dreams: near-universal prevalence', 'SLEEP Study (2025) · Journal of Behavioral and Brain Science'],
            ].map(([title, source]) => (
              <MagicCard key={title} className="rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="px-4 py-3">
                  <p className="text-sm text-zinc-300">{title}</p>
                  <p className="text-xs font-mono text-zinc-600 mt-0.5">{source}</p>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>

        {/* About */}
        <MagicCard className="rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <div className="px-4 py-4">
            <p className="text-sm font-medium text-zinc-200 mb-1">innernet</p>
            <p className="text-xs text-zinc-500">
              Evidence-based dream intelligence. No interpretation. No woo. Just patterns.
            </p>
            <p className="text-xs font-mono text-zinc-700 mt-3">"Your brain's nightly report."</p>
          </div>
        </MagicCard>
      </div>
    </div>
  )
}
