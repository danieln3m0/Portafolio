# 🎮 Guía de Personalización del Modelo 3D

## 🎯 Ajustes Recomendados para Comenzar

### 1. Coordenadas de Cámara por Sección

En `src/hooks/useThreeScene.ts`, ajusta estas coordenadas según tu preferencia:

```typescript
export const CAMERA_POSITIONS: Record<string, CameraPosition> = {
  hero: {
    position: [0, 5, 10],      // Vista frontal elevada
    target: [0, 0, 0],         // Mirando al centro
    fov: 75
  },
  about: {
    position: [5, 3, 8],       // Vista lateral derecha
    target: [2, 0, 0],
    fov: 65
  },
  experience: {
    position: [-3, 4, 12],     // Vista lateral izquierda alejada
    target: [-1, 1, 0],
    fov: 70
  },
  // ... más secciones
}
```

### 2. Tamaño y Posición del Modelo

En la función `loadModel()`:

```typescript
// Para hacer el modelo más grande
model.scale.setScalar(2.0)

// Para mover el modelo
model.position.set(0, -5, 0) // Bajar 5 unidades

// Para rotar el modelo
model.rotation.y = Math.PI / 4 // 45 grados
```

### 3. Velocidad de Transiciones

En la función de animación, ajusta el valor del lerp:

```typescript
// Más rápido (0.05) vs más suave (0.02)
camera.position.lerp(targetCameraPosition.current, 0.03)
```

## 🎨 Personalización de Iluminación

### Cambiar Colores de Luces

En la función `setupLights()`:

```typescript
// Luz principal (amarillo -> tu color preferido)
const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.2) // Cyan

// Luces puntuales
const pointLight1 = new THREE.PointLight(0xff00ff, 0.8, 20) // Magenta
const pointLight2 = new THREE.PointLight(0x00ff00, 0.6, 15) // Verde
```

### Intensidad de Luces

```typescript
// Ambiente más brillante
const ambientLight = new THREE.AmbientLight(0x1a1a4a, 0.6) // Era 0.3

// Luces más intensas
const directionalLight = new THREE.DirectionalLight(0xffeb3b, 2.0) // Era 1.2
```

## 🎪 Efectos Visuales Adicionales

### Partículas de Fondo

Agrega este código después de cargar el modelo:

```typescript
// Sistema de partículas
const particlesGeometry = new THREE.BufferGeometry()
const particleCount = 1000

const positions = new Float32Array(particleCount * 3)
for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 50
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particlesMaterial = new THREE.PointsMaterial({
  color: 0x888888,
  size: 2,
  transparent: true,
  opacity: 0.8
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
```

### Niebla Atmosférica

```typescript
// Agregar niebla
scene.fog = new THREE.Fog(0x0a0a1a, 10, 100)
```

## 📱 Optimizaciones de Rendimiento

### Para Dispositivos Móviles

```typescript
// Detectar dispositivo móvil
const isMobile = window.innerWidth < 768

// Ajustar calidad según dispositivo
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))

// Reducir complejidad en móviles
if (isMobile) {
  // Deshabilitar sombras
  renderer.shadowMap.enabled = false
  
  // Simplificar materiales
  model.traverse((child) => {
    if (child.material && child.material.map) {
      child.material.map.minFilter = THREE.LinearFilter
    }
  })
}
```

### Límites de FPS

```typescript
// Limitar a 30 FPS en móviles
const maxFPS = isMobile ? 30 : 60
const fpsInterval = 1000 / maxFPS

let then = Date.now()
const animate = (time: number) => {
  const now = Date.now()
  const elapsed = now - then

  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval)
    
    // Tu código de animación aquí
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }
  
  frameIdRef.current = requestAnimationFrame(animate)
}
```

## 🎛️ Controles de Depuración

### Agregar Stats.js (Opcional)

```bash
npm install stats.js @types/stats.js
```

```typescript
import Stats from 'stats.js'

// En initScene()
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb
document.body.appendChild(stats.dom)

// En el loop de animación
stats.begin()
// ... código de renderizado
stats.end()
```

### Controles de Órbita (Para Testing)

```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Después de crear la cámara
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

// En el loop de animación
controls.update()
```

## 🔧 Resolución de Problemas Comunes

### El modelo no se ve
1. Verifica que los archivos estén en `public/skybrack/`
2. Ajusta la escala: `model.scale.setScalar(0.1)` o `model.scale.setScalar(10)`
3. Revisa la posición de la cámara

### Rendimiento lento
1. Reduce `setPixelRatio` a 1
2. Deshabilita sombras: `renderer.shadowMap.enabled = false`
3. Limita FPS en móviles

### Transiciones bruscas
1. Reduce el valor de lerp de 0.02 a 0.01
2. Aumenta la distancia entre posiciones de cámara

## 🚀 Próximos Pasos

1. **Prueba las coordenadas**: Navega entre secciones y ajusta posiciones
2. **Personaliza colores**: Cambia la iluminación según tu marca
3. **Optimiza para móviles**: Prueba en diferentes dispositivos
4. **Agrega efectos**: Partículas, niebla, o animaciones adicionales

¡Tu portafolio 3D está listo para impresionar! 🎉
