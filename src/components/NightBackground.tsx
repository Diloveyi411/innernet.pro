import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseOpacity: number
  pulseOffset: number
  pulseSpeed: number
  color: [number, number, number]
}

interface Signal {
  fromIdx: number
  toIdx: number
  progress: number   // 0 to 1
  speed: number
  opacity: number
}

const COLORS: [number, number, number][] = [
  [79, 124, 255],   // blue
  [201, 167, 255],  // purple
  [124, 242, 211],  // teal
]

export function NightBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let nodes: Node[] = []
    let signals: Signal[] = []
    let lastSignalTime = 0

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      if (!canvas) return
      nodes = []
      signals = []

      const area = canvas.width * canvas.height
      const nodeCount = Math.min(38, Math.max(18, Math.floor(area / 14000)))

      for (let i = 0; i < nodeCount; i++) {
        const speed = 0.06 + Math.random() * 0.12
        const angle = Math.random() * Math.PI * 2
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 1.4 + 0.8,
          baseOpacity: Math.random() * 0.4 + 0.2,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.4 + Math.random() * 0.4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
      }
    }

    function spawnSignal(time: number) {
      if (time - lastSignalTime < 1200 + Math.random() * 1800) return
      if (nodes.length < 2) return

      // Pick two nodes that are connected (within max distance)
      const maxDist = getMaxDist()
      const candidates: [number, number][] = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          if (Math.sqrt(dx * dx + dy * dy) < maxDist * 0.85) {
            candidates.push([i, j])
          }
        }
      }
      if (candidates.length === 0) return
      const [a, b] = candidates[Math.floor(Math.random() * candidates.length)]
      signals.push({
        fromIdx: a,
        toIdx: b,
        progress: 0,
        speed: 0.004 + Math.random() * 0.003,
        opacity: 0.55 + Math.random() * 0.3,
      })
      lastSignalTime = time
    }

    function getMaxDist() {
      if (!canvas) return 180
      return Math.min(200, canvas.width * 0.2)
    }

    function draw(time: number) {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const t = time * 0.001

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < -20) n.x = canvas.width + 20
        if (n.x > canvas.width + 20) n.x = -20
        if (n.y < -20) n.y = canvas.height + 20
        if (n.y > canvas.height + 20) n.y = -20
      }

      // Advance signals
      signals = signals.filter(s => s.progress <= 1)
      for (const s of signals) s.progress += s.speed
      spawnSignal(time)

      const maxDist = getMaxDist()

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const proximity = 1 - dist / maxDist
            const lineOpacity = proximity * proximity * 0.13
            const [r, g, b] = nodes[i].color

            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`
            ctx.lineWidth = proximity * 0.7
            ctx.stroke()
          }
        }
      }

      // Draw signal pulses traveling along connections
      for (const s of signals) {
        if (s.progress > 1) continue
        const from = nodes[s.fromIdx]
        const to = nodes[s.toIdx]
        if (!from || !to) continue

        const px = from.x + (to.x - from.x) * s.progress
        const py = from.y + (to.y - from.y) * s.progress

        // Fade in and out at ends
        const edgeFade = Math.min(s.progress * 6, (1 - s.progress) * 6, 1)
        const alpha = s.opacity * edgeFade

        // Signal dot
        ctx.beginPath()
        ctx.arc(px, py, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`
        ctx.fill()

        // Small halo around signal
        const [r, g, b] = from.color
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 7)
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.beginPath()
        ctx.arc(px, py, 7, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Draw nodes
      for (const n of nodes) {
        const pulse = Math.sin(t * n.pulseSpeed + n.pulseOffset)
        const opacity = Math.max(0, n.baseOpacity + pulse * 0.1)
        const [r, g, b] = n.color

        // Outer glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 8)
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.25})`)
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * 8, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Node core
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        ctx.fill()
      }

      // Sparse background stars (subtle, still)
      ctx.save()
      ctx.globalAlpha = 0.18
      for (let i = 0; i < 40; i++) {
        // Use deterministic positions derived from canvas size to avoid re-seeding
        const sx = ((i * 1237 + 591) % canvas.width)
        const sy = ((i * 937 + 311) % canvas.height)
        const sr = 0.3 + (i % 5) * 0.1
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(200, 215, 255, 1)'
        ctx.fill()
      }
      ctx.restore()

      animId = requestAnimationFrame(draw)
    }

    resize()
    init()
    animId = requestAnimationFrame(draw)

    const onResize = () => { resize(); init() }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(25,32,58,0.55) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(18,28,48,0.4) 0%, transparent 65%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </>
  )
}
