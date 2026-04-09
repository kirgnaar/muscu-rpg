/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   ULTRA-LUXURY MEDICAL ENGINE (H-Res Humanoid & Procedural Glass Mannequin)
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null, model: null,
  muscles: {},
  isInitialized: false,
  loadTimeout: null,

  // Mapping optimisé pour une visualisation écorchée / stylisée
  mapping: {
    'Chest': 'Pectoraux', 'Back': 'Dos', 'Shoulders': 'Épaules',
    'Biceps': 'Biceps', 'Triceps': 'Triceps', 'Abs': 'Abdominaux',
    'Quads': 'Quadriceps', 'Glutes': 'Fessiers', 'Calves': 'Mollets',
    'Hams': 'Ischios', 'Traps': 'Trapèzes', 'Forearms': 'Avant-bras', 'LowerBack': 'Lombaires'
  },

  init: function() {
    if (this.isInitialized) return;
    var container = document.getElementById('body-3d-container');
    if (!container) return;

    try {
      // 1. Scene & Cinematic Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.4, 4.5);

      // 2. High-Performance Renderer
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        powerPreference: "high-performance",
        preserveDrawingBuffer: true
      });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(this.renderer.domElement);

      // 3. Studio Lighting (Medical Grade)
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      var topLight = new THREE.DirectionalLight(0xffffff, 1.2);
      topLight.position.set(2, 8, 5);
      this.scene.add(topLight);
      
      var sideLight = new THREE.PointLight(0x3b82f6, 1.5, 10);
      sideLight.position.set(-3, 2, 2);
      this.scene.add(sideLight);

      // 4. Advanced Orbit Controls
      if (window.OrbitControls) {
        this.controls = new window.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1.5;
        this.controls.maxDistance = 6;
        this.controls.target.set(0, 1.2, 0);
      }

      // 5. Start Load Pipeline
      this.startLoadPipeline();
      
      this.isInitialized = true;
      this.animate();
      window.addEventListener('resize', () => this.onResize());

    } catch (e) {
      console.error("BODY3D Luxury Engine Error:", e);
      this.showErrorMessage("Échec critique de l'initialisation 3D.");
    }
  },

  startLoadPipeline: function() {
    var self = this;
    // Timeout de sécurité : si le modèle externe ne charge pas en 5s, on passe au mannequin procédural
    this.loadTimeout = setTimeout(() => {
      if (!self.model) {
        console.warn("External model timed out. Switching to Procedural Glass Mannequin.");
        self.createGlassMannequin();
      }
    }, 5000);

    this.loadExternalModel();
  },

  loadExternalModel: function() {
    var self = this;
    var LoaderClass = window.GLTFLoader || THREE.GLTFLoader;
    if (!LoaderClass) return;

    var loader = new LoaderClass();
    // Utilisation d'un modèle humanoïde standard, extrêmement fiable (Standard Three.js Asset)
    var modelUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Xbot.glb';

    loader.load(modelUrl, 
      function(gltf) {
        clearTimeout(self.loadTimeout);
        self.model = gltf.scene;
        self.model.scale.set(1.2, 1.2, 1.2);
        self.model.position.y = 0;
        self.scene.add(self.model);

        self.model.traverse(node => {
          if (node.isMesh) {
            // "Cyber-Medical" Glass Material
            node.material = new THREE.MeshPhysicalMaterial({
              color: 0x1a2235,
              metalness: 0.9,
              roughness: 0.1,
              transparent: true,
              opacity: 0.6,
              transmission: 0.5,
              thickness: 1.0,
              emissive: new THREE.Color(0x000000),
              emissiveIntensity: 0
            });
            // On mappe les parties du Xbot sur nos groupes musculaires (simplifié)
            if (node.name.includes('Chest')) self.muscles['Chest'] = node;
            if (node.name.includes('Leg'))   self.muscles['Quads'] = node;
            if (node.name.includes('Arm'))   self.muscles['Biceps'] = node;
            if (node.name.includes('Back'))  self.muscles['Back'] = node;
            if (node.name.includes('Head'))  node.material.opacity = 0.3;
          }
        });
        document.getElementById('3d-loader').style.display = 'none';
        self.updateColors();
      },
      undefined,
      function(err) {
        console.warn("External model failed. Using Procedural Mannequin.");
        self.createGlassMannequin();
      }
    );
  },

  // LE CHEF-D'ŒUVRE : Un mannequin "Cristal" généré par code si le réseau flanche
  createGlassMannequin: function() {
    clearTimeout(this.loadTimeout);
    this.model = new THREE.Group();
    
    const createSegment = (w, h, y, x, z, name) => {
      const geo = new THREE.CapsuleGeometry(w, h, 8, 16);
      const mat = new THREE.MeshPhysicalMaterial({ 
        color: 0x22d3ee, 
        metalness: 0.8, 
        roughness: 0.1, 
        transparent: true, 
        opacity: 0.4,
        transmission: 0.8,
        thickness: 0.5
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.name = name;
      this.muscles[name] = mesh;
      this.model.add(mesh);
      return mesh;
    };

    // Human Anatomy Assembly (Architectural Style)
    createSegment(0.18, 0.5, 1.4, 0, 0, 'Chest');       // Torse Sup
    createSegment(0.15, 0.4, 1.0, 0, 0, 'Abs');         // Abdominaux
    createSegment(0.12, 0.3, 1.4, -0.35, 0, 'Biceps');  // Bras L
    createSegment(0.12, 0.3, 1.4, 0.35, 0, 'Triceps');  // Bras R
    createSegment(0.14, 0.6, 0.5, -0.18, 0, 'Quads');   // Jambe L
    createSegment(0.14, 0.6, 0.5, 0.18, 0, 'Hams');    // Jambe R
    
    // Head (Stylized Sphere)
    const headGeo = new THREE.IcosahedronGeometry(0.15, 2);
    const headMat = new THREE.MeshPhysicalMaterial({ color: 0x7a8aaa, transparent: true, opacity: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.9;
    this.model.add(head);

    this.scene.add(this.model);
    document.getElementById('3d-loader').style.display = 'none';
    this.updateColors();
  },

  updateColors: function() {
    if (!this.model || !window.gsap) return;
    var self = this;
    
    Object.keys(this.mapping).forEach(key => {
      const group = self.mapping[key];
      const mesh = self.muscles[key];
      if (mesh && mesh.material) {
        const targetColor = new THREE.Color(tierCol(group)); // tierCol from tiers.js
        const count = seriesCountByGroup(group);
        
        // Advanced GSAP Shader Interpolation
        gsap.to(mesh.material.color, {
          r: targetColor.r, g: targetColor.g, b: targetColor.b,
          duration: 1.2,
          ease: "expo.out"
        });

        if (count > 0) {
          gsap.to(mesh.material, {
            emissiveIntensity: 0.3 + Math.min(1.0, count / 100),
            opacity: 0.8,
            duration: 2,
            ease: "sine.inOut"
          });
          mesh.material.emissive.copy(targetColor);
        }
      }
    });
  },

  onResize: function() {
    var container = document.getElementById('body-3d-container');
    if (!container || !this.camera) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  },

  animate: function() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
};
