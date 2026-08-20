import { useEffect, useState } from 'react'
import RaymarchedSpaghetti from './RaymarchedSpaghetti.jsx'

const palette = [
  { name: 'Base', variable: '--bg', role: 'Background' },
  { name: 'Mantle', variable: '--surface', role: 'Cards & raised surfaces' },
  { name: 'Text', variable: '--fg', role: 'Body text' },
  { name: 'Subtext 0', variable: '--muted', role: 'Secondary text' },
  { name: 'Blue', variable: '--accent', role: 'Links & primary accent' },
  { name: 'Surface 1', variable: '--border', role: 'Borders & dividers' },
  { name: 'Maroon', variable: '--highlight', role: 'Highlight & badges' },
]

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <>
      <header className="site-header">
        <span className="brand">Filip Ekström</span>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
      </header>

      <main className="container">
        <section className="tile hero">
          <h1>My corner of the internet</h1>
          <p className="tagline">
            A playground for experiments and projects.
          </p>
        </section>

        <section className="tile">
          <h2>Spaghetti</h2>
          <p className="muted">
            A raymarched bowl of ASCII spaghetti, with a meatball. Drag it —
            works with mouse and touch.
          </p>
          <RaymarchedSpaghetti />
        </section>

        <section className="tile">
          <h2>Typography</h2>
          <h3>A level-three heading for structure</h3>
          <p>
            This is body text in <strong>Text</strong>, sitting on a{' '}
            <strong>Base</strong> background. Links like{' '}
            <a href="#">this one</a> use <strong>Blue</strong>, and secondary
            information is{' '}
            <span className="muted">rendered muted, like this</span>.
          </p>
        </section>

        <section className="tile">
          <h2>Palette</h2>
          <p className="muted">
            Catppuccin {theme === 'dark' ? 'Mocha' : 'Latte'} — swatches update
            with the theme toggle.
          </p>
          <div className="swatches">
            {palette.map((color) => (
              <div key={color.variable} className="swatch">
                <div
                  className="swatch-color"
                  style={{ backgroundColor: `var(${color.variable})` }}
                />
                <div className="swatch-label">
                  <strong>{color.name}</strong>
                  <span className="muted">{color.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="tile">
          <h2>Components</h2>
          <p>
            <button className="btn btn-primary">Primary action</button>{' '}
            <button className="btn btn-highlight">Highlight action</button>{' '}
            <button className="btn btn-outline">Outline action</button>
          </p>
          <div className="card">
            <h3>A bordered card</h3>
            <p>
              Cards sit on <strong>Mantle</strong> with{' '}
              <strong>Surface 1</strong> borders, and <strong>Maroon</strong>{' '}
              shows up in places like <span className="badge">badges</span> and
              highlights.
            </p>
          </div>
        </section>

        <footer className="tile footer">
          <a href="https://github.com">GitHub</a>
        </footer>
      </main>
    </>
  )
}
