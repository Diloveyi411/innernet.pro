import type { Emotion } from '../types'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 10) return 'Good morning.'
  if (hour < 17) return 'Good afternoon.'
  return 'Good evening.'
}

export const EMOTION_LABELS: Record<Emotion, string> = {
  anxious: 'Anxious',
  fearful: 'Fearful',
  sad: 'Sad',
  angry: 'Angry',
  neutral: 'Neutral',
  curious: 'Curious',
  happy: 'Happy',
  excited: 'Excited',
}

export const EMOTION_COLORS: Record<Emotion, string> = {
  anxious: 'border-orange-700 text-orange-400',
  fearful: 'border-red-800 text-red-400',
  sad: 'border-blue-800 text-blue-400',
  angry: 'border-red-700 text-red-400',
  neutral: 'border-zinc-700 text-zinc-400',
  curious: 'border-violet-700 text-violet-400',
  happy: 'border-green-700 text-green-400',
  excited: 'border-yellow-700 text-yellow-400',
}

export const ALL_EMOTIONS: Emotion[] = [
  'anxious', 'fearful', 'sad', 'angry',
  'neutral', 'curious', 'happy', 'excited',
]
