import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Mock storage for local preview / offline fallback
const LOCAL_STORAGE_KEY = 'spaghetti_mock_leaderboard'
const LOCAL_USER_KEY = 'spaghetti_mock_user'

const defaultMockScores = [
  { id: '1', username: 'Filipekann', avatar_url: 'https://github.com/Filipekann.png', score: 58, spins_per_sec: 5.8, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', username: 'octocat', avatar_url: 'https://github.com/octocat.png', score: 52, spins_per_sec: 5.2, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', username: 'torvalds', avatar_url: 'https://github.com/torvalds.png', score: 45, spins_per_sec: 4.5, created_at: new Date(Date.now() - 10800000).toISOString() },
]

export async function signInWithGitHub() {
  if (!isSupabaseConfigured) {
    // Mock login for preview
    const mockUser = {
      id: 'mock-user-123',
      user_metadata: {
        user_name: 'Filipekann',
        avatar_url: 'https://github.com/Filipekann.png',
        full_name: 'Filip Ekström',
      },
    }
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser))
    window.dispatchEvent(new Event('mock_auth_change'))
    return { data: { user: mockUser }, error: null }
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
    },
  })
  return { data, error }
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    localStorage.removeItem(LOCAL_USER_KEY)
    window.dispatchEvent(new Event('mock_auth_change'))
    return { error: null }
  }
  return await supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem(LOCAL_USER_KEY)
    return saved ? JSON.parse(saved) : null
  }
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

export async function fetchLeaderboard() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultMockScores
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select('id, user_id, username, avatar_url, score, spins_per_sec, created_at')
    .order('score', { ascending: false })
    .limit(25)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
  return data || []
}

export async function submitScore(score, spinsPerSec) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const username =
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    user.user_metadata?.name ||
    'anonymous_spinner'
  const avatarUrl = user.user_metadata?.avatar_url || ''

  if (!isSupabaseConfigured) {
    const current = await fetchLeaderboard()
    const existingIndex = current.findIndex((item) => item.username === username)
    
    if (existingIndex >= 0) {
      if (score > current[existingIndex].score) {
        current[existingIndex] = {
          ...current[existingIndex],
          score,
          spins_per_sec: spinsPerSec,
          created_at: new Date().toISOString(),
        }
      }
    } else {
      current.push({
        id: `mock-${Date.now()}`,
        username,
        avatar_url: avatarUrl,
        score,
        spins_per_sec: spinsPerSec,
        created_at: new Date().toISOString(),
      })
    }

    current.sort((a, b) => b.score - a.score)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current))
    window.dispatchEvent(new Event('mock_leaderboard_change'))
    return { data: current, error: null }
  }

  // Upsert score into Supabase
  const { data, error } = await supabase
    .from('leaderboard')
    .upsert(
      {
        user_id: user.id,
        username,
        avatar_url: avatarUrl,
        score,
        spins_per_sec: spinsPerSec,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()

  return { data, error }
}
