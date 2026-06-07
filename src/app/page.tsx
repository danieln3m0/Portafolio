'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, MapPin, Phone, ExternalLink, Download, Code, Database, Globe, Server } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThreeBackground from '@/components/ThreeBackground'
import SectionIndicator from '@/components/SectionIndicator'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [currentSection, setCurrentSection] = useState('hero')

  useEffect(() => {
    setMounted(true)

    // Detecta la sección visible para el indicador y el fondo 3D
    const sections = document.querySelectorAll('section')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen relative">
      {/* Fondo 3D con Three.js */}
      <ThreeBackground currentSection={currentSection} />

      {/* Indicador de sección */}
      <SectionIndicator currentSection={currentSection} />

      <Navigation />
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />
      <CertificationsSection />
      <ContactSection />
    </main>
  )
}

function Navigation() {
  const navItems = [
    { href: '#hero', label: 'Inicio' },
    { href: '#about', label: 'Sobre mí' },
    { href: '#experience', label: 'Experiencia' },
    { href: '#education', label: 'Educación' },
    { href: '#skills', label: 'Habilidades' },
    { href: '#projects', label: 'Proyectos' },
    { href: '#certifications', label: 'Certificaciones' },
    { href: '#contact', label: 'Contacto' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold gradient-text"
          >
            Francis Daniel
          </motion.div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium tracking-wide"
              >
                {item.label}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 pt-20 relative overflow-hidden">
      {/* Manchas de luz animadas - tema Fire in the Sky */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-shape absolute top-20 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="floating-shape absolute bottom-20 right-10 w-96 h-96 bg-red-500/15 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
        <div className="floating-shape absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-500/8 rounded-full blur-3xl" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none tracking-tight text-balance"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-white block">FRANCIS</span>
            <span className="gradient-text block">DANIEL</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto font-light tracking-wide"
          >
            SOFTWARE ENGINEERING STUDENT & FULL STACK DEVELOPER
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed text-balance"
          >
            Estudiante de Ingeniería de Software en UPC con promedio de 17.5/20.
            Experiencia en desarrollo Full Stack con Next.js, Spring Boot, React y tecnologías modernas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <a
              href="#contact"
              className="btn-primary bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 rounded-full transition-all duration-300 flex items-center gap-3 text-lg font-semibold hover-lift"
            >
              <Mail size={24} />
              Contactar
            </a>
            <a
              href="/cv.pdf"
              className="border-2 border-orange-400/50 hover:border-orange-400/80 text-white px-10 py-4 rounded-full transition-all duration-300 flex items-center gap-3 text-lg font-semibold hover-lift"
            >
              <Download size={24} />
              Descargar CV
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Sobre Mí</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg text-gray-300 mb-6 leading-relaxed font-light">
              Soy estudiante de Ingeniería de Software en la Universidad Peruana de Ciencias Aplicadas (UPC)
              con un promedio académico de 17.5/20, ubicándome en el tercio superior de mi carrera.
              Me especializo en desarrollo Full Stack con experiencia práctica en múltiples tecnologías.
            </p>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed font-light">
              Durante mi formación he trabajado en proyectos reales como interno de desarrollo Full Stack,
              construyendo sistemas de seguimiento en tiempo real, APIs REST seguras y plataformas web completas.
              Mi enfoque se centra en crear soluciones escalables y bien documentadas.
            </p>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-orange-400" />
                <span>Lima, Perú</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-orange-400" />
                <span>francisdani143@gmail.com</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="glass p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">17.5/20</div>
              <div className="text-gray-300">Promedio Académico</div>
            </div>
            <div className="glass p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">2026</div>
              <div className="text-gray-300">Graduación Esperada</div>
            </div>
            <div className="glass p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">10+</div>
              <div className="text-gray-300">Tecnologías</div>
            </div>
            <div className="glass p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">5+</div>
              <div className="text-gray-300">Proyectos Destacados</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  const experiences = [
    {
      title: "Full Stack Developer Intern",
      company: "Empresa de Tecnología",
      period: "Ago 2024 - May 2025",
      location: "Lima, Perú",
      description: "Desarrollo de sistemas de seguimiento de pedidos en tiempo real usando Next.js y Supabase. Creación de backend personalizado para POS e inventario con Java Spring Boot. Documentación completa de APIs con Swagger y manejo de autenticación JWT.",
      technologies: ["Next.js", "Supabase", "Java", "Spring Boot", "Swagger", "MySQL", "JWT"]
    }
  ]

  return (
    <section id="experience" className="py-20 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Experiencia</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-orange-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="glass p-8 rounded-lg"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{exp.title}</h3>
                  <p className="text-xl text-orange-400 mb-2">{exp.company}</p>
                  <p className="text-gray-400">{exp.location}</p>
                </div>
                <div className="text-gray-300 font-medium mt-4 lg:mt-0">{exp.period}</div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">{exp.description}</p>

              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EducationSection() {
  const education = [
    {
      degree: "Ingeniería de Software",
      institution: "Universidad Peruana de Ciencias Aplicadas (UPC)",
      period: "2022 - Diciembre 2026",
      location: "Lima, Perú",
      status: "En curso - Promedio: 17.5/20 (Tercio Superior)",
      description: "Formación integral en ingeniería de software con enfoque en desarrollo full stack, metodologías ágiles, inteligencia artificial y gestión de proyectos.",
      subjects: ["Programación Orientada a Objetos", "Estructuras de Datos y Algoritmos", "Desarrollo Web", "Inteligencia Artificial", "Ingeniería de Software", "Metodologías Ágiles", "Diseño de Bases de Datos", "Sistemas Operativos", "Gestión de Proyectos", "Interacción Humano-Computadora"]
    }
  ]

  return (
    <section id="education" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Educación</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-orange-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="space-y-8">
          {education.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="glass p-8 rounded-lg"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{edu.degree}</h3>
                  <p className="text-xl text-orange-400 mb-2">{edu.institution}</p>
                  <p className="text-gray-400 mb-1">{edu.location}</p>
                  <p className="text-yellow-400 font-medium">{edu.status}</p>
                </div>
                <div className="text-gray-300 font-medium mt-4 lg:mt-0">{edu.period}</div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">{edu.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {edu.subjects.map((subject, subjectIndex) => (
                  <span
                    key={subjectIndex}
                    className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillsSection() {
  const skillCategories = [
    {
      title: "Lenguajes de Programación",
      icon: <Code className="w-8 h-8" />,
      skills: ["Python (2 años)", "Java + Spring Boot (2 años)", "C++ (2 años)", "Kotlin (1 año)", "PHP (1 año)", "JavaScript/TypeScript"]
    },
    {
      title: "Frameworks & Libraries",
      icon: <Globe className="w-8 h-8" />,
      skills: ["React", "Flutter", "Angular", "Next.js", "Node.js", "Express", "Vue"]
    },
    {
      title: "Bases de Datos",
      icon: <Database className="w-8 h-8" />,
      skills: ["MySQL", "MongoDB", "SQL", "Redis", "PostgreSQL"]
    },
    {
      title: "Herramientas & Plataformas",
      icon: <Server className="w-8 h-8" />,
      skills: ["Docker", "Linux", "Power BI", "Git", "Firebase", "Supabase", "Azure", "Swagger"]
    }
  ]

  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Habilidades</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="glass p-6 rounded-lg text-center"
            >
              <div className="text-orange-400 mb-4 flex justify-center">
                {category.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{category.title}</h3>
              <div className="space-y-2">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="text-gray-300 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  const projects = [
    {
      title: "Transportify",
      description: "Plataforma logística digital que conecta empresas con conductores de carga certificados. Diseño y optimización de esquema de base de datos, APIs RESTful escalables con Express.",
      technologies: ["Vue.js", "Node.js", "Express", "MongoDB", "Docker"],
      image: "/project1.jpg",
      demo: "#",
      github: "#",
      period: "Mar - Ago 2024"
    },
    {
      title: "D'Taquito",
      description: "Plataforma web y móvil para coordinar actividades deportivas locales. Backend híbrido (monolito + microservicios) con gestión de eventos, salas comunitarias y programación dinámica.",
      technologies: ["Kotlin", "Java", "Angular", "MySQL", "Docker"],
      image: "/project2.jpg",
      demo: "#",
      github: "#",
      period: "Mar - Presente 2025"
    },
    {
      title: "4EverBodas",
      description: "Plataforma personalizable de gestión de bodas con invitaciones digitales, páginas de eventos y seguimiento de invitados en tiempo real. Backend con arquitectura de servicios limpia.",
      technologies: ["Express", "MongoDB", "React", "Node.js"],
      image: "/project3.jpg",
      demo: "#",
      github: "#",
      period: "Ago - Presente 2025"
    },
    {
      title: "Crypto & Product Price Dashboard",
      description: "Dashboard en tiempo real para visualizar precios de criptomonedas y productos. Integración con CoinGecko API, gráficos interactivos con Recharts y backend Flask para normalización de datos.",
      technologies: ["Next.js", "Recharts", "Flask", "CoinGecko API"],
      image: "/project4.jpg",
      demo: "#",
      github: "#",
      period: "En Progreso - 2025"
    }
  ]

  return (
    <section id="projects" className="py-20 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Proyectos Destacados</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="glass rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                <Code className="w-16 h-16 text-white" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                <p className="text-sm text-orange-400 mb-2">{project.period}</p>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="bg-orange-600/20 text-orange-300 px-2 py-1 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a
                    href={project.demo}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded text-center text-sm transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Demo
                  </a>
                  <a
                    href={project.github}
                    className="flex-1 border border-white/30 hover:border-white/50 text-white py-2 px-4 rounded text-center text-sm transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <Github size={16} />
                    Código
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CertificationsSection() {
  const certifications = [
    {
      title: "Introduction to MongoDB",
      issuer: "MongoDB",
      date: "Mayo 2023",
      description: "Fundamentos de bases de datos NoSQL, operaciones CRUD y estrategias de indexación para optimizar el rendimiento."
    },
    {
      title: "Scrum Fundamentals Certified",
      issuer: "SCRUMstudy",
      date: "Junio 2023",
      description: "Principios ágiles y framework Scrum: roles, eventos y artefactos para colaboración efectiva en equipos."
    },
    {
      title: "SQL for Data Science",
      issuer: "University of California, Davis",
      date: "Octubre 2024",
      description: "Consultas SQL avanzadas, agregación de datos y técnicas de preprocesamiento para análisis de datos."
    },
    {
      title: "AI Foundations for Everyone",
      issuer: "IBM",
      date: "Abril 2025",
      description: "Visión general de IA generativa, ingeniería de prompts, consideraciones éticas y herramientas como IBM watsonx y Hugging Face."
    },
    {
      title: "ISC Agile Development International Specialization",
      issuer: "UPC",
      date: "Junio 2025",
      description: "Curso electivo online enfocado en Scrum, User Stories, Lean Agile y prácticas alineadas con DevOps durante un currículum de cuatro meses."
    }
  ]

  return (
    <section id="certifications" className="py-20 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Certificaciones</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-600 to-orange-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {certifications.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="glass p-6 rounded-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>
                  <p className="text-orange-400 font-medium mb-1">{cert.issuer}</p>
                </div>
                <span className="text-gray-300 text-sm font-medium">{cert.date}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{cert.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Arma el mensaje para WhatsApp
    const whatsappMessage = `¡Hola Francis!

Me llamo *${formData.name}* y me gustaría contactarte.

Este es *Mi email:* ${formData.email}

Mi mensaje:
${formData.message}

¡Espero tu respuesta!`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/51935018631?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');

    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Contacto</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 font-light">¿Tienes un proyecto en mente? ¡Hablemos!</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Información de Contacto</h3>

            <div className="space-y-4">
              <a
                href="mailto:francisdani143@gmail.com"
                className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors duration-300"
              >
                <Mail className="w-6 h-6 text-orange-400" />
                <span>francisdani143@gmail.com</span>
              </a>

              <a
                href="https://www.linkedin.com/in/francis-daniel-mamani-silva-562ab6307/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors duration-300"
              >
                <Linkedin className="w-6 h-6 text-orange-400" />
                <span>linkedin.com/in/francis-daniel-mamani-silva</span>
              </a>

              <a
                href="https://github.com/danieln3m0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors duration-300"
              >
                <Github className="w-6 h-6 text-orange-400" />
                <span>github.com/danieln3m0</span>
              </a>

              <a
                href="https://wa.me/51935018631"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors duration-300"
              >
                <Phone className="w-6 h-6 text-orange-400" />
                <span>+51 935 018 631</span>
              </a>

              <div className="flex items-center gap-4 text-gray-300">
                <MapPin className="w-6 h-6 text-orange-400" />
                <span>Lima, Perú</span>
              </div>

              <div className="flex items-center gap-4 text-gray-300">
                <span className="w-6 h-6 text-orange-400 flex items-center justify-center">🎓</span>
                <span>Disponible desde Agosto 2025</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass p-8 rounded-lg"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Tu email"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tu mensaje"
                  rows={5}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full btn-primary bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors duration-300 hover-lift flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.462-.996-4.779-2.811-6.598-1.815-1.819-4.145-2.817-6.607-2.819-5.448 0-9.886 4.435-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.279-.456zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                Enviar por WhatsApp
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
