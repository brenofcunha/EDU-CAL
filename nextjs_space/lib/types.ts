export interface Profile {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  xp_points: number
  streak_days: number
  last_study_date: string | null
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  title: string
  description: string | null
  track: 'calculo1' | 'calculo2' | 'calculo3' | 'calculovetorial'
  order_index: number
  created_at: string
}

export interface Lesson {
  id: string
  topic_id: string
  title: string
  content_md: string | null
  order_index: number
  xp_reward: number
  created_at: string
}

export interface Exercise {
  id: string
  topic_id: string
  lesson_id: string | null
  question: string
  type: 'mc' | 'open' | 'tf'
  options: any
  correct_answer: string
  explanation: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  xp_reward: number
  created_at: string
}

export interface UserLessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
}

export interface UserExerciseAttempt {
  id: string
  user_id: string
  exercise_id: string
  answer: string
  is_correct: boolean
  attempted_at: string
}

export interface StudyNote {
  id: string
  user_id: string
  title: string
  body_md: string | null
  created_at: string
  updated_at: string
}

export interface StudyFavorite {
  id: string
  user_id: string
  item_type: 'lesson' | 'exercise'
  item_id: string
  created_at: string
}

export interface ForumTag {
  id: string
  name: string
  color: string
}

export interface ForumPost {
  id: string
  author_id: string
  title: string
  body_md: string
  topic_id: string | null
  is_resolved: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  forum_post_tags?: { forum_tags: ForumTag }[]
  forum_replies?: { id: string }[]
  forum_votes?: ForumVote[]
}

export interface ForumReply {
  id: string
  post_id: string
  author_id: string
  body_md: string
  is_accepted: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  forum_votes?: ForumVote[]
}

export interface ForumVote {
  id: string
  user_id: string
  post_id: string | null
  reply_id: string | null
  vote_type: 'up' | 'down'
  created_at: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  target_table: string | null
  target_id: string | null
  payload: any
  created_at: string
  profiles?: Profile
}

export const TRACKS = {
  calculo1: { label: 'Cálculo I', description: 'Limites, derivadas e integrais', icon: '∫', color: 'from-blue-500 to-indigo-600' },
  calculo2: { label: 'Cálculo II', description: 'Séries, sequências e integrais múltiplas', icon: '∑', color: 'from-purple-500 to-pink-600' },
  calculo3: { label: 'Cálculo III', description: 'Cálculo multivariável avançado', icon: '∇', color: 'from-emerald-500 to-teal-600' },
  calculovetorial: { label: 'Cálculo Vetorial', description: 'Campos vetoriais, fluxo e circulação', icon: '→', color: 'from-amber-500 to-orange-600' },
} as const

export type TrackKey = keyof typeof TRACKS
