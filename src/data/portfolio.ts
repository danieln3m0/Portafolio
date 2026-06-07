// Contenido del portafolio de Francis Daniel Mamani Silva.
// Todo el texto es real; las imágenes usan semillas descriptivas de Picsum
// hasta que existan capturas propias de cada proyecto.

export type Project = {
  title: string
  year: string
  category: string
  tech: string[]
  challenge: string
  overview: string
  highlights: string[]
  seed: string
  gallery: string[]
}

export const projects: Project[] = [
  {
    title: 'Transportify',
    year: '2024',
    category: 'Plataforma logística',
    tech: ['Vue.js', 'Node', 'Express', 'MongoDB', 'Docker'],
    challenge:
      'Conectar empresas con conductores de carga sobre un esquema de datos optimizado y APIs REST que escalan sin fricciones.',
    overview:
      'Transportify nace para quitarle fricción a la logística de carga: un punto de encuentro entre empresas que necesitan mover mercadería y conductores disponibles. Diseñé el modelo de datos y las APIs para que el emparejamiento fuera rápido y el sistema creciera sin reescrituras.',
    highlights: [
      'Modelo de datos optimizado para búsquedas de carga y rutas',
      'APIs REST desacopladas y documentadas',
      'Despliegue contenedorizado con Docker',
    ],
    seed: 'transportify-cargo-routes',
    gallery: ['transportify-cargo-routes', 'transportify-truck-fleet', 'transportify-logistics-dashboard'],
  },
  {
    title: "D'Taquito",
    year: '2025',
    category: 'App web y móvil',
    tech: ['Kotlin', 'Java', 'Angular', 'MySQL', 'Docker'],
    challenge:
      'Coordinar deporte local con un backend híbrido de eventos, salas comunitarias y programación dinámica de partidos.',
    overview:
      "D'Taquito conecta a la comunidad alrededor del deporte local. Construí un backend híbrido que coordina eventos, salas y la programación dinámica de partidos, con apps web y móvil que comparten la misma lógica.",
    highlights: [
      'Backend híbrido en Kotlin y Java',
      'Salas comunitarias y eventos en tiempo real',
      'Programación dinámica de partidos',
    ],
    seed: 'dtaquito-football-field',
    gallery: ['dtaquito-football-field', 'dtaquito-team-sport', 'dtaquito-mobile-app'],
  },
  {
    title: '4EverBodas',
    year: '2025',
    category: 'Producto web',
    tech: ['React', 'Node', 'Express', 'MongoDB'],
    challenge:
      'Gestionar bodas con invitaciones digitales, páginas de evento y seguimiento de invitados en tiempo real.',
    overview:
      '4EverBodas digitaliza la organización de una boda de principio a fin: invitaciones, página del evento y seguimiento de invitados en tiempo real, con una interfaz cuidada tanto para las parejas como para los proveedores.',
    highlights: [
      'Invitaciones digitales personalizables',
      'Páginas de evento por boda',
      'Seguimiento de invitados en tiempo real',
    ],
    seed: 'everbodas-wedding-table',
    gallery: ['everbodas-wedding-table', 'everbodas-celebration', 'everbodas-invitation-card'],
  },
  {
    title: 'Crypto & Product Dashboard',
    year: '2025',
    category: 'Visualización de datos',
    tech: ['Next.js', 'Flask', 'Recharts', 'CoinGecko'],
    challenge:
      'Mostrar precios de cripto y productos en vivo con gráficos interactivos sobre un backend que normaliza los datos.',
    overview:
      'Un tablero que reúne precios de cripto y productos en un solo lugar. Normalicé fuentes de datos dispares en un backend Flask y construí una capa visual en Next.js con gráficos interactivos que se actualizan en vivo.',
    highlights: [
      'Backend Flask que normaliza datos de varias fuentes',
      'Gráficos interactivos con Recharts',
      'Datos de mercado en vivo vía CoinGecko',
    ],
    seed: 'crypto-dashboard-charts',
    gallery: ['crypto-dashboard-charts', 'crypto-trading-screen', 'crypto-data-analytics'],
  },
]

export const roles = ['Desarrollador Full-Stack', 'Front-End', 'Creative Coding']

export type SkillGroup = { area: string; items: { name: string; core?: boolean }[] }

export const stack: SkillGroup[] = [
  {
    area: 'Lenguajes',
    items: [
      { name: 'Python', core: true },
      { name: 'Java', core: true },
      { name: 'TypeScript', core: true },
      { name: 'Kotlin' },
      { name: 'C++' },
      { name: 'PHP' },
    ],
  },
  {
    area: 'Front-end',
    items: [
      { name: 'React', core: true },
      { name: 'Next.js', core: true },
      { name: 'Angular' },
      { name: 'Vue' },
      { name: 'Flutter' },
    ],
  },
  {
    area: 'Backend y datos',
    items: [
      { name: 'Node', core: true },
      { name: 'Spring Boot', core: true },
      { name: 'PostgreSQL', core: true },
      { name: 'MySQL' },
      { name: 'MongoDB' },
      { name: 'Redis' },
    ],
  },
  {
    area: 'Plataformas',
    items: [
      { name: 'Docker', core: true },
      { name: 'Git', core: true },
      { name: 'Linux' },
      { name: 'Supabase' },
      { name: 'Firebase' },
      { name: 'Azure' },
    ],
  },
]

export type Certification = { year: string; title: string; by: string }

export const certifications: Certification[] = [
  { year: '2025', title: 'ISC Agile Development International', by: 'UPC' },
  { year: '2025', title: 'AI Foundations for Everyone', by: 'IBM' },
  { year: '2024', title: 'SQL for Data Science', by: 'UC Davis' },
  { year: '2023', title: 'Scrum Fundamentals Certified', by: 'SCRUMstudy' },
  { year: '2023', title: 'Introduction to MongoDB', by: 'MongoDB' },
]

export type Channel = { label: string; value: string; href: string }

export const channels: Channel[] = [
  { label: 'Email', value: 'francisdani143@gmail.com', href: 'mailto:francisdani143@gmail.com' },
  { label: 'LinkedIn', value: 'in/francis-daniel-mamani-silva', href: 'https://www.linkedin.com/in/francis-daniel-mamani-silva-562ab6307/' },
  { label: 'GitHub', value: 'github.com/danieln3m0', href: 'https://github.com/danieln3m0' },
  { label: 'WhatsApp', value: '+51 935 018 631', href: 'https://wa.me/51935018631' },
]

// Coloca tu CV en public/cv.pdf (ruta relativa para que funcione en GitHub Pages).
export const cvUrl = 'cv.pdf'

export const imgUrl = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`
