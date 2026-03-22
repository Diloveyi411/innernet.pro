import { useRef } from 'react'

interface MagicCardProps {
  children: React.ReactNode
  className?: string
  gradientColor?: string
}

export function MagicCard({ children, className = '', gradientColor = 'rgba(79,124,255,0.22)' }: MagicCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ref.current.style.backgroundImage = `radial-gradient(280px circle at ${x}px ${y}px, ${gradientColor}, transparent 70%)`
  }

  function handleMouseLeave() {
    if (!ref.current) return
    ref.current.style.backgroundImage = 'none'
  }

  return (
    <div
      ref={ref}
      className={`backdrop-blur-md ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
