import { useEffect, useState } from 'react'
import RaymarchedSpaghetti from './RaymarchedSpaghetti.jsx'
import Leaderboard from './Leaderboard.jsx'
import DebugPage from './DebugPage.jsx'
import {
  getCurrentUser,
  isSupabaseConfigured,
  signInWithGitHub,
  signOut,
  supabase,
} from './supabaseClient.js'

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark',
  )
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.toLowerCase()
    return hash === '#debug' || hash === '#dev' ? 'debug' : 'main'
  })
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // Auth initialization and state listener
  useEffect(() => {
    getCurrentUser().then(setCurrentUser)

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setCurrentUser(session?.user || null)
        }
      )
      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    const handleMockAuthChange = () => {
      getCurrentUser().then(setCurrentUser)
    }
    window.addEventListener('mock_auth_change', handleMockAuthChange)
    return () => window.removeEventListener('mock_auth_change', handleMockAuthChange)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase()
      setPage(hash === '#debug' || hash === '#dev' ? 'debug' : 'main')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateTo = (targetPage) => {
    setPage(targetPage)
    if (targetPage === 'debug') {
      window.location.hash = 'debug'
    } else {
      window.location.hash = ''
      if (window.location.hash) {
        history.pushState(null, '', window.location.pathname)
      }
    }
  }

  const handleSignIn = async () => {
    await signInWithGitHub()
  }

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
  }

  return (
    <>
      <header className="site-header">
        <div className="header-left">
          <span
            className="brand"
            onClick={() => navigateTo('main')}
            style={{ cursor: 'pointer' }}
          >
            Filip Ekström
          </span>
          <nav className="workspace-nav" aria-label="Workspaces">
            <button
              className={`workspace-pill ${page === 'main' ? 'active' : ''}`}
              onClick={() => navigateTo('main')}
              title="Main workspace (Spaghetti)"
            >
              <span className="ws-num">1</span>
              <span className="ws-name">main</span>
            </button>
            <button
              className={`workspace-pill ${page === 'debug' ? 'active' : ''}`}
              onClick={() => navigateTo('debug')}
              title="Debug / Development workspace"
            >
              <span className="ws-num">2</span>
              <span className="ws-name">debug</span>
            </button>
          </nav>
        </div>

        <div className="header-right">
          {currentUser ? (
            <div className="user-profile-pill">
              {currentUser.user_metadata?.avatar_url && (
                <img
                  src={currentUser.user_metadata.avatar_url}
                  alt={currentUser.user_metadata.user_name || 'User'}
                  className="header-avatar"
                />
              )}
              <span className="header-username">
                @{currentUser.user_metadata?.user_name ||
                  currentUser.user_metadata?.preferred_username ||
                  currentUser.user_metadata?.name ||
                  'spinner'}
              </span>
              <button className="logout-btn" onClick={handleSignOut} title="Sign Out">
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="github-auth-btn"
              onClick={handleSignIn}
              title="Sign in with GitHub"
              aria-label="Sign in with GitHub"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="auth-btn-text">Sign in</span>
            </button>
          )}

          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={`Switch to ${theme === 'dark' ? 'Latte (light)' : 'Mocha (dark)'}`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {page === 'debug' ? (
        <DebugPage theme={theme} onNavigateHome={() => navigateTo('main')} />
      ) : (
        <main className="container main-layout">
          <section className="tile full-width spaghetti-tile">
            <div className="tile-header">
              <h2>Spaghetti</h2>
              <span className="tile-tag">Raymarched ASCII • 10s Challenge</span>
            </div>
            <p className="muted">
              A raymarched bowl of ASCII spaghetti, with a meatball. Drag it —
              works with mouse and touch.
            </p>
            <RaymarchedSpaghetti
              currentUser={currentUser}
              onScoreSubmitted={() => {
                window.dispatchEvent(new Event('mock_leaderboard_change'))
              }}
            />
          </section>

          <Leaderboard currentUser={currentUser} />

          <footer className="tile footer">
            <div className="footer-links">
              <a href="https://github.com/Filipekann" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <span>•</span>
              <a href="https://www.linkedin.com/in/filipekstrom/" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <span>•</span>
              <button className="text-link-btn" onClick={() => navigateTo('debug')}>
                Debug & Dev Page
              </button>
            </div>
          </footer>
        </main>
      )}
    </>
  )
}
