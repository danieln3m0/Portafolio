import { describe, expect, it } from 'vitest'
import { experience, projects, stack, type ProjectModel } from '@/data/portfolio'
import { matchTech, normTech } from './techMatch'

describe('normTech', () => {
  it('recorta y pasa a minúsculas', () => expect(normTech('  React ')).toBe('react'))
  it('quita .js final', () => {
    expect(normTech('Vue.js')).toBe('vue')
    expect(normTech('Next.JS')).toBe('next')
  })
  it('no quita .js en medio ni nombres que solo terminan en js', () => {
    expect(normTech('node.js.x')).toBe('node.js.x')
    expect(normTech('Nodejs')).toBe('nodejs')
  })
  it('cadena vacía', () => expect(normTech('')).toBe(''))
})

const idx = (title: string) => {
  const i = projects.findIndex((p) => p.title === title)
  if (i < 0) throw new Error(`Proyecto no encontrado: ${title}`)
  return i
}
// Referencia independiente: índices de proyectos cuya tech normalizada contiene alguna clave.
const expected = (items: { tech: string[] }[], names: string[]) => {
  const keys = names.map(normTech)
  return items.flatMap((p, i) => (p.tech.some((t) => keys.includes(normTech(t))) ? [i] : []))
}

describe('matchTech con datos reales', () => {
  const all = projects.map((_, i) => i)

  it('selección vacía → todos los proyectos', () => {
    expect(matchTech(projects, [])).toEqual({ matched: all, used: [], unused: [] })
  })
  it('Vue (stack) coincide con Vue.js (Transportify)', () => {
    const names = stack.flatMap((g) => g.items.map((i) => i.name))
    expect(names).toContain('Vue')
    const r = matchTech(projects, ['Vue'])
    expect(r.matched).toEqual([idx('Transportify')])
    expect(r.used).toEqual(['Vue'])
    expect(r.unused).toEqual([])
  })
  it('Next coincide con Next.js (Crypto & Product Dashboard)', () => {
    expect(matchTech(projects, ['Next']).matched).toEqual([idx('Crypto & Product Dashboard')])
  })
  it('React solo en 4EverBodas', () => {
    expect(matchTech(projects, ['React']).matched).toEqual([idx('4EverBodas')])
  })
  it('Python coincide con Ayni', () => {
    const r = matchTech(projects, ['Python'])
    expect(r.matched).toEqual([idx('Ayni')])
    expect(r.used).toEqual(['Python'])
  })
  it('tecnología del stack sin proyecto queda en unused', () => {
    for (const name of ['Rust', 'PostgreSQL']) {
      expect(stack.some((g) => g.items.some((i) => i.name === name))).toBe(true)
      expect(projects.some((p) => p.tech.map(normTech).includes(normTech(name)))).toBe(false)
      expect(matchTech(projects, [name])).toEqual({ matched: [], used: [], unused: [name] })
    }
  })
  it('nombre sintético inexistente queda en unused', () => {
    expect(matchTech(projects, ['__tech-inexistente__'])).toEqual({
      matched: [],
      used: [],
      unused: ['__tech-inexistente__'],
    })
  })
  it('selección mixta separa used/unused conservando el nombre original', () => {
    const r = matchTech(projects, ['__nada__', 'React', 'vue.JS'])
    expect(r.matched).toEqual([idx('4EverBodas'), idx('Transportify')].sort((x, y) => x - y))
    expect(r.used).toEqual(['React', 'vue.JS'])
    expect(r.unused).toEqual(['__nada__'])
  })
  it('semántica de unión: Docker coincide con todos los proyectos que lo usan', () => {
    const docker = expected(projects, ['Docker'])
    expect(docker).toEqual(expect.arrayContaining([idx('Ayni'), idx("D'Taquito"), idx('Transportify')]))
    expect(matchTech(projects, ['Docker']).matched).toEqual(docker)
    expect(matchTech(projects, ['Docker', 'React']).matched).toEqual(expected(projects, ['Docker', 'React']))
  })
  it('MongoDB coincide con 4EverBodas y Transportify', () => {
    expect(matchTech(projects, ['MongoDB']).matched).toEqual(
      [idx('4EverBodas'), idx('Transportify')].sort((x, y) => x - y),
    )
  })
  it('índices ordenados y sin duplicados aunque se repita la selección', () => {
    const r = matchTech(projects, ['Docker', 'Node', 'Docker'])
    expect(r.matched).toEqual(expected(projects, ['Docker', 'Node']))
    expect(r.matched).toEqual([...new Set(r.matched)].sort((x, y) => x - y))
  })
})

describe('matchTech sobre [...projects, ...experience]', () => {
  const items = [...projects, ...experience]
  const expIdx = (company: string) => {
    const i = experience.findIndex((e) => e.company === company)
    if (i < 0) throw new Error(`Experiencia no encontrada: ${company}`)
    return projects.length + i
  }

  it('selección vacía → todos los índices combinados', () => {
    expect(matchTech(items, []).matched).toEqual(items.map((_, i) => i))
  })
  it('.NET solo coincide con la experiencia de EFC', () => {
    const r = matchTech(items, ['.NET'])
    expect(r.matched).toEqual([expIdx('EFC')])
    expect(r.matched.every((i) => i >= projects.length)).toBe(true)
    expect(r.used).toEqual(['.NET'])
  })
  it('Next.js coincide con Crypto y con A&S', () => {
    expect(matchTech(items, ['Next.js']).matched).toEqual([
      idx('Crypto & Product Dashboard'),
      expIdx('A&S Soluciones Generales'),
    ])
  })
  it('un proyecto y una experiencia distinguibles por índice', () => {
    const r = matchTech(items, ['Next', 'Flutter'])
    expect(r.matched).toEqual([idx('Crypto & Product Dashboard'), expIdx('iTLand Perú'), expIdx('A&S Soluciones Generales')])
    expect(r.matched.filter((i) => i < projects.length)).toEqual([idx('Crypto & Product Dashboard')])
  })
  it('SQL Server de la experiencia cuenta como used', () => {
    expect(matchTech(items, ['SQL Server', '__nada__'])).toEqual({
      matched: [expIdx('iTLand Perú')],
      used: ['SQL Server'],
      unused: ['__nada__'],
    })
  })
})

describe('integridad de datos del portafolio', () => {
  const MODELS: ProjectModel[] = ['mic', 'leaf', 'truck', 'ball', 'rings', 'chart']

  it('cada proyecto usa un model válido', () => {
    for (const p of projects) expect(MODELS).toContain(p.model)
  })
  it('títulos de proyecto únicos y no vacíos', () => {
    const titles = projects.map((p) => p.title)
    for (const t of titles) expect(t.trim()).not.toBe('')
    expect(new Set(titles).size).toBe(titles.length)
  })
  it('proyectos y experiencia tienen tech no vacío', () => {
    for (const x of [...projects, ...experience]) expect(x.tech.length).toBeGreaterThan(0)
  })
  it('cada item del stack tiene nombre no vacío y sin duplicados (normTech)', () => {
    const names = stack.flatMap((g) => g.items.map((i) => i.name))
    for (const n of names) expect(normTech(n)).not.toBe('')
    const norm = names.map(normTech)
    const dup = norm.filter((n, i) => norm.indexOf(n) !== i)
    expect(dup).toEqual([])
  })
})

describe('matchTech casos límite', () => {
  it('sin proyectos', () => {
    expect(matchTech([], [])).toEqual({ matched: [], used: [], unused: [] })
    expect(matchTech([], ['React'])).toEqual({ matched: [], used: [], unused: ['React'] })
  })
  it('proyecto sin tecnologías', () => {
    expect(matchTech([{ tech: [] }], ['React'])).toEqual({ matched: [], used: [], unused: ['React'] })
  })
  it('no muta las entradas', () => {
    const sel = ['React']
    matchTech(projects, sel)
    expect(sel).toEqual(['React'])
  })
})
