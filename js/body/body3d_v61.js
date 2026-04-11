/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — body/body3d_v61.js
   ENGINE v5.8 — Glutes Edition (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var BODY3D = {
  scene: null, camera: null, renderer: null, controls: null,
  group: new THREE.Group(),
  muscles: {},
  isInitialized: false,

  mapping: {
    'pecs': 'Pectoraux', 'back': 'Dorsal', 'shoulders_l': 'Épaules', 'shoulders_r': 'Épaules',
    'biceps_l': 'Biceps', 'biceps_r': 'Biceps', 'triceps_l': 'Triceps', 'triceps_r': 'Triceps',
    'avantbras_l': 'Biceps', 'avantbras_r': 'Biceps',
    'abs': 'Abdominaux', 'quads_l': 'Quadriceps', 'quads_r': 'Quadriceps', 
    'hams_l': 'Ischio-jambiers', 'hams_r': 'Ischio-jambiers',
    'glutes_l': 'Fessiers', 'glutes_r': 'Fessiers',
    'calves_l': 'Mollets', 'calves_r': 'Mollets',
    'traps': 'Trapèzes', 'lumbars': 'Lombaires'
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

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      var light1 = new THREE.DirectionalLight(0xffffff, 1.2);
      light1.position.set(5, 5, 5);
      this.scene.add(light1);
      
      var light2 = new THREE.DirectionalLight(0xffffff, 0.7);
      light2.position.set(-5, 2, -5);
      this.scene.add(light2);

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
        transparent: true, opacity: 0.7, emissive: 0x000000, emissiveIntensity: 0
      });
    };

    var addPart = function(geo, x, y, z, rx, rz, name, pivotAtTop) {
      if (pivotAtTop) {
        geo.translate(0, -geo.parameters.height / 2, 0);
      }
      var mesh = new THREE.Mesh(geo, mat());
      mesh.position.set(x, y, z);
      if (rx) mesh.rotation.x = rx;
      if (rz) mesh.rotation.z = rz;
      mesh.name = name;
      self.muscles[name] = mesh;
      self.group.add(mesh);
      var wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.02 }));
      mesh.add(wire);
    };

    var boxGeo = function(w, h, d) { return new THREE.BoxGeometry(w, h, d); };
    var sphGeo = function(r) { return new THREE.SphereGeometry(r, 24, 24); };
    
    var halfCyl = function(rt, rb, h, side) {
      var start = side === 0 ? -Math.PI/2 : Math.PI/2;
      return new THREE.CylinderGeometry(rt, rb, h, 24, 1, false, start, Math.PI);
    };
    var fullCyl = function(rt, rb, h) { return new THREE.CylinderGeometry(rt, rb, h, 32); };

    // TRONC
    addPart(boxGeo(0.25, 0.5, 0.15), 0, 1.1, 0, 0, 0, 'abs');
    addPart(fullCyl(0.36, 0.28, 0.32), 0, 1.5, 0, 0, 0, 'pecs');
    addPart(boxGeo(0.45, 0.6, 0.1), 0, 1.35, -0.08, 0, 0, 'back');
    addPart(sphGeo(0.12), -0.32, 1.6, 0, 0, 0, 'shoulders_l');
    addPart(sphGeo(0.12), 0.32, 1.6, 0, 0, 0, 'shoulders_r');
    
    // BRAS (v60 Refined + v61 Split)
    addPart(halfCyl(0.122, 0.106, 0.36, 0), -0.44, 1.6, 0, 0, -0.785, 'biceps_l', true);
    addPart(halfCyl(0.122, 0.106, 0.36, 1), -0.44, 1.6, 0, 0, -0.785, 'triceps_l', true);
    addPart(halfCyl(0.122, 0.106, 0.36, 0), 0.44, 1.6, 0, 0, 0.785, 'biceps_r', true);
    addPart(halfCyl(0.122, 0.106, 0.36, 1), 0.44, 1.6, 0, 0, 0.785, 'triceps_r', true);

    // AVANT-BRAS
    addPart(fullCyl(0.09, 0.075, 0.4), -0.694, 1.346, 0, 0, 0.785, 'avantbras_l', true);
    addPart(fullCyl(0.09, 0.075, 0.4), 0.694, 1.346, 0, 0, -0.785, 'avantbras_r', true);

    // FESSIERS - 2 Demi-Sphères (v61)
    // Placées à l'arrière des hanches (Z négatif)
    var gluteGeo = new THREE.SphereGeometry(0.14, 24, 24, Math.PI, Math.PI);
    addPart(gluteGeo, -0.14, 0.85, -0.08, 0, 0, 'glutes_l');
    addPart(gluteGeo, 0.14, 0.85, -0.08, 0, 0, 'glutes_r');

    // JAMBES (Split demi-cylindres)
    addPart(halfCyl(0.16, 0.12, 0.7, 0), -0.18, 0.85, 0, 0, 0.05, 'quads_l', true);
    addPart(halfCyl(0.16, 0.12, 0.7, 1), -0.18, 0.85, 0, 0, 0.05, 'hams_l', true);
    addPart(halfCyl(0.16, 0.12, 0.7, 0), 0.18, 0.85, 0, 0, -0.05, 'quads_r', true);
    addPart(halfCyl(0.16, 0.12, 0.7, 1), 0.18, 0.85, 0, 0, -0.05, 'hams_r', true);

    addPart(fullCyl(0.1, 0.08, 0.4), -0.2, 0.05, 0, 0, 0.02, 'calves_l', true);
    addPart(fullCyl(0.1, 0.08, 0.4), 0.2, 0.05, 0, 0, -0.02, 'calves_r', true);

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
          var prog = levelProgress(vol);
          var baseCol = new THREE.Color(levelColor(lvl));
          var nextCol = new THREE.Color(levelColor(lvl + 1));
          var finalCol = baseCol.clone().lerp(nextCol, prog);
          var targetOpacity = 0.7 + (prog * 0.3);
          var targetEmissive = prog * 0.8;
          gsap.to(mesh.material.color, { r: finalCol.r, g: finalCol.g, b: finalCol.b, duration: 1.5 });
          gsap.to(mesh.material, { opacity: targetOpacity, emissiveIntensity: targetEmissive, duration: 1.5 });
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
