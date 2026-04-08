/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   Moteur 3D interactif (Three.js) pour la visualisation anatomique
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  model: null,
  muscles: {},

  // Mapping étendu pour un modèle anatomique standard
  mapping: {
    'Pectoralis_Major': 'Pectoraux',
    'Latissimus_Dorsi': 'Dos',
    'Deltoid': 'Épaules',
    'Biceps_Brachii': 'Biceps',
    'Triceps_Brachii': 'Triceps',
    'Abdominal_Rectus': 'Abdominaux',
    'Quadriceps_Femoral': 'Quadriceps',
    'Gluteus_Maximus': 'Fessiers',
    'Gastrocnemius': 'Mollets',
    'Hamstrings': 'Ischios',
    'Trapezius': 'Trapèzes',
    'Forearms': 'Avant-bras',
    'Lower_Back': 'Lombaires'
  },

  init: function() {
    var container = document.getElementById('body-3d-container');
    if (!container) return;

    // 1. Scène & Caméra
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 1.2, 3);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // 3. Lumières
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
    var backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 2, -5);
    this.scene.add(backLight);

    // 4. Contrôles (OrbitControls via CDN)
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.minDistance = 1.2;
      this.controls.maxDistance = 4;
      this.controls.target.set(0, 1, 0);
    }

    // 5. Chargement du modèle (GLTFLoader via CDN)
    var self = this;
    if (typeof THREE.GLTFLoader !== 'undefined') {
      var loader = new THREE.GLTFLoader();
      // Modèle de base (placeholder) - À remplacer par un vrai modèle anatomique .glb
      var modelUrl = 'https://raw.githubusercontent.com/pmndrs/drei-assets/master/meat.glb';

      loader.load(modelUrl, function(gltf) {
        self.model = gltf.scene;
        self.model.scale.set(1.5, 1.5, 1.5);
        self.model.position.y = 0;
        self.scene.add(self.model);

        self.model.traverse(function(node) {
          if (node.isMesh) {
            node.material = node.material.clone();
            self.muscles[node.name] = node;
          }
        });

        var loaderEl = document.getElementById('3d-loader');
        if (loaderEl) loaderEl.style.display = 'none';
        
        self.updateColors();
        self.animate();
      }, undefined, function(error) {
        console.error('Erreur chargement 3D:', error);
        var loaderEl = document.getElementById('3d-loader');
        if (loaderEl) loaderEl.innerHTML = '<p style="color:#ef4444">Erreur de chargement 3D</p>';
      });
    }

    window.addEventListener('resize', function() {
      self.onResize();
    });
  },

  updateColors: function() {
    if (!this.model) return;
    var self = this;

    Object.keys(this.mapping).forEach(function(meshName) {
      var groupName = self.mapping[meshName];
      var mesh = self.muscles[meshName];

      if (mesh) {
        var colorHex = tierCol(groupName); // Fonction définie dans tiers.js
        mesh.material.color.set(colorHex);
        
        // Brillance proportionnelle au volume
        var count = seriesCountByGroup(groupName);
        if (mesh.material.emissive) {
            mesh.material.emissive.set(colorHex);
            mesh.material.emissiveIntensity = Math.min(0.5, count / 200);
        }
      }
    });
  },

  onResize: function() {
    var container = document.getElementById('body-3d-container');
    if (!container) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  },

  animate: function() {
    var self = this;
    requestAnimationFrame(function() {
      self.animate();
    });
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
};
