/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — tiers.js
   Système de tiers (Bronze→Platine) et niveaux RPG 1→100 (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

// ── Tiers (basés sur nombre de séries totales par exercice) ───────────────
var TIERS = [
  { name: 'Inactif',   min: 0,    cls: 't0', col: '#4b5563', rate: '100%',  label: 'Bloqué' },
  { name: 'Novice',    min: 10,   cls: 't1', col: '#94a3b8', rate: '95.0%', label: 'COMMUN' },
  { name: 'Initié',    min: 25,   cls: 't2', col: '#10b981', rate: '60.0%', label: 'PEU COMMUN' },
  { name: 'Athlète',   min: 50,   cls: 't3', col: '#3b82f6', rate: '25.0%', label: 'RARE' },
  { name: 'Expert',    min: 100,  cls: 't4', col: '#a855f7', rate: '8.0%',  label: 'ÉPIQUE' },
  { name: 'Maître',    min: 250,  cls: 't5', col: '#fbbf24', rate: '2.0%',  label: 'LÉGENDAIRE' },
  { name: 'Légende',   min: 1000, cls: 't6', col: '#22d3ee', rate: '0.1%',  label: 'MYTHIQUE' },
  { name: 'Divin',     min: 2500, cls: 't7', col: '#ffffff', rate: '0.01%', label: 'RELIQUE' },
];

var TIER_NEXT_MIN = [10, 25, 50, 100, 250, 1000, 2500, null];

function getTier(n) {
  var t = TIERS[0];
  for (var i = TIERS.length - 1; i >= 0; i--) {
    if (n >= TIERS[i].min) { t = TIERS[i]; break; }
  }
  return t;
}

function getTierIndex(n) {
  var idx = 0;
  for (var i = TIERS.length - 1; i >= 0; i--) {
    if (n >= TIERS[i].min) { idx = i; break; }
  }
  return idx;
}

function getTierProgress(n) {
  var ti = getTierIndex(n);
  if (ti >= TIERS.length - 1) return 1;
  var low  = TIERS[ti].min;
  var high = TIERS[ti + 1].min;
  return Math.min(1, (n - low) / (high - low));
}

function getNextTierCount(n) {
  for (var i = 1; i < TIERS.length; i++) {
    if (n < TIERS[i].min) return TIERS[i].min;
  }
  return null;
}

// ── RPG Levels 1→100 ─────────────────────────────────────────────────────

/**
 * Titres RPG évolutifs
 */
function levelName(lvl) {
  if (lvl >= 100) return 'LÉGENDE — Niv. 100';
  if (lvl >= 95)  return 'GRAND MAÎTRE — Niv. ' + lvl;
  if (lvl >= 85)  return 'MAÎTRE — Niv. '       + lvl;
  if (lvl >= 70)  return 'EXPERT — Niv. '       + lvl;
  if (lvl >= 50)  return 'GUERRIER — Niv. '     + lvl;
  if (lvl >= 30)  return 'APPRENTI — Niv. '     + lvl;
  if (lvl >= 15)  return 'NOVICE — Niv. '       + lvl;
  if (lvl >= 5)   return 'ÉVEIL — Niv. '        + lvl;
  return 'LATENT — Niv. ' + lvl;
}

/**
 * Synchronisation avec utils.js:getColorForLevel
 */
function levelColor(lvl) {
  return getColorForLevel(lvl);
}

/**
 * Nombre de séries pour un groupe musculaire (Score Hybride Option B)
 * Score = (Total Pondéré * 0.4) + (Meilleur Exercice Pondéré * 0.6)
 * Évite d'être Expert sans maîtriser au moins un mouvement.
 */
function seriesCountByGroup(grp) {
  var totalWeightedSets = 0;
  var bestExWeightedSets = 0;

  for (var i = 0; i < EX.length; i++) {
    var exData = EX[i];
    var influence = getMuscleInfluence(exData[0], grp);
    if (influence > 0) {
      var setsForEx = 0;
      for (var j = 0; j < APP.data.length; j++) {
        var entry = APP.data[j];
        if (entry.ex === exData[0]) {
          setsForEx += (entry.ser || 0);
        }
      }
      var weighted = setsForEx * influence;
      totalWeightedSets += weighted;
      if (weighted > bestExWeightedSets) {
        bestExWeightedSets = weighted;
      }
    }
  }

  // Formule Hybride Option B
  var hybridScore = (totalWeightedSets * 0.4) + (bestExWeightedSets * 0.6);
  return Math.floor(hybridScore);
}

function tierCol(grp) {
  return getTier(seriesCountByGroup(grp)).col;
}
