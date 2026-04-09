/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   THE ARCHITECT v2.1 — Pure Mathematical 3D Anatomy (No Assets, High Compatibility)
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null,
  model: new THREE.Group(),
  muscles: {},
  isInitialized: false,

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
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.6, 5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(this.renderer.domElement);

      // Studio Lighting
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.25));
      var l1 = new THREE.DirectionalLight(0x3b82f6, 1.5);
      l1.position.set(5, 5, 5);
      this.scene.add(l1);
      var l2 = new THREE.PointLight(0x22d3ee, 1.2, 15);
      l2.position.set(-3, 2, 3);
      this.scene.add(l2);

      if (window.OrbitControls) {
        this.controls = new window.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 1.1, 0);
      }

      this.buildHumanoid();
      this.scene.add(this.model);
      
      document.getElementById('3d-loader').style.display = 'none';
      this.isInitialized = true;
      
      this.updateColors();
      this.animate();
      
      window.addEventListener('resize', () => this.onResize());
    } catch (e) {
      console.error("BODY3D Error:", e);
    }
  },

  // Création d'une capsule personnalisée (Compatible toutes versions)
  createCapsuleGeo: function(radius, height) {
    const points = [];
    for (let i = 0; i <= 18; i++) {
      const angle = (i / 18) * Math.PI;
      const x = radius * Math.sin(angle);
      const y = radius * Math.cos(angle) + (i <= 9 ? height / 2 : -height / 2);
      points.push(new THREE.Vector2(x, y));
    }
    return new THREE.LatheGeometry(points, 20);
  },

  buildHumanoid: function() {
    const glassMat = () => new THREE.MeshPhysicalMaterial({
      color: 0x1a2235, metalness: 0.95, roughness: 0.05,
      transparent: true, opacity: 0.4, transmission: 0.8, thickness: 1.5,
      emissive: new THREE.Color(0x000000), emissiveIntensity: 0
    });

    const addPart = (geo, y, x, z, rx, ry, rz, name) => {
      const mesh = new THREE.Mesh(geo, glassMat());
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx || 0, ry || 0, rz || 0);
      mesh.name = name;
      this.muscles[name] = mesh;
      this.model.add(mesh);
    };

    // --- BUSTE ---
    addPart(this.createCapsuleGeo(0.2, 0.45), 1.3, 0, 0, 0, 0, 0, 'abs');
    addPart(new THREE.BoxGeometry(0.42, 0.22, 0.12), 1.55, 0, 0.06, 0.1, 0, 0, 'pecs');
    addPart(new THREE.BoxGeometry(0.42, 0.48, 0.08), 1.35, 0, -0.08, -0.1, 0, 0, 'back');
    addPart(this.createCapsuleGeo(0.08, 0.12), 1.1, 0, -0.1, 0, 0, 0, 'lumbars');
    addPart(this.createCapsuleGeo(0.1, 0.08), 1.7, 0, -0.04, 0, 0, 0, 'traps');

    // --- BRAS ---
    addPart(new THREE.SphereGeometry(0.11, 16, 16), 1.6, -0.26, 0, 0, 0, 0, 'shoulders_l');
    addPart(new THREE.SphereGeometry(0.11, 16, 16), 1.6, 0.26, 0, 0, 0, 0, 'shoulders_r');
    addPart(this.createCapsuleGeo(0.07, 0.22), 1.4, -0.32, 0, 0, 0, 0.2, 'biceps_l');
    addPart(this.createCapsuleGeo(0.07, 0.22), 1.4, 0.32, 0, 0, 0, -0.2, 'biceps_r');
    addPart(this.createCapsuleGeo(0.06, 0.22), 1.1, -0.38, 0, 0, 0, 0.1, 'forearms_l');
    addPart(this.createCapsuleGeo(0.06, 0.22), 1.1, 0.38, 0, 0, 0, -0.1, 'forearms_r');

    // --- JAMBES ---
    addPart(new THREE.SphereGeometry(0.16, 16, 12), 0.9, 0, -0.08, 0, 0, 0, 'glutes');
    addPart(this.createCapsuleGeo(0.13, 0.45), 0.5, -0.16, 0, 0, 0, 0.05, 'quads_l');
    addPart(this.createCapsuleGeo(0.13, 0.45), 0.5, 0.16, 0, 0, 0, -0.05, 'quads_r');
    addPart(this.createCapsuleGeo(0.09, 0.35), -0.1, -0.18, 0, 0, 0, 0.02, 'calves_l');
    addPart(this.createCapsuleGeo(0.09, 0.35), -0.1, 0.18, 0, 0, 0, -0.02, 'calves_r');

    // Tête
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 2), glassMat());
    head.position.y = 1.92;
    head.material.opacity = 0.2;
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
        gsap.to(mesh.material.color, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 1 });
        if (count > 0) {
          gsap.to(mesh.material, { emissiveIntensity: 0.4 + Math.min(1.2, count / 60), opacity: 0.85, duration: 1.5 });
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
