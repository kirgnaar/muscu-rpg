/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d.js
   ENGINE v4.3 — Ultra-Stable Athletic Mannequin (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null,
  group: new THREE.Group(),
  muscles: {},
  isInitialized: false,

  mapping: {
    'pecs': 'Pectoraux', 'back': 'Dorsal', 'shoulders_l': 'Épaules', 'shoulders_r': 'Épaules',
    'biceps_l': 'Biceps', 'biceps_r': 'Biceps', 'triceps_l': 'Triceps', 'triceps_r': 'Triceps',
    'abs': 'Abdominaux', 'quads_l': 'Quadriceps', 'quads_r': 'Quadriceps', 'glutes': 'Fessiers',
    'calves_l': 'Mollets', 'calves_r': 'Mollets', 'hams_l': 'Ischio-jambiers', 'hams_r': 'Ischio-jambiers',
    'traps': 'Trapèzes', 'forearms_l': 'Biceps', 'forearms_r': 'Biceps', 'lumbars': 'Lombaires'
  },

  init: function() {
    if (this.isInitialized) return;
    var container = document.getElementById('body-3d-container');
    if (!container || container.clientWidth === 0) return;

    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.5, 5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      var light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(5, 5, 5);
      this.scene.add(light1);

      var OrbitControlsClass = window.THREE.OrbitControls || window.OrbitControls;
      if (OrbitControlsClass) {
        this.controls = new OrbitControlsClass(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1.1, 0);
      }

      this.buildAthleticBody();
      this.scene.add(this.group);

      if (document.getElementById('3d-loader')) document.getElementById('3d-loader').style.display = 'none';
      if (document.getElementById('body-svg-fallback')) document.getElementById('body-svg-fallback').style.display = 'none';

      this.isInitialized = true;
      this.updateColors();
      this.animate();

      var self = this;
      window.addEventListener('resize', function() { self.onResize(); });
    } catch (e) { console.error("BODY3D Init Error:", e); }
  },

  buildAthleticBody: function() {
    var self = this;
    var mat = function() {
      return new THREE.MeshStandardMaterial({
        color: 0x2d3748, metalness: 0.7, roughness: 0.2,
        transparent: true, opacity: 0.6, emissive: 0x000000, emissiveIntensity: 0
      });
    };

    var addPart = function(geo, y, x, z, rx, rz, name) {
      var mesh = new THREE.Mesh(geo, mat());
      mesh.position.set(x, y, z);
      if (rx) mesh.rotation.x = rx;
      if (rz) mesh.rotation.z = rz;
      mesh.name = name;
      self.muscles[name] = mesh;
      self.group.add(mesh);
      var wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.03 }));
      mesh.add(wire);
    };

    var boxGeo = function(w, h, d) { return new THREE.BoxGeometry(w, h, d); };
    var cylGeo = function(rt, rb, h) { return new THREE.CylinderGeometry(rt, rb, h, 16); };
    var sphGeo = function(r) { return new THREE.SphereGeometry(r, 16, 16); };

    addPart(boxGeo(0.25, 0.5, 0.15), 1.1, 0, 0, 0, 0, 'abs');
    addPart(cylGeo(0.36, 0.28, 0.32), 1.5, 0, 0, 0, 0, 'pecs');
    addPart(boxGeo(0.45, 0.6, 0.1), 1.35, 0, -0.08, 0, 0, 'back');
    addPart(sphGeo(0.12), 1.6, -0.28, 0, 0, 0, 'shoulders_l');
    addPart(sphGeo(0.12), 1.6, 0.28, 0, 0, 0, 'shoulders_r');
    addPart(cylGeo(0.07, 0.06, 0.35), 1.4, -0.35, 0, 0, 0.2, 'biceps_l');
    addPart(cylGeo(0.07, 0.06, 0.35), 1.4, 0.35, 0, 0, -0.2, 'biceps_r');
    addPart(cylGeo(0.16, 0.12, 0.7), 0.5, -0.18, 0, 0, 0.05, 'quads_l');
    addPart(cylGeo(0.16, 0.12, 0.7), 0.5, 0.18, 0, 0, -0.05, 'quads_r');
    addPart(cylGeo(0.1, 0.08, 0.4), -0.15, -0.2, 0, 0, 0.02, 'calves_l');
    addPart(cylGeo(0.1, 0.08, 0.4), -0.15, 0.2, 0, 0, -0.02, 'calves_r');

    var head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), mat());
    head.position.y = 1.95;
    this.group.add(head);
  },

  updateColors: function() {
    if (!this.isInitialized || !window.gsap) return;
    var self = this;
    for (var key in this.mapping) {
      if (this.mapping.hasOwnProperty(key)) {
        var group = this.mapping[key];
        var mesh = this.muscles[key];
        if (mesh && mesh.material) {
          var vol = volByGroup(group);
          var lvl = getLevel(vol);
          var prog = levelProgress(vol); // 0.0 à 1.0 dans le niveau actuel

          // 1. Interpolation de couleur entre le niveau actuel et le suivant
          var baseCol = new THREE.Color(levelColor(lvl));
          var nextCol = new THREE.Color(levelColor(lvl + 1));
          var finalCol = baseCol.clone().lerp(nextCol, prog);

          // 2. Calcul de l'opacité et de l'intensité (effet de "chargement" énergétique)
          // Opacité de 0.6 (base) à 1.0 (plein) selon la progression
          var targetOpacity = 0.6 + (prog * 0.4);
          // Émission (glow) qui augmente avec la proximité du prochain niveau
          var targetEmissive = prog * 0.8;

          // 3. Animation fluide avec GSAP
          gsap.to(mesh.material.color, { r: finalCol.r, g: finalCol.g, b: finalCol.b, duration: 1.5 });
          gsap.to(mesh.material, { 
            opacity: targetOpacity, 
            emissiveIntensity: targetEmissive, 
            duration: 1.5 
          });
          
          // L'émission prend la couleur du niveau supérieur pour simuler l'évolution
          mesh.material.emissive.copy(finalCol);
        }
      }
    }
  },

  animate: function() {
    var self = this;
    requestAnimationFrame(function() { self.animate(); });
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  },

  onResize: function() {
    var container = document.getElementById('body-3d-container');
    if (!container || !this.camera || !this.renderer || container.clientWidth === 0) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }
};
