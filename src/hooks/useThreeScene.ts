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

      // Iniciar loop de renderizado con animación de luces
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Animación de spotlight como en el ejemplo
        const time = performance.now() / 3000;
        if (sceneRef.current) {
          const spotlights = sceneRef.current.children.filter((child: any) => child.type === 'SpotLight');
          if (spotlights.length > 0) {
            const mainSpotlight = spotlights[0];
            if (mainSpotlight) {
              mainSpotlight.position.x = Math.cos(time) * 2.5;
              mainSpotlight.position.z = Math.sin(time) * 2.5;
            }
          }
        }
        
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
    // Luz ambiente hemisférica como en el ejemplo
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.15);
    scene.add(ambientLight);

    // Spotlight principal inspirado en el ejemplo - este se moverá
    const spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.position.set(2.5, 5, 2.5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 1;
    spotLight.decay = 2;
    spotLight.distance = 0;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.focus = 1;
    scene.add(spotLight);

    // Spotlight con color naranja para la paleta del usuario - fijo
    const coloredSpotLight = new THREE.SpotLight(0xff6b35, 80);
    coloredSpotLight.position.set(-2.5, 4, -2.5);
    coloredSpotLight.angle = Math.PI / 8;
    coloredSpotLight.penumbra = 0.8;
    coloredSpotLight.decay = 2;
    coloredSpotLight.castShadow = true;
    scene.add(coloredSpotLight);

    // Luz de relleno suave
    const fillLight = new THREE.DirectionalLight(0xff8c42, 0.3);
    fillLight.position.set(-5, -2, 5);
    scene.add(fillLight);
  };

  const loadModel = async (scene: any, THREE: any, GLTFLoader: any) => {
    console.log('🚀 Creando modelo 3D procedural - Architectural Sculpture');
    
    try {
      // Crear un modelo procedural: escultura arquitectónica
      const group = new THREE.Group();
      
      // Crear un plano base como en el ejemplo
      const planeGeometry = new THREE.PlaneGeometry(8, 8);
      const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.position.set(0, -2, 0);
      plane.rotation.x = -Math.PI / 2;
      plane.receiveShadow = true;
      scene.add(plane);
      
      // Escultura principal - estructura compleja tipo "Lucy" pero procedural
      const sculptureGeometry = new THREE.ConeGeometry(0.8, 4, 12);
      const sculptureMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff6b35,
        transparent: false
      });
      
      const mainSculpture = new THREE.Mesh(sculptureGeometry, sculptureMaterial);
      mainSculpture.position.set(0, 0, 0);
      mainSculpture.castShadow = true;
      mainSculpture.receiveShadow = true;
      group.add(mainSculpture);
      
      // Agregar complejidad geométrica - elementos arquitectónicos
      // Torre principal
      const towerGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2.5, 8);
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xff8c42 });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      tower.position.set(0, 2.5, 0);
      tower.castShadow = true;
      tower.receiveShadow = true;
      group.add(tower);
      
      // Elementos decorativos alrededor - como pilares
      for (let i = 0; i < 6; i++) {
        const pillarGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.8, 6);
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0xffb347 });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        
        const angle = (i / 6) * Math.PI * 2;
        const radius = 1.8;
        pillar.position.set(
          Math.cos(angle) * radius,
          -0.2,
          Math.sin(angle) * radius
        );
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        group.add(pillar);
        
        // Capiteles en los pilares
        const capGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 8);
        const capMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.set(
          Math.cos(angle) * radius,
          0.7,
          Math.sin(angle) * radius
        );
        cap.castShadow = true;
        cap.receiveShadow = true;
        group.add(cap);
      }
      
      // Estructura superior - como una corona
      const crownGeometry = new THREE.RingGeometry(0.8, 1.2, 12);
      const crownMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff6b35,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.set(0, 3.5, 0);
      crown.rotation.x = Math.PI / 2;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
      
      // Detalles finales - orbes flotantes
      for (let i = 0; i < 8; i++) {
        const orbGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const orbMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xffd700,
          transparent: true,
          opacity: 0.9
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        
        const angle = (i / 8) * Math.PI * 2;
        const height = 1.5 + Math.sin(i) * 0.5;
        const radius = 1.3;
        
        orb.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        orb.castShadow = true;
        group.add(orb);
      }
      
      // Guardar referencia del modelo
      modelRef.current = group;
      
      // Escalar y posicionar
      group.scale.setScalar(1.2);
      group.position.set(0, 0, -5);
      
      scene.add(group);
      
      console.log('✅ Modelo procedural Architectural Sculpture creado exitosamente');
      
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
