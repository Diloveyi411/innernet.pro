export type Emotion =
  | 'anxious'
  | 'fearful'
  | 'sad'
  | 'angry'
  | 'neutral'
  | 'curious'
  | 'happy'
  | 'excited'

export interface DreamEntry {
  id: string
  createdAt: string // ISO timestamp
  rawText: string
  emotions: Emotion[]
  objects: string[]
  people: string[]
  lucidity: 0 | 1 | 2 | 3 // 0=none 1=brief 2=sustained 3=controlled
  vividness: 1 | 2 | 3 | 4 | 5
  reflection?: string // IPA response: where in waking life does this emotion appear
}

export interface EveningCheckin {
  id: string
  date: string // YYYY-MM-DD
  dayEmotion: Emotion
  sleepIntention: string
  stressLevel: 1 | 2 | 3 | 4 | 5
}

export interface MorningEntryDraft {
  rawText: string
  emotions: Emotion[]
  objects: string[]
  people: string[]
  lucidity: 0 | 1 | 2 | 3
  vividness: 1 | 2 | 3 | 4 | 5
  reflection?: string
}
