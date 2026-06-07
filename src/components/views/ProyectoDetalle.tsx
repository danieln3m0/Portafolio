'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { projects, imgUrl } from '@/data/portfolio'

export default function ProyectoDetalle({
  index,
  onBack,
  onOpen,
}: {
  index: number
  onBack: () => void
  onOpen: (i: number) => void
}) {
  const p = projects[index]
  const next = (index + 1) % projects.length

  return (
    <div className="h-full overflow-y-auto px-5 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-4xl">
        <button onClick={onBack} className="cta text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} />
          Volver a proyectos
        </button>

        <Reveal className="mt-8">
          <p className="text-sm text-muted">
            {p.category} · {p.year}
          </p>
          <h1 className="display mt-3 text-[clamp(2.2rem,6vw,4.5rem)] uppercase">{p.title}</h1>
          <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-ink/90">{p.challenge}</p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="card aspect-[16/9]">
            <img src={imgUrl(p.seed, 1600, 900)} alt={`Pantalla principal de ${p.title}`} />
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <h2 className="text-sm text-muted">El proyecto</h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-ink/90">{p.overview}</p>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-5">
            <h2 className="text-sm text-muted">Lo que resolví</h2>
            <ul className="mt-4 space-y-3">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-3 border-t border-line pt-3 text-ink/90">
                  <span className="text-muted">+</span>
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="mt-14 grid gap-5 sm:grid-cols-2">
          {p.gallery.slice(1).map((g, i) => (
            <div key={g} className="card aspect-[4/3]">
              <img src={imgUrl(g, 1000, 750)} alt={`Detalle ${i + 1} de ${p.title}`} loading="lazy" />
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-12">
          <h2 className="text-sm text-muted">Tecnologías</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {p.tech.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1 text-sm text-muted">{t}</li>
            ))}
          </ul>
        </Reveal>

        <button
          onClick={() => onOpen(next)}
          className="group mt-16 flex w-full items-center justify-between border-t border-line pt-6 text-left"
        >
          <span className="text-sm text-muted">Siguiente proyecto</span>
          <span className="cta display text-xl uppercase md:text-2xl">
            {projects[next].title}
            <ArrowRight size={20} />
          </span>
        </button>
      </div>
    </div>
  )
}
