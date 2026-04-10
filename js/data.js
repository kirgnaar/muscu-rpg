/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — data.js
   Couche données: localStorage, CRUD, détection PR (ES5 Stable)
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
    if (typeof toast === 'function') toast('Erreur de sauvegarde', 'err');
  }
}

/**
 * Ajouter une entrée
 */
function addEntry(entry) {
  var data = APP.data;
  var vol = entry.ser * entry.rep * entry.pds;
  var rm1 = epley(entry.pds, entry.rep);

  var isPR = false;
  if (entry.pds >= 1) { // PR possible sur tout exercice avec charge
    var prevBest = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].ex === entry.ex) {
        var val = epley(data[i].pds, data[i].rep);
        if (val > prevBest) prevBest = val;
      }
    }
    if (rm1 > prevBest && prevBest > 0) isPR = true;
  }

  var prevVol = 0;
  for (var j = 0; j < data.length; j++) prevVol += data[j].vol;
  var prevLvl = getLevel(prevVol);

  var newEntry = {
    id:    Date.now() + Math.floor(Math.random() * 1000),
    date:  entry.date,
    type:  entry.type,
    ex:    entry.ex,
    grp:   entry.grp || getPrimaryGroup(entry.ex),
    ser:   entry.ser,
    rep:   entry.rep,
    pds:   entry.pds,
    vol:   vol,
    rm1:   rm1,
    isPR:  isPR
  };

  APP.data.push(newEntry);
  APP.save();

  var newVol = prevVol + vol;
  var newLvl = getLevel(newVol);
  if (newLvl > prevLvl) {
    newEntry.isLevelUp = true;
    newEntry.newLvl = newLvl;
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }

  return newEntry;
}

/**
 * Supprimer une entrée
 */
function deleteEntry(id) {
  var newData = [];
  for (var i = 0; i < APP.data.length; i++) {
    if (APP.data[i].id !== id) newData.push(APP.data[i]);
  }
  APP.data = newData;
  APP.save();
}

/**
 * Nombre de séries pour un exercice
 */
function countSeries(exName) {
  var sum = 0;
  for (var i = 0; i < APP.data.length; i++) {
    if (APP.data[i].ex === exName) sum += (APP.data[i].ser || 0);
  }
  return sum;
}

/**
 * Meilleur 1RM historique
 */
function bestRM1(exName) {
  var best = 0;
  for (var i = 0; i < APP.data.length; i++) {
    if (APP.data[i].ex === exName && APP.data[i].pds >= 10) {
      var val = epley(APP.data[i].pds, APP.data[i].rep);
      if (val > best) best = val;
    }
  }
  return best;
}

/**
 * Entrée correspondant au record 1RM
 */
function bestRM1Entry(exName) {
  var bestVal = 0;
  var bestE = null;
  for (var i = 0; i < APP.data.length; i++) {
    if (APP.data[i].ex === exName && APP.data[i].pds >= 10) {
      var val = epley(APP.data[i].pds, APP.data[i].rep);
      if (val > bestVal) {
        bestVal = val;
        bestE = APP.data[i];
      }
    }
  }
  return bestE;
}

/**
 * Meilleur 1RM pour un exercice à une date donnée
 */
function bestRM1ForDate(exName, date) {
  var best = 0;
  for (var i = 0; i < APP.data.length; i++) {
    var e = APP.data[i];
    if (e.ex === exName && e.date === date && e.pds >= 10) {
      var val = epley(e.pds, e.rep);
      if (val > best) best = val;
    }
  }
  return best;
}

/**
 * Volume total pour un groupe musculaire
 */
function volByGroup(grp) {
  var sum = 0;
  for (var i = 0; i < APP.data.length; i++) {
    var e = APP.data[i];
    var influence = getMuscleInfluence(e.ex, grp);
    sum += (e.vol * influence);
  }
  return sum;
}

/**
 * Historique par date pour un exercice
 */
function exerciseHistory(exName) {
  var byDate = {};
  for (var i = 0; i < APP.data.length; i++) {
    var e = APP.data[i];
    if (e.ex === exName) {
      if (!byDate[e.date]) byDate[e.date] = { date: e.date, vol: 0, rm1: 0 };
      byDate[e.date].vol += e.vol;
      var val = epley(e.pds, e.rep);
      if (val > byDate[e.date].rm1) byDate[e.date].rm1 = val;
    }
  }
  var keys = [];
  for (var k in byDate) keys.push(byDate[k]);
  return keys.sort(function(a, b) { return a.date.localeCompare(b.date); });
}

/**
 * Toutes les dates de séances uniques, triées desc
 */
function allDates() {
  var dates = [];
  for (var i = 0; i < APP.data.length; i++) {
    var d = APP.data[i].date;
    if (dates.indexOf(d) === -1) dates.push(d);
  }
  return dates.sort().reverse();
}
