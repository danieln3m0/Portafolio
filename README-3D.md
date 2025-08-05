# Portafolio con Fondo 3D - Three.js Integration

## 🎯 Configuración de Posiciones de Cámara

Tu portafolio ahora incluye un modelo 3D interactivo como fondo que responde a la navegación entre secciones. Las posiciones de cámara se definen en el archivo `src/hooks/useThreeScene.ts`.

### 📍 Cómo Personalizar las Posiciones de Cámara

En el archivo `src/hooks/useThreeScene.ts`, encontrarás la constante `CAMERA_POSITIONS` donde puedes ajustar las coordenadas para cada sección:

```typescript
export const CAMERA_POSITIONS: Record<string, CameraPosition> = {
  hero: {
    position: [0, 5, 10],      // [x, y, z] - Posición de la cámara
    target: [0, 0, 0],         // [x, y, z] - Punto hacia donde mira la cámara
    fov: 75                    // Campo de visión (opcional)
  },
  // ... más secciones
}
```

### 🎮 Coordenadas Explicadas

- **position**: `[x, y, z]` - Dónde se ubica la cámara en el espacio 3D
  - `x`: Izquierda (-) / Derecha (+)
  - `y`: Abajo (-) / Arriba (+)  
  - `z`: Alejado (-) / Cerca (+)

- **target**: `[x, y, z]` - Hacia dónde mira la cámara
- **fov**: Campo de visión (25-120, por defecto 75)

### 🎨 Paleta de Colores del Ambiente 3D

El sistema de iluminación usa tu paleta especificada:
- 🔴 **Rojo anaranjado** (#ff4500) - Luz puntual 1
- 🟡 **Amarillo brillante** (#ffeb3b) - Luz direccional y spot
- 🔵 **Azul oscuro** (#0a0a1a) - Color de fondo
- 🟠 **Naranja cálido** (#ff8c00) - Luz puntual 2

### 🛠️ Personalización del Modelo

En el método `loadModel()` puedes ajustar:

```typescript
// Escala del modelo (1 = tamaño original)
model.scale.setScalar(1.5) // Hacer 50% más grande

// Posición del modelo en la escena
model.position.set(0, -2, 0) // Mover hacia abajo
```

### 📱 Optimizaciones Móviles

El sistema incluye optimizaciones automáticas:
- Reducción de pixelRatio para mejor rendimiento
- Simplificación de materiales en dispositivos móviles
- Fallback a geometría simple si el modelo falla

### 🎯 Secciones Configuradas

Actualmente hay 8 secciones configuradas:
1. **hero** - Página de inicio
2. **about** - Sobre mí
3. **experience** - Experiencia
4. **education** - Educación  
5. **skills** - Habilidades
6. **projects** - Proyectos
7. **certifications** - Certificaciones
8. **contact** - Contacto

### 🔧 Resolución de Problemas

Si el modelo no carga:
1. Verifica que los archivos estén en `public/skybrack/`
2. Revisa la consola del navegador para errores
3. El sistema mostrará un cubo naranja como fallback

### 🚀 Comandos de Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

### 📁 Estructura de Archivos 3D

```
public/
  skybrack/
    scene.gltf    # Archivo principal del modelo
    scene.bin     # Datos binarios del modelo
    license.txt   # Licencia del modelo
```

¡Tu portafolio ahora tiene un fondo 3D completamente interactivo! 🎉
