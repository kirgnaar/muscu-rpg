/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — data.js
   Couche données: localStorage, CRUD, détection PR
══════════════════════════════════════════════════════════════════════════ */

var DB_KEY = 'mrpg_v2';

/**
 * Charger les données depuis localStorage
 */
function loadData() {
  try {
    var raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.error('[data] Load error:', e);
    return [];
  }
}

/**
 * Sauvegarder les données dans localStorage
 */
function saveData(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch(e) {
    console.error('[data] Save error:', e);
    toast('Erreur de sauvegarde', 'err');
  }
}

/**
 * Ajouter une entrée
 * @param {object} entry - données de la série
 * @returns {object} entry enrichie (avec id, vol, rm1, isPR)
 */
function addEntry(entry) {
  var data = APP.data;

  var vol = entry.ser * entry.rep * entry.pds;
  var rm1 = epley(entry.pds, entry.rep);

  // Détection PR: Big 6, poids >= 10kg, nouveau record 1RM
  var isPR = false;
  if (BIG6.indexOf(entry.ex) !== -1 && entry.pds >= 10) {
    var prevBest = data
      .filter(function(e) { return e.ex === entry.ex && e.pds >= 10; })
      .reduce(function(best, e) { return Math.max(best, epley(e.pds, e.rep)); }, 0);
    if (rm1 > prevBest) isPR = true;
  }

  var newEntry = {
    id:    Date.now() + Math.floor(Math.random() * 1000),
    date:  entry.date,
    type:  entry.type,
    ex:    entry.ex,
    grp:   entry.grp,
    ser:   entry.ser,
    rep:   entry.rep,
    pds:   entry.pds,
    vol:   vol,
    rm1:   rm1,
    isPR:  isPR,
  };

  APP.data.push(newEntry);
  APP.save();
  return newEntry;
}

/**
 * Supprimer une entrée par id
 */
function deleteEntry(id) {
  APP.data = APP.data.filter(function(e) { return e.id !== id; });
  APP.save();
}

// ── Statistiques ─────────────────────────────────────────────────────────
/**
 * Nombre de séries pour un exercice
 */
function countSeries(exName) {
  return APP.data.filter(function(e) { return e.ex === exName; }).length;
}

/**
 * Meilleur 1RM estimé pour un exercice
 */
function bestRM1(exName) {
  var entries = APP.data.filter(function(e) {
    return e.ex === exName && e.pds >= 10;
  });
  if (!entries.length) return 0;
  return entries.reduce(function(best, e) {
    return Math.max(best, epley(e.pds, e.rep));
  }, 0);
}

/**
 * Entrée du meilleur 1RM pour un exercice
 */
function bestRM1Entry(exName) {
  var entries = APP.data.filter(function(e) {
    return e.ex === exName && e.pds >= 10;
  });
  if (!entries.length) return null;
  return entries.reduce(function(best, e) {
    return epley(e.pds, e.rep) > epley(best.pds, best.rep) ? e : best;
  });
}

/**
 * Meilleur 1RM pour un exercice à une date donnée
 */
function bestRM1ForDate(exName, date) {
  var entries = APP.data.filter(function(e) {
    return e.ex === exName && e.date === date && e.pds >= 10;
  });
  if (!entries.length) return 0;
  return entries.reduce(function(best, e) {
    return Math.max(best, epley(e.pds, e.rep));
  }, 0);
}

/**
 * Volume total pour un groupe musculaire
 */
function volByGroup(grp) {
  return APP.data.reduce(function(s, e) {
    return e.grp === grp ? s + e.vol : s;
  }, 0);
}

/**
 * Volume total pour un exercice par date (pour les graphiques)
 * Retourne [{date, vol, rm1}, ...]
 */
function exerciseHistory(exName) {
  var byDate = {};
  APP.data
    .filter(function(e) { return e.ex === exName; })
    .forEach(function(e) {
      if (!byDate[e.date]) byDate[e.date] = { date: e.date, vol: 0, rm1: 0 };
      byDate[e.date].vol += e.vol;
      byDate[e.date].rm1  = Math.max(byDate[e.date].rm1, epley(e.pds, e.rep));
    });
  return Object.values(byDate).sort(function(a, b) { return a.date.localeCompare(b.date); });
}

/**
 * Toutes les dates de séances uniques, triées desc
 */
function allDates() {
  return [...new Set(APP.data.map(function(e) { return e.date; }))].sort().reverse();
}
