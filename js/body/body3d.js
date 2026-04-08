/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   Moteur 3D interactif (Three.js) — VERSION RENFORCÉE AVEC FALLBACK
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null, model: null,
  muscles: {},
  isInitialized: false,

  // Mapping simple (on colorera tout ce qu'on trouve si possible)
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
      // 1. Initialisation de base
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.2, 3.5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(this.renderer.domElement);

      // Lumières
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      var dl = new THREE.DirectionalLight(0xffffff, 0.8);
      dl.position.set(5, 10, 7.5);
      this.scene.add(dl);

      // 2. Contrôles
      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1, 0);
      }

      // 3. Tentative chargement modèle GLB
      this.loadModel();
      
      this.isInitialized = true;
      this.animate();
      window.addEventListener('resize', () => this.onResize());

    } catch (e) {
      console.error("BODY3D Error:", e);
      this.showErrorMessage("Erreur d'initialisation 3D.");
    }
  },

  loadModel: function() {
    var self = this;
    var loader = (THREE.GLTFLoader) ? new THREE.GLTFLoader() : null;
    
    // URL via CDN plus stable (modèle anatomique low poly)
    var modelUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/meat.glb';

    if (loader) {
      loader.load(modelUrl, 
        function(gltf) {
          self.model = gltf.scene;
          self.model.scale.set(1.5, 1.5, 1.5);
          self.scene.add(self.model);
          self.model.traverse(node => {
            if (node.isMesh) {
              node.material = node.material.clone();
              self.muscles[node.name] = node;
            }
          });
          document.getElementById('3d-loader').style.display = 'none';
          self.updateColors();
        },
        undefined,
        function(err) {
          console.warn("GLB non chargé, utilisation du mannequin de secours.");
          self.createFallbackMannequin();
        }
      );
    } else {
      this.createFallbackMannequin();
    }
  },

  // Création d'un mannequin simple (boîtes/sphères) si le modèle GLB échoue
  createFallbackMannequin: function() {
    this.model = new THREE.Group();
    
    const createPart = (w, h, d, y, name) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = y;
      mesh.name = name;
      this.muscles[name] = mesh;
      this.model.add(mesh);
    };

    // Parties simplifiées mappées sur nos groupes
    createPart(0.4, 0.6, 0.2, 1.3, 'Dos');       // Buste
    createPart(0.15, 0.4, 0.1, 1.3, 'Biceps');   // Bras gauche
    createPart(0.15, 0.4, 0.1, 1.3, 'Triceps');  // Bras droit (simplifié)
    createPart(0.2, 0.7, 0.15, 0.6, 'Quadriceps'); // Jambe gauche
    createPart(0.2, 0.7, 0.15, 0.6, 'Mollets');    // Jambe droite (simplifié)

    this.scene.add(this.model);
    document.getElementById('3d-loader').style.display = 'none';
    this.updateColors();
  },

  updateColors: function() {
    if (!this.model) return;
    Object.keys(this.mapping).forEach(meshName => {
      const group = this.mapping[meshName];
      const mesh = this.muscles[meshName];
      if (mesh && mesh.material) {
        const color = tierCol(group);
        mesh.material.color.set(color);
        if (mesh.material.emissive) {
          mesh.material.emissive.set(color);
          mesh.material.emissiveIntensity = 0.2;
        }
      }
    });
  },

  showErrorMessage: function(msg) {
    const loader = document.getElementById('3d-loader');
    if (loader) {
      loader.innerHTML = `<p style="color:#ef4444; font-size:12px">${msg}</p>`;
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
