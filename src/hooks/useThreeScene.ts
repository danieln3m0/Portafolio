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
    scene.add(spotLight);

    // Spotlight con color naranja para la paleta del usuario - fijo
    const coloredSpotLight = new THREE.SpotLight(0xff6b35, 80);
    coloredSpotLight.position.set(-2.5, 4, -2.5);
    coloredSpotLight.angle = Math.PI / 8;
    coloredSpotLight.penumbra = 0.8;
    coloredSpotLight.decay = 2;
    scene.add(coloredSpotLight);

    // Luz de relleno suave
    const fillLight = new THREE.DirectionalLight(0xff8c42, 0.3);
    fillLight.position.set(-5, -2, 5);
    scene.add(fillLight);
  };

  const loadModel = async (scene: any, THREE: any, GLTFLoader: any) => {
    console.log('🚀 Cargando modelo GLTF real con manejo de CORS');
    
    try {
      // URLs directas de Netlify
      const gltfUrl = 'https://jovial-tanuki-bee826.netlify.app/scene.gltf';
      const binUrl = 'https://jovial-tanuki-bee826.netlify.app/scene.bin';
      
      console.log('📥 Descargando archivos GLTF manualmente...');
      
      // Descargar el archivo GLTF manualmente
      const gltfResponse = await fetch(gltfUrl, {
        mode: 'cors', // Intentar CORS primero
        headers: {
          'Accept': 'application/json, model/gltf+json, */*'
        }
      }).catch(async () => {
        // Si CORS falla, usar proxy público
        console.log('🔄 CORS falló, intentando con proxy público...');
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(gltfUrl)}`;
        return await fetch(proxyUrl);
      });
      
      if (!gltfResponse.ok) {
        throw new Error(`No se pudo descargar GLTF: ${gltfResponse.status}`);
      }
      
      const gltfText = await gltfResponse.text();
      const gltfData = JSON.parse(gltfText);
      
      console.log('✅ Archivo GLTF descargado y parseado');
      
      // Descargar el archivo binario manualmente
      const binResponse = await fetch(binUrl, {
        mode: 'cors'
      }).catch(async () => {
        // Si CORS falla, usar proxy público
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(binUrl)}`;
        return await fetch(proxyUrl);
      });
      
      if (!binResponse.ok) {
        throw new Error(`No se pudo descargar BIN: ${binResponse.status}`);
      }
      
      const binData = await binResponse.arrayBuffer();
      console.log('✅ Archivo binario descargado:', binData.byteLength, 'bytes');
      
      // Crear un blob URL para el archivo binario
      const binBlob = new Blob([binData], { type: 'application/octet-stream' });
      const binBlobUrl = URL.createObjectURL(binBlob);
      
      // Modificar las referencias en el GLTF para usar el blob URL
      if (gltfData.buffers) {
        gltfData.buffers = gltfData.buffers.map((buffer: any) => {
          if (buffer.uri && buffer.uri.includes('scene.bin')) {
            return {
              ...buffer,
              uri: binBlobUrl
            };
          }
          return buffer;
        });
      }
      
      // Crear un blob URL para el archivo GLTF modificado
      const modifiedGltfText = JSON.stringify(gltfData);
      const gltfBlob = new Blob([modifiedGltfText], { type: 'model/gltf+json' });
      const gltfBlobUrl = URL.createObjectURL(gltfBlob);
      
      console.log('🔧 Archivos convertidos a blob URLs, cargando con GLTFLoader...');
      
      // Cargar usando GLTFLoader con el blob URL
      const loader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          gltfBlobUrl,
          (loadedGltf: any) => {
            console.log('✅ Modelo GLTF cargado exitosamente desde blob URLs');
            resolve(loadedGltf);
          },
          (progress: any) => {
            if (progress.total > 0) {
              const percentage = (progress.loaded / progress.total * 100).toFixed(1);
              console.log('📊 Progreso de carga:', percentage + '%');
            }
          },
          (error: any) => {
            console.error('❌ Error cargando modelo GLTF desde blob:', error);
            reject(error);
          }
        );
      });

      // Limpiar blob URLs para evitar memory leaks
      URL.revokeObjectURL(gltfBlobUrl);
      URL.revokeObjectURL(binBlobUrl);

      console.log('✅ Modelo GLTF procesado correctamente');
      const model = (gltf as any).scene;
      
      // Guardar referencia del modelo
      modelRef.current = model;
      
      // Calcular el centro del modelo para posicionarlo correctamente
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      console.log('📐 Dimensiones del modelo:', {
        width: size.x.toFixed(2),
        height: size.y.toFixed(2),
        depth: size.z.toFixed(2)
      });
      
      // Centrar el modelo en el origen
      model.position.x = -center.x;
      model.position.y = -center.y;
      model.position.z = -center.z;
      
      // Escalar el modelo basado en su tamaño
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 19; // Tamaño objetivo
      const scale = targetSize / maxDimension;
      model.scale.setScalar(scale);
      
      console.log('🎯 Escala aplicada:', scale.toFixed(3));
      
      // Posicionar el modelo en la escena
      model.position.set(0, 0, -5);
      
      // Configurar materiales para todos los meshes del modelo
      model.traverse((child: any) => {
        if (child.isMesh) {
          // Mejorar los materiales para mejor iluminación
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });

      scene.add(model);
      
      console.log('✅ Modelo GLTF real añadido a la escena');
      
      // Hacer una rotación inicial después de cargar
      setTimeout(() => {
        console.log('🎲 Ejecutando rotación inicial del modelo GLTF');
        rotateModelRandomly();
      }, 1000);
      
    } catch (error) {
      console.warn('❌ No se pudo cargar el modelo GLTF, usando modelo procedural de respaldo:', error);
      
      // Fallback: usar el modelo procedural arquitectónico
      const group = new THREE.Group();
      
      // Escultura principal - estructura compleja tipo "Lucy" pero procedural
      const sculptureGeometry = new THREE.ConeGeometry(0.8, 4, 12);
      const sculptureMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff6b35,
        transparent: false
      });
      
      const mainSculpture = new THREE.Mesh(sculptureGeometry, sculptureMaterial);
      mainSculpture.position.set(0, 0, 0);
      group.add(mainSculpture);
      
      // Torre principal
      const towerGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2.5, 8);
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xff8c42 });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      tower.position.set(0, 2.5, 0);
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
        group.add(cap);
      }
      
      // Guardar referencia del modelo de respaldo
      modelRef.current = group;
      
      // Escalar y posicionar
      group.scale.setScalar(1.2);
      group.position.set(0, 0, -5);
      
      scene.add(group);
      
      console.log('✅ Modelo procedural de respaldo creado');
      
      setTimeout(() => {
        console.log('🎲 Ejecutando rotación inicial del modelo de respaldo');
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
