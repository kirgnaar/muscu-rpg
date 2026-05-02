/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — data.js
   Couche données: localStorage, CRUD, détection PR (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var DB_KEY = 'mrpg_v2';
var USER_KEY = 'mrpg_user';

var DEFAULT_USER = {
  nom: 'Muscu',
  prenom: 'Guerrier',
  age: 25,
  poids: 75,
  taille: 180,
  langue: 'fr',
  theme: 'dark'
};

/**
 * Charger le profil utilisateur
 */
function loadUser() {
  try {
    var raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USER;
  } catch(e) {
    return DEFAULT_USER;
  }
}

/**
 * Sauvegarder le profil utilisateur et déclencher la sync
 */
function saveUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    var timestamp = Date.now();
    localStorage.setItem('mrpg_last_sync', timestamp.toString());

    if (window.Auth && window.Auth.user && window.pushToCloud) {
      window.pushToCloud(window.Auth.user.uid, {
        sessions: APP.data,
        user: APP.user,
        blocks: (window.SIM && SIM.blocks) ? SIM.blocks : []
      });
    }
  } catch(e) {}
}

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
 * Sauvegarder les données dans localStorage et déclencher la sync cloud
 */
function saveData(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    var timestamp = Date.now();
    localStorage.setItem('mrpg_last_sync', timestamp.toString());

    // Déclencher la sync Cloud si l'utilisateur est connecté
    // On utilise dynamic import pour rester compatible ES5 et éviter les erreurs de chargement
    if (window.Auth && window.Auth.user && window.pushToCloud) {
      window.pushToCloud(window.Auth.user.uid, {
        sessions: APP.data,
        user: APP.user,
        blocks: (window.SIM && SIM.blocks) ? SIM.blocks : []
      });
    }
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

  // Détecter le mode : priorité à exMode explicite, sinon déduire du type d'exercice
  var rawMode = entry.exMode || getExType(entry.ex);
  var isTimed  = (rawMode === 'timed'  || rawMode === 'Timed');
  var isCardio = (rawMode === 'cardio' || rawMode === 'Cardio');

  var vol, rm1 = 0, isPR = false;
  if (isTimed) {
    var dur = entry.dur || entry.rep || 0;
    vol = entry.ser * dur; // total secondes d'effort
  } else if (isCardio) {
    var dist = entry.dist || 0;
    var durC = entry.dur || 0;
    vol = dist > 0 ? Math.round(dist * 100) : Math.round(durC * 10);
  } else {
    vol = entry.ser * entry.rep * entry.pds;
    rm1 = epley(entry.pds, entry.rep);
    if (entry.pds >= 1) {
      var prevBest = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i].ex === entry.ex) {
          var val = epley(data[i].pds, data[i].rep);
          if (val > prevBest) prevBest = val;
        }
      }
      if (rm1 > prevBest && prevBest > 0) isPR = true;
    }
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
    ser:   entry.ser || 1,
    rep:   entry.rep || 0,
    pds:   entry.pds || 0,
    vol:   vol,
    rm1:   rm1,
    isPR:  isPR
  };
  if (isTimed)  { newEntry.exMode = 'timed';  newEntry.dur = entry.dur || entry.rep || 0; }
  if (isCardio) { newEntry.exMode = 'cardio'; newEntry.dur = entry.dur || 0; newEntry.dist = entry.dist || 0; }

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

/**
 * Liste de tous les noms d'exercices existants (statique)
 */
function getAllExercises() {
  var list = [];
  for (var i = 0; i < EX.length; i++) {
    list.push(EX[i][0]);
  }
  return list;
}

/**
 * Liste des exercices ayant au moins une série enregistrée
 */
function allExercisesWithData() {
  var list = [];
  for (var i = 0; i < APP.data.length; i++) {
    var ex = APP.data[i].ex;
    if (list.indexOf(ex) === -1) list.push(ex);
  }
  return list.sort();
}
