import { useEffect, useState } from 'react'
import {
  fetchLeaderboard,
  isSupabaseConfigured,
  supabase,
} from './supabaseClient.js'

export default function Leaderboard({ currentUser }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  const loadScores = async () => {
    const data = await fetchLeaderboard()
    setScores(data)
    setLoading(false)
  }

  useEffect(() => {
    loadScores()

    // Realtime Supabase subscription
    let channel
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('leaderboard-live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leaderboard' },
          () => {
            loadScores()
          }
        )
        .subscribe()
    }

    // Mock local event listener
    const handleMockChange = () => loadScores()
    window.addEventListener('mock_leaderboard_change', handleMockChange)

    return () => {
      if (channel) supabase.removeChannel(channel)
      window.removeEventListener('mock_leaderboard_change', handleMockChange)
    }
  }, [])

  return (
    <section className="tile full-width leaderboard-tile">
      <div className="tile-header">
        <div className="leaderboard-title-group">
          <h2>🏆 Hall of Fame</h2>
          <span className="tile-tag">10s Challenge Leaderboard</span>
        </div>
        <div className="leaderboard-status-badge">
          <span className="live-dot" />
          <span className="muted">{isSupabaseConfigured ? 'Live Supabase' : 'Preview Mode'}</span>
        </div>
      </div>

      <p className="muted leaderboard-desc">
        Spin the spaghetti bowl as fast as you can in 10 seconds. Sign in with GitHub to get on the board!
      </p>

      {loading ? (
        <div className="leaderboard-loading">
          <span className="muted">Loading leaderboard...</span>
        </div>
      ) : scores.length === 0 ? (
        <div className="leaderboard-empty">
          <p className="muted">No scores yet. Be the first to spin!</p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {scores.map((entry, index) => {
            const rank = index + 1
            const isSelf =
              currentUser &&
              (entry.username === currentUser.user_metadata?.user_name ||
                entry.username === currentUser.user_metadata?.preferred_username ||
                entry.username === currentUser.user_metadata?.name)

            let rankClass = 'rank-default'
            let medal = `#${rank}`
            if (rank === 1) {
              rankClass = 'rank-gold'
              medal = '🥇 1st'
            } else if (rank === 2) {
              rankClass = 'rank-silver'
              medal = '🥈 2nd'
            } else if (rank === 3) {
              rankClass = 'rank-bronze'
              medal = '🥉 3rd'
            }

            return (
              <div
                key={entry.id || entry.username}
                className={`leaderboard-item ${rankClass} ${isSelf ? 'is-current-user' : ''}`}
              >
                <div className="item-left">
                  <span className={`rank-badge ${rankClass}`}>{medal}</span>
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={entry.username}
                      className="user-avatar"
                      loading="lazy"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">🐙</div>
                  )}
                  <a
                    href={`https://github.com/${entry.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="user-handle"
                  >
                    @{entry.username}
                  </a>
                  {isSelf && <span className="you-pill">You</span>}
                </div>

                <div className="item-right">
                  <div className="score-badge">
                    <span className="score-num">{entry.score}</span>
                    <span className="score-unit">spins</span>
                  </div>
                  {entry.spins_per_sec && (
                    <span className="speed-tag">
                      {Number(entry.spins_per_sec).toFixed(1)}/s
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
