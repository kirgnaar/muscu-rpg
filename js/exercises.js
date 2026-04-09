/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — exercises.js
   Base de données complète des 102 exercices
   Format: [Nom, Chaîne, Groupe, Type]
   ══════════════════════════════════════════════════════════════════════════ */

var EX = [
  // ── HAUT ANTÉRIEUR — PECTORAUX ──────────────────────────────────────────
  ["Développé couché barre",           "Haut Antérieur", {p:"Pectoraux", s:{Triceps:0.4, Épaules:0.3}}, "Poly"],
  ["Développé couché haltères",        "Haut Antérieur", {p:"Pectoraux", s:{Triceps:0.4, Épaules:0.3}}, "Poly"],
  ["Développé incliné barre",          "Haut Antérieur", {p:"Pectoraux", s:{Triceps:0.3, Épaules:0.5}}, "Poly"],
  ["Développé incliné haltères",       "Haut Antérieur", {p:"Pectoraux", s:{Triceps:0.3, Épaules:0.5}}, "Poly"],
  ["Développé décliné barre",          "Haut Antérieur", {p:"Pectoraux", s:{Triceps:0.5, Épaules:0.2}}, "Poly"],
  ["Développé machine",                "Haut Antérieur", {p:"Pectoraux", s:{Triceps:0.3}},           "Poly"],
  ["Pompes",                           "Haut Antérieur", {p:"Pectoraux", s:{Triceps:0.4}},           "Poly"],
  ["Écarté haltères",                  "Haut Antérieur", "Pectoraux",        "Mono"],
  ["Écarté machine / Pec deck",        "Haut Antérieur", "Pectoraux",        "Mono"],
  ["Crossover câble",                  "Haut Antérieur", "Pectoraux",        "Mono"],
  ["Pull over haltère",                "Haut Antérieur", {p:"Pectoraux", s:{Dorsal:0.4}},            "Poly"],
  // ── HAUT ANTÉRIEUR — ÉPAULES ────────────────────────────────────────────
  ["Développé militaire barre",        "Haut Antérieur", {p:"Épaules", s:{Triceps:0.4}},             "Poly"],
  ["Développé militaire haltères",     "Haut Antérieur", {p:"Épaules", s:{Triceps:0.4}},             "Poly"],
  ["Presse épaule machine",            "Haut Antérieur", {p:"Épaules", s:{Triceps:0.4}},             "Poly"],
  ["Arnold press",                     "Haut Antérieur", {p:"Épaules", s:{Triceps:0.4}},             "Poly"],
  ["Élévation latérale haltères",      "Haut Antérieur", "Épaules",          "Mono"],
  ["Élévation latérale câble",         "Haut Antérieur", "Épaules",          "Mono"],
  ["Élévation frontale haltères",      "Haut Antérieur", "Épaules",          "Mono"],
  ["Oiseau haltères",                  "Haut Postérieur","Épaules",          "Mono"],
  ["Face pull câble",                  "Haut Postérieur",{p:"Épaules", s:{Trapèzes:0.5}},            "Poly"],
  ["Rotation externe câble",           "Haut Antérieur", "Épaules",          "Mono"],
  // ── HAUT ANTÉRIEUR — TRICEPS ─────────────────────────────────────────────
  ["Dips",                             "Haut Antérieur", {p:"Triceps", s:{Pectoraux:0.6, Épaules:0.2}}, "Poly"],
  ["Extensions triceps poulie haute",  "Haut Antérieur", "Triceps",          "Mono"],
  ["Triceps poulie 1 bras",            "Haut Antérieur", "Triceps",          "Mono"],
  ["Skull crusher barre",              "Haut Antérieur", "Triceps",          "Mono"],
  ["Kickback triceps haltère",         "Haut Antérieur", "Triceps",          "Mono"],
  ["Triceps machine",                  "Haut Antérieur", "Triceps",          "Mono"],
  ["Développé couché prise serrée",    "Haut Antérieur", {p:"Triceps", s:{Pectoraux:0.4}},           "Poly"],
  ["Pompes prise serrée",              "Haut Antérieur", {p:"Triceps", s:{Pectoraux:0.4}},           "Poly"],
  // ── HAUT POSTÉRIEUR — DORSAL ─────────────────────────────────────────────
  ["Tractions pronation",              "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.4, Trapèzes:0.3}},    "Poly"],
  ["Tractions supination",             "Haut Postérieur",{p:"Biceps", s:{Dorsal:0.6}},               "Poly"],
  ["Tractions neutres",                "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.5}},               "Poly"],
  ["Tirage haut kimono",               "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.4}},               "Poly"],
  ["Tirage poitrine poulie haute",     "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.4}},               "Poly"],
  ["Rowing barre",                     "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.4, Lombaires:0.3}},   "Poly"],
  ["Rowing haltère 1 bras",            "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.4}},               "Poly"],
  ["Rowing machine",                   "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.3}},               "Poly"],
  ["Tirage allongé poulie basse",      "Haut Postérieur",{p:"Dorsal", s:{Biceps:0.4}},               "Poly"],
  ["Rowing vertical / Upright row",    "Haut Postérieur",{p:"Épaules", s:{Trapèzes:0.6}},            "Poly"],
  ["Tirage bras tendu câble",          "Haut Postérieur","Dorsal",           "Mono"],
  ["Pull over poulie",                 "Haut Postérieur",{p:"Dorsal", s:{Triceps:0.3}},              "Poly"],
  // ── HAUT POSTÉRIEUR — BICEPS ──────────────────────────────────────────────
  ["Curl barre droite",                "Haut Postérieur","Biceps",           "Mono"],
  ["Curl barre EZ",                    "Haut Postérieur","Biceps",           "Mono"],
  ["Curl haltères alternés",           "Haut Postérieur","Biceps",           "Mono"],
  ["Curl marteau",                     "Haut Postérieur","Biceps",           "Mono"],
  ["Curl incliné haltères",            "Haut Postérieur","Biceps",           "Mono"],
  ["Curl pupitre / Scott",             "Haut Postérieur","Biceps",           "Mono"],
  ["Biceps poulie 1 bras",             "Haut Postérieur","Biceps",           "Mono"],
  ["Curl câble haute poulie",          "Haut Postérieur","Biceps",           "Mono"],
  // ── HAUT POSTÉRIEUR — TRAPÈZES ───────────────────────────────────────────
  ["Shrugs barre",                     "Haut Postérieur","Trapèzes",         "Mono"],
  ["Shrugs haltères",                  "Haut Postérieur","Trapèzes",         "Mono"],
  ["Shrugs machine",                   "Haut Postérieur","Trapèzes",         "Mono"],
  // ── CORE — ABDOMINAUX ─────────────────────────────────────────────────────
  ["Crunch",                           "Core",           "Abdominaux",       "Mono"],
  ["Crunch machine",                   "Core",           "Abdominaux",       "Mono"],
  ["Relevé de jambes suspendu",        "Core",           "Abdominaux",       "Poly"],
  ["Relevé de buste banc décliné",     "Core",           "Abdominaux",       "Mono"],
  ["Rotation russe",                   "Core",           "Abdominaux",       "Mono"],
  ["Gainage face (planche)",           "Core",           "Abdominaux",       "Mono"],
  ["Gainage latéral",                  "Core",           "Abdominaux",       "Mono"],
  ["Ab wheel (roue abdominale)",       "Core",           {p:"Abdominaux", s:{Lombaires:0.4}},          "Poly"],
  ["Cable crunch poulie haute",        "Core",           "Abdominaux",       "Mono"],
  ["Traction haute kimono isométrique","Core",           "Abdominaux",       "Mono"],
  // ── CORE — LOMBAIRES ──────────────────────────────────────────────────────
  ["Extensions lombaires banc romain", "Core",           "Lombaires",        "Mono"],
  ["Superman",                         "Core",           "Lombaires",        "Mono"],
  ["Good morning barre",               "Core",           {p:"Lombaires", s:{"Ischio-jambiers":0.5}},     "Poly"],
  // ── BAS ANTÉRIEUR — QUADRICEPS ───────────────────────────────────────────
  ["Squat barre",                      "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.5, Lombaires:0.3}}, "Poly"],
  ["Squat gobelet haltère",            "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.4}},           "Poly"],
  ["Squat avant (front squat)",        "Bas Antérieur",  {p:"Quadriceps", s:{Lombaires:0.4}},          "Poly"],
  ["Leg press 45°",                    "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.3}},           "Poly"],
  ["Hack squat machine",               "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.3}},           "Poly"],
  ["Fentes avant haltères",            "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.4}},           "Poly"],
  ["Fentes marchées",                  "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.4}},           "Poly"],
  ["Fentes latérales",                 "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.4}},           "Poly"],
  ["Step up haltères",                 "Bas Antérieur",  {p:"Quadriceps", s:{Fessiers:0.4}},           "Poly"],
  ["Leg extension machine",            "Bas Antérieur",  "Quadriceps",       "Mono"],
  ["Sissy squat",                      "Bas Antérieur",  "Quadriceps",       "Mono"],
  // ── BAS ANTÉRIEUR — FESSIERS ─────────────────────────────────────────────
  ["Hip thrust barre",                 "Bas Antérieur",  {p:"Fessiers", s:{"Ischio-jambiers":0.6}},      "Poly"],
  ["Hip thrust machine",               "Bas Antérieur",  {p:"Fessiers", s:{"Ischio-jambiers":0.6}},      "Poly"],
  ["Sumo squat haltère",               "Bas Antérieur",  {p:"Fessiers", s:{Quadriceps:0.5}},           "Poly"],
  ["Fentes arrière haltères",          "Bas Antérieur",  {p:"Fessiers", s:{Quadriceps:0.5}},           "Poly"],
  ["Abduction hanche câble",           "Bas Antérieur",  "Fessiers",         "Mono"],
  ["Abduction machine",                "Bas Antérieur",  "Fessiers",         "Mono"],
  ["Kickback fessier câble",           "Bas Antérieur",  "Fessiers",         "Mono"],
  ["Glute bridge au sol",              "Bas Antérieur",  "Fessiers",         "Mono"],
  // ── BAS POSTÉRIEUR — ISCHIO-JAMBIERS ─────────────────────────────────────
  ["Soulevé de terre conventionnel",   "Bas Postérieur", {p:"Ischio-jambiers", s:{Lombaires:0.6, Trapèzes:0.4, Fessiers:0.4}}, "Poly"],
  ["Soulevé de terre sumo",            "Bas Postérieur", {p:"Ischio-jambiers", s:{Quadriceps:0.6, Trapèzes:0.4}}, "Poly"],
  ["Soulevé de terre roumain",         "Bas Postérieur", {p:"Ischio-jambiers", s:{Lombaires:0.5, Fessiers:0.4}}, "Poly"],
  ["Leg curl couché machine",          "Bas Postérieur", "Ischio-jambiers",  "Mono"],
  ["Leg curl assis machine",           "Bas Postérieur", "Ischio-jambiers",  "Mono"],
  ["Leg curl debout câble",            "Bas Postérieur", "Ischio-jambiers",  "Mono"],
  ["Nordic curl",                      "Bas Postérieur", "Ischio-jambiers",  "Mono"],
  ["Fentes arrière accent ischio",     "Bas Postérieur", {p:"Ischio-jambiers", s:{Fessiers:0.5}},      "Poly"],
  // ── BAS POSTÉRIEUR — MOLLETS ─────────────────────────────────────────────
  ["Mollets debout machine",           "Bas Postérieur", "Mollets",          "Mono"],
  ["Mollets assis machine",            "Bas Postérieur", "Mollets",          "Mono"],
  ["Mollets presse à jambes",          "Bas Postérieur", "Mollets",          "Mono"],
  ["Mollets haltères 1 jambe",         "Bas Postérieur", "Mollets",          "Mono"],
  ["Mollets à la barre",               "Bas Postérieur", "Mollets",          "Mono"],
  // ── FULL BODY ─────────────────────────────────────────────────────────────
  ["Barre explosive (power clean)",    "Full body",      {p:"Full body", s:{Trapèzes:0.6, Quadriceps:0.6, Dorsal:0.4}}, "Poly"],
  ["Soulevé de terre complet",         "Full body",      {p:"Full body", s:{Lombaires:0.6, "Ischio-jambiers":0.6}}, "Poly"],
  ["Squat sauté",                      "Full body",      {p:"Full body", s:{Quadriceps:0.8}},           "Poly"],
  ["Burpee avec développé",            "Full body",      {p:"Full body", s:{Pectoraux:0.5, Épaules:0.5}},  "Poly"],
];

// Big 6 pour PR tracking
var BIG6 = [
  "Squat barre",
  "Développé couché barre",
  "Soulevé de terre conventionnel",
  "Développé militaire barre",
  "Rowing barre",
  "Leg press 45°",
];

var BIG6_COLORS = ["#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444","#f97316"];

// Groupes musculaires ordonnés
var MUSCLES = [
  "Pectoraux","Épaules","Triceps","Dorsal","Biceps","Trapèzes",
  "Abdominaux","Lombaires","Quadriceps","Fessiers","Ischio-jambiers",
  "Mollets","Full body"
];

// Couleurs par groupe
var MCOL = {
  "Pectoraux":        "#3b82f6",
  "Épaules":          "#60a5fa",
  "Triceps":          "#ef4444",
  "Dorsal":           "#10b981",
  "Biceps":           "#06b6d4",
  "Trapèzes":         "#34d399",
  "Abdominaux":       "#f97316",
  "Lombaires":        "#f59e0b",
  "Quadriceps":       "#8b5cf6",
  "Fessiers":         "#ec4899",
  "Ischio-jambiers":  "#14b8a6",
  "Mollets":          "#64748b",
  "Full body":        "#94a3b8",
};

// Couleurs par type de séance
var TCOL = {
  "Hypertrophie":         "#3b82f6",
  "Force":                "#ef4444",
  "Hyperforce (PR)":      "#8b5cf6",
  "Endurance musculaire": "#10b981",
  "Décharge":             "#64748b",
};

// Icône emoji par groupe musculaire (body map badges)
var MUSCLE_META = {
  "Pectoraux":       { emoji: "💪", side: "front" },
  "Épaules":         { emoji: "🦾", side: "both"  },
  "Triceps":         { emoji: "💪", side: "back"  },
  "Dorsal":          { emoji: "🏋️", side: "back"  },
  "Biceps":          { emoji: "💪", side: "front" },
  "Trapèzes":        { emoji: "🦁", side: "back"  },
  "Abdominaux":      { emoji: "⚡", side: "front" },
  "Lombaires":       { emoji: "🔩", side: "back"  },
  "Quadriceps":      { emoji: "🦵", side: "front" },
  "Fessiers":        { emoji: "🍑", side: "back"  },
  "Ischio-jambiers": { emoji: "🦵", side: "back"  },
  "Mollets":         { emoji: "🦵", side: "both"  },
  "Full body":       { emoji: "🏆", side: "both"  },
};

// Mapper exercice → icône
var ICON_MAP = {
  "Développé couché barre": "bench",
  "Développé couché haltères": "bench",
  "Développé incliné barre": "bench",
  "Développé incliné haltères": "bench",
  "Développé décliné barre": "bench",
  "Développé machine": "bench",
  "Dips": "dip",
  "Pompes": "pushup",
  "Pompes prise serrée": "pushup",
  "Écarté haltères": "fly",
  "Écarté machine / Pec deck": "fly",
  "Crossover câble": "fly",
  "Pull over haltère": "pullover",
  "Pull over poulie": "pullover",
  "Développé militaire barre": "ohp",
  "Développé militaire haltères": "ohp",
  "Presse épaule machine": "ohp",
  "Arnold press": "ohp",
  "Élévation latérale haltères": "lateral",
  "Élévation latérale câble": "lateral",
  "Élévation frontale haltères": "lateral",
  "Abduction hanche câble": "lateral",
  "Abduction machine": "lateral",
  "Oiseau haltères": "fly",
  "Face pull câble": "row",
  "Rotation externe câble": "generic",
  "Extensions triceps poulie haute": "pushdown",
  "Triceps poulie 1 bras": "pushdown",
  "Skull crusher barre": "bench",
  "Kickback triceps haltère": "pushdown",
  "Triceps machine": "pushdown",
  "Développé couché prise serrée": "bench",
  "Tractions pronation": "pullup",
  "Tractions supination": "pullup",
  "Tractions neutres": "pullup",
  "Tirage haut kimono": "pullup",
  "Tirage poitrine poulie haute": "pullup",
  "Traction haute kimono isométrique": "pullup",
  "Relevé de jambes suspendu": "pullup",
  "Rowing barre": "row",
  "Rowing haltère 1 bras": "row",
  "Rowing machine": "row",
  "Tirage allongé poulie basse": "row",
  "Rowing vertical / Upright row": "shrug",
  "Tirage bras tendu câble": "pullover",
  "Barre explosive": "clean",
  "Barre explosive (power clean)": "clean",
  "Curl barre droite": "curl",
  "Curl barre EZ": "curl",
  "Curl haltères alternés": "curl",
  "Curl marteau": "curl",
  "Curl incliné haltères": "curl",
  "Curl pupitre / Scott": "curl",
  "Biceps poulie 1 bras": "curl",
  "Curl câble haute poulie": "curl",
  "Shrugs barre": "shrug",
  "Shrugs haltères": "shrug",
  "Shrugs machine": "shrug",
  "Crunch": "crunch",
  "Crunch machine": "crunch",
  "Relevé de buste banc décliné": "crunch",
  "Rotation russe": "crunch",
  "Cable crunch poulie haute": "crunch",
  "Gainage face (planche)": "plank",
  "Gainage latéral": "plank",
  "Ab wheel (roue abdominale)": "plank",
  "Extensions lombaires banc romain": "back_ext",
  "Superman": "back_ext",
  "Good morning barre": "rdl",
  "Soulevé de terre roumain": "rdl",
  "Squat barre": "squat",
  "Squat gobelet haltère": "squat",
  "Squat avant (front squat)": "squat",
  "Squat sauté": "squat",
  "Sumo squat haltère": "squat",
  "Hack squat machine": "squat",
  "Sissy squat": "legext",
  "Leg press 45°": "legpress",
  "Fentes avant haltères": "lunge",
  "Fentes marchées": "lunge",
  "Fentes latérales": "lunge",
  "Fentes arrière haltères": "lunge",
  "Fentes arrière accent ischio": "lunge",
  "Step up haltères": "lunge",
  "Leg extension machine": "legext",
  "Hip thrust barre": "hipthrust",
  "Hip thrust machine": "hipthrust",
  "Glute bridge au sol": "hipthrust",
  "Kickback fessier câble": "back_ext",
  "Soulevé de terre conventionnel": "deadlift",
  "Soulevé de terre sumo": "deadlift",
  "Soulevé de terre complet": "deadlift",
  "Leg curl couché machine": "legcurl",
  "Leg curl assis machine": "legcurl",
  "Leg curl debout câble": "legcurl",
  "Nordic curl": "legcurl",
  "Mollets debout machine": "calf",
  "Mollets assis machine": "calf",
  "Mollets presse à jambes": "calf",
  "Mollets haltères 1 jambe": "calf",
  "Mollets à la barre": "calf",
  "Burpee avec développé": "pushup",
};

// Population du <select> avec optgroups par chaîne
function populateExerciseSelect(selectEl, includeEmpty) {
  if (includeEmpty) {
    var opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- Choisir un exercice --';
    selectEl.appendChild(opt);
  }
  var groups = {};
  EX.forEach(function(e) {
    if (!groups[e[1]]) groups[e[1]] = [];
    groups[e[1]].push(e);
  });
  Object.keys(groups).forEach(function(g) {
    var og = document.createElement('optgroup');
    og.label = g;
    groups[g].forEach(function(e) {
      var o = document.createElement('option');
      o.value = e[0];
      o.textContent = e[0];
      og.appendChild(o);
    });
    selectEl.appendChild(og);
  });
}

/**
 * Helper: obtenir le groupe principal d'un exercice
 */
function getPrimaryGroup(exName) {
  var ex = EX.find(e => e[0] === exName);
  if (!ex) return "Full body";
  var grp = ex[2];
  return (typeof grp === 'string') ? grp : grp.p;
}

/**
 * Helper: obtenir l'influence d'un exercice sur un groupe donné (0 à 1)
 */
function getMuscleInfluence(exName, targetGrp) {
  var ex = EX.find(e => e[0] === exName);
  if (!ex) return 0;
  var grp = ex[2];
  
  // Cas 1: String simple (100% influence)
  if (typeof grp === 'string') return grp === targetGrp ? 1 : 0;
  
  // Cas 2: Objet avec p (primary) et s (secondary)
  // Influence primaire
  if (grp.p === targetGrp) return 1;
  
  // Influence secondaire
  if (grp.s) {
    // Si s est un tableau, influence fixe de 0.5
    if (Array.isArray(grp.s)) {
      return grp.s.includes(targetGrp) ? 0.5 : 0;
    }
    // Si s est un objet, influence personnalisée
    if (typeof grp.s === 'object') {
      return grp.s[targetGrp] || 0;
    }
  }
  
  return 0;
}
