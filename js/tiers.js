/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — tiers.js
   Système de tiers (Bronze→Platine) et niveaux RPG 1→100
══════════════════════════════════════════════════════════════════════════ */

// ── Tiers (basés sur nombre de séries totales par exercice) ───────────────
var TIERS = [
  { name: 'Inactif',   min: 0,   cls: 't0', col: '#4b5563', emoji: '🔒',  label: 'Non débloqué' },
  { name: 'Novice',    min: 10,  cls: 't1', col: '#cd7f32', emoji: '🥉', label: 'Novice'       },
  { name: 'Guerrier',  min: 25,  cls: 't2', col: '#94a3b8', emoji: '🥈', label: 'Guerrier'     },
  { name: 'Chevalier', min: 50,  cls: 't3', col: '#fbbf24', emoji: '🥇', label: 'Chevalier'    },
  { name: 'Champion',  min: 100, cls: 't4', col: '#22d3ee', emoji: '💎', label: 'Champion'     },
  { name: 'Légende',   min: 200, cls: 't5', col: '#c084fc', emoji: '🔮', label: 'Légende'      },
];

// Tier suivant (null si max)
var TIER_NEXT_MIN = [10, 25, 50, 100, 200, null];

/**
 * Retourne l'objet tier pour un nombre de séries donné
 */
function getTier(n) {
  var t = TIERS[0];
  for (var i = TIERS.length - 1; i >= 0; i--) {
    if (n >= TIERS[i].min) { t = TIERS[i]; break; }
  }
  return t;
}

/**
 * Index du tier (0-5)
 */
function getTierIndex(n) {
  var idx = 0;
  for (var i = TIERS.length - 1; i >= 0; i--) {
    if (n >= TIERS[i].min) { idx = i; break; }
  }
  return idx;
}

/**
 * Progression (0-1) dans le tier actuel
 */
function getTierProgress(n) {
  var ti = getTierIndex(n);
  if (ti >= TIERS.length - 1) return 1;
  var low  = TIERS[ti].min;
  var high = TIERS[ti + 1].min;
  return Math.min(1, (n - low) / (high - low));
}

/**
 * Nombre de séries nécessaires pour le tier suivant (null si max)
 */
function getNextTierCount(n) {
  for (var i = 1; i < TIERS.length; i++) {
    if (n < TIERS[i].min) return TIERS[i].min;
  }
  return null;
}

// ── RPG Levels 1→100 ─────────────────────────────────────────────────────
// Formule: XP requis pour niveau N = 5000 × N^(19/10)
// Calibré pour que niveau 10 ≈ 3 mois d'entraînement régulier

var RPG_BASE = 5000;
var RPG_EXP  = 19 / 10; // 1.9

/**
 * Volume cumulé requis pour atteindre le niveau N
 */
function levelThreshold(n) {
  return RPG_BASE * Math.pow(n, RPG_EXP);
}

/**
 * Niveau actuel (0-100) pour un volume donné
 */
function getLevel(vol) {
  return Math.min(100, Math.floor(Math.pow(vol / RPG_BASE, 1 / RPG_EXP)));
}

/**
 * Progression (0-1) dans le niveau actuel
 */
function levelProgress(vol) {
  var lvl = getLevel(vol);
  if (lvl >= 100) return 1;
  var low  = levelThreshold(lvl);
  var high = levelThreshold(lvl + 1);
  return Math.min(1, (vol - low) / (high - low));
}

/**
 * Nom du niveau avec emoji de rang
 */
function levelName(lvl) {
  if (lvl >= 100) return '🔴 ÉLITE — Niv. 100';
  if (lvl >= 76)  return '🟠 Expert — Niv. '   + lvl;
  if (lvl >= 51)  return '🟣 Avancé — Niv. '   + lvl;
  if (lvl >= 26)  return '🔵 Inter. — Niv. '   + lvl;
  if (lvl >= 11)  return '🟢 Débutant — Niv. ' + lvl;
  if (lvl >= 1)   return '⚪ Novice — Niv. '   + lvl;
  return '⚪ Niv. 0';
}

/**
 * Couleur du niveau
 */
function levelColor(lvl) {
  if (lvl >= 76) return '#f97316';
  if (lvl >= 51) return '#8b5cf6';
  if (lvl >= 26) return '#3b82f6';
  if (lvl >= 11) return '#10b981';
  return '#94a3b8';
}

/**
 * Nombre de séries pour un groupe musculaire
 * (moyenne des exercices pratiqués dans ce groupe)
 */
function seriesCountByGroup(grp) {
  var done = EX.filter(function(e) {
    return e[2] === grp && APP.data.filter(function(d){ return d.ex === e[0]; }).length > 0;
  });
  if (!done.length) return 0;
  var total = done.reduce(function(s, e) {
    return s + APP.data.filter(function(d){ return d.ex === e[0]; }).length;
  }, 0);
  return Math.floor(total / done.length);
}

/**
 * Couleur du tier pour un groupe musculaire
 */
function tierCol(grp) {
  return getTier(seriesCountByGroup(grp)).col;
}
