/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   HOLOGRAM ENGINE v4.0 — High-Compatibility Procedural Visualizer
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null,
  group: new THREE.Group(),
  muscles: {},
  isReady: false,

  mapping: {
    'pecs': 'Pectoraux', 'back': 'Dos', 'shoulders_l': 'Épaules', 'shoulders_r': 'Épaules',
    'biceps_l': 'Biceps', 'biceps_r': 'Biceps', 'triceps_l': 'Triceps', 'triceps_r': 'Triceps',
    'abs': 'Abdominaux', 'quads_l': 'Quadriceps', 'quads_r': 'Quadriceps', 'glutes': 'Fessiers',
    'calves_l': 'Mollets', 'calves_r': 'Mollets', 'hams_l': 'Ischio-jambiers', 'hams_r': 'Ischio-jambiers',
    'traps': 'Trapèzes', 'forearms_l': 'Avant-bras', 'forearms_r': 'Avant-bras', 'lumbars': 'Lombaires'
  },

  init: function() {
    if (this.isReady) return;
    var container = document.getElementById('body-3d-container');
    if (!container) return;

    // Check size — if hidden, it might be 0
    if (container.clientWidth === 0) {
      console.warn("BODY3D: Container hidden, delaying init.");
      return;
    }

    try {
      // 1. Scene Setup
      this.scene = new THREE.Scene();
      
      // Camera
      this.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.5, 5);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      // 2. Lighting
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      var light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(5, 5, 5);
      this.scene.add(light1);
      
      var light2 = new THREE.PointLight(0x3b82f6, 1, 10);
      light2.position.set(-3, 2, 2);
      this.scene.add(light2);

      // 3. Orbit Controls
      if (window.THREE && window.THREE.OrbitControls) {
        this.controls = new window.THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1.1, 0);
      } else if (window.OrbitControls) {
        this.controls = new window.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1.1, 0);
      }

      // 4. Construct Humanoid
      this.buildHumanoid();
      this.scene.add(this.group);

      // 5. Status
      var loader = document.getElementById('3d-loader');
      if (loader) loader.style.display = 'none';
      
      this.isReady = true;
      this.updateColors();
      this.animate();

      console.log("BODY3D: Procedural Mannequin Ready.");

    } catch (e) {
      console.error("BODY3D Init Error:", e);
      var loader = document.getElementById('3d-loader');
      if (loader) loader.innerHTML = `<p style="color:red; font-size:10px">GL_ERROR: ${e.message}</p>`;
    }
  },

  buildHumanoid: function() {
    const mat = (color) => new THREE.MeshStandardMaterial({
      color: color || 0x1a2235,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.6,
      emissive: color || 0x000000,
      emissiveIntensity: 0
    });

    const addPart = (geo, y, x, z, name) => {
      const mesh = new THREE.Mesh(geo, mat());
      mesh.position.set(x, y, z);
      mesh.name = name;
      this.muscles[name] = mesh;
      this.group.add(mesh);
      
      // Wireframe overlay for premium look
      const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x00f2ff, wireframe: true, transparent: true, opacity: 0.1 }));
      mesh.add(wire);
    };

    // --- Geometries ---
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const sphere = (r) => new THREE.SphereGeometry(r, 16, 16);

    // Torso
    addPart(box(0.4, 0.6, 0.2), 1.3, 0, 0, 'abs');
    addPart(box(0.45, 0.25, 0.12), 1.55, 0, 0.05, 'pecs');
    addPart(box(0.45, 0.5, 0.1), 1.35, 0, -0.1, 'back');
    
    // Arms
    addPart(sphere(0.12), 1.6, -0.28, 0, 'shoulders_l');
    addPart(sphere(0.12), 1.6, 0.28, 0, 'shoulders_r');
    addPart(box(0.1, 0.35, 0.1), 1.4, -0.35, 0, 'biceps_l');
    addPart(box(0.1, 0.35, 0.1), 1.4, 0.35, 0, 'triceps_r');
    
    // Legs
    addPart(box(0.18, 0.75, 0.18), 0.5, -0.18, 0, 'quads_l');
    addPart(box(0.18, 0.75, 0.18), 0.5, 0.18, 0, 'quads_r');
    addPart(box(0.12, 0.45, 0.12), -0.15, -0.2, 0, 'calves_l');
    addPart(box(0.12, 0.45, 0.12), -0.15, 0.2, 0, 'calves_r');

    // Head
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), mat(0x7a8aaa));
    head.position.y = 1.95;
    this.group.add(head);
  },

  updateColors: function() {
    if (!this.isReady || !window.gsap) return;
    
    Object.keys(this.mapping).forEach(key => {
      const group = this.mapping[key];
      const mesh = this.muscles[key];
      if (mesh && mesh.material) {
        const color = new THREE.Color(tierCol(group));
        const count = seriesCountByGroup(group);
        
        gsap.to(mesh.material.color, { r: color.r, g: color.g, b: color.b, duration: 1 });
        
        if (count > 0) {
          gsap.to(mesh.material, {
            opacity: 0.9,
            emissiveIntensity: 0.5 + Math.min(1.5, count / 50),
            duration: 1.5
          });
          mesh.material.emissive.copy(color);
        } else {
          gsap.to(mesh.material, { opacity: 0.4, emissiveIntensity: 0, duration: 1 });
        }
      }
    });
  },

  onResize: function() {
    var container = document.getElementById('body-3d-container');
    if (!container || !this.camera || !this.renderer) return;
    if (container.clientWidth === 0) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  },

  animate: function() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    
    // Floating movement
    this.group.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    this.group.rotation.y += 0.005;

    this.renderer.render(this.scene, this.camera);
  }
};
