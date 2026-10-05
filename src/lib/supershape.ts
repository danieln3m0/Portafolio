// Avatar de "Tu forma": un cuerpo hecho con dos superfórmulas de Gielis (una
// por ángulo) y una carita (ojos, boca, mejillas y un adorno), todo sembrado
// por el nombre del visitante. Mismo nombre → mismo avatar.
// Funciones puras: no dependen de Three.js ni del DOM.

export type Superformula = { m: number; n1: number; n2: number; n3: number }
export const MOUTHS = ['smile', 'open', 'cat'] as const
export const TOPPERS = ['none', 'antenna', 'sprout'] as const
export type Mouth = (typeof MOUTHS)[number]
export type Topper = (typeof TOPPERS)[number]
// Medidas relativas al cuerpo normalizado (dimensión mayor = 2).
export type Face = { eyeSize: number; eyeGap: number; eyeY: number; mouth: Mouth; blush: boolean; topper: Topper }
// stretch: estiramiento vertical del cuerpo (más bajito y ancho < 1 < más alto).
export type SupershapeParams = { a: Superformula; b: Superformula; pal: number; theme: number; face: Face; stretch: number }

export const DEFAULT_NAME = 'Visitante'
export const MAX_NAME = 18

export function cleanName(raw: string): string {
  return (raw.trim() || DEFAULT_NAME).slice(0, MAX_NAME)
}

// Hash FNV-1a (sin distinguir mayúsculas) como semilla.
export function seedFrom(str: string): number {
  let h = 2166136261
  for (const ch of str.toLowerCase()) {
    h ^= ch.codePointAt(0) ?? 0
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// PRNG determinista (mulberry32) en [0, 1).
export function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function paramsFor(name: string, palettes = 5, themes = 4): SupershapeParams {
  const r = mulberry32(seedFrom(name))
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]
  const f = (lo: number, hi: number) => +(lo + r() * (hi - lo)).toFixed(2)
  // Rangos intermedios: cuerpos blandos con algo de lóbulos y bultos, sin llegar a púas
  // (radio mínimo/máximo ≈ 0.89 de mediana; 1 sería una esfera perfecta).
  return {
    a: { m: pick([2, 3, 4, 5, 6, 7]), n1: f(0.9, 2.6), n2: f(0.9, 2), n3: f(0.9, 2) },
    b: { m: pick([2, 3, 4, 5]), n1: f(1.2, 3.5), n2: f(1, 2), n3: f(1, 2) },
    pal: Math.floor(r() * palettes),
    theme: Math.floor(r() * themes),
    face: {
      eyeSize: f(0.12, 0.18),
      eyeGap: f(0.26, 0.4),
      eyeY: f(0.02, 0.22),
      mouth: pick(MOUTHS),
      blush: r() < 0.7,
      topper: pick(TOPPERS),
    },
    stretch: f(0.85, 1.2),
  }
}

export function superformula(p: Superformula, ang: number): number {
  const t1 = Math.abs(Math.cos((p.m * ang) / 4)) ** p.n2
  const t2 = Math.abs(Math.sin((p.m * ang) / 4)) ** p.n3
  return Math.pow(t1 + t2, -1 / p.n1)
}

export type SupershapeData = {
  positions: Float32Array // xyz por vértice, centrado y con dimensión máxima 2
  indices: Uint32Array
  heights: Float32Array // 0..1 de polo a polo (para el degradado vertical)
  lobes: Float32Array // -1..1 según el lóbulo (vetas por pétalo)
}

// Malla UV de la supershape: θ ∈ [-π, π] con r1 = sf(a), φ ∈ [-π/2, π/2] con r2 = sf(b).
export function buildSupershapeData(P: SupershapeParams, U = 200, V = 100): SupershapeData {
  const count = (U + 1) * (V + 1)
  const positions = new Float32Array(count * 3)
  const heights = new Float32Array(count)
  const lobes = new Float32Array(count)
  let k = 0
  for (let j = 0; j <= V; j++) {
    const phi = -Math.PI / 2 + (Math.PI * j) / V
    const r2 = superformula(P.b, phi)
    for (let i = 0; i <= U; i++) {
      const th = -Math.PI + (2 * Math.PI * i) / U
      const r1 = superformula(P.a, th)
      positions[k * 3] = r1 * Math.cos(th) * r2 * Math.cos(phi)
      positions[k * 3 + 1] = r2 * Math.sin(phi) * P.stretch
      positions[k * 3 + 2] = r1 * Math.sin(th) * r2 * Math.cos(phi)
      heights[k] = j / V
      lobes[k] = Math.sin(th * P.a.m * 0.5)
      k++
    }
  }

  // Centra y escala para que la dimensión mayor mida 2 (cabe en [-1, 1]).
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let v = 0; v < count; v++) {
    for (let c = 0; c < 3; c++) {
      const x = positions[v * 3 + c]
      if (x < min[c]) min[c] = x
      if (x > max[c]) max[c] = x
    }
  }
  const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) || 1
  const s = 2 / size
  for (let v = 0; v < count; v++) {
    for (let c = 0; c < 3; c++) {
      positions[v * 3 + c] = (positions[v * 3 + c] - (min[c] + max[c]) / 2) * s
    }
  }

  const indices = new Uint32Array(U * V * 6)
  let n = 0
  for (let j = 0; j < V; j++) {
    for (let i = 0; i < U; i++) {
      const a = j * (U + 1) + i
      const b = a + U + 1
      indices[n++] = a
      indices[n++] = b
      indices[n++] = a + 1
      indices[n++] = b
      indices[n++] = b + 1
      indices[n++] = a + 1
    }
  }
  return { positions, indices, heights, lobes }
}

// Texto legible de los parámetros (pantalla y tarjeta).
export function describeParams({ a, b }: SupershapeParams): string {
  const n = (x: number) => x.toFixed(2)
  return `m ${a.m}×${b.m} · n₁ ${n(a.n1)}/${n(b.n1)} · n₂ ${n(a.n2)}/${n(b.n2)} · n₃ ${n(a.n3)}/${n(b.n3)}`
}
