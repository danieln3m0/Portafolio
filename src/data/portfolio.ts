// Contenido del portafolio de Francis Daniel Mamani Silva.
// Perfil, experiencia, logros, certificados y OratorIA/Ayni salen del CV
// (public/cv.pdf); el resto del contenido es anterior al CV. Las imágenes usan
// semillas descriptivas de Picsum hasta que existan capturas de cada proyecto.

// Modelo 3D en el que se materializa cada proyecto en la escena de fondo.
export type ProjectModel = 'mic' | 'leaf' | 'truck' | 'ball' | 'rings' | 'chart'

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
  model: ProjectModel
  shape: string
  award?: string
}

const GEMMA_AWARD = '2.º puesto nacional · Build with Gemma Hackathon'

// Ordenados del más reciente al más antiguo.
export const projects: Project[] = [
  {
    title: 'OratorIA',
    year: '2026',
    category: 'IA on-device',
    tech: ['Gemma', 'Visión por computadora', 'Análisis de voz'],
    challenge:
      'Practicar oratoria con retroalimentación en tiempo real sin que la voz ni la imagen del usuario salgan de su dispositivo.',
    overview:
      'OratorIA es un asistente para practicar oratoria que funciona por completo en local: el audio y el video nunca salen del dispositivo, sin cuenta ni servidor. Analiza en tiempo real la voz, las muletillas, el ritmo y el lenguaje corporal, y un modelo Gemma on-device genera repreguntas como si fuera el público. Nació como MVP en menos de 24 horas en el Build with Gemma Hackathon.',
    highlights: [
      'Modelo Gemma 100% on-device que simula repreguntas del público',
      'Análisis en tiempo real de voz, muletillas, ritmo y lenguaje corporal',
      'Degradación funcional ante fallos de cámara, micrófono o modelo',
      'Optimizada para gama baja y zonas sin internet',
    ],
    seed: 'oratoria-speaker-stage',
    gallery: ['oratoria-speaker-stage', 'oratoria-microphone', 'oratoria-audience'],
    model: 'mic',
    shape: 'Micrófono con ondas de voz',
    award: GEMMA_AWARD,
  },
  {
    title: 'Ayni',
    year: '2025',
    category: 'Machine Learning · móvil y web',
    tech: ['Python', 'FastAPI', 'Java', 'Spring Boot', 'Docker', 'Machine Learning'],
    challenge:
      'Detectar enfermedades del café a partir de imágenes con una solución móvil y web basada en microservicios.',
    overview:
      'Ayni ayuda a detectar enfermedades del café a partir de imágenes. Construí una solución móvil y web con microservicios aislados: un servicio en Python con FastAPI para procesar las imágenes y un backend en Spring Boot con Eureka y Spring Cloud, todo contenedorizado con Docker.',
    highlights: [
      'Microservicio FastAPI con sanitización de entradas y control de acceso',
      'Backend de microservicios con Spring Boot, Eureka y Spring Cloud',
      'Despliegue contenedorizado con Docker',
    ],
    seed: 'ayni-coffee-leaf',
    gallery: ['ayni-coffee-leaf', 'ayni-coffee-farm', 'ayni-plant-scan'],
    model: 'leaf',
    shape: 'Hoja de café bajo la lupa',
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
      'Roles y permisos diferenciados (RBAC) para jugadores, organizadores y dueños',
      'Backend híbrido (monolito + microservicios) en Kotlin y Java',
      'Programación dinámica y flujos de pago con validación de usuarios y cifrado de datos',
    ],
    seed: 'dtaquito-football-field',
    gallery: ['dtaquito-football-field', 'dtaquito-team-sport', 'dtaquito-mobile-app'],
    model: 'ball',
    shape: 'Balón en juego',
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
    model: 'rings',
    shape: 'Anillos entrelazados',
  },
  {
    title: 'Crypto & Product Dashboard',
    year: '2025',
    category: 'Visualización de datos',
    tech: ['Next.js', 'Flask', 'Recharts', 'CoinGecko'],
    challenge:
      'Mostrar precios de cripto y productos en vivo con gráficos interactivos sobre un backend que normaliza los datos.',
    overview:
      'Un tablero que reúne precios de cripto y productos en un solo lugar. Integré la CoinGecko API con validación y normalización en un backend Flask, y construí una capa visual en Next.js con gráficos interactivos que se actualizan en vivo.',
    highlights: [
      'Backend Flask que valida y normaliza los datos de la CoinGecko API',
      'Gráficos interactivos con Recharts',
      'Filtros por tipo de activo, categoría y rango temporal',
    ],
    seed: 'crypto-dashboard-charts',
    gallery: ['crypto-dashboard-charts', 'crypto-trading-screen', 'crypto-data-analytics'],
    model: 'chart',
    shape: 'Gráfico al alza',
  },
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
      'Esquema de datos centrado en consistencia e integridad',
      'Endpoints REST con validación de entradas y autenticación',
      'Servicios contenedorizados con Docker Compose',
    ],
    seed: 'transportify-cargo-routes',
    gallery: ['transportify-cargo-routes', 'transportify-truck-fleet', 'transportify-logistics-dashboard'],
    model: 'truck',
    shape: 'Camión de carga',
  },
]

export const roles = ['Desarrollador Full-Stack', 'Front-End', 'Creative Coding']

// Datos de perfil (CV) compartidos por "Sobre mí" y el modo reclutador.
export const profile = {
  name: 'Francis Daniel Mamani Silva',
  tagline: 'Desarrollador full-stack · Front-end · Creative coding',
  bio: 'Soy desarrollador full-stack y estudiante de Ingeniería de Software en la UPC. Construyo plataformas, interfaces y APIs, y me obsesiona que cada pieza se sienta rápida, clara y bien resuelta.',
  degree: 'Ingeniería de Software',
  university: 'UPC',
  graduation: 'Diciembre 2026',
  gpa: '17.5 / 20 · tercio superior',
  location: 'Lima, Perú',
  availability: 'Disponibilidad inmediata',
  languages: 'Español nativo · Inglés intermedio',
}

export type Experience = { role: string; company: string; period: string; tech: string[]; points: string[] }

export const experience: Experience[] = [
  {
    role: 'Practicante de Sistemas',
    company: 'EFC',
    period: 'Sep 2025 – Actualidad',
    tech: ['Visual Basic 6', '.NET', 'SQL'],
    points: [
      'Mantenimiento y soporte de sistemas de escritorio on-premise en Visual Basic 6 y .NET',
      'Desarrollo y optimización de scripts de base de datos',
      'QA de los cambios de otros desarrolladores antes del despliegue',
    ],
  },
  {
    role: 'Software Developer Intern',
    company: 'iTLand Perú',
    period: 'Abr – Jun 2025',
    tech: ['Flutter', 'Angular', 'PHP', 'SQL Server'],
    points: [
      'Nuevas funciones en una aplicación de control de gastos',
      'Reorganización y optimización del código existente',
      'Optimización de procesos internos para soportar más usuarios',
    ],
  },
  {
    role: 'Practicante de Sistemas',
    company: 'A&S Soluciones Generales',
    period: 'Ago 2024 – Abr 2025',
    tech: ['Next.js', 'Supabase', 'Spring Boot', 'Swagger', 'MySQL'],
    points: [
      'Seguimiento de pedidos en tiempo real con Next.js y Supabase',
      'Modelos relacionales en MySQL para inventario, ventas, usuarios y pedidos',
      'Procesos ETL, transacciones con rollback y documentación de APIs con Swagger',
    ],
  },
]

export type Award = { year: string; title: string; by: string; project: string }

export const awards: Award[] = [{ year: '2026', title: GEMMA_AWARD, by: 'GDG Callao', project: 'OratorIA' }]

export type SkillGroup = { area: string; items: { name: string; core?: boolean }[] }

// core = stack principal: lo marcado como "Avanzado" en el CV más lo que ya
// figuraba como principal en el portafolio.
export const stack: SkillGroup[] = [
  {
    area: 'Lenguajes',
    items: [
      { name: 'Python', core: true },
      { name: 'Java', core: true },
      { name: 'C++', core: true },
      { name: 'TypeScript', core: true },
      { name: 'JavaScript' },
      { name: 'Kotlin' },
      { name: 'Rust' },
      { name: '.NET' },
      { name: 'PHP' },
    ],
  },
  {
    area: 'Front-end y móvil',
    items: [
      { name: 'React', core: true },
      { name: 'Next.js', core: true },
      { name: 'Angular', core: true },
      { name: 'Flutter', core: true },
      { name: 'Vue' },
    ],
  },
  {
    area: 'Backend y datos',
    items: [
      { name: 'Node', core: true },
      { name: 'Spring Boot', core: true },
      { name: 'PostgreSQL', core: true },
      { name: 'Express' },
      { name: 'FastAPI' },
      { name: 'Flask' },
      { name: 'MySQL' },
      { name: 'SQL Server' },
      { name: 'MongoDB' },
      { name: 'Redis' },
    ],
  },
  {
    area: 'Plataformas',
    items: [
      { name: 'Docker', core: true },
      { name: 'Git', core: true },
      { name: 'Azure', core: true },
      { name: 'Linux' },
      { name: 'AWS' },
      { name: 'Google Cloud' },
      { name: 'Supabase' },
      { name: 'Firebase' },
      { name: 'Power BI' },
    ],
  },
  {
    area: 'IA',
    items: [{ name: 'Gemma' }, { name: 'Gemini API' }, { name: 'ElevenLabs' }, { name: 'Machine Learning' }],
  },
]

export type Certification = { year: string; title: string; by: string }

export const certifications: Certification[] = [
  { year: 'En curso', title: 'Analista de Ciberseguridad', by: 'Google' },
  { year: 'En curso', title: 'Computer Science, Data Analyst & IT', by: '—' },
  { year: '2025', title: 'Computación en la nube: Microsoft Azure', by: 'Microsoft' },
  { year: '2025', title: 'ISC Desarrollo Ágil', by: 'UPC' },
  { year: '2025', title: 'Fundamentos de IA para Todos', by: 'IBM' },
  { year: '2024', title: 'SQL para Ciencia de Datos', by: 'UC Davis' },
  { year: '2024', title: 'Congreso: IA aplicada a la Ciberseguridad', by: 'Laureate' },
  { year: '2023', title: 'Scrum Fundamentals Certified', by: 'SCRUMstudy' },
  { year: '2023', title: 'Introduction to MongoDB', by: 'MongoDB' },
]

export type Channel = { label: string; value: string; href: string }

export const channels: Channel[] = [
  { label: 'Email', value: 'francisdani143@gmail.com', href: 'mailto:francisdani143@gmail.com' },
  { label: 'LinkedIn', value: 'in/francis-daniel-mamani-silva', href: 'https://www.linkedin.com/in/francis-daniel-mamani-silva-562ab6307/' },
  { label: 'GitHub', value: 'github.com/danieln3m0', href: 'https://github.com/danieln3m0' },
  // El número no se muestra en el HTML para evitar scraping; el chat se abre vía wa.me.
  { label: 'WhatsApp', value: 'Mensaje directo', href: 'https://wa.me/51910547175' },
]

// CV en public/cv.pdf (ruta relativa para que funcione en GitHub Pages).
export const cvUrl = 'cv.pdf'

export const imgUrl = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`
