'use client'

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Copy, FileText, Plus, Trophy } from 'lucide-react'
import { awards, certifications, channels, cvUrl, experience, profile, projects, stack } from '@/data/portfolio'
import { matchTech, normTech } from '@/lib/techMatch'

const EASE = [0.16, 1, 0.3, 1] as const
const email = channels.find((c) => c.label === 'Email')?.value ?? ''
const links = channels.filter((c) => c.href.startsWith('http'))
const core = stack.flatMap((g) => g.items).filter((i) => i.core).map((i) => i.name)
// El buscador cruza el stack con proyectos y con experiencia laboral.
const sources = [...projects, ...experience]

// Texto plano para pegar en notas o en un ATS.
const summary = [
  profile.name,
  profile.tagline,
  `${profile.degree}, ${profile.university} · Promedio ${profile.gpa} · Egreso previsto: ${profile.graduation}`,
  `${profile.location} · ${profile.availability} · ${profile.languages}`,
  `Stack principal: ${core.join(', ')}`,
  `Experiencia: ${experience.map((e) => `${e.role}, ${e.company} (${e.period})`).join('; ')}`,
  `Proyectos: ${projects.map((p) => `${p.title} (${p.year}, ${p.tech.join('/')})`).join('; ')}`,
  ...awards.map((a) => `Logro: ${a.title} (${a.project}) — ${a.by} ${a.year}`),
  `Email: ${email}`,
  ...links.filter((c) => c.label !== 'WhatsApp').map((c) => `${c.label}: ${c.href}`),
].join('\n')

const panel = 'rounded-[22px] border border-line bg-paper/80 p-5 backdrop-blur-xl md:p-7'
const h3 = 'flex justify-between gap-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-muted'

function TechChips({ tech, selected }: { tech: string[]; selected: Set<string> }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {tech.map((t) => (
        <span
          key={t}
          className={`rounded-full border px-2 py-0.5 text-xs ${
            selected.has(normTech(t)) ? 'border-ink bg-ink text-paper' : 'border-line text-muted'
          }`}
        >
          {t}
        </span>
      ))}
    </span>
  )
}

export default function Reclutador() {
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const match = useMemo(() => matchTech(sources, selected), [selected])
  const selectedKeys = useMemo(() => new Set(selected.map(normTech)), [selected])
  const hitProjects = match.matched.filter((i) => i < projects.length)
  const hitJobs = match.matched.filter((i) => i >= projects.length).map((i) => i - projects.length)

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  })

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]))

  const copy = async (text: string, ok: string, onFail: () => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setNote(ok)
    } catch {
      onFail()
    }
  }

  return (
    <div className="h-full overflow-y-auto px-5 pb-12 pt-20 md:px-8">
      <div className="mx-auto grid w-full max-w-shell items-start gap-4 md:grid-cols-12">
        {/* Cabecera: quién, qué ofrece y cómo contactarlo */}
        <motion.section {...rise(0.05)} className={`${panel} grid gap-6 md:col-span-12 md:grid-cols-12`}>
          <div className="md:col-span-7">
            <p className="eyebrow">Modo reclutador · lo esencial en una pantalla</p>
            <h2 className="display mt-3 text-[clamp(1.8rem,3.6vw,2.9rem)] uppercase">{profile.name}</h2>
            <p className="mt-3">{profile.tagline}</p>
            <p className="mt-3 max-w-2xl font-light leading-relaxed text-ink/90">{profile.bio}</p>
            {awards.map((a) => (
              <p key={a.title} className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm">
                <Trophy size={15} aria-hidden="true" />
                {a.title} ({a.project}) · {a.by} {a.year}
              </p>
            ))}
          </div>
          <div className="grid content-start gap-4 md:col-span-5">
            <span className="inline-flex items-center gap-2 justify-self-start rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_0_4px_rgb(var(--mint)/0.35)]" aria-hidden="true" />
              {profile.availability}
            </span>
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
              <dt className="text-muted">Formación</dt>
              <dd>
                {profile.degree}, {profile.university}
              </dd>
              <dt className="text-muted">Promedio</dt>
              <dd className="tabular-nums">{profile.gpa}</dd>
              <dt className="text-muted">Egreso</dt>
              <dd>{profile.graduation}</dd>
              <dt className="text-muted">Ubicación</dt>
              <dd>{profile.location}</dd>
              <dt className="text-muted">Idiomas</dt>
              <dd>{profile.languages}</dd>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5 md:col-span-12">
            <span className="mr-1 select-all text-sm">{email}</span>
            <button
              onClick={() => copy(email, 'Email copiado.', () => setNote('No se pudo copiar; selecciona el email.'))}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper transition-[opacity,transform] duration-300 hover:opacity-85 active:scale-[0.97]"
            >
              <Copy size={14} />
              Copiar email
            </button>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm transition-[background-color,color] duration-300 hover:bg-ink hover:text-paper"
            >
              <FileText size={14} />
              Ver CV
            </a>
            {links.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm transition-colors duration-300 hover:border-ink"
              >
                {c.label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ))}
            <button
              onClick={() =>
                copy(summary, 'Resumen copiado: pégalo en tus notas o en el ATS.', () => {
                  setShowSummary(true)
                  setNote('No se pudo copiar; selecciona el resumen de abajo.')
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition-colors duration-300 hover:border-ink"
            >
              <Copy size={14} />
              Copiar resumen
            </button>
          </div>
          <p className="-mt-3 min-h-[1.25rem] text-sm text-muted md:col-span-12" aria-live="polite">
            {note}
          </p>
          {showSummary && (
            <pre className="select-all whitespace-pre-wrap break-words rounded-2xl border border-dashed border-line p-4 font-sans text-sm leading-relaxed md:col-span-12">
              {summary}
            </pre>
          )}
        </motion.section>

        {/* Buscador de tecnologías + certificaciones */}
        <motion.section {...rise(0.12)} className={`${panel} grid gap-5 md:col-span-5`}>
          <h3 className={h3}>¿Qué tecnología buscas?</h3>
          <p className="-mt-2 text-sm text-muted">
            Elige una o varias: se resaltan la experiencia y los proyectos que las usan. El punto marca el stack
            principal.
          </p>
          <div className="grid gap-4">
            {stack.map((group) => (
              <div key={group.area} className="grid gap-2">
                <span className="text-xs text-muted">{group.area}</span>
                <ul className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => toggle(item.name)}
                        aria-pressed={selected.includes(item.name)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[0.8rem] transition-colors duration-200 hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
                      >
                        {item.core && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="min-h-[3rem] rounded-2xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed" aria-live="polite">
            {selected.length === 0 ? (
              <>
                Sin filtro: se muestran {experience.length} experiencias y {projects.length} proyectos.
              </>
            ) : (
              <>
                {match.used.length > 0 && (
                  <span>
                    <b className="font-medium">{match.used.join(', ')}</b> — Experiencia:{' '}
                    {hitJobs.map((i) => experience[i].company).join(', ') || 'ninguna'} · Proyectos:{' '}
                    {hitProjects.map((i) => projects[i].title).join(', ') || 'ninguno'}.{' '}
                  </span>
                )}
                {match.unused.length > 0 && (
                  <span>
                    {match.unused.join(', ')} {match.unused.length === 1 ? 'está' : 'están'} en su stack; aún no hay
                    un proyecto ni un puesto listado aquí que {match.unused.length === 1 ? 'la use' : 'las use'}.{' '}
                  </span>
                )}
                <button onClick={() => setSelected([])} className="text-muted underline underline-offset-4 hover:text-ink">
                  Quitar filtro
                </button>
              </>
            )}
          </div>

          <h3 className={`${h3} mt-2`}>
            Certificaciones <span className="tabular-nums">{certifications.length}</span>
          </h3>
          <ul className="text-sm">
            {certifications.map((c) => (
              <li key={c.title} className="grid grid-cols-[4.5rem_1fr_auto] gap-3 border-t border-line py-2">
                <span className="tabular-nums text-muted">{c.year}</span>
                <span>{c.title}</span>
                <span className="text-muted">{c.by}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <div className="grid gap-4 md:col-span-7">
          {/* Experiencia laboral */}
          <motion.section {...rise(0.16)} className={`${panel} grid gap-4`}>
            <h3 className={h3}>
              Experiencia
              <span className="tabular-nums">
                {selected.length ? hitJobs.length : experience.length} de {experience.length}
              </span>
            </h3>
            <ul>
              {experience.map((e, i) => (
                <li
                  key={e.company + e.period}
                  className={`grid gap-2 border-t border-line py-4 transition-opacity duration-300 last:border-b md:grid-cols-[9.5rem_1fr] ${
                    selected.length && !hitJobs.includes(i) ? 'opacity-70' : ''
                  }`}
                >
                  <span className="text-sm tabular-nums text-muted">{e.period}</span>
                  <div className="grid gap-2">
                    <p>
                      <span className="font-medium">{e.role}</span>
                      <span className="text-muted"> · {e.company}</span>
                    </p>
                    <ul className="grid gap-1 text-sm font-light text-ink/90">
                      {e.points.map((pt) => (
                        <li key={pt}>
                          <span className="text-muted">+ </span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <TechChips tech={e.tech} selected={selectedKeys} />
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Proyectos desplegables */}
          <motion.section {...rise(0.2)} className={`${panel} grid gap-4`}>
            <h3 className={h3}>
              Proyectos
              <span className="tabular-nums">
                {selected.length ? hitProjects.length : projects.length} de {projects.length}
              </span>
            </h3>
            <div>
              {projects.map((p, i) => {
                const hit = !selected.length || hitProjects.includes(i)
                return (
                  <details
                    key={p.title}
                    className={`group border-t border-line transition-opacity duration-300 last:border-b ${hit ? '' : 'opacity-70'}`}
                  >
                    <summary className="grid cursor-pointer list-none grid-cols-[3rem_1fr_auto] items-baseline gap-x-3 gap-y-2 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="text-sm tabular-nums text-muted">{p.year}</span>
                      <span>
                        <span className="display block text-lg uppercase">{p.title}</span>
                        <span className="text-sm text-muted">{p.category}</span>
                        {p.award && (
                          <span className="mt-1 flex items-center gap-1.5 text-sm">
                            <Trophy size={13} aria-hidden="true" />
                            {p.award}
                          </span>
                        )}
                      </span>
                      <Plus size={18} aria-hidden="true" className="text-muted transition-transform duration-300 group-open:rotate-45" />
                      <span className="col-start-2 col-end-4">
                        <TechChips tech={p.tech} selected={selectedKeys} />
                      </span>
                    </summary>
                    <div className="grid gap-3 pb-5 md:pl-[3.75rem]">
                      <p className="max-w-2xl font-light leading-relaxed text-ink/90">{p.challenge}</p>
                      <ul className="grid gap-1 text-sm">
                        {p.highlights.map((h) => (
                          <li key={h}>
                            <span className="text-muted">+ </span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )
              })}
            </div>
            <p className="text-sm text-muted">Abre un proyecto para ver el reto y lo que resolvió.</p>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
