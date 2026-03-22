import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { NightBackground } from './components/NightBackground'
import { HomeScreen } from './screens/HomeScreen'
import { MorningEntryScreen } from './screens/MorningEntryScreen'
import { EveningScreen } from './screens/EveningScreen'
import { JournalScreen, DreamDetailScreen } from './screens/JournalScreen'
import { PatternsScreen } from './screens/PatternsScreen'
import { SettingsScreen } from './screens/SettingsScreen'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NightBackground />
      <div className="relative min-h-dvh" style={{ zIndex: 2 }}>
        <Routes>
          <Route path="/" element={<Layout><HomeScreen /></Layout>} />
          <Route path="/entry" element={<MorningEntryScreen />} />
          <Route path="/evening" element={<EveningScreen />} />
          <Route path="/journal" element={<Layout><JournalScreen /></Layout>} />
          <Route path="/journal/:id" element={<DreamDetailScreen />} />
          <Route path="/patterns" element={<Layout><PatternsScreen /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsScreen /></Layout>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
