/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   Moteur 3D interactif (Three.js) — VERSION PRO (Z-Anatomy Data)
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
      this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.2, 4);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(this.renderer.domElement);

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      var dl = new THREE.DirectionalLight(0xffffff, 1.0);
      dl.position.set(5, 10, 7.5);
      this.scene.add(dl);

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1, 0);
      }

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
    
    // Nouveau modèle GLB ultra-fiable (Source: hpfrei / Z-Anatomy optimized)
    var modelUrl = 'https://cdn.jsdelivr.net/gh/hpfrei/body-anatomy-3d-viewer@main/public/models/body.glb';

    if (loader) {
      loader.load(modelUrl, 
        function(gltf) {
          self.model = gltf.scene;
          // Centrage et mise à l'échelle
          self.model.scale.set(1.2, 1.2, 1.2);
          self.model.position.y = -1.2; // Ajuster selon le modèle
          self.scene.add(self.model);

          self.model.traverse(node => {
            if (node.isMesh) {
              node.material = new THREE.MeshStandardMaterial({
                color: 0x2d3748,
                metalness: 0.2,
                roughness: 0.8
              });
              self.muscles[node.name] = node;
            }
          });
          document.getElementById('3d-loader').style.display = 'none';
          self.updateColors();
        },
        undefined,
        function(err) {
          console.warn("Modèle externe inaccessible, passage au mannequin de secours.");
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
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0);
      mesh.name = name;
      this.muscles[name] = mesh;
      this.model.add(mesh);
    };

    createPart(0.4, 0.6, 0.2, 1.3, 0, 'Latissimus_Dorsi'); // Torse
    createPart(0.3, 0.2, 0.1, 1.5, 0, 'Pectoralis_Major'); // Pecs
    createPart(0.12, 0.4, 0.1, 1.3, -0.3, 'Biceps_Brachii'); // Bras L
    createPart(0.12, 0.4, 0.1, 1.3, 0.3, 'Triceps_Brachii'); // Bras R
    createPart(0.18, 0.8, 0.18, 0.5, -0.15, 'Quadriceps_Femoral'); // Jambe L
    createPart(0.18, 0.8, 0.18, 0.5, 0.15, 'Hamstrings'); // Jambe R

    this.scene.add(this.model);
    document.getElementById('3d-loader').style.display = 'none';
    this.updateColors();
  },

  updateColors: function() {
    if (!this.model) return;
    var self = this;
    Object.keys(this.mapping).forEach(meshName => {
      const group = self.mapping[meshName];
      const mesh = self.muscles[meshName];
      if (mesh && mesh.material) {
        const colorHex = tierCol(group);
        mesh.material.color.set(colorHex);
        
        const count = seriesCountByGroup(group);
        if (count > 0) {
          mesh.material.emissive.set(colorHex);
          mesh.material.emissiveIntensity = 0.2 + Math.min(0.6, count / 200);
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
