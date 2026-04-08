/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/badges.js
   Refonte visuelle "RPG / Jeu Vidéo" des badges et succès
   ══════════════════════════════════════════════════════════════════════════ */

var BADGES = { groupFilter: '' };

// ── ICONS ─────────────────────────────────────────────────────────────────
// (Gardons les icônes existantes car elles sont déjà très bien)
var ICONS = {
  bench: '<rect x="5" y="60" width="90" height="8" rx="4" fill="currentColor" opacity=".3"/>'
    +'<ellipse cx="22" cy="45" rx="8" ry="8" fill="currentColor"/>'
    +'<path d="M14,53 L14,68 L10,76 L26,76 L22,68 L22,58 Z" fill="currentColor"/>'
    +'<path d="M22,55 L38,42 L44,34 Z" fill="currentColor"/>'
    +'<rect x="44" y="28" width="50" height="10" rx="5" fill="currentColor"/>'
    +'<ellipse cx="44" cy="33" rx="7" ry="7" fill="currentColor" opacity=".6"/>'
    +'<ellipse cx="94" cy="33" rx="7" ry="7" fill="currentColor" opacity=".6"/>',
  ohp: '<ellipse cx="50" cy="20" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,29 L35,58 L44,58 L48,44 L50,44 L52,44 L56,58 L65,58 L59,29 Z" fill="currentColor"/>'
    +'<path d="M35,38 L22,32 L15,32 L15,42 L28,42 L35,44 Z" fill="currentColor"/>'
    +'<path d="M65,38 L78,32 L85,32 L85,42 L72,42 L65,44 Z" fill="currentColor"/>'
    +'<rect x="12" y="9" width="76" height="10" rx="5" fill="currentColor"/>'
    +'<ellipse cx="12" cy="14" rx="7" ry="7" fill="currentColor" opacity=".6"/>'
    +'<ellipse cx="88" cy="14" rx="7" ry="7" fill="currentColor" opacity=".6"/>'
    +'<path d="M44,58 L40,78 L34,88 L50,88 L56,78 L56,58 Z" fill="currentColor"/>',
  pullup: '<rect x="5" y="5" width="90" height="10" rx="5" fill="currentColor" opacity=".5"/>'
    +'<rect x="18" y="5" width="8" height="28" rx="4" fill="currentColor" opacity=".4"/>'
    +'<rect x="74" y="5" width="8" height="28" rx="4" fill="currentColor" opacity=".4"/>'
    +'<ellipse cx="50" cy="35" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M22,15 L28,34 L50,34 Z" fill="currentColor"/>'
    +'<path d="M78,15 L72,34 L50,34 Z" fill="currentColor"/>'
    +'<path d="M41,44 L36,65 L30,82 L44,82 L50,65 L56,82 L70,82 L64,65 L59,44 Z" fill="currentColor"/>',
  row: '<ellipse cx="22" cy="25" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M13,34 L20,56 L14,72 L28,72 L32,56 L38,44 Z" fill="currentColor"/>'
    +'<path d="M32,40 L58,48 L72,48 L72,58 L58,58 L38,50 Z" fill="currentColor"/>'
    +'<rect x="72" y="42" width="22" height="22" rx="5" fill="currentColor" opacity=".4"/>'
    +'<ellipse cx="80" cy="53" rx="8" ry="8" fill="none" stroke="currentColor" stroke-width="4"/>',
  curl: '<ellipse cx="50" cy="16" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,25 L36,50 L44,50 L50,38 L56,50 L64,50 L59,25 Z" fill="currentColor"/>'
    +'<path d="M36,42 L22,50 L16,62 L16,72 L22,72 L28,60 L40,54 Z" fill="currentColor"/>'
    +'<ellipse cx="15" cy="72" rx="8" ry="8" fill="none" stroke="currentColor" stroke-width="4"/>'
    +'<path d="M44,50 L40,78 L34,90 L50,90 L56,78 L56,50 Z" fill="currentColor"/>',
  squat: '<ellipse cx="50" cy="14" rx="9" ry="9" fill="currentColor"/>'
    +'<rect x="8" y="34" width="84" height="10" rx="5" fill="currentColor"/>'
    +'<path d="M41,23 L38,38 L50,38 L62,38 L59,23 Z" fill="currentColor"/>'
    +'<path d="M38,38 L22,52 L18,72 L30,72 L34,56 L50,46 L66,56 L70,72 L82,72 L78,52 L62,38 Z" fill="currentColor"/>'
    +'<path d="M18,72 L14,88 L30,88 L30,72 Z" fill="currentColor"/>'
    +'<path d="M82,72 L86,88 L70,88 L70,72 Z" fill="currentColor"/>',
  deadlift: '<ellipse cx="36" cy="20" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M27,29 L24,48 L32,48 L36,38 L44,52 L60,66 Z" fill="currentColor"/>'
    +'<path d="M27,32 L16,40 L32,62 L44,52 Z" fill="currentColor"/>'
    +'<path d="M24,48 L20,66 L14,80 L28,80 L32,66 L36,80 L50,80 L44,66 L44,52 Z" fill="currentColor"/>'
    +'<rect x="6" y="78" width="88" height="10" rx="5" fill="currentColor"/>'
    +'<ellipse cx="10" cy="72" rx="9" ry="9" fill="currentColor" opacity=".6"/>'
    +'<ellipse cx="90" cy="72" rx="9" ry="9" fill="currentColor" opacity=".6"/>',
  legpress: '<rect x="60" y="5" width="35" height="80" rx="8" fill="currentColor" opacity=".25"/>'
    +'<ellipse cx="20" cy="30" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M11,39 L10,55 L18,55 L22,45 L30,60 L42,46 L60,30 L60,22 L42,34 Z" fill="currentColor"/>'
    +'<path d="M10,55 L8,72 L20,72 L20,55 Z" fill="currentColor"/>'
    +'<path d="M20,55 L30,60 L42,46 L40,68 L30,72 L18,72 Z" fill="currentColor"/>',
  generic: '<ellipse cx="50" cy="14" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,23 L34,46 L42,46 L50,32 L58,46 L66,46 L59,23 Z" fill="currentColor"/>'
    +'<path d="M34,34 L14,28 L12,38 L30,46 Z" fill="currentColor"/>'
    +'<path d="M66,34 L86,28 L88,38 L70,46 Z" fill="currentColor"/>'
    +'<path d="M42,46 L38,72 L32,88 L50,88 L56,72 L62,88 L68,72 L62,46 Z" fill="currentColor"/>',
};

// ── Init ──────────────────────────────────────────────────────────────────
function initBadges() {
  $('badge-filter').addEventListener('click', function(ev) {
    var pill = ev.target.closest('.bfpill');
    if (!pill) return;
    $$('.bfpill', $('badge-filter')).forEach(function(p) { p.classList.remove('on'); });
    pill.classList.add('on');
    BADGES.groupFilter = pill.dataset.grp;
    renderBadgeGrid();
  });
}

// ── Render ────────────────────────────────────────────────────────────────
function renderBadges() {
  // 3D Model handled by body3d.js init
  renderMuscleBadges();
  renderGlobalAchievements();
  renderBadgeFilterPills();
  renderBadgeGrid();
}

// ── Muscle badges ─────────────────────────────────────────────────────────
function renderMuscleBadges() {
  var row = $('muscle-badges-row');
  if (!row) return;
  row.innerHTML = MUSCLES.map(function(m) {
    var n    = seriesCountByGroup(m);
    var ti   = getTier(n);
    var meta = MUSCLE_META[m] || { emoji: '💪' };
    var pct  = (getTierProgress(n) * 100).toFixed(0);
    return '<div class="mbdg ' + ti.cls + '">'
         + '<span class="mbdg-ico">' + meta.emoji + '</span>'
         + '<div class="mbdg-nm">' + m + '</div>'
         + '<span class="mbdg-t">' + ti.emoji + ' ' + ti.name + '</span>'
         + '<div class="mbdg-pb"><div class="mbdg-pf" style="width:' + pct + '%"></div></div>'
         + '</div>';
  }).join('');
}

// ── Succès Globaux ────────────────────────────────────────────────────────
function renderGlobalAchievements() {
  var container = $('badge-filter'); // On va injecter ça avant les filtres
  var totalVol = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var totalSes = allDates().length;
  
  // 1. Volume
  var volTitle = "Novice du levage";
  var volIco = "🧱";
  if (totalVol >= 1000000) { volTitle = "Le Titan"; volIco = "🌍"; }
  else if (totalVol >= 500000) { volTitle = "Force de la Nature"; volIco = "🌪️"; }
  else if (totalVol >= 100000) { volTitle = "Poids Lourd"; volIco = "🚛"; }
  else if (totalVol >= 50000) { volTitle = "Poids Moyen"; volIco = "📦"; }
  
  // 2. Assiduité
  var sesTitle = "Nouveau Visiteur";
  var sesIco = "👋";
  if (totalSes >= 100) { sesTitle = "Pilier du Club"; sesIco = "🏛️"; }
  else if (totalSes >= 50) { sesTitle = "Fanatique"; sesIco = "🔥"; }
  else if (totalSes >= 25) { sesTitle = "Adepte"; sesIco = "🧘"; }
  else if (totalSes >= 10) { sesTitle = "Habitué"; sesIco = "🎫"; }

  var html = '<div class="clabel" style="margin:20px 0 10px">Succès Globaux</div>'
           + '<div class="ach-section">'
           + '<div class="ach-card" style="border-left-color: #f97316">'
           + '<div class="ach-ico">' + volIco + '</div>'
           + '<div class="ach-info"><div class="ach-nm">' + volTitle + '</div><div class="ach-desc">Volume total : ' + fmtV(totalVol) + '</div></div>'
           + '</div>'
           + '<div class="ach-card" style="border-left-color: #3b82f6">'
           + '<div class="ach-ico">' + sesIco + '</div>'
           + '<div class="ach-info"><div class="ach-nm">' + sesTitle + '</div><div class="ach-desc">' + totalSes + ' séances enregistrées</div></div>'
           + '</div>'
           + '</div>';
           
  // Injection propre avant les filtres
  var target = document.querySelector('#v-badges .clabel[style*="Badges Exercices"]');
  if (target) {
    var old = document.getElementById('global-ach-box');
    if (old) old.remove();
    var box = document.createElement('div');
    box.id = 'global-ach-box';
    box.innerHTML = html;
    target.parentNode.insertBefore(box, target);
  }
}

// ── Filter pills ──────────────────────────────────────────────────────────
function renderBadgeFilterPills() {
  var el = $('badge-filter');
  if (!el) return;
  var grps = [''].concat(MUSCLES);
  el.innerHTML = grps.map(function(g) {
    return '<button class="bfpill' + (g === BADGES.groupFilter ? ' on' : '') + '" data-grp="' + g + '">'
         + (g || 'Tous') + '</button>';
  }).join('');
}

// ── Badge grid ────────────────────────────────────────────────────────────
function renderBadgeGrid() {
  var grid = $('badge-grid');
  if (!grid) return;

  var counts = {};
  APP.data.forEach(function(e) {
    counts[e.ex] = (counts[e.ex] || 0) + 1;
  });

  var exList = EX.filter(function(e) {
    return !BADGES.groupFilter || e[2] === BADGES.groupFilter;
  });

  // Débloqués (triés par tier desc), puis locked
  var unlocked = exList.filter(function(e) { return counts[e[0]] > 0; });
  var locked   = exList.filter(function(e) { return !counts[e[0]]; });
  unlocked.sort(function(a, b) { return (counts[b[0]] || 0) - (counts[a[0]] || 0); });

  var all = unlocked.concat(locked);

  grid.innerHTML = all.map(function(ex) {
    var name    = ex[0];
    var n       = counts[name] || 0;
    var ti      = getTier(n);
    var pct     = (getTierProgress(n) * 100).toFixed(0);
    var next    = getNextTierCount(n);
    var earned  = n >= 10;
    var iconKey = ICON_MAP[name] || 'generic';
    var svg     = ICONS[iconKey] || ICONS.generic;
    var cntLbl  = n > 0 ? (next ? n + '/' + next + ' séries' : '✓ MAX') : '0 série';

    return '<div class="bdg ' + ti.cls + (earned ? ' earned' : '') + '">'
         + '<div class="bdg-ico" style="color:' + (n > 0 ? ti.col : '#374151') + '">'
         + '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>'
         + '</div>'
         + '<div class="bdg-nm">' + name + '</div>'
         + '<div class="bdg-tier">' + (n > 0 ? ti.emoji + ' ' + ti.name : '○ Inactif') + '</div>'
         + '<div class="bdg-pb"><div class="bdg-pf" style="width:' + (n > 0 ? pct : 0) + '%"></div></div>'
         + '<div class="bdg-cnt">' + cntLbl + '</div>'
         + '</div>';
  }).join('');
}
