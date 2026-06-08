# Portafolio · Francis Daniel Mamani Silva

Portafolio personal de Francis Daniel Mamani Silva, estudiante de Ingeniería de Software en la Universidad Peruana de Ciencias Aplicadas (UPC) y desarrollador full-stack.

El sitio es un ejercicio de **Minimalismo Interactivo / Creative Coding** bajo el concepto de "materialización de las formas": diseño limpio y muy tipográfico sobre un fondo interactivo de figuras abstractas que reaccionan al cursor.

## Características

- **Fondo interactivo (`BlobField`)**: blobs orgánicos alargados e iridiscentes en Canvas 2D que se ondulan, reaccionan al cursor con paralaje y se **agrupan** al pasar el cursor sobre el nombre del hero. Corre en `requestAnimationFrame`, fuera del ciclo de render de React, y honra `prefers-reduced-motion`.
- **Alto contraste tipográfico**: titulares en mayúsculas peso 800 con Outfit, nombres con contorno; cuerpo en peso ligero. El color vivo se reserva al fondo.
- **SPA por vistas, sin scroll de página**: se cambia de pestaña con los botones; solo el **detalle de proyecto** tiene scroll para profundizar con imágenes.
- **Micro-animaciones**: transiciones fluidas entre vistas y aparición suave (fade-in / slide-up) con Framer Motion.
- **Estático y ligero**: Next.js 15 con `output: export` para GitHub Pages.

## Tecnologías

- **Framework**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Animación**: Framer Motion + Canvas 2D
- **Iconos**: lucide-react
- **Deploy**: GitHub Pages

## Vistas

1. **Inicio**: saludo directo, los tres roles y llamadas a la acción.
2. **Proyectos**: lista de proyectos. Al hacer clic en uno se abre su **detalle con scroll** (imágenes, resumen y tecnologías).
3. **Sobre mí**: biografía, stack y botón para ver el CV.
4. **Contacto**: enlaces directos (Email, LinkedIn, GitHub, WhatsApp).

## CV

El botón "Ver mi CV" abre `public/cv.pdf`. Coloca ahí tu CV con ese nombre exacto.

## Desarrollo

```bash
npm install      # instalar dependencias
npm run dev      # entorno de desarrollo (http://localhost:3000)
npm run build    # build estático para producción (genera /out)
npm run lint     # linter
```

## Contacto

- **Email**: francisdani143@gmail.com
- **LinkedIn**: [francis-daniel-mamani-silva](https://www.linkedin.com/in/francis-daniel-mamani-silva-562ab6307/)
- **GitHub**: [danieln3m0](https://github.com/danieln3m0)
- **WhatsApp**: +51 910 547 175
- **Ubicación**: Lima, Perú
