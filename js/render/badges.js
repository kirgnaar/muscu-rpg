/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/badges.js
   Pictogrammes olympiques (silhouettes remplies) + corps anatomique
══════════════════════════════════════════════════════════════════════════ */

var BADGES = { groupFilter: '' };

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

  lunge: '<ellipse cx="50" cy="12" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,21 L36,40 L44,40 L50,30 L56,40 L64,40 L59,21 Z" fill="currentColor"/>'
    +'<path d="M36,40 L24,65 L18,88 L32,88 L36,68 L50,48 L50,40 Z" fill="currentColor"/>'
    +'<path d="M50,40 L50,48 L66,75 L72,88 L86,88 L80,65 L64,40 Z" fill="currentColor"/>',

  hipthrust: '<rect x="5" y="70" width="40" height="12" rx="6" fill="currentColor" opacity=".35"/>'
    +'<ellipse cx="80" cy="18" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M71,27 L68,44 L74,44 L80,34 L86,44 L92,44 L89,27 Z" fill="currentColor"/>'
    +'<path d="M68,44 L55,58 L25,62 L14,62 L14,72 L30,72 L55,68 Z" fill="currentColor"/>'
    +'<path d="M68,44 L74,65 L70,82 L84,82 L86,65 L86,44 Z" fill="currentColor"/>',

  legcurl: '<rect x="5" y="10" width="90" height="12" rx="6" fill="currentColor" opacity=".25"/>'
    +'<ellipse cx="18" cy="28" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M9,37 L10,54 L18,54 L22,44 L22,37 Z" fill="currentColor"/>'
    +'<path d="M22,44 L50,38 L72,30 L80,42 L52,52 L22,58 Z" fill="currentColor"/>',

  legext: '<rect x="25" y="35" width="50" height="12" rx="6" fill="currentColor" opacity=".3"/>'
    +'<ellipse cx="22" cy="20" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M13,29 L18,48 L26,48 L30,36 L22,36 Z" fill="currentColor"/>'
    +'<path d="M26,48 L12,68 L8,88 L22,88 L28,68 L38,48 Z" fill="currentColor"/>'
    +'<path d="M38,44 L72,38 L80,50 L44,58 Z" fill="currentColor"/>',

  calf: '<ellipse cx="50" cy="12" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,21 L36,42 L44,42 L50,30 L56,42 L64,42 L59,21 Z" fill="currentColor"/>'
    +'<path d="M36,42 L30,65 L24,82 L38,82 L44,65 L50,50 L56,65 L62,82 L76,82 L70,65 L64,42 Z" fill="currentColor"/>'
    +'<path d="M28,82 L24,95 L40,95 L38,82 Z" fill="currentColor"/>'
    +'<path d="M72,82 L76,95 L60,95 L62,82 Z" fill="currentColor"/>',

  crunch: '<ellipse cx="50" cy="24" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,33 L36,52 L44,52 L50,42 Z" fill="currentColor"/>'
    +'<path d="M50,42 L56,52 L64,52 L59,33 Z" fill="currentColor"/>'
    +'<path d="M36,52 L20,56 L14,56 L14,66 L24,66 L40,62 Z" fill="currentColor"/>'
    +'<path d="M36,52 L32,72 L26,88 L55,88 L58,72 Z" fill="currentColor"/>'
    +'<path d="M58,72 L70,88 L86,88 L80,72 L60,62 Z" fill="currentColor"/>',

  plank: '<ellipse cx="14" cy="28" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M8,37 L10,56 L18,56 L20,44 L20,37 Z" fill="currentColor"/>'
    +'<path d="M10,48 L88,62 L88,74 L8,60 Z" fill="currentColor"/>'
    +'<path d="M88,62 L92,56 L92,74 Z" fill="currentColor"/>'
    +'<path d="M8,60 L6,74 L20,74 L18,60 Z" fill="currentColor"/>'
    +'<rect x="25" y="35" width="7" height="22" rx="3" fill="currentColor" opacity=".5"/>'
    +'<rect x="58" y="40" width="7" height="22" rx="3" fill="currentColor" opacity=".5"/>',

  dip: '<rect x="5" y="25" width="90" height="10" rx="5" fill="currentColor" opacity=".4"/>'
    +'<rect x="8" y="10" width="10" height="72" rx="5" fill="currentColor" opacity=".3"/>'
    +'<rect x="82" y="10" width="10" height="72" rx="5" fill="currentColor" opacity=".3"/>'
    +'<ellipse cx="50" cy="38" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,47 L36,65 L44,65 L50,55 L56,65 L64,65 L59,47 Z" fill="currentColor"/>'
    +'<path d="M36,55 L18,30 L26,30 L42,52 Z" fill="currentColor"/>'
    +'<path d="M64,55 L82,30 L74,30 L58,52 Z" fill="currentColor"/>',

  pushup: '<ellipse cx="14" cy="22" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M8,31 L10,50 L18,50 L20,38 L20,31 Z" fill="currentColor"/>'
    +'<path d="M10,42 L82,58 L88,74 L76,74 L70,62 L8,48 Z" fill="currentColor"/>'
    +'<rect x="26" y="28" width="7" height="22" rx="3" fill="currentColor" opacity=".5"/>'
    +'<rect x="62" y="36" width="7" height="22" rx="3" fill="currentColor" opacity=".5"/>',

  fly: '<ellipse cx="50" cy="14" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,23 L36,48 L44,48 L50,36 L56,48 L64,48 L59,23 Z" fill="currentColor"/>'
    +'<path d="M36,36 L10,28 L6,38 L32,50 Z" fill="currentColor"/>'
    +'<path d="M64,36 L90,28 L94,38 L68,50 Z" fill="currentColor"/>'
    +'<path d="M44,48 L40,72 L34,88 L50,88 L56,72 L56,48 Z" fill="currentColor"/>',

  shrug: '<ellipse cx="50" cy="14" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,23 L35,42 L44,42 L50,30 L56,42 L65,42 L59,23 Z" fill="currentColor"/>'
    +'<path d="M35,28 L14,18 L10,28 L30,40 Z" fill="currentColor"/>'
    +'<path d="M65,28 L86,18 L90,28 L70,40 Z" fill="currentColor"/>'
    +'<path d="M44,42 L40,68 L34,85 L50,85 L56,68 L56,42 Z" fill="currentColor"/>',

  rdl: '<ellipse cx="36" cy="16" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M27,25 L22,44 L30,48 L36,36 L48,52 L66,68 Z" fill="currentColor"/>'
    +'<path d="M27,28 L14,35 L28,56 L36,48 Z" fill="currentColor"/>'
    +'<path d="M22,44 L18,65 L12,80 L26,80 L30,65 L36,80 L50,80 L44,65 L44,52 Z" fill="currentColor"/>'
    +'<rect x="6" y="78" width="88" height="10" rx="5" fill="currentColor" opacity=".6"/>',

  back_ext: '<rect x="5" y="42" width="90" height="12" rx="6" fill="currentColor" opacity=".3"/>'
    +'<ellipse cx="80" cy="24" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M71,33 L68,48 L76,48 L80,38 L84,48 L92,48 L89,33 Z" fill="currentColor"/>'
    +'<path d="M68,44 L42,48 L10,48 L10,58 L42,58 L72,56 Z" fill="currentColor"/>'
    +'<path d="M84,48 L88,65 L82,80 L96,80 L98,62 Z" fill="currentColor"/>',

  pullover: '<rect x="5" y="60" width="90" height="12" rx="6" fill="currentColor" opacity=".3"/>'
    +'<ellipse cx="72" cy="38" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M63,47 L60,62 L66,62 L72,52 L78,62 L84,62 L81,47 Z" fill="currentColor"/>'
    +'<path d="M60,58 L44,72 L20,72 L20,62 L42,62 L58,50 Z" fill="currentColor"/>'
    +'<ellipse cx="16" cy="67" rx="8" ry="8" fill="none" stroke="currentColor" stroke-width="5"/>'
    +'<path d="M66,62 L62,80 L56,90 L72,90 L78,80 L78,62 Z" fill="currentColor"/>',

  clean: '<ellipse cx="50" cy="14" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,23 L34,42 L42,46 L50,34 L58,46 L66,42 L59,23 Z" fill="currentColor"/>'
    +'<path d="M34,34 L18,26 L10,26 L10,36 L24,36 L38,44 Z" fill="currentColor"/>'
    +'<path d="M66,34 L82,26 L90,26 L90,36 L76,36 L62,44 Z" fill="currentColor"/>'
    +'<rect x="8" y="14" width="84" height="10" rx="5" fill="currentColor"/>'
    +'<path d="M42,46 L36,68 L28,88 L44,88 L50,68 L56,88 L72,88 L64,68 L58,46 Z" fill="currentColor"/>',

  lateral: '<ellipse cx="50" cy="14" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,23 L36,48 L44,48 L50,36 L56,48 L64,48 L59,23 Z" fill="currentColor"/>'
    +'<path d="M36,32 L8,24 L6,34 L34,44 Z" fill="currentColor"/>'
    +'<path d="M64,32 L92,24 L94,34 L66,44 Z" fill="currentColor"/>'
    +'<ellipse cx="6" cy="29" rx="7" ry="7" fill="none" stroke="currentColor" stroke-width="4"/>'
    +'<ellipse cx="94" cy="29" rx="7" ry="7" fill="none" stroke="currentColor" stroke-width="4"/>'
    +'<path d="M44,48 L40,72 L34,88 L50,88 L56,72 L56,48 Z" fill="currentColor"/>',

  pushdown: '<rect x="36" y="4" width="28" height="10" rx="5" fill="currentColor" opacity=".5"/>'
    +'<ellipse cx="50" cy="24" rx="9" ry="9" fill="currentColor"/>'
    +'<path d="M41,33 L36,52 L44,52 L50,42 L56,52 L64,52 L59,33 Z" fill="currentColor"/>'
    +'<path d="M36,42 L22,38 L18,48 L34,56 Z" fill="currentColor"/>'
    +'<path d="M64,42 L78,38 L82,48 L66,56 Z" fill="currentColor"/>'
    +'<path d="M44,52 L40,78 L34,92 L50,92 L56,78 L56,52 Z" fill="currentColor"/>',

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
  renderBodyMaps();
  renderMuscleBadges();
  renderBadgeFilterPills();
  renderBadgeGrid();
}

// ── Body maps ─────────────────────────────────────────────────────────────
function renderBodyMaps() {
  var wf = $('body-front-wrap');
  var wb = $('body-back-wrap');
  try { if (wf) wf.innerHTML = buildBodyFront(); } catch(e) { console.warn('[body-front]', e); }
  try { if (wb) wb.innerHTML = buildBodyBack();  } catch(e) { console.warn('[body-back]',  e); }
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
    var next = getNextTierCount(n);
    return '<div class="mbdg ' + ti.cls + '">'
         + '<span class="mbdg-ico">' + meta.emoji + '</span>'
         + '<div class="mbdg-nm">' + m + '</div>'
         + '<span class="mbdg-t">' + ti.emoji + ' ' + ti.name + '</span>'
         + '<div class="mbdg-pb"><div class="mbdg-pf" style="width:' + pct + '%"></div></div>'
         + '</div>';
  }).join('');
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
