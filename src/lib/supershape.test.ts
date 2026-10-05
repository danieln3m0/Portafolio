import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NAME,
  MAX_NAME,
  MOUTHS,
  TOPPERS,
  buildSupershapeData,
  cleanName,
  describeParams,
  mulberry32,
  paramsFor,
  seedFrom,
  superformula,
} from './supershape'

const NAMES = Array.from({ length: 300 }, (_, i) => `visitante-${i}-${(i * 7919).toString(36)}`)

describe('cleanName', () => {
  it('recorta espacios', () => expect(cleanName('  Ana  ')).toBe('Ana'))
  it('vacío o solo espacios → Visitante', () => {
    expect(cleanName('')).toBe(DEFAULT_NAME)
    expect(cleanName('   \t ')).toBe('Visitante')
  })
  it('trunca a MAX_NAME', () => {
    expect(MAX_NAME).toBe(18)
    expect(cleanName('x'.repeat(40))).toHaveLength(MAX_NAME)
    expect(cleanName('x'.repeat(MAX_NAME))).toHaveLength(MAX_NAME)
  })
})

describe('seedFrom / mulberry32', () => {
  it('seedFrom es uint32, determinista y no distingue mayúsculas', () => {
    const s = seedFrom('Daniel')
    expect(Number.isInteger(s)).toBe(true)
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThan(2 ** 32)
    expect(seedFrom('Daniel')).toBe(s)
    expect(seedFrom('DANIEL')).toBe(s)
    expect(seedFrom('daniel2')).not.toBe(s)
  })
  it('seedFrom("") es el offset basis FNV-1a', () => expect(seedFrom('')).toBe(2166136261))
  it('seedFrom("a") coincide con el vector FNV-1a conocido', () => expect(seedFrom('a')).toBe(0xe40c292c))
  it('mulberry32 devuelve valores en [0,1) y es determinista', () => {
    const r1 = mulberry32(123)
    const r2 = mulberry32(123)
    for (let i = 0; i < 5000; i++) {
      const v = r1()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
      expect(r2()).toBe(v)
    }
  })
  it('semillas distintas dan secuencias distintas', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)())
  })
})

describe('paramsFor', () => {
  it('es determinista y no distingue mayúsculas', () => {
    expect(paramsFor('Daniel')).toEqual(paramsFor('Daniel'))
    expect(paramsFor('Daniel')).toEqual(paramsFor('dAnIeL'))
  })
  it('nombres distintos suelen dar parámetros distintos', () => {
    const uniq = new Set(NAMES.map((n) => JSON.stringify(paramsFor(n))))
    expect(uniq.size).toBeGreaterThan(NAMES.length * 0.95)
  })
  it('respeta los rangos y el redondeo a 2 decimales', () => {
    const in2 = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9
    for (const n of NAMES) {
      const p = paramsFor(n)
      expect(Number.isInteger(p.a.m) && p.a.m >= 2 && p.a.m <= 7).toBe(true)
      expect(Number.isInteger(p.b.m) && p.b.m >= 2 && p.b.m <= 5).toBe(true)
      expect(p.a.n1).toBeGreaterThanOrEqual(0.9)
      expect(p.a.n1).toBeLessThanOrEqual(2.6)
      expect(p.b.n1).toBeGreaterThanOrEqual(1.2)
      expect(p.b.n1).toBeLessThanOrEqual(3.5)
      for (const v of [p.a.n2, p.a.n3]) {
        expect(v).toBeGreaterThanOrEqual(0.9)
        expect(v).toBeLessThanOrEqual(2)
        expect(in2(v)).toBe(true)
      }
      for (const v of [p.b.n2, p.b.n3]) {
        expect(v).toBeGreaterThanOrEqual(1)
        expect(v).toBeLessThanOrEqual(2)
        expect(in2(v)).toBe(true)
      }
      expect(p.stretch).toBeGreaterThanOrEqual(0.85)
      expect(p.stretch).toBeLessThanOrEqual(1.2)
      expect(in2(p.stretch)).toBe(true)
      const fc = p.face
      expect(fc.eyeSize).toBeGreaterThanOrEqual(0.12)
      expect(fc.eyeSize).toBeLessThanOrEqual(0.18)
      expect(fc.eyeGap).toBeGreaterThanOrEqual(0.26)
      expect(fc.eyeGap).toBeLessThanOrEqual(0.4)
      expect(fc.eyeY).toBeGreaterThanOrEqual(0.02)
      expect(fc.eyeY).toBeLessThanOrEqual(0.22)
      expect(in2(fc.eyeSize) && in2(fc.eyeGap) && in2(fc.eyeY)).toBe(true)
      expect(MOUTHS).toContain(fc.mouth)
      expect(TOPPERS).toContain(fc.topper)
      expect(typeof fc.blush).toBe('boolean')
      expect(in2(p.a.n1) && in2(p.b.n1)).toBe(true)
      expect(Number.isInteger(p.pal) && p.pal >= 0 && p.pal < 5).toBe(true)
      expect(Number.isInteger(p.theme) && p.theme >= 0 && p.theme < 4).toBe(true)
    }
  })
  it('respeta palettes/themes personalizados', () => {
    for (const n of NAMES) {
      const p = paramsFor(n, 2, 1)
      expect(p.pal).toBeLessThan(2)
      expect(p.theme).toBe(0)
    }
  })
  it('cubre todos los valores de m, pal y theme', () => {
    const am = new Set<number>()
    const bm = new Set<number>()
    const pal = new Set<number>()
    const theme = new Set<number>()
    for (const n of NAMES) {
      const p = paramsFor(n)
      am.add(p.a.m)
      bm.add(p.b.m)
      pal.add(p.pal)
      theme.add(p.theme)
    }
    expect(am.size).toBe(6)
    expect(bm.size).toBe(4)
    expect(pal.size).toBe(5)
    expect(theme.size).toBe(4)
  })
})

describe('paramsFor.stretch', () => {
  it('determinista e insensible a mayúsculas', () => {
    expect(paramsFor('Daniel').stretch).toBe(paramsFor('Daniel').stretch)
    expect(paramsFor('Daniel').stretch).toBe(paramsFor('DANIEL').stretch)
  })
  it('varía entre nombres y cubre casi todo el rango', () => {
    const vals = NAMES.map((n) => paramsFor(n).stretch)
    expect(new Set(vals).size).toBeGreaterThan(20)
    expect(Math.min(...vals)).toBeLessThan(0.9)
    expect(Math.max(...vals)).toBeGreaterThan(1.15)
  })
})

describe('paramsFor.face', () => {
  it('misma cara para el mismo nombre, insensible a mayúsculas', () => {
    expect(paramsFor('Daniel').face).toEqual(paramsFor('Daniel').face)
    expect(paramsFor('Daniel').face).toEqual(paramsFor('DANIEL').face)
  })
  it('con muchos nombres aparecen todas las bocas, adornos y ambos valores de blush', () => {
    const mouths = new Set<string>()
    const toppers = new Set<string>()
    const blush = new Set<boolean>()
    for (const n of NAMES) {
      const { face } = paramsFor(n)
      mouths.add(face.mouth)
      toppers.add(face.topper)
      blush.add(face.blush)
    }
    expect([...mouths].sort()).toEqual([...MOUTHS].sort())
    expect([...toppers].sort()).toEqual([...TOPPERS].sort())
    expect([...blush].sort()).toEqual([false, true])
  })
  it('las caras varían entre nombres', () => {
    const uniq = new Set(NAMES.map((n) => JSON.stringify(paramsFor(n).face)))
    expect(uniq.size).toBeGreaterThan(NAMES.length * 0.9)
  })
})

describe('superformula', () => {
  it('con m=0, n=2 devuelve 1 (círculo)', () => {
    expect(superformula({ m: 0, n1: 2, n2: 2, n3: 2 }, 1.234)).toBeCloseTo(1, 10)
  })
  it('es finita y positiva para parámetros de paramsFor', () => {
    for (const n of NAMES.slice(0, 50)) {
      const p = paramsFor(n)
      for (let k = 0; k <= 64; k++) {
        for (const sf of [p.a, p.b]) {
          const v = superformula(sf, -Math.PI + (2 * Math.PI * k) / 64)
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('buildSupershapeData', () => {
  it('tamaños para U/V pequeños', () => {
    const U = 8
    const V = 4
    const d = buildSupershapeData(paramsFor('Daniel'), U, V)
    const count = (U + 1) * (V + 1)
    expect(d.positions).toBeInstanceOf(Float32Array)
    expect(d.indices).toBeInstanceOf(Uint32Array)
    expect(d.positions.length).toBe(count * 3)
    expect(d.heights.length).toBe(count)
    expect(d.lobes.length).toBe(count)
    expect(d.indices.length).toBe(U * V * 6)
  })
  it('valores por defecto U=200, V=100', () => {
    const d = buildSupershapeData(paramsFor('x'))
    expect(d.positions.length).toBe(201 * 101 * 3)
    expect(d.indices.length).toBe(200 * 100 * 6)
  })
  it('posiciones finitas, |coord| ≤ 1, dimensión mayor ≈ 2 y centrado', () => {
    for (const n of NAMES.slice(0, 60)) {
      const d = buildSupershapeData(paramsFor(n), 40, 20)
      const min = [Infinity, Infinity, Infinity]
      const max = [-Infinity, -Infinity, -Infinity]
      for (let i = 0; i < d.positions.length; i++) {
        const x = d.positions[i]
        expect(Number.isFinite(x)).toBe(true)
        expect(Math.abs(x)).toBeLessThanOrEqual(1 + 1e-5)
        const c = i % 3
        min[c] = Math.min(min[c], x)
        max[c] = Math.max(max[c], x)
      }
      const dims = [0, 1, 2].map((c) => max[c] - min[c])
      expect(Math.max(...dims)).toBeCloseTo(2, 4)
      for (let c = 0; c < 3; c++) expect((max[c] + min[c]) / 2).toBeCloseTo(0, 4)
    }
  })
  it('índices dentro del número de vértices y triángulos con 3 índices distintos', () => {
    const U = 12
    const V = 6
    const d = buildSupershapeData(paramsFor('Ana'), U, V)
    const count = (U + 1) * (V + 1)
    for (const i of d.indices) expect(i).toBeLessThan(count)
    for (let t = 0; t < d.indices.length; t += 3) {
      const tri = new Set([d.indices[t], d.indices[t + 1], d.indices[t + 2]])
      expect(tri.size).toBe(3)
    }
  })
  it('heights ∈ [0,1] de polo a polo y lobes ∈ [-1,1]', () => {
    const d = buildSupershapeData(paramsFor('Ana'), 10, 5)
    for (const h of d.heights) {
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(1)
    }
    expect(d.heights[0]).toBe(0)
    expect(d.heights[d.heights.length - 1]).toBe(1)
    for (const l of d.lobes) {
      expect(l).toBeGreaterThanOrEqual(-1)
      expect(l).toBeLessThanOrEqual(1)
    }
  })
  it('stretch cambia la relación alto/ancho del bbox en el sentido esperado', () => {
    const ratio = (stretch: number) => {
      const d = buildSupershapeData({ ...paramsFor('Daniel'), stretch }, 40, 20)
      const min = [Infinity, Infinity, Infinity]
      const max = [-Infinity, -Infinity, -Infinity]
      for (let i = 0; i < d.positions.length; i++) {
        const c = i % 3
        min[c] = Math.min(min[c], d.positions[i])
        max[c] = Math.max(max[c], d.positions[i])
      }
      const dims = [0, 1, 2].map((c) => max[c] - min[c])
      expect(Math.max(...dims)).toBeCloseTo(2, 4)
      return dims[1] / Math.max(dims[0], dims[2])
    }
    const low = ratio(0.85)
    const high = ratio(1.2)
    expect(high).toBeGreaterThan(low)
    // La razón escala linealmente con stretch (x y z no cambian).
    expect(high / low).toBeCloseTo(1.2 / 0.85, 2)
  })
  it('es determinista', () => {
    const a = buildSupershapeData(paramsFor('Z'), 10, 5)
    const b = buildSupershapeData(paramsFor('Z'), 10, 5)
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions))
  })
})

describe('describeParams', () => {
  it('formatea con 2 decimales', () => {
    const s = describeParams({
      a: { m: 5, n1: 1, n2: 0.5, n3: 1.25 },
      b: { m: 3, n1: 0.6, n2: 1.9, n3: 0.4 },
      pal: 0,
      theme: 0,
      face: { eyeSize: 0.15, eyeGap: 0.3, eyeY: 0.1, mouth: 'smile', blush: true, topper: 'none' },
      stretch: 1,
    })
    expect(s).toBe('m 5×3 · n₁ 1.00/0.60 · n₂ 0.50/1.90 · n₃ 1.25/0.40')
  })
})
