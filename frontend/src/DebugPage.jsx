import { useState } from 'react'

const themeRoles = [
  { name: 'Base', variable: '--bg', role: 'Background' },
  { name: 'Mantle', variable: '--surface', role: 'Cards & raised surfaces' },
  { name: 'Text', variable: '--fg', role: 'Body text' },
  { name: 'Subtext 0', variable: '--muted', role: 'Secondary text' },
  { name: 'Blue', variable: '--accent', role: 'Links & primary accent' },
  { name: 'Sapphire', variable: '--accent-hover', role: 'Accent hover state' },
  { name: 'Surface 1', variable: '--border', role: 'Borders & dividers' },
  { name: 'Maroon', variable: '--highlight', role: 'Highlight & badges' },
]

const catppuccinAccents = [
  { name: 'Rosewater', variable: '--ctp-rosewater' },
  { name: 'Flamingo', variable: '--ctp-flamingo' },
  { name: 'Pink', variable: '--ctp-pink' },
  { name: 'Mauve', variable: '--ctp-mauve' },
  { name: 'Red', variable: '--ctp-red' },
  { name: 'Maroon', variable: '--ctp-maroon' },
  { name: 'Peach', variable: '--ctp-peach' },
  { name: 'Yellow', variable: '--ctp-yellow' },
  { name: 'Green', variable: '--ctp-green' },
  { name: 'Teal', variable: '--ctp-teal' },
  { name: 'Sky', variable: '--ctp-sky' },
  { name: 'Sapphire', variable: '--ctp-sapphire' },
  { name: 'Blue', variable: '--ctp-blue' },
  { name: 'Lavender', variable: '--ctp-lavender' },
]

const catppuccinSurfaces = [
  { name: 'Crust', variable: '--ctp-crust' },
  { name: 'Mantle', variable: '--ctp-mantle' },
  { name: 'Base', variable: '--ctp-base' },
  { name: 'Surface 0', variable: '--ctp-surface0' },
  { name: 'Surface 1', variable: '--ctp-surface1' },
  { name: 'Surface 2', variable: '--ctp-surface2' },
  { name: 'Overlay 0', variable: '--ctp-overlay0' },
  { name: 'Overlay 1', variable: '--ctp-overlay1' },
  { name: 'Overlay 2', variable: '--ctp-overlay2' },
  { name: 'Subtext 0', variable: '--ctp-subtext0' },
  { name: 'Subtext 1', variable: '--ctp-subtext1' },
  { name: 'Text', variable: '--ctp-text' },
]

export default function DebugPage({ theme, onNavigateHome }) {
  const [copiedToken, setCopiedToken] = useState(null)
  const [demoInput, setDemoInput] = useState('i3-msg focus left')
  const [demoChecked, setDemoChecked] = useState(true)

  const handleCopy = (variable) => {
    navigator.clipboard?.writeText(`var(${variable})`)
    setCopiedToken(variable)
    setTimeout(() => setCopiedToken(null), 1500)
  }

  return (
    <div className="container">
      {/* Navigation Banner */}
      <section className="tile hero debug-banner">
        <div className="debug-header-row">
          <div>
            <div className="badge-row">
              <span className="badge">Development & Debug</span>
              <span className="badge badge-outline">Catppuccin {theme === 'dark' ? 'Mocha' : 'Latte'}</span>
            </div>
            <h1>My corner of the internet</h1>
            <p className="tagline">
              A playground for experiments and projects.
            </p>
          </div>
          <button className="btn btn-outline back-btn" onClick={onNavigateHome}>
            ← Back to Main
          </button>
        </div>
      </section>

      {/* Typography Section */}
      <section className="tile">
        <div className="tile-header">
          <h2>Typography</h2>
          <span className="tile-tag">Inter & JetBrains Mono</span>
        </div>
        
        <div className="type-samples">
          <div className="type-row">
            <h1>Heading 1 — The quick brown fox</h1>
          </div>
          <div className="type-row">
            <h2>Heading 2 — Jumps over the lazy dog</h2>
          </div>
          <div className="type-row">
            <h3>Heading 3 — A level-three heading for structure</h3>
          </div>
          <div className="type-row">
            <h4>Heading 4 — Smaller subheadings and sections</h4>
          </div>
        </div>

        <hr className="divider" />

        <p>
          This is body text in <strong>Text</strong>, sitting on a{' '}
          <strong>Base</strong> background. Links like{' '}
          <a href="#debug">this one</a> use <strong>Blue</strong>, and secondary
          information is{' '}
          <span className="muted">rendered muted, like this</span>.
        </p>

        <p>
          Inline code is styled with font <code className="inline-code">JetBrains Mono</code>, e.g. <code className="inline-code">Mod+Shift+q</code> or <code className="inline-code">bindsym $mod+Return exec foot</code>.
        </p>

        <blockquote className="quote-box">
          “Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra
        </blockquote>
      </section>

      {/* Theme Roles Palette */}
      <section className="tile">
        <div className="tile-header">
          <h2>Active Theme Roles</h2>
          <span className="tile-tag">CSS Custom Properties</span>
        </div>
        <p className="muted">
          Active theme mappings for Catppuccin {theme === 'dark' ? 'Mocha' : 'Latte'}. Click any swatch to copy its CSS variable.
        </p>
        
        <div className="swatches-grid">
          {themeRoles.map((color) => (
            <button
              key={color.variable}
              className="swatch-btn"
              onClick={() => handleCopy(color.variable)}
              title="Click to copy CSS variable"
            >
              <div
                className="swatch-color"
                style={{ backgroundColor: `var(${color.variable})` }}
              />
              <div className="swatch-label">
                <strong>{color.name}</strong>
                <span className="mono-label">{copiedToken === color.variable ? 'Copied!' : color.variable}</span>
                <span className="muted">{color.role}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Full Catppuccin Palette */}
      <section className="tile full-width">
        <div className="tile-header">
          <h2>Full Catppuccin Palette</h2>
          <span className="tile-tag">{theme === 'dark' ? 'Mocha' : 'Latte'} Spectrum</span>
        </div>
        <p className="muted">
          Complete set of 14 accent colors and 12 base/surface shades.
        </p>

        <h3 className="palette-subheading">Accents</h3>
        <div className="color-chips-grid">
          {catppuccinAccents.map((c) => (
            <div
              key={c.variable}
              className="color-chip"
              onClick={() => handleCopy(c.variable)}
              title={`Click to copy ${c.variable}`}
            >
              <div className="chip-color" style={{ backgroundColor: `var(${c.variable})` }} />
              <div className="chip-info">
                <span className="chip-name">{c.name}</span>
                <span className="chip-var">{copiedToken === c.variable ? 'Copied!' : c.variable.replace('--ctp-', '')}</span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="palette-subheading">Surfaces & Text</h3>
        <div className="color-chips-grid">
          {catppuccinSurfaces.map((c) => (
            <div
              key={c.variable}
              className="color-chip"
              onClick={() => handleCopy(c.variable)}
              title={`Click to copy ${c.variable}`}
            >
              <div className="chip-color" style={{ backgroundColor: `var(${c.variable})` }} />
              <div className="chip-info">
                <span className="chip-name">{c.name}</span>
                <span className="chip-var">{copiedToken === c.variable ? 'Copied!' : c.variable.replace('--ctp-', '')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Components Section */}
      <section className="tile full-width">
        <div className="tile-header">
          <h2>Components & UI Elements</h2>
          <span className="tile-tag">Design System</span>
        </div>
        
        <div className="components-grid">
          {/* Buttons */}
          <div className="component-group">
            <h3>Buttons</h3>
            <div className="button-row">
              <button className="btn btn-primary">Primary action</button>
              <button className="btn btn-highlight">Highlight action</button>
              <button className="btn btn-outline">Outline action</button>
              <button className="btn btn-outline" disabled>Disabled</button>
            </div>
          </div>

          {/* Badges & Tags */}
          <div className="component-group">
            <h3>Badges & Tags</h3>
            <div className="badge-row">
              <span className="badge">Maroon Badge</span>
              <span className="badge badge-accent">Blue Accent</span>
              <span className="badge badge-success">Green Success</span>
              <span className="badge badge-warning">Yellow Warning</span>
              <span className="badge badge-outline">Outline Pill</span>
            </div>
          </div>

          {/* Cards */}
          <div className="component-group">
            <h3>Cards</h3>
            <div className="card">
              <h4>Bordered Card</h4>
              <p className="muted">
                Cards sit on <strong>Mantle</strong> with <strong>Surface 1</strong> borders, and <strong>Maroon</strong> shows up in places like <span className="badge">badges</span> and highlights.
              </p>
            </div>
          </div>

          {/* Form Controls */}
          <div className="component-group">
            <h3>Form Controls</h3>
            <div className="form-controls-col">
              <div className="input-group">
                <label className="input-label" htmlFor="dev-input">Terminal Command Input</label>
                <input
                  id="dev-input"
                  type="text"
                  className="text-input"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Enter command..."
                />
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={demoChecked}
                  onChange={(e) => setDemoChecked(e.target.checked)}
                />
                <span>Enable window tiling animations</span>
              </label>
            </div>
          </div>

          {/* Tiling Window Mockup */}
          <div className="component-group full-width-group">
            <h3>Window Frame Mockup</h3>
            <div className="mock-window">
              <div className="mock-titlebar">
                <div className="mock-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <span className="mock-title">filip@archlinux: ~/projects</span>
                <span className="mock-meta">[sway: tile-1]</span>
              </div>
              <div className="mock-body">
                <p className="mock-line"><span className="mock-prompt">$</span> ls -la</p>
                <p className="mock-line muted">drwxr-xr-x  8 filip users 4096 Aug 20 20:55 .</p>
                <p className="mock-line muted">drwxr-xr-x 12 filip users 4096 Aug 20 20:55 ..</p>
                <p className="mock-line"><span className="mock-dir">frontend/</span></p>
                <p className="mock-line"><span className="mock-dir">backend/</span></p>
                <p className="mock-line"><span className="mock-file">docker-compose.yml</span></p>
                <p className="mock-line"><span className="mock-file">README.md</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="tile footer debug-footer">
        <div className="footer-links">
          <button className="text-link-btn" onClick={onNavigateHome}>← Home</button>
          <span>•</span>
          <a href="https://github.com/Filipekann" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span>•</span>
          <a href="https://www.linkedin.com/in/filipekstrom/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
        <span className="muted">Debug View — filipekstrom.com</span>
      </footer>
    </div>
  )
}
