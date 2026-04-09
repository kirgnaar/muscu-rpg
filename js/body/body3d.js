/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   THE ARCHITECT — Pure Procedural 3D Anatomy Engine (No External Assets)
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null,
  model: new THREE.Group(),
  muscles: {},
  isInitialized: false,

  // Mapping précis des segments géométriques aux groupes Muscu-RPG
  mapping: {
    'pecs': 'Pectoraux', 'back': 'Dos', 'shoulders_l': 'Épaules', 'shoulders_r': 'Épaules',
    'biceps_l': 'Biceps', 'biceps_r': 'Biceps', 'triceps_l': 'Triceps', 'triceps_r': 'Triceps',
    'abs': 'Abdominaux', 'quads_l': 'Quadriceps', 'quads_r': 'Quadriceps', 'glutes': 'Fessiers',
    'calves_l': 'Mollets', 'calves_r': 'Mollets', 'hams_l': 'Ischio-jambiers', 'hams_r': 'Ischio-jambiers',
    'traps': 'Trapèzes', 'forearms_l': 'Avant-bras', 'forearms_r': 'Avant-bras', 'lumbars': 'Lombaires'
  },

  init: function() {
    if (this.isInitialized) return;
    var container = document.getElementById('body-3d-container');
    if (!container) return;

    try {
      // 1. Setup Scene (Cinematic Dark)
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.5, 5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.appendChild(this.renderer.domElement);

      // 2. Lighting (Medical Studio)
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));
      var l1 = new THREE.DirectionalLight(0x3b82f6, 1);
      l1.position.set(5, 5, 5);
      this.scene.add(l1);
      var l2 = new THREE.PointLight(0xffffff, 1);
      l2.position.set(-5, 2, 2);
      this.scene.add(l2);

      // 3. Controls
      if (window.OrbitControls) {
        this.controls = new window.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 1, 0);
      }

      // 4. Construction Procédrale du Corps (Garantie 100% sans chargement externe)
      this.buildHumanoid();
      
      this.scene.add(this.model);
      document.getElementById('3d-loader').style.display = 'none';
      this.isInitialized = true;
      
      this.updateColors();
      this.animate();
      
      window.addEventListener('resize', () => this.onResize());
      console.log("BODY3D: Procedural Engine Online.");

    } catch (e) {
      console.error("BODY3D: Initialization Failed", e);
      document.getElementById('3d-loader').innerHTML = "<p style='color:red'>WebGL Error: " + e.message + "</p>";
    }
  },

  // Architecture Anatomique Mathématique
  buildHumanoid: function() {
    const glassMat = (color) => new THREE.MeshPhysicalMaterial({
      color: color || 0x1a2235,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.5,
      transmission: 0.7,
      thickness: 1,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0
    });

    const addPart = (geo, y, x, z, rx, ry, rz, name) => {
      const mesh = new THREE.Mesh(geo, glassMat());
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx || 0, ry || 0, rz || 0);
      mesh.name = name;
      this.muscles[name] = mesh;
      this.model.add(mesh);
    };

    // --- BUSTE & TRONC ---
    addPart(new THREE.CapsuleGeometry(0.22, 0.5, 8, 16), 1.3, 0, 0, 0, 0, 0, 'abs'); // Abdominaux / Tronc
    addPart(new THREE.BoxGeometry(0.45, 0.25, 0.15), 1.55, 0, 0.05, 0.1, 0, 0, 'pecs'); // Pectoraux
    addPart(new THREE.BoxGeometry(0.45, 0.5, 0.1), 1.35, 0, -0.1, -0.1, 0, 0, 'back'); // Dos
    addPart(new THREE.CapsuleGeometry(0.1, 0.15, 4, 8), 1.1, 0, -0.12, 0, 0, 0, 'lumbars'); // Lombaires
    addPart(new THREE.CapsuleGeometry(0.12, 0.1, 4, 8), 1.7, 0, -0.05, 0, 0, 0, 'traps'); // Trapèzes

    // --- BRAS ---
    // Épaules
    addPart(new THREE.SphereGeometry(0.12, 16, 16), 1.6, -0.28, 0, 0, 0, 0, 'shoulders_l');
    addPart(new THREE.SphereGeometry(0.12, 16, 16), 1.6, 0.28, 0, 0, 0, 0, 'shoulders_r');
    // Biceps / Triceps
    addPart(new THREE.CapsuleGeometry(0.08, 0.25, 4, 12), 1.4, -0.35, 0, 0, 0, 0.2, 'biceps_l');
    addPart(new THREE.CapsuleGeometry(0.08, 0.25, 4, 12), 1.4, 0.35, 0, 0, 0, -0.2, 'biceps_r');
    addPart(new THREE.CapsuleGeometry(0.07, 0.25, 4, 12), 1.1, -0.42, 0, 0, 0, 0.1, 'forearms_l');
    addPart(new THREE.CapsuleGeometry(0.07, 0.25, 4, 12), 1.1, 0.42, 0, 0, 0, -0.1, 'forearms_r');

    // --- JAMBES ---
    // Fessiers
    addPart(new THREE.SphereGeometry(0.18, 16, 12), 0.9, 0, -0.1, 0, 0, 0, 'glutes');
    // Cuisses
    addPart(new THREE.CapsuleGeometry(0.14, 0.5, 4, 12), 0.5, -0.18, 0, 0, 0, 0.05, 'quads_l');
    addPart(new THREE.CapsuleGeometry(0.14, 0.5, 4, 12), 0.5, 0.18, 0, 0, 0, -0.05, 'quads_r');
    // Mollets
    addPart(new THREE.CapsuleGeometry(0.1, 0.4, 4, 12), -0.1, -0.2, 0, 0, 0, 0.02, 'calves_l');
    addPart(new THREE.CapsuleGeometry(0.1, 0.4, 4, 12), -0.1, 0.2, 0, 0, 0, -0.02, 'calves_r');

    // --- TÊTE (Purely Visual) ---
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 2), glassMat(0x7a8aaa));
    head.position.y = 1.95;
    this.model.add(head);
  },

  updateColors: function() {
    if (!this.isInitialized || !window.gsap) return;
    
    Object.keys(this.mapping).forEach(key => {
      const group = this.mapping[key];
      const mesh = this.muscles[key];
      if (mesh && mesh.material) {
        const targetColor = new THREE.Color(tierCol(group));
        const count = seriesCountByGroup(group);
        
        // Animation Fluide GSAP (High-End Rendering)
        gsap.to(mesh.material.color, {
          r: targetColor.r, g: targetColor.g, b: targetColor.b,
          duration: 1,
          ease: "power2.out"
        });

        if (count > 0) {
          gsap.to(mesh.material, {
            emissiveIntensity: 0.2 + Math.min(1.2, count / 80),
            opacity: 0.8,
            duration: 1.5,
            ease: "sine.inOut"
          });
          mesh.material.emissive.copy(targetColor);
        } else {
          gsap.to(mesh.material, { emissiveIntensity: 0, opacity: 0.4, duration: 1 });
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
