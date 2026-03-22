import { useCallback } from 'react'
import { getAllDreams, getAllEvenings } from '../lib/db'
import { getInsightForEntry } from '../lib/scienceFacts'
import { EMOTION_LABELS } from '../lib/utils'
import type { DreamEntry, MorningEntryDraft } from '../types'

const LUCIDITY_LABELS = ['None', 'Brief awareness', 'Sustained', 'Controlled']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function dreamToHTML(dream: DreamEntry, index: number, total: number): string {
  const insight = getInsightForEntry(dream as unknown as MorningEntryDraft)
  const emotionList = dream.emotions.map(e => EMOTION_LABELS[e]).join(', ')
  const objectList = dream.objects.join(', ')
  const peopleList = dream.people.join(', ')

  return `
    <div class="dream-entry">
      <div class="dream-meta">
        <span class="dream-index">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
        <span class="dream-date">${formatDate(dream.createdAt)}</span>
        <span class="dream-time">${formatTime(dream.createdAt)}</span>
      </div>

      <div class="dream-text">${dream.rawText || 'No text recorded.'}</div>

      <div class="dream-fields">
        <div class="field-row">
          <span class="field-label">Vividness</span>
          <span class="field-value">${dream.vividness} / 5</span>
        </div>
        <div class="field-row">
          <span class="field-label">Lucidity</span>
          <span class="field-value">${LUCIDITY_LABELS[dream.lucidity]}</span>
        </div>
        ${emotionList ? `
        <div class="field-row">
          <span class="field-label">Emotions</span>
          <span class="field-value">${emotionList}</span>
        </div>` : ''}
        ${objectList ? `
        <div class="field-row">
          <span class="field-label">Objects & places</span>
          <span class="field-value">${objectList}</span>
        </div>` : ''}
        ${peopleList ? `
        <div class="field-row">
          <span class="field-label">People</span>
          <span class="field-value">${peopleList}</span>
        </div>` : ''}
      </div>

      ${dream.reflection ? `
      <div class="reflection-block">
        <div class="section-label">Reflection</div>
        <div class="reflection-text">${dream.reflection}</div>
      </div>` : ''}

      <div class="analysis-block">
        <div class="analysis-tag">${insight.tag}</div>
        <div class="analysis-headline">${insight.headline}</div>
        <div class="analysis-text">${insight.text.replace(/\n/g, '<br>')}</div>
        <div class="analysis-citation">${insight.citation}</div>
      </div>
    </div>
  `
}

function buildHTML(dreams: DreamEntry[]): string {
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const avgVividness = dreams.length
    ? (dreams.reduce((s, d) => s + d.vividness, 0) / dreams.length).toFixed(1)
    : 'N/A'

  const emotionFreq: Record<string, number> = {}
  for (const d of dreams) {
    for (const e of d.emotions) emotionFreq[e] = (emotionFreq[e] ?? 0) + 1
  }
  const topEmotion = Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0]

  const dreamsHTML = dreams.map((d, i) => dreamToHTML(d, i, dreams.length)).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>innernet — Dream Journal Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0f1117;
      --ink-secondary: #3d4148;
      --ink-muted: #7a7f8a;
      --ink-faint: #b8bcc4;
      --accent: #3d5ce0;
      --accent-dim: rgba(61,92,224,0.08);
      --border: #e0e2e8;
      --bg: #fafafa;
      --card: #ffffff;
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg);
      color: var(--ink);
      font-size: 13px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      max-width: 680px;
      margin: 0 auto;
      padding: 60px 40px 80px;
    }

    /* Cover */
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 0 60px;
      page-break-after: always;
    }

    .cover-brand {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .cover-title {
      font-family: 'Lora', Georgia, serif;
      font-size: 48px;
      font-weight: 700;
      color: var(--ink);
      line-height: 1.1;
      margin-top: 24px;
    }

    .cover-subtitle {
      font-family: 'Lora', Georgia, serif;
      font-style: italic;
      font-size: 18px;
      color: var(--ink-secondary);
      margin-top: 12px;
    }

    .cover-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 56px;
      padding-top: 40px;
      border-top: 1px solid var(--border);
    }

    .stat-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink-muted);
      margin-bottom: 6px;
    }

    .stat-value {
      font-family: 'Lora', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      color: var(--ink);
    }

    .stat-unit {
      font-size: 11px;
      color: var(--ink-muted);
      margin-top: 2px;
    }

    .cover-footer {
      border-top: 1px solid var(--border);
      padding-top: 20px;
    }

    .cover-footer-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--ink-faint);
      letter-spacing: 0.05em;
    }

    /* Dream entries */
    .dream-entry {
      padding: 48px 0;
      border-bottom: 1px solid var(--border);
      page-break-inside: avoid;
    }

    .dream-entry:last-child {
      border-bottom: none;
    }

    .dream-meta {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 20px;
    }

    .dream-index {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--accent);
      letter-spacing: 0.08em;
    }

    .dream-date {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--ink-secondary);
      letter-spacing: 0.04em;
    }

    .dream-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--ink-faint);
    }

    .dream-text {
      font-family: 'Lora', Georgia, serif;
      font-size: 16px;
      line-height: 1.75;
      color: var(--ink);
      margin-bottom: 24px;
      white-space: pre-wrap;
    }

    .dream-fields {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 16px 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }

    .field-row {
      display: flex;
      gap: 16px;
      align-items: baseline;
    }

    .field-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
      width: 120px;
      shrink: 0;
    }

    .field-value {
      font-size: 12px;
      color: var(--ink-secondary);
    }

    .section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
      margin-bottom: 8px;
    }

    .reflection-block {
      margin-bottom: 24px;
      padding: 16px;
      background: #f5f6f8;
      border-radius: 8px;
    }

    .reflection-text {
      font-family: 'Lora', Georgia, serif;
      font-size: 13px;
      font-style: italic;
      line-height: 1.7;
      color: var(--ink-secondary);
      white-space: pre-wrap;
    }

    .analysis-block {
      background: var(--accent-dim);
      border: 1px solid rgba(61,92,224,0.15);
      border-radius: 10px;
      padding: 20px;
    }

    .analysis-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--accent);
      margin-bottom: 8px;
    }

    .analysis-headline {
      font-family: 'Lora', Georgia, serif;
      font-size: 15px;
      font-weight: 600;
      color: var(--ink);
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .analysis-text {
      font-size: 12px;
      line-height: 1.75;
      color: var(--ink-secondary);
      margin-bottom: 12px;
    }

    .analysis-citation {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: var(--ink-faint);
      line-height: 1.5;
      border-top: 1px solid rgba(61,92,224,0.12);
      padding-top: 10px;
      margin-top: 4px;
    }

    @media print {
      body { background: white; }
      .cover { page-break-after: always; }
      .dream-entry { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Cover page -->
    <div class="cover">
      <div>
        <div class="cover-brand">innernet · dream intelligence</div>
        <h1 class="cover-title">Dream Journal</h1>
        <p class="cover-subtitle">Your brain's nightly report.</p>

        <div class="cover-stats">
          <div>
            <div class="stat-label">Total dreams</div>
            <div class="stat-value">${dreams.length}</div>
            <div class="stat-unit">entries</div>
          </div>
          <div>
            <div class="stat-label">Avg vividness</div>
            <div class="stat-value">${avgVividness}</div>
            <div class="stat-unit">out of 5</div>
          </div>
          <div>
            <div class="stat-label">Top emotion</div>
            <div class="stat-value" style="font-size:18px; margin-top:4px;">${topEmotion ? EMOTION_LABELS[topEmotion[0] as keyof typeof EMOTION_LABELS] : 'N/A'}</div>
            <div class="stat-unit">${topEmotion ? `${topEmotion[1]}× logged` : ''}</div>
          </div>
        </div>
      </div>

      <div class="cover-footer">
        <div class="cover-footer-text">Exported ${exportDate} · All data stored locally · Evidence-based analysis · No interpretation, no woo, just patterns.</div>
      </div>
    </div>

    <!-- Dream entries -->
    ${dreamsHTML}

  </div>
  <script>
    window.onload = () => {
      window.print()
    }
  </script>
</body>
</html>`
}

export function useExport() {
  const exportPDF = useCallback(async () => {
    const dreams = await getAllDreams()
    await getAllEvenings()

    const html = buildHTML(dreams)
    const win = window.open('', '_blank')
    if (!win) {
      alert('Please allow popups to export your journal.')
      return
    }
    win.document.write(html)
    win.document.close()
  }, [])

  return { exportPDF }
}
