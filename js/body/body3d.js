/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   HOLOGRAM ENGINE v3.0 — The Indestructible Procedural Core
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null,
  group: new THREE.Group(),
  muscles: {},
  isReady: false,

  // Mapping direct vers les segments géométriques
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

    try {
      // 1. Scene Setup
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.5, 5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      // 2. Lighting (Neon Rig)
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.1));
      var light1 = new THREE.DirectionalLight(0x00f2ff, 1);
      light1.position.set(5, 5, 5);
      this.scene.add(light1);
      
      // 3. Orbit Controls
      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 1.1, 0);
      }

      // 4. Construct Holographic Body
      this.buildHologram();
      this.scene.add(this.group);

      // 5. Success
      document.getElementById('3d-loader').style.display = 'none';
      this.isReady = true;
      this.updateColors();
      this.animate();

      window.addEventListener('resize', () => this.onResize());
      console.log("Hologram Engine: ONLINE");

    } catch (e) {
      console.error("Hologram Init Error:", e);
      document.getElementById('3d-loader').innerHTML = `<p style="color:#ff3e3e; font-size:10px">SYSTEM_FAILURE: ${e.message}</p>`;
    }
  },

  buildHologram: function() {
    // Matériau Holographique Universel (Fil de fer + Lueur)
    const createHoloMat = (color) => {
      return new THREE.MeshLambertMaterial({
        color: color || 0x00f2ff,
        transparent: true,
        opacity: 0.4,
        wireframe: false,
        emissive: color || 0x00f2ff,
        emissiveIntensity: 0.2
      });
    };

    const addPart = (geo, y, x, z, name) => {
      const mesh = new THREE.Mesh(geo, createHoloMat());
      mesh.position.set(x, y, z);
      mesh.name = name;
      this.muscles[name] = mesh;
      this.group.add(mesh);
      
      // Bordures lumineuses (Outline)
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.3 }));
      mesh.add(line);
    };

    // --- CONSTRUCTION ANATOMIQUE ---
    const sphere = (r) => new THREE.SphereGeometry(r, 16, 16);
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

    // Torse & Core
    addPart(box(0.4, 0.6, 0.2), 1.3, 0, 0, 'abs');
    addPart(box(0.45, 0.25, 0.15), 1.55, 0, 0.05, 'pecs');
    addPart(box(0.45, 0.5, 0.1), 1.35, 0, -0.1, 'back');
    
    // Bras
    addPart(sphere(0.12), 1.6, -0.28, 0, 'shoulders_l');
    addPart(sphere(0.12), 1.6, 0.28, 0, 'shoulders_r');
    addPart(box(0.1, 0.3, 0.1), 1.4, -0.35, 0, 'biceps_l');
    addPart(box(0.1, 0.3, 0.1), 1.4, 0.35, 0, 'triceps_r');
    
    // Jambes
    addPart(box(0.18, 0.7, 0.18), 0.5, -0.18, 0, 'quads_l');
    addPart(box(0.18, 0.7, 0.18), 0.5, 0.18, 0, 'quads_r');
    addPart(box(0.12, 0.4, 0.12), -0.1, -0.2, 0, 'calves_l');
    addPart(box(0.12, 0.4, 0.12), -0.1, 0.2, 0, 'calves_r');

    // Tête
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), createHoloMat(0x7a8aaa));
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
            opacity: 0.8,
            emissiveIntensity: 0.5 + Math.min(1.5, count / 50),
            duration: 1.5
          });
          mesh.material.emissive.copy(color);
        } else {
          gsap.to(mesh.material, { opacity: 0.2, emissiveIntensity: 0.1, duration: 1 });
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
    
    // Floating Animation
    this.group.position.y = Math.sin(Date.now() * 0.002) * 0.05;
    this.group.rotation.y += 0.005;

    this.renderer.render(this.scene, this.camera);
  }
};
