---
name: auditar-portafolio
description: Audita y mejora el portafolio personal (Next.js 15 + React + TypeScript + Tailwind + Three.js + Framer Motion). Úsala cuando el usuario pida "mejorar el portafolio", "auditar el portafolio", "revisar diseño/UX", "limpiar el código", "mejorar SEO" o "armonizar visualmente" este proyecto.
---

# Auditar y mejorar el portafolio

Skill para revisar y elevar la calidad del portafolio personal de Francis Daniel Mamani Silva.
Trabaja en cuatro ejes: **Diseño/UX**, **Limpieza de código**, **SEO/Rendimiento** y **Contenido/Links**.

## Stack del proyecto

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Estilos**: Tailwind CSS + `src/app/globals.css`
- **Animación**: Framer Motion
- **3D**: Three.js (`src/components/ThreeBackground.tsx`, `src/hooks/useThreeScene.ts`)
- **Iconos**: lucide-react
- **Tema visual**: "Fire in the Sky" — paleta fuego (naranja/rojo/ámbar) sobre fondo oscuro
- **Deploy**: GitHub Pages / Netlify (build estático)

Archivos clave:
- `src/app/page.tsx` — todas las secciones (Hero, About, Experience, Education, Skills, Projects, Certifications, Contact)
- `src/app/layout.tsx` — metadata/SEO
- `src/app/globals.css` — sistema de estilos y animaciones
- `tailwind.config.js`, `next.config.js`

## Cómo auditar (orden recomendado)

1. **Lee el estado actual** antes de tocar nada: `page.tsx`, `globals.css`, `layout.tsx`, `tailwind.config.js`.
2. **Aplica el checklist** de abajo, anotando hallazgos concretos con `archivo:línea`.
3. **Propón cambios agrupados por eje**; aplica los de bajo riesgo y confirma los de alto impacto visual.
4. **Verifica** que compila: `npm run build` (o `npm run lint`).

## Checklist de auditoría

### Diseño / UX (armonía y toque artístico)
- [ ] Paleta coherente: todo gira en torno al tema fuego; evitar azules sueltos (scrollbar, `::selection`) que rompen la armonía.
- [ ] Jerarquía tipográfica consistente entre secciones (tamaños de `h2`, line-height, tracking).
- [ ] Espaciado vertical uniforme entre secciones (`py-*` repetidos, no improvisados).
- [ ] Microinteracciones suaves y coherentes (hover-lift, transición de botones, gradientes animados).
- [ ] Contraste suficiente del texto sobre el fondo 3D (legibilidad AA).
- [ ] Respeta `prefers-reduced-motion` para usuarios sensibles al movimiento.
- [ ] Estados de foco visibles en links/botones/inputs (accesibilidad de teclado).
- [ ] Responsividad real en móvil (grid, tamaños de fuente, el fondo 3D no debe tapar contenido).

### Limpieza de código
- [ ] Sin `console.log` de depuración en producción.
- [ ] Sin grandes bloques de código comentado muerto (cursor personalizado, etc.).
- [ ] Sin reglas CSS duplicadas (`.glass`, `.gradient-text`, `float`, `.hover-lift`, `.btn-primary`).
- [ ] Sin estado/props de React sin uso (p. ej. prop-drilling de `setIsHovering` si el cursor está desactivado).
- [ ] Imports sin usar eliminados.
- [ ] Tipos explícitos donde aporten claridad.

### SEO / Rendimiento
- [ ] `metadata` completo en `layout.tsx`: `metadataBase`, `openGraph`, `twitter`, `robots`, `alternates`.
- [ ] `theme-color` y favicon/`icons` definidos.
- [ ] Imágenes optimizadas (formato moderno, dimensiones, `loading`); evitar placeholders rotos.
- [ ] Una sola `<h1>` por página; headings jerárquicos.
- [ ] `lang="es"` en `<html>` (ya está) y `alt` en imágenes.
- [ ] Sitemap/robots si aplica para el deploy.

### Contenido / Links reales
- [ ] Datos personales **consistentes** entre `README.md` y la web (universidad, semestre, teléfono, ubicación).
- [ ] Links de proyectos con URLs reales (no `#`); el texto del link coincide con su `href` (ojo con GitHub).
- [ ] CV (`/cv.pdf`) existe en `public/`.
- [ ] Imágenes de proyectos existen o se reemplazan por un placeholder intencional y bonito.
- [ ] Información de contacto verificada (email, WhatsApp, LinkedIn, GitHub).

## Principios al editar

- Mantén el **tema fuego**; no introduzcas colores fuera de paleta sin justificarlo.
- Cambios visuales grandes: descríbelos antes de aplicarlos.
- Edita siguiendo el estilo existente del archivo (densidad de comentarios, nombres, idioma español).
- Tras cambios, ejecuta `npm run build` para confirmar que no se rompió nada.
