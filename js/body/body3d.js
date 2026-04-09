/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   ENGINE PRO — Medical-Grade 3D Anatomy & Shader Suite
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null, model: null,
  muscles: {},
  isInitialized: false,

  mapping: {
    'Pectoralis_Major': 'Pectoraux', 'Latissimus_Dorsi': 'Dos', 'Deltoid': 'Épaules',
    'Biceps_Brachii': 'Biceps', 'Triceps_Brachii': 'Triceps', 'Abdominal_Rectus': 'Abdominaux',
    'Quadriceps_Femoral': 'Quadriceps', 'Gluteus_Maximus': 'Fessiers', 'Gastrocnemius': 'Mollets',
    'Hamstrings': 'Ischios', 'Trapezius': 'Trapèzes', 'Forearms': 'Avant-bras', 'Lower_Back': 'Lombaires'
  },

  init: function() {
    if (this.isInitialized) return;
    var container = document.getElementById('body-3d-container');
    if (!container) return;

    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.2, 3.8);

      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        logarithmicDepthBuffer: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ReinhardToneMapping;
      this.renderer.toneMappingExposure = 1.2;
      container.appendChild(this.renderer.domElement);

      // Lights (Studio Rig)
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      var light1 = new THREE.DirectionalLight(0xffffff, 1.2);
      light1.position.set(2, 5, 5);
      this.scene.add(light1);
      
      var light2 = new THREE.PointLight(0x3b82f6, 1, 10);
      light2.position.set(-2, 1, 2);
      this.scene.add(light2);

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1.2;
        this.controls.maxDistance = 6;
        this.controls.target.set(0, 1, 0);
      }

      this.loadModel();
      this.isInitialized = true;
      this.animate();
      window.addEventListener('resize', () => this.onResize());

    } catch (e) {
      console.error("BODY3D Engine Error:", e);
      this.showErrorMessage("Échec du chargement du moteur 3D.");
    }
  },

  loadModel: function() {
    var self = this;
    var loader = (THREE.GLTFLoader) ? new THREE.GLTFLoader() : null;
    
    // High-Resolution Segmented Anatomy Model
    var modelUrl = 'https://cdn.jsdelivr.net/gh/hpfrei/body-anatomy-3d-viewer@main/public/models/body.glb';

    if (loader) {
      loader.load(modelUrl, 
        function(gltf) {
          self.model = gltf.scene;
          self.model.scale.set(1.15, 1.15, 1.15);
          self.model.position.y = -1.15;
          self.scene.add(self.model);

          self.model.traverse(node => {
            if (node.isMesh) {
              // Medical-Grade Subsurface Material
              node.material = new THREE.MeshPhysicalMaterial({
                color: 0x1a2235,
                metalness: 0.1,
                roughness: 0.6,
                transmission: 0,
                thickness: 0.5,
                emissive: new THREE.Color(0x000000),
                emissiveIntensity: 0
              });
              self.muscles[node.name] = node;
            }
          });
          document.getElementById('3d-loader').style.display = 'none';
          self.updateColors();
        },
        undefined,
        function(err) {
          console.warn("Retrying with backup model...");
          self.createFallbackMannequin();
        }
      );
    } else {
      this.createFallbackMannequin();
    }
  },

  createFallbackMannequin: function() {
    this.model = new THREE.Group();
    const createPart = (w, h, d, y, x, name) => {
      const geo = new THREE.CapsuleGeometry(w, h, 4, 16);
      const mat = new THREE.MeshPhysicalMaterial({ color: 0x1a2235, roughness: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0);
      mesh.name = name;
      this.muscles[name] = mesh;
      this.model.add(mesh);
    };

    createPart(0.15, 0.4, 0.1, 1.4, 0, 'Latissimus_Dorsi');
    createPart(0.08, 0.3, 0.08, 1.4, -0.3, 'Biceps_Brachii');
    createPart(0.08, 0.3, 0.08, 1.4, 0.3, 'Triceps_Brachii');
    createPart(0.12, 0.6, 0.12, 0.6, -0.15, 'Quadriceps_Femoral');
    createPart(0.12, 0.6, 0.12, 0.6, 0.15, 'Hamstrings');

    this.scene.add(this.model);
    document.getElementById('3d-loader').style.display = 'none';
    this.updateColors();
  },

  updateColors: function() {
    if (!this.model || !window.gsap) return;
    var self = this;
    
    Object.keys(this.mapping).forEach(meshName => {
      const group = self.mapping[meshName];
      const mesh = self.muscles[meshName];
      if (mesh && mesh.material) {
        const targetColor = new THREE.Color(tierCol(group));
        const count = seriesCountByGroup(group);
        
        // Smooth transition with GSAP
        gsap.to(mesh.material.color, {
          r: targetColor.r, g: targetColor.g, b: targetColor.b,
          duration: 1.5,
          ease: "power2.inOut"
        });

        if (count > 0) {
          gsap.to(mesh.material, {
            emissiveIntensity: 0.1 + Math.min(0.8, count / 150),
            duration: 2,
            ease: "sine.inOut"
          });
          mesh.material.emissive.copy(targetColor);
        }
      }
    });
  },

  showErrorMessage: function(msg) {
    const loader = document.getElementById('3d-loader');
    if (loader) {
      loader.innerHTML = `<div class="spinner"></div><p style="color:#ef4444; font-size:12px; margin-top:15px">${msg}</p>`;
      loader.style.display = 'flex';
    }
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
