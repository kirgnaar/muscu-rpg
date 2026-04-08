/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/badges.js
   Interface Professionnelle inspirée par Hevy
   ══════════════════════════════════════════════════════════════════════════ */

var BADGES = { groupFilter: '' };

// ── ICONS ─────────────────────────────────────────────────────────────────
var ICONS = {
  bench: '<rect x="10" y="65" width="80" height="6" rx="3" fill="currentColor" opacity=".3"/>'
    +'<path d="M20,60 L20,70 L15,80 L35,80 L30,70 L30,60 Z" fill="currentColor"/>'
    +'<rect x="40" y="35" width="45" height="8" rx="4" fill="currentColor"/>'
    +'<circle cx="40" cy="39" r="6" fill="currentColor" opacity=".6"/>'
    +'<circle cx="85" cy="39" r="6" fill="currentColor" opacity=".6"/>',
  ohp: '<circle cx="50" cy="25" r="8" fill="currentColor"/>'
    +'<path d="M42,35 L38,65 L62,65 L58,35 Z" fill="currentColor"/>'
    +'<rect x="15" y="15" width="70" height="8" rx="4" fill="currentColor"/>'
    +'<circle cx="15" cy="19" r="6" fill="currentColor" opacity=".6"/>'
    +'<circle cx="85" cy="19" r="6" fill="currentColor" opacity=".6"/>',
  pullup: '<rect x="10" y="10" width="80" height="6" rx="3" fill="currentColor" opacity=".5"/>'
    +'<circle cx="50" cy="40" r="8" fill="currentColor"/>'
    +'<path d="M42,50 L38,80 L62,80 L58,50 Z" fill="currentColor"/>'
    +'<path d="M25,20 L35,40 L50,40 L65,40 L75,20 Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
  row: '<circle cx="30" cy="30" r="8" fill="currentColor"/>'
    +'<path d="M22,40 L20,70 L40,70 L38,40 Z" fill="currentColor"/>'
    +'<path d="M35,45 L70,55 L70,70 L35,60 Z" fill="currentColor"/>'
    +'<rect x="70" y="50" width="20" height="20" rx="4" fill="currentColor" opacity=".4"/>',
  curl: '<circle cx="50" cy="20" r="8" fill="currentColor"/>'
    +'<path d="M42,30 L38,60 L62,60 L58,30 Z" fill="currentColor"/>'
    +'<path d="M38,45 L20,60 L25,85 L35,85 L30,65 Z" fill="currentColor"/>'
    +'<circle cx="20" cy="85" r="8" fill="none" stroke="currentColor" stroke-width="4"/>',
  squat: '<circle cx="50" cy="20" r="8" fill="currentColor"/>'
    +'<rect x="15" y="35" width="70" height="8" rx="4" fill="currentColor"/>'
    +'<path d="M42,30 L38,45 L50,45 L62,45 L58,30 Z" fill="currentColor"/>'
    +'<path d="M38,45 L25,65 L20,90 L35,90 L40,70 L50,55 L60,70 L65,90 L80,90 L75,65 L62,45 Z" fill="currentColor"/>',
  deadlift: '<circle cx="40" cy="25" r="8" fill="currentColor"/>'
    +'<path d="M32,35 L28,60 L45,85 L55,85 L52,60 L48,35 Z" fill="currentColor"/>'
    +'<rect x="10" y="80" width="80" height="8" rx="4" fill="currentColor"/>'
    +'<circle cx="15" cy="75" r="8" fill="currentColor" opacity=".6"/>'
    +'<circle cx="85" cy="75" r="8" fill="currentColor" opacity=".6"/>',
  legpress: '<rect x="65" y="10" width="25" height="80" rx="5" fill="currentColor" opacity=".2"/>'
    +'<circle cx="30" cy="35" r="8" fill="currentColor"/>'
    +'<path d="M22,45 L20,65 L45,55 L65,40 L65,30 L45,45 Z" fill="currentColor"/>',
  generic: '<circle cx="50" cy="25" r="8" fill="currentColor"/>'
    +'<path d="M42,35 L38,60 L62,60 L58,35 Z" fill="currentColor"/>'
    +'<path d="M38,45 L20,40 L15,55 L35,65 Z" fill="currentColor" opacity=".5"/>'
    +'<path d="M62,45 L80,40 L85,55 L65,65 Z" fill="currentColor" opacity=".5"/>',
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
    var pct  = (getTierProgress(n) * 100).toFixed(0);
    return '<div class="mbdg ' + ti.cls + '">'
         + '<div class="mbdg-nm">' + m + '</div>'
         + '<span class="mbdg-t">' + ti.name + '</span>'
         + '<div class="mbdg-pb" style="height:2px; background:rgba(255,255,255,0.05); margin-top:6px; border-radius:1px">'
         + '<div style="height:100%; background:' + ti.col + '; width:' + pct + '%; border-radius:1px"></div></div>'
         + '</div>';
  }).join('');
}

// ── Global Achievements (Professional Style) ──────────────────────────────
function renderGlobalAchievements() {
  var totalVol = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var totalSes = allDates().length;
  
  // Niveaux de volume (Titres professionnels)
  var volRank = "Niveau I";
  if (totalVol >= 1000000) volRank = "Élite Mondiale";
  else if (totalVol >= 500000) volRank = "Niveau Master";
  else if (totalVol >= 250000) volRank = "Niveau Avancé";
  else if (totalVol >= 100000) volRank = "Niveau Intermédiaire";
  
  // Assiduité
  var sesRank = "Stagiaire";
  if (totalSes >= 100) sesRank = "Pilier de fer";
  else if (totalSes >= 50) sesRank = "Habitué";
  else if (totalSes >= 20) sesRank = "Initié";

  var html = '<div class="clabel" style="margin:20px 0 10px">Statistiques Globales</div>'
           + '<div class="ach-section">'
           + '<div class="ach-card">'
           + '<div class="ach-nm">Volume Total</div>'
           + '<div class="ach-desc">' + fmtV(totalVol) + '</div>'
           + '<div class="bdg-label" style="margin-top:4px">' + volRank + '</div>'
           + '</div>'
           + '<div class="ach-card">'
           + '<div class="ach-nm">Fréquence</div>'
           + '<div class="ach-desc">' + totalSes + ' séances</div>'
           + '<div class="bdg-label" style="margin-top:4px">' + sesRank + '</div>'
           + '</div>'
           + '</div>';
           
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

// ── Badge grid (Hevy Style List) ──────────────────────────────────────────
function renderBadgeGrid() {
  var grid = $('badge-grid');
  if (!grid) return;

  var counts = {};
  var max1RMs = {};
  APP.data.forEach(function(e) {
    counts[e.ex] = (counts[e.ex] || 0) + 1;
    max1RMs[e.ex] = Math.max(max1RMs[e.ex] || 0, e.rm1);
  });

  var exList = EX.filter(function(e) {
    return !BADGES.groupFilter || e[2] === BADGES.groupFilter;
  });

  // Tri par volume ou débloqué
  var unlocked = exList.filter(function(e) { return counts[e[0]] > 0; });
  var locked   = exList.filter(function(e) { return !counts[e[0]]; });
  unlocked.sort(function(a, b) { return (counts[b[0]] || 0) - (counts[a[0]] || 0); });

  var all = unlocked.concat(locked);

  grid.innerHTML = all.map(function(ex) {
    var name    = ex[0];
    var group   = ex[2];
    var n       = counts[name] || 0;
    var ti      = getTier(n);
    var pct     = (getTierProgress(n) * 100).toFixed(0);
    var earned  = n > 0;
    var max1RM  = max1RMs[name] || 0;
    
    var iconKey = ICON_MAP[name] || 'generic';
    var svg     = ICONS[iconKey] || ICONS.generic;

    return '<div class="bdg ' + ti.cls + (earned ? ' earned' : '') + '">'
         + '<div class="bdg-ico-wrap">'
         + '<svg class="bdg-ico" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>'
         + '</div>'
         + '<div class="bdg-main">'
         + '<div class="bdg-nm">' + name + '</div>'
         + '<div class="bdg-sub">'
         + '<span>' + group + '</span>'
         + (earned ? '<span class="bdg-tier-pill">' + ti.name + '</span>' : '')
         + '</div>'
         + '</div>'
         + (earned ? 
           '<div class="bdg-stats">'
           + '<div class="bdg-val">' + (max1RM > 0 ? max1RM + 'kg' : '--') + '</div>'
           + '<div class="bdg-label">Record 1RM</div>'
           + '</div>' 
           : '<div class="bdg-stats"><div class="bdg-val">--</div><div class="bdg-label">Bloqué</div></div>'
         )
         + '<div class="bdg-pb-wrap"><div class="bdg-pf" style="width:' + (earned ? pct : 0) + '%"></div></div>'
         + '</div>';
  }).join('');
}
