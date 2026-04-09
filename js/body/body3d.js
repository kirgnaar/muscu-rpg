/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   ENGINE v4.2 — Ultra-Stable Athletic Mannequin (Procedural + Safety Fallbacks)
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null,
  group: new THREE.Group(),
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
    if (!container || container.clientWidth === 0) return;

    try {
      // 1. Core Three.js Setup
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.5, 5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      // 2. Lighting (Athletic Rig)
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      var light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(5, 5, 5);
      this.scene.add(light1);
      
      var light2 = new THREE.PointLight(0x00f2ff, 1, 10);
      light2.position.set(-3, 2, 2);
      this.scene.add(light2);

      // 3. Orbit Controls (Safe loading)
      var OrbitControlsClass = window.THREE.OrbitControls || window.OrbitControls;
      if (OrbitControlsClass) {
        this.controls = new OrbitControlsClass(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1.1, 0);
      }

      // 4. Build Athletic Procedural Mannequin (Using only stable Cylinder/Sphere)
      this.buildAthleticBody();
      this.scene.add(this.group);

      // 5. Hide Loader & Fallback
      var loader = document.getElementById('3d-loader');
      if (loader) loader.style.display = 'none';
      var fallback = document.getElementById('body-svg-fallback');
      if (fallback) fallback.style.display = 'none';
      
      this.isInitialized = true;
      this.updateColors();
      this.animate();

      // Hook force button
      var btn = document.getElementById('btn-force-3d');
      if (btn) btn.onclick = () => { this.isInitialized = false; this.init(); };

      window.addEventListener('resize', () => this.onResize());
      console.log("ENGINE 4.2: STABLE_BUILD_SUCCESS");

    } catch (e) {
      console.error("ENGINE 4.2 Error:", e);
    }
  },

  buildAthleticBody: function() {
    const athleticMat = () => new THREE.MeshStandardMaterial({
      color: 0x2d3748, metalness: 0.8, roughness: 0.2,
      transparent: true, opacity: 0.8, emissive: 0x000000, emissiveIntensity: 0
    });

    const addPart = (geo, y, x, z, rx, rz, name) => {
      const mesh = new THREE.Mesh(geo, athleticMat());
      mesh.position.set(x, y, z);
      if (rx) mesh.rotation.x = rx;
      if (rz) mesh.rotation.z = rz;
      mesh.name = name;
      this.muscles[name] = mesh;
      this.group.add(mesh);
      
      // Wireframe for detail
      const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.05 }));
      mesh.add(wire);
    };

    // Geometries
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const cyl = (rt, rb, h) => new THREE.CylinderGeometry(rt, rb, h, 16);
    const sph = (r) => new THREE.SphereGeometry(r, 16, 16);

    // --- ATHLETIC ASSEMBLY (Ref: User Image) ---
    // Core & Torso (V-Taper)
    addPart(box(0.25, 0.5, 0.15), 1.1, 0, 0, 0, 0, 'abs'); // Lower Abs
    addPart(cyl(0.45, 0.35, 0.4), 1.5, 0, 0, 0, 0, 'pecs'); // Upper Torso
    addPart(box(0.45, 0.6, 0.1), 1.35, 0, -0.08, 0, 0, 'back'); // Back
    
    // Shoulders & Arms
    addPart(sph(0.12), 1.6, -0.28, 0, 0, 0, 'shoulders_l');
    addPart(sph(0.12), 1.6, 0.28, 0, 0, 0, 'shoulders_r');
    addPart(cyl(0.07, 0.06, 0.35), 1.4, -0.35, 0, 0, 0.2, 'biceps_l');
    addPart(cyl(0.07, 0.06, 0.35), 1.4, 0.35, 0, 0, -0.2, 'biceps_r');
    
    // Legs (Strong Quads)
    addPart(cyl(0.16, 0.12, 0.7), 0.5, -0.18, 0, 0, 0.05, 'quads_l');
    addPart(cyl(0.16, 0.12, 0.7), 0.5, 0.18, 0, 0, -0.05, 'quads_r');
    addPart(cyl(0.1, 0.08, 0.4), -0.15, -0.2, 0, 0, 0.02, 'calves_l');
    addPart(cyl(0.1, 0.08, 0.4), -0.15, 0.2, 0, 0, -0.02, 'calves_r');

    // Head
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), athleticMat());
    head.position.y = 1.95;
    this.group.add(head);
  },

  updateColors: function() {
    if (!this.isInitialized || !window.gsap) return;
    Object.keys(this.mapping).forEach(key => {
      const group = this.mapping[key];
      const mesh = this.muscles[key];
      if (mesh && mesh.material) {
        const color = new THREE.Color(tierCol(group));
        const count = seriesCountByGroup(group);
        gsap.to(mesh.material.color, { r: color.r, g: color.g, b: color.b, duration: 1 });
        if (count > 0) {
          gsap.to(mesh.material, { emissiveIntensity: 0.5 + Math.min(1.0, count / 50), opacity: 1, duration: 1.5 });
          mesh.material.emissive.copy(color);
        } else {
          gsap.to(mesh.material, { opacity: 0.6, emissiveIntensity: 0, duration: 1 });
        }
      }
    });
  },

  onResize: function() {
    var container = document.getElementById('body-3d-container');
    if (!container || !this.camera || !this.renderer || container.clientWidth === 0) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  },

  animate: function() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    this.group.rotation.y += 0.005;
    this.renderer.render(this.scene, this.camera);
  }
};
