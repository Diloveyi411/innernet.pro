import { useState } from 'react'

export function useResearchMode() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('researchMode') === 'true'
  })

  function toggle() {
    setEnabled(prev => {
      const next = !prev
      localStorage.setItem('researchMode', String(next))
      return next
    })
  }

  return { researchMode: enabled, toggleResearchMode: toggle }
}
