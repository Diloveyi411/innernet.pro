import { NavLink } from 'react-router-dom'
import { House, Notebook, ChartLineUp, Sliders } from '@phosphor-icons/react'

const links = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/journal', icon: Notebook, label: 'Journal' },
  { to: '/patterns', icon: ChartLineUp, label: 'Patterns' },
  { to: '/settings', icon: Sliders, label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-2xl border-t border-white/[0.07]">
      <div className="flex items-center justify-around px-2 pb-safe">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 min-w-[44px] transition-colors ${
                isActive ? 'text-accent' : 'text-zinc-500/80'
              }`
            }
            aria-label={label}
          >
            <Icon size={22} weight="light" />
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
