/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/simulation.js
   📅 Onglet Planification : calendrier + bibliothèque de séances (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

// ── Données Planification ─────────────────────────────────────────────────
var PLAN = {
  entries: [],
  period: 'week',
  offset: 0,
  activeView: 'calendar',
  dbKey: 'mrpg_planning'
};

PLAN.save = function() {
  localStorage.setItem(PLAN.dbKey, JSON.stringify(PLAN.entries));
};

PLAN.load = function() {
  var raw = localStorage.getItem(PLAN.dbKey);
  PLAN.entries = raw ? JSON.parse(raw) : [];
  // Si le planning est vide, on génère le cycle PP Judo de 5 semaines à partir de ce lundi
  if (!PLAN.entries || PLAN.entries.length === 0) {
    PLAN.entries = PLAN.generateDefaultSchedule(_thisMonday());
    PLAN.save();
  }
};

// Génère 5 semaines de planning PP Judo à partir du lundi de la semaine donnée.
// blockId : Jambes=1000, MusA→E=1001-1005, Muscu1→5=1006-1010, FullBody=1011
PLAN.generateDefaultSchedule = function(startMonday) {
  var entries = [];
  var uid = Date.now();
  var y  = startMonday.getFullYear();
  var mo = startMonday.getMonth();
  var d0 = startMonday.getDate();

  // Pour chaque semaine S1→S5, on pose 4 séances : Lun, Mer, Ven, Dim
  var slots = [
    { off: 0, blockFn: function()  { return 1000; } },       // Lundi  — Jambes (fixe)
    { off: 2, blockFn: function(s) { return 1001 + s; } },   // Mercredi — Muscu A→E
    { off: 4, blockFn: function()  { return 1011; } },       // Vendredi — Full Body (fixe)
    { off: 6, blockFn: function(s) { return 1006 + s; } }    // Dimanche — Muscu 1→5
  ];

  for (var s = 0; s < 5; s++) {
    for (var i = 0; i < slots.length; i++) {
      var totalOffset = s * 7 + slots[i].off;
      // new Date(y, mo, d0 + offset) gère automatiquement les débordements de mois
      var dt = new Date(y, mo, d0 + totalOffset);
      var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
      var dd = ('0' + dt.getDate()).slice(-2);
      entries.push({
        id: uid++,
        date: dt.getFullYear() + '-' + mm + '-' + dd,
        blockId: slots[i].blockFn(s),
        note: ''
      });
    }
  }
  return entries;
};

// Retourne le lundi de la semaine courante (sans heure pour éviter les soucis DST)
function _thisMonday() {
  var today = new Date();
  var dow  = today.getDay(); // 0=dim, 1=lun, ..., 6=sam
  var diff = (dow === 0) ? -6 : 1 - dow;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
}

// Retourne la date ISO "YYYY-MM-DD" d'un objet Date (lecture seule, pas de mutation)
function _isoDate(dateObj) {
  var mm = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  var dd = ('0' + dateObj.getDate()).slice(-2);
  return dateObj.getFullYear() + '-' + mm + '-' + dd;
}

// ── Données Bibliothèque ──────────────────────────────────────────────────
var SIM = {
  blocks: [],
  currentBlock: null,
  dbKey: 'mrpg_blocks'
};

// ── Séances par défaut — Programme PP Judo ────────────────────────────────
var DEFAULT_BLOCKS = [
  // ── JAMBES (Lundi — hors cycle) ─────────────────────────────────────────
  {
    id: 1000, name: '🦵 Jambes', type: 'Force',
    exercises: [
      { ex: 'Squat barre',                  ser: 4, rep: 6,  pds: 80,  grp: 'Quadriceps' },
      { ex: 'Soulevé de terre roumain',      ser: 4, rep: 6,  pds: 70,  grp: 'Ischio-jambiers' },
      { ex: 'Fentes arrière haltères',       ser: 4, rep: 10, pds: 20,  grp: 'Fessiers' },
      { ex: 'Leg extension machine',         ser: 2, rep: 12, pds: 50,  grp: 'Quadriceps' },
      { ex: 'Leg curl couché machine',       ser: 2, rep: 12, pds: 40,  grp: 'Ischio-jambiers' }
    ]
  },
  // ── MUSCU A (Mercredi S1 — 8 reps) ──────────────────────────────────────
  {
    id: 1001, name: '💪 Muscu A — Haut du corps', type: 'Hypertrophie',
    exercises: [
      { ex: 'Développé machine',             ser: 4, rep: 8,  pds: 60,  grp: 'Pectoraux' },
      { ex: 'Presse épaule machine',         ser: 4, rep: 8,  pds: 40,  grp: 'Épaules' },
      { ex: 'Dips',                          ser: 4, rep: 10, pds: 0,   grp: 'Triceps' },
      { ex: 'Développé couché haltères',     ser: 4, rep: 8,  pds: 25,  grp: 'Pectoraux' },
      { ex: 'Triceps poulie 1 bras',         ser: 4, rep: 8,  pds: 10,  grp: 'Triceps' },
      { ex: 'Pompes',                        ser: 4, rep: 12, pds: 0,   grp: 'Pectoraux' },
      { ex: 'Traction haute kimono isométrique', ser: 1, rep: 30, pds: 0, grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU B (Mercredi S2 — 9 reps) ──────────────────────────────────────
  {
    id: 1002, name: '💪 Muscu B — Haut du corps', type: 'Hypertrophie',
    exercises: [
      { ex: 'Développé machine',             ser: 4, rep: 9,  pds: 60,  grp: 'Pectoraux' },
      { ex: 'Presse épaule machine',         ser: 4, rep: 9,  pds: 40,  grp: 'Épaules' },
      { ex: 'Dips',                          ser: 4, rep: 12, pds: 0,   grp: 'Triceps' },
      { ex: 'Développé couché haltères',     ser: 4, rep: 9,  pds: 25,  grp: 'Pectoraux' },
      { ex: 'Triceps poulie 1 bras',         ser: 4, rep: 9,  pds: 10,  grp: 'Triceps' },
      { ex: 'Pompes',                        ser: 4, rep: 14, pds: 0,   grp: 'Pectoraux' },
      { ex: 'Traction haute kimono isométrique', ser: 1, rep: 30, pds: 0, grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU C (Mercredi S3 — 10 reps) ─────────────────────────────────────
  {
    id: 1003, name: '💪 Muscu C — Haut du corps', type: 'Hypertrophie',
    exercises: [
      { ex: 'Développé machine',             ser: 4, rep: 10, pds: 60,  grp: 'Pectoraux' },
      { ex: 'Presse épaule machine',         ser: 4, rep: 10, pds: 40,  grp: 'Épaules' },
      { ex: 'Dips',                          ser: 4, rep: 14, pds: 0,   grp: 'Triceps' },
      { ex: 'Développé couché haltères',     ser: 4, rep: 10, pds: 25,  grp: 'Pectoraux' },
      { ex: 'Triceps poulie 1 bras',         ser: 4, rep: 10, pds: 10,  grp: 'Triceps' },
      { ex: 'Pompes',                        ser: 4, rep: 16, pds: 0,   grp: 'Pectoraux' },
      { ex: 'Traction haute kimono isométrique', ser: 1, rep: 30, pds: 0, grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU D (Mercredi S4 — 11 reps) ─────────────────────────────────────
  {
    id: 1004, name: '💪 Muscu D — Haut du corps', type: 'Hypertrophie',
    exercises: [
      { ex: 'Développé machine',             ser: 4, rep: 11, pds: 60,  grp: 'Pectoraux' },
      { ex: 'Presse épaule machine',         ser: 4, rep: 11, pds: 40,  grp: 'Épaules' },
      { ex: 'Dips',                          ser: 4, rep: 16, pds: 0,   grp: 'Triceps' },
      { ex: 'Développé couché haltères',     ser: 4, rep: 11, pds: 25,  grp: 'Pectoraux' },
      { ex: 'Triceps poulie 1 bras',         ser: 4, rep: 11, pds: 10,  grp: 'Triceps' },
      { ex: 'Pompes',                        ser: 4, rep: 18, pds: 0,   grp: 'Pectoraux' },
      { ex: 'Traction haute kimono isométrique', ser: 1, rep: 30, pds: 0, grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU E (Mercredi S5 — 12 reps) ─────────────────────────────────────
  {
    id: 1005, name: '💪 Muscu E — Haut du corps', type: 'Hypertrophie',
    exercises: [
      { ex: 'Développé machine',             ser: 4, rep: 12, pds: 60,  grp: 'Pectoraux' },
      { ex: 'Presse épaule machine',         ser: 4, rep: 12, pds: 40,  grp: 'Épaules' },
      { ex: 'Dips',                          ser: 4, rep: 16, pds: 0,   grp: 'Triceps' },
      { ex: 'Développé couché haltères',     ser: 4, rep: 12, pds: 25,  grp: 'Pectoraux' },
      { ex: 'Triceps poulie 1 bras',         ser: 4, rep: 12, pds: 10,  grp: 'Triceps' },
      { ex: 'Pompes',                        ser: 4, rep: 18, pds: 0,   grp: 'Pectoraux' },
      { ex: 'Traction haute kimono isométrique', ser: 1, rep: 30, pds: 0, grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU 1 (Dimanche S1 — Blocs Pousser + Tirer) ───────────────────────
  {
    id: 1006, name: '🏋️ Muscu 1 — Blocs pousser/tirer', type: 'Hypertrophie',
    exercises: [
      // Bloc Pousser
      { ex: 'Développé couché barre',        ser: 4, rep: 10, pds: 70,  grp: 'Pectoraux' },
      { ex: 'Développé militaire barre',     ser: 4, rep: 10, pds: 40,  grp: 'Épaules' },
      { ex: 'Dips',                          ser: 4, rep: 10, pds: 0,   grp: 'Triceps' },
      // Bloc Tirer
      { ex: 'Tirage haut kimono',            ser: 4, rep: 10, pds: 50,  grp: 'Dorsal' },
      { ex: 'Rowing barre',                  ser: 4, rep: 10, pds: 60,  grp: 'Dorsal' },
      { ex: 'Tractions pronation',           ser: 4, rep: 8,  pds: 0,   grp: 'Dorsal' },
      // Finisher gainage
      { ex: 'Traction haute kimono isométrique', ser: 3, rep: 30, pds: 0, grp: 'Abdominaux' },
      { ex: 'Gainage face (planche)',        ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' },
      { ex: 'Extensions lombaires banc romain', ser: 3, rep: 60, pds: 0, grp: 'Lombaires' },
      { ex: 'Gainage latéral',               ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU 2 (Dimanche S2) ────────────────────────────────────────────────
  {
    id: 1007, name: '🏋️ Muscu 2 — Blocs pousser/tirer', type: 'Hypertrophie',
    exercises: [
      // Bloc Pousser
      { ex: 'Développé machine',             ser: 4, rep: 10, pds: 60,  grp: 'Pectoraux' },
      { ex: 'Pull over haltère',             ser: 4, rep: 10, pds: 20,  grp: 'Dorsal' },
      { ex: 'Barre explosive (power clean)', ser: 4, rep: 10, pds: 40,  grp: 'Full body' },
      // Bloc Tirer
      { ex: 'Tirage haut kimono',            ser: 4, rep: 10, pds: 50,  grp: 'Dorsal' },
      { ex: 'Tirage allongé poulie basse',   ser: 4, rep: 10, pds: 50,  grp: 'Dorsal' },
      { ex: 'Traction haute kimono isométrique', ser: 4, rep: 6, pds: 0, grp: 'Dorsal' },
      // Finisher
      { ex: 'Traction haute kimono isométrique', ser: 3, rep: 30, pds: 0, grp: 'Abdominaux' },
      { ex: 'Gainage face (planche)',        ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' },
      { ex: 'Extensions lombaires banc romain', ser: 3, rep: 60, pds: 0, grp: 'Lombaires' },
      { ex: 'Gainage latéral',               ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU 3 (Dimanche S3) ────────────────────────────────────────────────
  {
    id: 1008, name: '🏋️ Muscu 3 — Blocs pousser/tirer', type: 'Hypertrophie',
    exercises: [
      // Bloc Pousser
      { ex: 'Développé couché barre',        ser: 4, rep: 10, pds: 70,  grp: 'Pectoraux' },
      { ex: 'Développé militaire barre',     ser: 4, rep: 10, pds: 40,  grp: 'Épaules' },
      { ex: 'Triceps poulie 1 bras',         ser: 4, rep: 10, pds: 10,  grp: 'Triceps' },
      { ex: 'Dips',                          ser: 4, rep: 10, pds: 0,   grp: 'Triceps' },
      // Bloc Tirer
      { ex: 'Tirage haut kimono',            ser: 4, rep: 10, pds: 50,  grp: 'Dorsal' },
      { ex: 'Rowing barre',                  ser: 4, rep: 10, pds: 60,  grp: 'Dorsal' },
      { ex: 'Biceps poulie 1 bras',          ser: 4, rep: 10, pds: 10,  grp: 'Biceps' },
      { ex: 'Tractions pronation',           ser: 4, rep: 8,  pds: 0,   grp: 'Dorsal' },
      // Finisher (35s)
      { ex: 'Traction haute kimono isométrique', ser: 3, rep: 35, pds: 0, grp: 'Abdominaux' },
      { ex: 'Gainage face (planche)',        ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' },
      { ex: 'Extensions lombaires banc romain', ser: 3, rep: 60, pds: 0, grp: 'Lombaires' },
      { ex: 'Gainage latéral',               ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU 4 (Dimanche S4) ────────────────────────────────────────────────
  {
    id: 1009, name: '🏋️ Muscu 4 — Blocs pousser/tirer', type: 'Hypertrophie',
    exercises: [
      // Bloc Pousser
      { ex: 'Développé machine',             ser: 4, rep: 10, pds: 60,  grp: 'Pectoraux' },
      { ex: 'Barre explosive (power clean)', ser: 4, rep: 10, pds: 40,  grp: 'Full body' },
      { ex: 'Pompes',                        ser: 4, rep: 20, pds: 0,   grp: 'Pectoraux' },
      // Bloc Tirer
      { ex: 'Tirage haut kimono',            ser: 4, rep: 10, pds: 50,  grp: 'Dorsal' },
      { ex: 'Tirage allongé poulie basse',   ser: 4, rep: 10, pds: 50,  grp: 'Dorsal' },
      { ex: 'Traction haute kimono isométrique', ser: 4, rep: 6, pds: 0, grp: 'Dorsal' },
      // Finisher (35s)
      { ex: 'Traction haute kimono isométrique', ser: 3, rep: 35, pds: 0, grp: 'Abdominaux' },
      { ex: 'Gainage face (planche)',        ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' },
      { ex: 'Extensions lombaires banc romain', ser: 3, rep: 60, pds: 0, grp: 'Lombaires' },
      { ex: 'Gainage latéral',               ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' }
    ]
  },
  // ── MUSCU 5 (Dimanche S5) ────────────────────────────────────────────────
  {
    id: 1010, name: '🏋️ Muscu 5 — Blocs pousser/tirer', type: 'Hypertrophie',
    exercises: [
      // Bloc Pousser
      { ex: 'Développé couché barre',        ser: 4, rep: 10, pds: 70,  grp: 'Pectoraux' },
      { ex: 'Développé militaire barre',     ser: 4, rep: 10, pds: 40,  grp: 'Épaules' },
      { ex: 'Dips',                          ser: 4, rep: 10, pds: 0,   grp: 'Triceps' },
      // Bloc Tirer
      { ex: 'Tirage haut kimono',            ser: 4, rep: 10, pds: 50,  grp: 'Dorsal' },
      { ex: 'Rowing barre',                  ser: 4, rep: 10, pds: 60,  grp: 'Dorsal' },
      { ex: 'Tractions pronation',           ser: 4, rep: 8,  pds: 0,   grp: 'Dorsal' },
      // Finisher (40s)
      { ex: 'Traction haute kimono isométrique', ser: 3, rep: 40, pds: 0, grp: 'Abdominaux' },
      { ex: 'Gainage face (planche)',        ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' },
      { ex: 'Extensions lombaires banc romain', ser: 3, rep: 60, pds: 0, grp: 'Lombaires' },
      { ex: 'Gainage latéral',               ser: 3, rep: 60, pds: 0,   grp: 'Abdominaux' }
    ]
  },
  // ── FULL BODY (Vendredi — hors cycle) ────────────────────────────────────
  {
    id: 1011, name: '⚡ Full Body', type: 'Hypertrophie',
    exercises: [
      // Principaux 4×10
      { ex: 'Squat barre',                   ser: 4, rep: 10, pds: 70,  grp: 'Quadriceps' },
      { ex: 'Développé couché barre',        ser: 4, rep: 10, pds: 70,  grp: 'Pectoraux' },
      { ex: 'Soulevé de terre conventionnel',ser: 4, rep: 10, pds: 80,  grp: 'Ischio-jambiers' },
      // Secondaires 3×12
      { ex: 'Développé militaire barre',     ser: 3, rep: 12, pds: 40,  grp: 'Épaules' },
      { ex: 'Rowing barre',                  ser: 3, rep: 12, pds: 60,  grp: 'Dorsal' },
      { ex: 'Leg press 45°',                 ser: 3, rep: 12, pds: 100, grp: 'Quadriceps' },
      // Isolation 2×16
      { ex: 'Extensions triceps poulie haute', ser: 2, rep: 16, pds: 15, grp: 'Triceps' },
      { ex: 'Rowing vertical / Upright row', ser: 2, rep: 16, pds: 20,  grp: 'Épaules' },
      { ex: 'Leg extension machine',         ser: 2, rep: 16, pds: 40,  grp: 'Quadriceps' },
      { ex: 'Leg curl couché machine',       ser: 2, rep: 16, pds: 35,  grp: 'Ischio-jambiers' }
    ]
  }
];

// ── Init ──────────────────────────────────────────────────────────────────
function loadBlocks() {
  try {
    var raw = localStorage.getItem(SIM.dbKey);
    var blocks = raw ? JSON.parse(raw) : [];
    // Si la bibliothèque est vide, on charge les séances par défaut du programme PP Judo
    if (!blocks || blocks.length === 0) {
      blocks = JSON.parse(JSON.stringify(DEFAULT_BLOCKS)); // deep copy
      localStorage.setItem(SIM.dbKey, JSON.stringify(blocks));
    }
    return blocks;
  } catch(e) { return JSON.parse(JSON.stringify(DEFAULT_BLOCKS)); }
}

function saveBlocks() {
  localStorage.setItem(SIM.dbKey, JSON.stringify(SIM.blocks));
}

function initSimulation() {
  PLAN.load();
  SIM.blocks = loadBlocks();
  populateExerciseSelect($('sim-ex-sel'), true);

  $('plan-tab-cal').addEventListener('click', function() { _switchPlanView('calendar'); });
  $('plan-tab-lib').addEventListener('click', function() { _switchPlanView('library'); });

  $('plan-period-bar').addEventListener('click', function(ev) {
    var btn = ev.target.closest('.plan-period-btn');
    if (!btn) return;
    PLAN.period = btn.dataset.period;
    PLAN.offset = 0;
    renderCalendar();
  });

  $('plan-prev').addEventListener('click', function() { PLAN.offset--; renderCalendar(); });
  $('plan-next').addEventListener('click', function() { PLAN.offset++; renderCalendar(); });

  $('plan-cal-view').addEventListener('click', function(ev) {
    var addBtn = ev.target.closest('.plan-add-btn');
    if (addBtn && addBtn.dataset.date) { openSessionPicker(addBtn.dataset.date); return; }
    var badge = ev.target.closest('.plan-session-badge');
    if (badge && badge.dataset.entryId) { openPlanDetail(parseInt(badge.dataset.entryId)); return; }
  });

  $('plan-picker-confirm').addEventListener('click', function() {
    var date = this.dataset.date;
    var blockId = $('plan-picker-sel').value;
    if (!blockId) return;
    addPlanEntry(date, blockId);
    closePlanModal('plan-picker-modal');
  });
  $('plan-picker-cancel').addEventListener('click', function() { closePlanModal('plan-picker-modal'); });

  $('plan-detail-log-btn').addEventListener('click', function() {
    _logPlanEntry(parseInt(this.dataset.entryId));
  });
  $('plan-detail-del-btn').addEventListener('click', function() {
    if (!confirm('Supprimer cette séance du planning ?')) return;
    removePlanEntry(parseInt(this.dataset.entryId));
    closePlanModal('plan-detail-modal');
  });
  $('plan-detail-close-btn').addEventListener('click', function() { closePlanModal('plan-detail-modal'); });

  $('sim-new-block-btn').addEventListener('click', function() { handleNewBlock(); });
  $('sim-save-block-btn').addEventListener('click', function() { saveCurrentBlock(); });
  $('sim-add-ex-btn').addEventListener('click', function() { handleAddExToBlock(); });
  $('sim-confirm-btn').addEventListener('click', function() { confirmSession(); });
  $('sim-back-btn').addEventListener('click', function() { closeEditor(); });

  $('sim-blocks-list').addEventListener('click', function(ev) {
    var btnEdit = ev.target.closest('.sim-block-edit');
    var btnDel = ev.target.closest('.sim-block-del');
    if (btnEdit) openEditor(parseInt(btnEdit.dataset.id));
    if (btnDel) deleteBlock(parseInt(btnDel.dataset.id));
  });

  $('sim-ex-list').addEventListener('click', function(ev) {
    var btn = ev.target.closest('.sim-ex-del');
    if (!btn) return;
    SIM.currentBlock.exercises.splice(parseInt(btn.dataset.idx), 1);
    renderEditor();
  });

  $('sim-ex-list').addEventListener('input', function(ev) {
    var input = ev.target;
    var idx = parseInt(input.dataset.idx);
    var field = input.dataset.field;
    if (!field || isNaN(idx)) return;
    SIM.currentBlock.exercises[idx][field] = parseFloat(input.value) || 0;
    calculateSimResults(SIM.currentBlock.exercises);
  });
}

function _switchPlanView(view) {
  PLAN.activeView = view;
  $('plan-tab-cal').classList.toggle('active', view === 'calendar');
  $('plan-tab-lib').classList.toggle('active', view === 'library');
  $('plan-cal-view').style.display = view === 'calendar' ? 'block' : 'none';
  $('plan-lib-view').style.display = view === 'library' ? 'block' : 'none';
  if (view === 'calendar') renderCalendar();
  if (view === 'library') renderBlockList();
}

// ── Rendu principal ───────────────────────────────────────────────────────
function renderSimulation() {
  if (PLAN.activeView === 'calendar') renderCalendar();
  else renderBlockList();
}

// ── Calendrier ────────────────────────────────────────────────────────────
function _isoDate(d) {
  var m = d.getMonth() + 1;
  var mStr = m < 10 ? '0' + m : '' + m;
  var dayStr = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate();
  return d.getFullYear() + '-' + mStr + '-' + dayStr;
}

function _getWeekStart(date) {
  var d = new Date(date);
  d.setHours(0, 0, 0, 0);
  var dow = d.getDay();
  var diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

function _getPeriodDays() {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var days = [];
  var i, d, m, y, dim;

  if (PLAN.period === 'week') {
    var start = _getWeekStart(today);
    start.setDate(start.getDate() + PLAN.offset * 7);
    for (i = 0; i < 7; i++) { d = new Date(start); d.setDate(d.getDate() + i); days.push(_isoDate(d)); }

  } else if (PLAN.period === '2weeks') {
    var start2 = _getWeekStart(today);
    start2.setDate(start2.getDate() + PLAN.offset * 14);
    for (i = 0; i < 14; i++) { d = new Date(start2); d.setDate(d.getDate() + i); days.push(_isoDate(d)); }

  } else if (PLAN.period === 'month') {
    var mo = new Date(today.getFullYear(), today.getMonth() + PLAN.offset, 1);
    y = mo.getFullYear(); m = mo.getMonth();
    dim = new Date(y, m + 1, 0).getDate();
    for (i = 1; i <= dim; i++) days.push(_isoDate(new Date(y, m, i)));

  } else if (PLAN.period === '3months') {
    var base = new Date(today.getFullYear(), today.getMonth() + PLAN.offset * 3, 1);
    for (var q = 0; q < 3; q++) {
      var mm = base.getMonth() + q;
      y = base.getFullYear() + Math.floor(mm / 12);
      m = mm % 12;
      dim = new Date(y, m + 1, 0).getDate();
      for (i = 1; i <= dim; i++) days.push(_isoDate(new Date(y, m, i)));
    }
  }
  return days;
}

function _getPeriodLabel() {
  var days = _getPeriodDays();
  if (!days.length) return '';
  var MOIS = ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'jun.', 'jul.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
  var first = new Date(days[0] + 'T00:00:00');
  var last  = new Date(days[days.length - 1] + 'T00:00:00');
  if (PLAN.period === 'week') {
    return first.getDate() + ' – ' + last.getDate() + ' ' + MOIS[last.getMonth()] + ' ' + last.getFullYear();
  } else if (PLAN.period === '2weeks') {
    return first.getDate() + ' ' + MOIS[first.getMonth()] + ' – ' + last.getDate() + ' ' + MOIS[last.getMonth()] + ' ' + last.getFullYear();
  } else if (PLAN.period === 'month') {
    var NOMS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return NOMS[first.getMonth()] + ' ' + first.getFullYear();
  } else {
    return MOIS[first.getMonth()] + ' – ' + MOIS[last.getMonth()] + ' ' + last.getFullYear();
  }
}

function renderCalendar() {
  var days = _getPeriodDays();
  var todayStr = todayISO();

  var periodBtns = document.querySelectorAll('.plan-period-btn');
  for (var b = 0; b < periodBtns.length; b++) {
    periodBtns[b].classList.toggle('active', periodBtns[b].dataset.period === PLAN.period);
  }
  $('plan-period-label').textContent = _getPeriodLabel();

  var JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  var html = '<div class="plan-grid-header">';
  for (var j = 0; j < 7; j++) html += '<div class="plan-grid-hcell">' + JOURS[j] + '</div>';
  html += '</div><div class="plan-grid-body">';

  var leadingPad = 0;
  if (days.length > 0) {
    var firstDow = new Date(days[0] + 'T00:00:00').getDay();
    leadingPad = firstDow === 0 ? 6 : firstDow - 1;
    for (var p = 0; p < leadingPad; p++) html += '<div class="plan-day-cell plan-day-empty"></div>';
  }

  for (var i = 0; i < days.length; i++) html += _buildDayCell(days[i], todayStr);

  var totalCells = leadingPad + days.length;
  var trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (var t = 0; t < trailing; t++) html += '<div class="plan-day-cell plan-day-empty"></div>';

  html += '</div>';
  $('plan-grid').innerHTML = html;
}

function _buildDayCell(dateStr, todayStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var isToday = dateStr === todayStr;
  var entries = [];
  for (var i = 0; i < PLAN.entries.length; i++) {
    if (PLAN.entries[i].date === dateStr) entries.push(PLAN.entries[i]);
  }
  var badgesHtml = '';
  for (var j = 0; j < entries.length; j++) {
    var e = entries[j];
    var block = _getBlockById(e.blockId);
    var name = block ? block.name : '?';
    var shortName = name.length > 10 ? name.substring(0, 9) + '…' : name;
    badgesHtml += '<div class="plan-session-badge" data-entry-id="' + e.id + '">' + shortName + '</div>';
  }
  return '<div class="plan-day-cell' + (isToday ? ' plan-day-today' : '') + '" data-date="' + dateStr + '">' +
    '<div class="plan-day-header"><span class="plan-day-num">' + d.getDate() + '</span>' +
    '<button class="plan-add-btn" data-date="' + dateStr + '">+</button></div>' +
    badgesHtml + '</div>';
}

function _getBlockById(id) {
  for (var i = 0; i < SIM.blocks.length; i++) {
    if (SIM.blocks[i].id === id) return SIM.blocks[i];
  }
  return null;
}

// ── Modal : sélecteur de séance ───────────────────────────────────────────
function openSessionPicker(date) {
  if (SIM.blocks.length === 0) {
    toast('Créez d\'abord une séance dans l\'onglet Séances', 'err');
    return;
  }
  var sel = $('plan-picker-sel');
  sel.innerHTML = '';
  for (var i = 0; i < SIM.blocks.length; i++) {
    var b = SIM.blocks[i];
    var opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.name;
    sel.appendChild(opt);
  }
  $('plan-picker-date').textContent = _formatDateFull(date);
  $('plan-picker-confirm').dataset.date = date;
  $('plan-picker-modal').style.display = 'flex';
}

function _formatDateFull(dateStr) {
  var JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var MOIS  = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var d = new Date(dateStr + 'T00:00:00');
  return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
}

function addPlanEntry(date, blockId) {
  PLAN.entries.push({ id: Date.now(), date: date, blockId: parseInt(blockId), note: '' });
  PLAN.save();
  renderCalendar();
}

function removePlanEntry(id) {
  var newEntries = [];
  for (var i = 0; i < PLAN.entries.length; i++) {
    if (PLAN.entries[i].id !== id) newEntries.push(PLAN.entries[i]);
  }
  PLAN.entries = newEntries;
  PLAN.save();
  renderCalendar();
}

function closePlanModal(id) {
  $(id).style.display = 'none';
}

// ── Modal : détail séance planifiée ───────────────────────────────────────
function openPlanDetail(entryId) {
  var entry = null;
  for (var i = 0; i < PLAN.entries.length; i++) {
    if (PLAN.entries[i].id === entryId) { entry = PLAN.entries[i]; break; }
  }
  if (!entry) return;
  var block = _getBlockById(entry.blockId);
  if (!block) { toast('Séance introuvable', 'err'); return; }

  $('plan-detail-title').textContent = block.name;
  $('plan-detail-date').textContent = _formatDateFull(entry.date);

  var html = '';
  for (var j = 0; j < block.exercises.length; j++) {
    var ex = block.exercises[j];
    html += '<div style="padding:8px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-weight:700;color:#fff">' + ex.ex + '</div>' +
      '<div style="font-size:12px;color:var(--text2)">' + ex.ser + ' × ' + ex.rep + ' @ ' + ex.pds + ' kg</div>' +
      '</div>';
  }
  $('plan-detail-exlist').innerHTML = html || '<div style="color:var(--text2);font-size:13px;padding:8px 0">Séance vide</div>';

  $('plan-detail-log-btn').dataset.entryId  = entryId;
  $('plan-detail-del-btn').dataset.entryId  = entryId;
  $('plan-detail-modal').style.display = 'flex';
}

// ── Logger une séance planifiée ───────────────────────────────────────────
function _logPlanEntry(entryId) {
  var entry = null;
  for (var i = 0; i < PLAN.entries.length; i++) {
    if (PLAN.entries[i].id === entryId) { entry = PLAN.entries[i]; break; }
  }
  if (!entry) return;
  var block = _getBlockById(entry.blockId);
  if (!block || block.exercises.length === 0) { toast('Séance vide', 'err'); return; }
  if (!confirm('Logger "' + block.name + '" pour le ' + _formatDateFull(entry.date) + ' ?')) return;

  var type = block.type || 'Hypertrophie';
  for (var j = 0; j < block.exercises.length; j++) {
    var item = block.exercises[j];
    addEntry({ date: entry.date, type: type, ex: item.ex, grp: item.grp || getPrimaryGroup(item.ex), ser: item.ser, rep: item.rep, pds: item.pds });
  }
  APP.render();
  toast('Séance loggée dans le journal !');
  closePlanModal('plan-detail-modal');
  APP.switchView('seances');
}

// ── Bibliothèque ──────────────────────────────────────────────────────────
// (loadBlocks et saveBlocks définis plus haut — saveBlocks enrichi avec sync cloud)
// On surcharge saveBlocks pour ajouter la sync cloud
var _saveBlocksBase = saveBlocks;
saveBlocks = function() {
  localStorage.setItem(SIM.dbKey, JSON.stringify(SIM.blocks));
  if (window.Auth && window.Auth.user && window.pushToCloud) {
    window.pushToCloud(window.Auth.user.uid, {
      sessions: APP.data,
      user: APP.user,
      blocks: SIM.blocks
    });
  }
};

function handleNewBlock() {
  SIM.currentBlock = { id: Date.now(), name: 'Nouveau programme', type: 'Hypertrophie', exercises: [] };
  openEditor();
}

function openEditor(id) {
  if (id) {
    for (var i = 0; i < SIM.blocks.length; i++) {
      if (SIM.blocks[i].id === id) { SIM.currentBlock = JSON.parse(JSON.stringify(SIM.blocks[i])); break; }
    }
  }
  if (!SIM.currentBlock.type) SIM.currentBlock.type = 'Hypertrophie';
  $('plan-lib-header').style.display = 'none';
  $('sim-blocks-list').style.display = 'none';
  $('sim-editor').style.display = 'block';
  $('sim-block-name').value = SIM.currentBlock.name;
  $('sim-block-type').value = SIM.currentBlock.type;
  renderEditor();
}

function closeEditor() {
  SIM.currentBlock = null;
  $('sim-editor').style.display = 'none';
  $('sim-blocks-list').style.display = 'block';
  $('plan-lib-header').style.display = 'flex';
  renderBlockList();
}

function saveCurrentBlock() {
  if (!SIM.currentBlock) return;
  SIM.currentBlock.name = $('sim-block-name').value || 'Sans titre';
  SIM.currentBlock.type = $('sim-block-type').value;
  var foundIdx = -1;
  for (var i = 0; i < SIM.blocks.length; i++) {
    if (SIM.blocks[i].id === SIM.currentBlock.id) { foundIdx = i; break; }
  }
  if (foundIdx !== -1) SIM.blocks[foundIdx] = JSON.parse(JSON.stringify(SIM.currentBlock));
  else SIM.blocks.push(JSON.parse(JSON.stringify(SIM.currentBlock)));
  saveBlocks();
  toast('Programme sauvegardé');
  closeEditor();
}

function deleteBlock(id) {
  if (!confirm('Supprimer ce programme ?')) return;
  var newBlocks = [];
  for (var i = 0; i < SIM.blocks.length; i++) {
    if (SIM.blocks[i].id !== id) newBlocks.push(SIM.blocks[i]);
  }
  SIM.blocks = newBlocks;
  saveBlocks();
  renderBlockList();
}

function handleAddExToBlock() {
  var exName = $('sim-ex-sel').value;
  var ser = parseInt($('sim-ser').value);
  var rep = parseInt($('sim-rep').value);
  var pds = parseFloat($('sim-pds').value);
  if (!exName || !ser || !rep || isNaN(pds)) { toast('Champs invalides', 'err'); return; }
  SIM.currentBlock.exercises.push({ ex: exName, ser: ser, rep: rep, pds: pds, grp: getPrimaryGroup(exName) });
  renderEditor();
}

function renderBlockList() {
  var list = $('sim-blocks-list');
  if (SIM.blocks.length === 0) {
    list.innerHTML = '<div class="empty"><p>Aucun programme. Créez-en un !</p></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < SIM.blocks.length; i++) {
    var b = SIM.blocks[i];
    var dist = calculateMuscleDistribution(b.exercises);
    var distHtml = '';
    if (dist.length > 0) {
      distHtml = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">';
      for (var j = 0; j < dist.length; j++) {
        distHtml += '<span style="font-size:9px;background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;color:var(--text2)">' + dist[j].grp + ' ' + dist[j].pct + '%</span>';
      }
      distHtml += '</div>';
    }
    html += '<div class="card" style="margin-bottom:10px"><div class="flex-between"><div>' +
      '<div style="font-weight:800;color:#fff">' + b.name + '</div>' +
      '<div style="font-size:11px;color:var(--accent);font-weight:700">' + b.type + '</div>' +
      '<div style="font-size:10px;color:var(--text2);margin-top:2px">' + b.exercises.length + ' exercice(s)</div>' +
      '</div><div style="display:flex;gap:8px">' +
      '<button class="btn btn-s sim-block-edit" data-id="' + b.id + '">Éditer</button>' +
      '<button class="btn btn-s sim-block-del" data-id="' + b.id + '" style="background:rgba(239,68,68,0.1);color:#ef4444">✕</button>' +
      '</div></div>' + distHtml + '</div>';
  }
  list.innerHTML = html;
}

function calculateMuscleDistribution(exercises) {
  if (!exercises.length) return [];
  var weightedCounts = {};
  var totalWeighted = 0;
  for (var i = 0; i < exercises.length; i++) {
    var ex = exercises[i];
    for (var k = 0; k < MUSCLES.length; k++) {
      var m = MUSCLES[k];
      var influence = getMuscleInfluence(ex.ex, m);
      if (influence > 0) {
        var w = ex.ser * influence;
        weightedCounts[m] = (weightedCounts[m] || 0) + w;
        totalWeighted += w;
      }
    }
  }
  if (totalWeighted === 0) return [];
  var results = [];
  for (var grp in weightedCounts) {
    results.push({ grp: grp, pct: Math.round((weightedCounts[grp] / totalWeighted) * 100) });
  }
  results.sort(function(a, b) { return b.pct - a.pct; });
  var filtered = [];
  for (var l = 0; l < results.length; l++) { if (results[l].pct > 0) filtered.push(results[l]); }
  return filtered;
}

function renderEditor() {
  var typeSel = $('sim-block-type');
  var currentType = SIM.currentBlock.type || 'Hypertrophie';
  typeSel.innerHTML = '';
  var types = ['Hypertrophie', 'Force', 'Hyperforce (PR)', 'Endurance musculaire', 'Décharge'];
  for (var i = 0; i < types.length; i++) {
    var o = document.createElement('option');
    o.value = types[i]; o.textContent = types[i];
    typeSel.appendChild(o);
  }
  typeSel.value = currentType;

  var list   = $('sim-ex-list');
  var exList = SIM.currentBlock.exercises;
  if (exList.length === 0) {
    list.innerHTML = '<div class="empty" style="padding:20px"><p>Liste vide.</p></div>';
    calculateSimResults([]);
    return;
  }
  var html = '';
  for (var j = 0; j < exList.length; j++) {
    var item = exList[j];
    html += '<div class="sitem" style="flex-direction:column;align-items:stretch;gap:8px;padding:12px">' +
      '<div class="flex-between"><div class="sname" style="font-size:14px">' + item.ex + '</div>' +
      '<button class="sim-ex-del" data-idx="' + j + '" style="background:none;border:none;color:#ef4444;font-size:18px;padding:0">✕</button></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
      '<div><label class="flabel" style="font-size:9px">Séries</label><input type="number" class="sim-inline-input" data-idx="' + j + '" data-field="ser" value="' + item.ser + '"></div>' +
      '<div><label class="flabel" style="font-size:9px">Reps</label><input type="number" class="sim-inline-input" data-idx="' + j + '" data-field="rep" value="' + item.rep + '"></div>' +
      '<div><label class="flabel" style="font-size:9px">Poids</label><input type="number" class="sim-inline-input" data-idx="' + j + '" data-field="pds" step="0.5" value="' + item.pds + '"></div>' +
      '</div></div>';
  }
  list.innerHTML = html;
  calculateSimResults(exList);
}

function calculateSimResults(simList) {
  var currentVol = 0;
  for (var i = 0; i < APP.data.length; i++) currentVol += APP.data[i].vol;
  var simVolGain = 0;
  for (var j = 0; j < simList.length; j++) simVolGain += (simList[j].ser * simList[j].rep * simList[j].pds);
  var newVolTotal  = currentVol + simVolGain;
  var currentLvl   = getLevel(currentVol);
  var nextLvl      = getLevel(newVolTotal);
  $('sim-xp-gain').textContent = '+ ' + fmtV(simVolGain) + ' XP';
  var lvlHtml = '<div style="font-weight:700">Niveau global : ' + currentLvl + ' ➔ ' + nextLvl + '</div>';
  if (nextLvl > currentLvl) {
    lvlHtml += '<div style="color:var(--green);font-size:12px;margin-top:4px;font-weight:800">✨ Level up !</div>';
  } else {
    var remaining = levelThreshold(nextLvl + 1) - newVolTotal;
    lvlHtml += '<div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmtV(remaining) + ' XP pour le niveau ' + (nextLvl + 1) + '</div>';
  }
  $('sim-lvl-preview').innerHTML = lvlHtml;

  var muscleGains = {};
  for (var k = 0; k < simList.length; k++) {
    var item = simList[k];
    for (var m = 0; m < MUSCLES.length; m++) {
      var grp       = MUSCLES[m];
      var influence = getMuscleInfluence(item.ex, grp);
      if (influence > 0) muscleGains[grp] = (muscleGains[grp] || 0) + (item.ser * item.rep * item.pds * influence);
    }
  }
  var muscleHtml = '<div class="clabel" style="margin-bottom:8px">Progression par muscle</div>';
  for (var grpName in muscleGains) {
    var curVolGrp  = volByGroup(grpName);
    var gainGrp    = muscleGains[grpName];
    var newVolGrp  = curVolGrp + gainGrp;
    var curL       = getLevel(curVolGrp);
    var nxtL       = getLevel(newVolGrp);
    var color      = levelColor(nxtL);
    var missingXP  = levelThreshold(curL + 1) - newVolGrp;
    var subText    = nxtL > curL
      ? '<span style="color:var(--green);font-weight:800">LEVEL UP ! (+' + (nxtL - curL) + ')</span>'
      : '<span style="opacity:0.6">-' + fmtV(missingXP) + ' XP manquants</span>';
    muscleHtml += '<div class="card" style="margin-bottom:8px;border-left:4px solid ' + color + ';padding:12px"><div class="flex-between"><div>' +
      '<div style="font-size:14px;font-weight:900;color:#fff">' + grpName + '</div>' +
      '<div style="font-size:12px;color:' + color + ';font-weight:700">Niv. ' + curL + ' ➔ ' + nxtL + '</div>' +
      '</div><div style="text-align:right"><div style="font-size:11px;font-weight:600">' + subText + '</div>' +
      '<div style="font-size:9px;color:var(--text2);margin-top:2px">+ ' + fmtV(gainGrp) + ' XP</div></div></div>' +
      '<div class="bar-bg" style="height:4px;margin-top:8px"><div class="bar-fill" style="width:' + (levelProgress(newVolGrp) * 100).toFixed(0) + '%;background:' + color + '"></div></div></div>';
  }
  $('sim-muscle-results').innerHTML = muscleHtml;
}

function confirmSession() {
  if (!SIM.currentBlock || SIM.currentBlock.exercises.length === 0) return;
  if (!confirm('Logger cette séance dans le journal aujourd\'hui ?')) return;
  var date = todayISO();
  var type = SIM.currentBlock.type || 'Hypertrophie';
  for (var i = 0; i < SIM.currentBlock.exercises.length; i++) {
    var item = SIM.currentBlock.exercises[i];
    addEntry({ date: date, type: type, ex: item.ex, grp: item.grp || getPrimaryGroup(item.ex), ser: item.ser, rep: item.rep, pds: item.pds });
  }
  APP.render();
  toast('Séance loggée dans le journal !');
  closeEditor();
  APP.switchView('seances');
}
