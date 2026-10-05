// Buscador de tecnologías del modo reclutador: cruza el stack con las
// tecnologías de cada proyecto. Funciones puras.

// "Vue.js" y "Vue" (o "Next.js" en ambos lados) cuentan como la misma tecnología.
export function normTech(name: string): string {
  return name.trim().toLowerCase().replace(/\.js$/, '')
}

export type TechMatch = {
  matched: number[] // índices de proyectos que usan alguna tecnología elegida
  used: string[] // tecnologías elegidas que aparecen en algún proyecto
  unused: string[] // tecnologías elegidas sin proyecto publicado
}

// Sin selección, todos los proyectos cuentan como coincidencia.
export function matchTech(projects: { tech: string[] }[], selected: string[]): TechMatch {
  const keys = new Set(selected.map(normTech))
  const techOf = projects.map((p) => p.tech.map(normTech))
  if (keys.size === 0) return { matched: projects.map((_, i) => i), used: [], unused: [] }
  const matched = techOf.flatMap((t, i) => (t.some((k) => keys.has(k)) ? [i] : []))
  const used: string[] = []
  const unused: string[] = []
  for (const name of selected) {
    const k = normTech(name)
    ;(techOf.some((t) => t.includes(k)) ? used : unused).push(name)
  }
  return { matched, used, unused }
}
