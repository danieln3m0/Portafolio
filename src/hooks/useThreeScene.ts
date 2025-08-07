import { useEffect, useRef, useState } from 'react';

// Ya no necesitamos posiciones de cámara, solo una cámara fija
const CAMERA_POSITION = { x: 0, y: 0, z: 15 };

export const useThreeScene = (containerRef: React.RefObject<HTMLDivElement>, currentSection: string) => {
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const modelRef = useRef<any>(null); // Nueva ref para el modelo
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: log cuando se inicializa el hook
  console.log('🔧 useThreeScene inicializado con sección:', currentSection);

  const initializeScene = async () => {
    try {
      console.log('Inicializando escena 3D...');
      
      // Importación dinámica de Three.js
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

      if (!containerRef.current) {
        console.error('Container ref no disponible');
        return;
      }

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Crear escena
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a); // Fondo negro oscuro
      sceneRef.current = scene;

      // Crear cámara (posición fija)
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
      camera.lookAt(0, 0, 0); // Hacer que la cámara mire hacia el centro
      cameraRef.current = camera;

      // Crear renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Limpiar container y agregar canvas
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Configurar luces con la paleta de colores del usuario
      setupLights(scene, THREE);

      // Cargar modelo
      await loadModel(scene, THREE, GLTFLoader);

      // Iniciar loop de renderizado
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      setIsLoading(false);
      console.log('Escena 3D inicializada correctamente');

    } catch (err) {
      console.error('Error inicializando escena 3D:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsLoading(false);
    }
  };

  const setupLights = (scene: any, THREE: any) => {
    // Luz ambiente suave
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Luz direccional principal (rojo-naranja)
    const directionalLight = new THREE.DirectionalLight(0xff4500, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Luz puntual (amarillo brillante)
    const pointLight = new THREE.PointLight(0xffff00, 0.8, 100);
    pointLight.position.set(-10, 5, 10);
    scene.add(pointLight);

    // Luz de relleno (azul oscuro)
    const fillLight = new THREE.DirectionalLight(0x000080, 0.3);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    // Luz adicional (naranja cálido)
    const warmLight = new THREE.PointLight(0xff8c00, 0.6, 50);
    warmLight.position.set(5, -3, 8);
    scene.add(warmLight);
  };

  const loadModel = async (scene: any, THREE: any, GLTFLoader: any) => {
    // Por el problema de Git LFS, usamos un modelo procedural atractivo por ahora
    console.log('🚀 Creando modelo 3D procedural - Crystal Formation');
    
    try {
      // Crear un modelo procedural: formación cristalina
      const group = new THREE.Group();
      
      // Cristales principales
      const mainCrystalGeometry = new THREE.ConeGeometry(0.8, 3, 8);
      const crystalMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff6b35, 
        transparent: true,
        opacity: 0.8,
        shininess: 100 
      });
      
      // Cristal principal
      const mainCrystal = new THREE.Mesh(mainCrystalGeometry, crystalMaterial);
      mainCrystal.position.set(0, 0, 0);
      mainCrystal.castShadow = true;
      mainCrystal.receiveShadow = true;
      group.add(mainCrystal);
      
      // Cristales secundarios
      for (let i = 0; i < 5; i++) {
        const secondaryCrystalGeometry = new THREE.ConeGeometry(0.3, 1.5, 6);
        const secondaryCrystalMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xff8c42,
          transparent: true,
          opacity: 0.7,
          shininess: 80 
        });
        
        const secondaryCrystal = new THREE.Mesh(secondaryCrystalGeometry, secondaryCrystalMaterial);
        
        // Posicionar alrededor del cristal principal
        const angle = (i / 5) * Math.PI * 2;
        const radius = 1.2;
        secondaryCrystal.position.set(
          Math.cos(angle) * radius,
          -0.5 + Math.random() * 0.4,
          Math.sin(angle) * radius
        );
        
        // Rotación aleatoria
        secondaryCrystal.rotation.z = (Math.random() - 0.5) * 0.3;
        secondaryCrystal.castShadow = true;
        secondaryCrystal.receiveShadow = true;
        
        group.add(secondaryCrystal);
      }
      
      // Base cristalina
      const baseGeometry = new THREE.CylinderGeometry(1.5, 2, 0.3, 12);
      const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffb347,
        transparent: true,
        opacity: 0.6 
      });
      
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, -1.5, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      
      // Partículas flotantes
      const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffd700,
        transparent: true,
        opacity: 0.8 
      });
      
      for (let i = 0; i < 15; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4 + 1,
          (Math.random() - 0.5) * 4
        );
        group.add(particle);
      }
      
      // Guardar referencia del modelo
      modelRef.current = group;
      
      // Escalar y posicionar
      group.scale.setScalar(1.5);
      group.position.set(0, 0, -5);
      
      scene.add(group);
      
      console.log('✅ Modelo procedural Crystal Formation creado exitosamente');
      
      // Hacer una rotación inicial después de cargar
      setTimeout(() => {
        console.log('🎲 Ejecutando rotación inicial del modelo');
        rotateModelRandomly();
      }, 1000);
      
    } catch (error) {
      console.warn('Error creando modelo procedural, usando cubo de respaldo:', error);
      
      // Cubo de respaldo naranja como última opción
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff8c00,
        shininess: 100 
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.position.set(0, 0, -5);
      
      modelRef.current = cube;
      
      const animateCube = () => {
        if (modelRef.current === cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }
        requestAnimationFrame(animateCube);
      };
      animateCube();
      
      scene.add(cube);
      
      setTimeout(() => {
        console.log('🎲 Ejecutando rotación inicial del cubo');
        rotateModelRandomly();
      }, 1000);
    }
  };

  const rotateModelRandomly = () => {
    console.log('🎲 Rotando modelo de forma controlada');
    console.log('📦 modelRef.current:', !!modelRef.current);
    
    if (!modelRef.current) {
      console.warn('❌ No hay modelo disponible para rotar');
      return;
    }

    console.log('✅ Ejecutando rotación suave y controlada');
    
    // Generar rotaciones más sutiles y controladas
    const randomX = (Math.random() - 0.5) * Math.PI * 0.4; // Rotación suave en X (-36° a 36°)
    const randomY = (Math.random() - 0.5) * Math.PI * 0.8 + modelRef.current.rotation.y; // Rotación relativa en Y (±72°)
    const randomZ = (Math.random() - 0.5) * Math.PI * 0.2; // Rotación muy sutil en Z (±18°)
    
    console.log('🔄 Nuevas rotaciones:', { 
      x: (randomX * (180/Math.PI)).toFixed(1) + '°', 
      y: (randomY * (180/Math.PI)).toFixed(1) + '°', 
      z: (randomZ * (180/Math.PI)).toFixed(1) + '°'
    });
    
    // Aplicar rotación suave con animación
    const startRotation = {
      x: modelRef.current.rotation.x,
      y: modelRef.current.rotation.y,
      z: modelRef.current.rotation.z
    };
    
    const targetRotation = {
      x: randomX,
      y: randomY,
      z: randomZ
    };
    
    // Animación más lenta y suave
    let progress = 0;
    const duration = 2000; // 2 segundos para una rotación muy suave
    const startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Interpolación muy suave con ease in-out
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease in-out quad
      
      if (modelRef.current) {
        modelRef.current.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easeProgress;
        modelRef.current.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * easeProgress;
        modelRef.current.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * easeProgress;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log('✅ Animación suave completada');
      }
    };
    
    animate();
  };

  const handleScroll = () => {
    // Limpiar timeout anterior si existe
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce: esperar 300ms después de que termine el scroll para más control
    scrollTimeoutRef.current = setTimeout(() => {
      console.log('🌀 Scroll detectado - activando rotación controlada');
      rotateModelRandomly();
    }, 300);
  };

  useEffect(() => {
    initializeScene();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // Agregar event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      
      // Limpiar timeout si existe
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Ya no necesitamos este useEffect que escuchaba cambios de sección
  // useEffect(() => {
  //   console.log('📍 Sección cambiada a:', currentSection);
  //   rotateModelRandomly();
  // }, [currentSection]);

  return { isLoading, error };
};
