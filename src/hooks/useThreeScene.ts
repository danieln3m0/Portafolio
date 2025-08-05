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
    const loader = new GLTFLoader();
    
    try {
      console.log('Intentando cargar modelo GLTF...');
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          '/skybrack/scene.gltf',
          resolve,
          (progress: any) => {
            console.log('Progreso de carga:', (progress.loaded / progress.total * 100) + '%');
          },
          reject
        );
      });

      console.log('Modelo GLTF cargado exitosamente');
      const model = (gltf as any).scene;
      
      // Guardar referencia del modelo
      modelRef.current = model;
      
      // Calcular el centro del modelo
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      
      // Centrar el modelo en el origen
      model.position.x = -center.x;
      model.position.y = -center.y;
      model.position.z = -center.z;
      
      // Escalar el modelo si es necesario
      model.scale.setScalar(6);
      
      // Posicionar el modelo centrado en la pantalla
      model.position.set(0, 0, -5);
      
      // Configurar sombras
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model);
      
      // Hacer una rotación inicial después de cargar
      setTimeout(() => {
        console.log('🎲 Ejecutando rotación inicial del modelo');
        rotateModelRandomly('hero');
      }, 1000);
      
    } catch (error) {
      console.warn('No se pudo cargar el modelo GLTF, usando cubo de respaldo:', error);
      
      // Cubo de respaldo naranja
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff8c00, // Naranja cálido
        shininess: 100 
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.position.set(0, 0, -5); // Centrado en la pantalla
      
      // Guardar referencia del cubo como modelo
      modelRef.current = cube;
      
      // Animación de rotación continua para el cubo
      const animateCube = () => {
        if (modelRef.current === cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }
        requestAnimationFrame(animateCube);
      };
      animateCube();
      
      scene.add(cube);
      
      // Hacer una rotación inicial después de cargar el cubo
      setTimeout(() => {
        console.log('🎲 Ejecutando rotación inicial del cubo');
        rotateModelRandomly('hero');
      }, 1000);
    }
  };

  const rotateModelRandomly = (section: string) => {
    console.log('🎲 rotateModelRandomly llamado para sección:', section);
    console.log('📦 modelRef.current:', !!modelRef.current);
    
    if (!modelRef.current) {
      console.warn('❌ No hay modelo disponible para rotar');
      return;
    }

    console.log('✅ Rotando modelo aleatoriamente para sección:', section);
    
    // Generar rotaciones aleatorias
    const randomX = (Math.random() - 0.5) * Math.PI * 0.5; // Rotación aleatoria en X (-45° a 45°)
    const randomY = Math.random() * Math.PI * 2; // Rotación completa en Y (0° a 360°)
    const randomZ = (Math.random() - 0.5) * Math.PI * 0.3; // Rotación pequeña en Z (-27° a 27°)
    
    console.log('🔄 Nuevas rotaciones:', { 
      x: randomX * (180/Math.PI), 
      y: randomY * (180/Math.PI), 
      z: randomZ * (180/Math.PI) 
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
    
    console.log('🎯 Rotación inicial:', startRotation);
    console.log('🎯 Rotación objetivo:', targetRotation);
    
    // Animación suave de rotación
    let progress = 0;
    const duration = 1000; // 1 segundo
    const startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Interpolación suave
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      if (modelRef.current) {
        modelRef.current.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easeProgress;
        modelRef.current.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * easeProgress;
        modelRef.current.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * easeProgress;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log('✅ Animación de rotación completada');
      }
    };
    
    animate();
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

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    console.log('📍 Sección cambiada a:', currentSection);
    rotateModelRandomly(currentSection);
  }, [currentSection]);

  return { isLoading, error };
};
