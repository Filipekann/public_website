import { useEffect, useRef } from 'react'

// Grid size in characters
const W = 64
const H = 32

const RAMP = ' .:-=+*#%@'
const BASE_SPIN = 0.006 // idle rotation speed, rad/frame

const MAX_STEPS = 48
const MAX_DIST = 8
const EPS = 0.003
const STEP_SCALE = 0.8 // safety factor: our wavy-torus SDF isn't perfectly signed

// Material ids
const BOWL = 0
const NOODLE = 1
const MEATBALL = 2

// Noodle pile: stacked wavy tori (radius and height wobble with angle)
const NOODLES = [
  { R: 0.85, y: 0.3, phase: 0.0 },
  { R: 0.7, y: 0.38, phase: 2.1 },
  { R: 0.55, y: 0.46, phase: 4.2 },
]

// Signed distance to the whole scene. Writes [dist, material] into `res`.
function sdScene(px, py, pz, res) {
  // Bowl: spherical shell, top cut off by a plane
  const by = py - 0.35
  let d = Math.abs(Math.sqrt(px * px + by * by + pz * pz) - 1.15) - 0.06
  d = Math.max(d, py - 0.3)
  let mat = BOWL

  for (let n = 0; n < NOODLES.length; n++) {
    const nd = NOODLES[n]
    const ang = Math.atan2(pz, px)
    const R =
      nd.R + 0.18 * Math.sin(3 * ang + nd.phase) + 0.08 * Math.sin(7 * ang + 2 * nd.phase)
    const qx = Math.sqrt(px * px + pz * pz) - R
    const qy = py - nd.y - 0.06 * Math.sin(5 * ang + 3 * nd.phase)
    const dNoodle = Math.sqrt(qx * qx + qy * qy) - 0.09
    if (dNoodle < d) {
      d = dNoodle
      mat = NOODLE
    }
  }

  // Meatball
  const mx = px - 0.15
  const my = py - 0.42
  const mz = pz + 0.1
  const dBall = Math.sqrt(mx * mx + my * my + mz * mz) - 0.22
  if (dBall < d) {
    d = dBall
    mat = MEATBALL
  }

  res[0] = d
  res[1] = mat
}

export default function RaymarchedSpaghetti() {
  const bowlRef = useRef(null)
  const noodleRef = useRef(null)
  const ballRef = useRef(null)
  const spinRef = useRef(null)
  const state = useRef({
    rotX: 0.55,
    rotY: 0,
    prevRotY: 0,
    totalRotation: 0,
    spins: 0,
    velX: 0,
    velY: BASE_SPIN,
    dragging: false,
    lastX: 0,
    lastY: 0,
  })

  useEffect(() => {
    const bowlOut = new Array(W * H)
    const noodleOut = new Array(W * H)
    const ballOut = new Array(W * H)
    const res = new Float64Array(2)
    // Light direction (normalized-ish)
    const Lx = 0.55
    const Ly = 0.75
    const Lz = -0.35
    let raf

    const frame = () => {
      const s = state.current
      if (!s.dragging) {
        s.velY += (BASE_SPIN - s.velY) * 0.03 // ease back to idle spin
        s.velX *= 0.96
        s.rotY += s.velY
        s.rotX += s.velX
      }
      s.rotX = Math.max(0.05, Math.min(1.35, s.rotX))

      // Orbiting camera looking at the bowl
      const cosY = Math.cos(s.rotY)
      const sinY = Math.sin(s.rotY)
      const cosX = Math.cos(s.rotX)
      const sinX = Math.sin(s.rotX)
      const ex = 3.4 * sinY * cosX
      const ey = 3.4 * sinX
      const ez = 3.4 * cosY * cosX
      const tx = 0
      const ty = -0.1
      const tz = 0
      // Camera basis
      let fx = tx - ex
      let fy = ty - ey
      let fz = tz - ez
      const fl = Math.sqrt(fx * fx + fy * fy + fz * fz)
      fx /= fl
      fy /= fl
      fz /= fl
      // right = normalize(cross(forward, worldUp))
      let rx = fz
      let rz = -fx
      const rl = Math.sqrt(rx * rx + rz * rz) || 1
      rx /= rl
      rz /= rl
      // up = cross(right, forward)
      const ux = -rz * fy
      const uy = rz * fx - rx * fz
      const uz = rx * fy

      bowlOut.fill(' ')
      noodleOut.fill(' ')
      ballOut.fill(' ')

      for (let cy = 0; cy < H; cy++) {
        for (let cx = 0; cx < W; cx++) {
          // Screen coords; x is halved because characters are ~half as wide as tall
          const px = ((2 * (cx + 0.5) - W) / H) * 0.5
          const py = (2 * (cy + 0.5) - H) / H
          // Ray direction through this "pixel"
          let dx = px * rx + py * ux + 1.6 * fx
          let dy = py * uy + 1.6 * fy
          let dz = px * rz + py * uz + 1.6 * fz
          const dl = Math.sqrt(dx * dx + dy * dy + dz * dz)
          dx /= dl
          dy /= dl
          dz /= dl

          // Sphere trace
          let t = 0
          let mat = -1
          for (let step = 0; step < MAX_STEPS; step++) {
            const hx = ex + dx * t
            const hy = ey + dy * t
            const hz = ez + dz * t
            sdScene(hx, hy, hz, res)
            if (res[0] < EPS) {
              mat = res[1]
              break
            }
            t += res[0] * STEP_SCALE
            if (t > MAX_DIST) break
          }
          if (mat < 0) continue

          // Surface normal via central differences
          const h = 0.002
          const hx = ex + dx * t
          const hy = ey + dy * t
          const hz = ez + dz * t
          sdScene(hx + h, hy, hz, res)
          const gx1 = res[0]
          sdScene(hx - h, hy, hz, res)
          let nx = gx1 - res[0]
          sdScene(hx, hy + h, hz, res)
          const gy1 = res[0]
          sdScene(hx, hy - h, hz, res)
          let ny = gy1 - res[0]
          sdScene(hx, hy, hz + h, res)
          const gz1 = res[0]
          sdScene(hx, hy, hz - h, res)
          let nz = gz1 - res[0]
          const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
          nx /= nl
          ny /= nl
          nz /= nl
          // Flip normals facing away from the camera (bowl interior)
          if (nx * dx + ny * dy + nz * dz > 0) {
            nx = -nx
            ny = -ny
            nz = -nz
          }

          // Diffuse + ambient
          const diff = Math.max(0, nx * Lx + ny * Ly + nz * Lz)
          const b = Math.min(1, 0.18 + 0.82 * diff)
          const ch = RAMP[Math.floor(b * (RAMP.length - 1))]

          const idx = cy * W + cx
          if (mat === BOWL) bowlOut[idx] = ch
          else if (mat === NOODLE) noodleOut[idx] = ch
          else ballOut[idx] = ch
        }
      }

      if (bowlRef.current) bowlRef.current.textContent = toText(bowlOut)
      if (noodleRef.current) noodleRef.current.textContent = toText(noodleOut)
      if (ballRef.current) ballRef.current.textContent = toText(ballOut)

      // Calculate spins based on rotY changes
      const delta = s.rotY - s.prevRotY
      s.totalRotation += Math.abs(delta)
      s.prevRotY = s.rotY
      const spins = Math.floor(s.totalRotation / (2 * Math.PI))
      if (s.spins !== spins) {
        s.spins = spins
        if (spinRef.current) {
          spinRef.current.textContent = spins
        }
      }

      raf = requestAnimationFrame(frame)
    }

    const toText = (out) => {
      const rows = []
      for (let r = 0; r < H; r++) rows.push(out.slice(r * W, (r + 1) * W).join(''))
      return rows.join('\n')
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const s = state.current
    s.dragging = true
    s.lastX = e.clientX
    s.lastY = e.clientY
  }

  const onPointerMove = (e) => {
    const s = state.current
    if (!s.dragging) return
    const dx = e.clientX - s.lastX
    const dy = e.clientY - s.lastY
    s.lastX = e.clientX
    s.lastY = e.clientY
    s.rotY += dx * 0.01
    s.rotX += dy * 0.01
    s.velY = dx * 0.01 // remembered for inertia on release
    s.velX = dy * 0.01
  }

  const onPointerUp = () => {
    state.current.dragging = false
  }

  return (
    <>
      <p className="spin-counter">
        Spins: <span ref={spinRef}>0</span>
      </p>
      <div
        className="ascii-scene"
        role="img"
        aria-label="Raymarched ASCII bowl of spaghetti with a meatball. Drag to orbit around it."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <pre ref={bowlRef} className="ascii-layer ascii-bowl" aria-hidden="true" />
        <pre
          ref={noodleRef}
          className="ascii-layer ascii-noodles"
          aria-hidden="true"
        />
        <pre
          ref={ballRef}
          className="ascii-layer ascii-meatball"
          aria-hidden="true"
        />
      </div>
    </>
  )
}
