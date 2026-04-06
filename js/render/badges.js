/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/badges.js
   Onglet Badges: corps humain SVG, badges muscles, grille exercices
══════════════════════════════════════════════════════════════════════════ */

var BADGES = { groupFilter: '' };

// ── SVG icons exercices (stick figures) ───────────────────────────────────
var ICONS = {
  bench:    '<rect x="3" y="44" width="50" height="4" rx="2" fill="currentColor" opacity=".2"/><circle cx="14" cy="28" r="5" fill="currentColor"/><line x1="14" y1="33" x2="14" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="40" x2="8" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="40" x2="20" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="33" x2="26" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="20" y1="11" x2="50" y2="11" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="11" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="11" r="4" fill="none" stroke="currentColor" stroke-width="2"/>',
  ohp:      '<circle cx="28" cy="10" r="5" fill="currentColor"/><line x1="28" y1="15" x2="28" y2="35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="29" x2="20" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="29" x2="36" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="16" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="40" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="12" x2="48" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="48" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>',
  pullup:   '<line x1="6" y1="6" x2="50" y2="6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="28" cy="22" r="5" fill="currentColor"/><line x1="22" y1="6" x2="22" y2="17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="34" y1="6" x2="34" y2="17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="27" x2="28" y2="44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="35" x2="20" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="35" x2="36" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  row:      '<circle cx="14" cy="16" r="5" fill="currentColor"/><line x1="14" y1="21" x2="20" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="26" x2="8" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="21" x2="36" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="24" x2="36" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="24" x2="48" y2="24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="48" cy="24" r="5" fill="none" stroke="currentColor" stroke-width="2"/>',
  curl:     '<circle cx="28" cy="8" r="5" fill="currentColor"/><line x1="28" y1="13" x2="28" y2="35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="28" x2="20" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="28" x2="36" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="20" x2="18" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="28" x2="14" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="2"/>',
  pushdown: '<line x1="28" y1="4" x2="28" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="10" x2="38" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="28" cy="20" r="5" fill="currentColor"/><line x1="28" y1="25" x2="28" y2="42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="35" x2="20" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="35" x2="36" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="28" x2="20" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  squat:    '<circle cx="28" cy="8" r="5" fill="currentColor"/><line x1="28" y1="13" x2="28" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="16" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="40" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="26" x2="14" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="28" x2="18" y2="42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="28" x2="38" y2="42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="42" x2="14" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="42" x2="42" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="10" y1="26" x2="46" y2="26" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  deadlift: '<circle cx="22" cy="10" r="5" fill="currentColor"/><line x1="22" y1="15" x2="26" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="26" y1="28" x2="18" y2="46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="26" y1="28" x2="34" y2="46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="15" x2="14" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="22" x2="32" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="48" x2="50" y2="48" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="44" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="44" r="5" fill="none" stroke="currentColor" stroke-width="2"/>',
  legpress: '<circle cx="12" cy="20" r="5" fill="currentColor"/><line x1="12" y1="25" x2="16" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="34" x2="8" y2="46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="34" x2="22" y2="44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="20" x2="24" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="44" x2="40" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><rect x="38" y="20" width="6" height="22" rx="2" fill="currentColor" opacity=".4"/>',
  lunge:    '<circle cx="28" cy="8" r="5" fill="currentColor"/><line x1="28" y1="13" x2="28" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="20" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="36" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="18" y2="46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="46" x2="14" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="40" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="40" x2="44" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  hipthrust:'<rect x="4" y="46" width="22" height="5" rx="2" fill="currentColor" opacity=".3"/><circle cx="46" cy="12" r="5" fill="currentColor"/><line x1="46" y1="17" x2="46" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="22" x2="38" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="32" x2="46" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="32" x2="18" y2="34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="34" x2="14" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="32" x2="40" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  legcurl:  '<rect x="4" y="8" width="48" height="4" rx="2" fill="currentColor" opacity=".2"/><circle cx="10" cy="18" r="5" fill="currentColor"/><line x1="10" y1="23" x2="10" y2="34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="10" y1="34" x2="30" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="28" x2="44" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="44" y1="20" x2="50" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  legext:   '<rect x="20" y="28" width="22" height="5" rx="2" fill="currentColor" opacity=".3"/><circle cx="18" cy="14" r="5" fill="currentColor"/><line x1="18" y1="19" x2="22" y2="32" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="32" x2="10" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="32" x2="44" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  calf:     '<circle cx="28" cy="8" r="5" fill="currentColor"/><line x1="28" y1="13" x2="28" y2="35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="20" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="36" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="35" x2="22" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="35" x2="34" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="52" x2="26" y2="46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="46" x2="38" y2="52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  crunch:   '<circle cx="28" cy="16" r="5" fill="currentColor"/><line x1="28" y1="21" x2="24" y2="34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="34" x2="8" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="34" x2="28" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="48" x2="42" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="21" x2="20" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="21" x2="38" y2="26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  plank:    '<circle cx="8" cy="22" r="5" fill="currentColor"/><line x1="8" y1="27" x2="50" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="36" x2="52" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="27" x2="10" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="30" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="34" x2="38" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  dip:      '<line x1="10" y1="14" x2="10" y2="50" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".4"/><line x1="46" y1="14" x2="46" y2="50" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".4"/><line x1="6" y1="22" x2="50" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".4"/><circle cx="28" cy="28" r="5" fill="currentColor"/><line x1="28" y1="33" x2="28" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="42" x2="20" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="42" x2="36" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="33" x2="14" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="33" x2="42" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  pushup:   '<circle cx="10" cy="16" r="5" fill="currentColor"/><line x1="10" y1="21" x2="46" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="30" x2="50" y2="44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="10" y1="21" x2="14" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="24" x2="18" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="28" x2="36" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  fly:      '<circle cx="28" cy="10" r="5" fill="currentColor"/><line x1="28" y1="15" x2="28" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="28" x2="20" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="28" x2="36" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="8" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="48" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  shrug:    '<circle cx="28" cy="8" r="5" fill="currentColor"/><line x1="28" y1="13" x2="28" y2="38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="20" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="36" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="16" x2="12" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="16" x2="44" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  rdl:      '<circle cx="22" cy="8" r="5" fill="currentColor"/><line x1="22" y1="13" x2="26" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="26" y1="28" x2="20" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="26" y1="28" x2="32" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="13" x2="12" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="16" x2="28" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="10" y1="40" x2="48" y2="40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  clean:    '<circle cx="28" cy="8" r="5" fill="currentColor"/><line x1="28" y1="13" x2="28" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="16" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="40" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="20" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="36" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="18" x2="48" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  lateral:  '<circle cx="28" cy="10" r="5" fill="currentColor"/><line x1="28" y1="15" x2="28" y2="38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="20" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="30" x2="36" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="8" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="22" x2="48" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  back_ext: '<circle cx="46" cy="18" r="5" fill="currentColor"/><line x1="46" y1="23" x2="30" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="30" x2="10" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="23" x2="50" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="36" x2="48" y2="46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><rect x="4" y="28" width="48" height="4" rx="2" fill="currentColor" opacity=".2"/>',
  pullover: '<circle cx="46" cy="28" r="5" fill="currentColor"/><line x1="46" y1="33" x2="46" y2="44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="28" x2="30" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="24" x2="20" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="18" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="14" y="44" width="28" height="4" rx="2" fill="currentColor" opacity=".3"/>',
  generic:  '<circle cx="28" cy="10" r="5" fill="currentColor"/><line x1="28" y1="15" x2="28" y2="38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="26" x2="16" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="26" x2="40" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="38" x2="20" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="38" x2="36" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
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
  if (wf) wf.innerHTML = buildBodyFront();
  if (wb) wb.innerHTML = buildBodyBack();
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
         + '<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>'
         + '</div>'
         + '<div class="bdg-nm">' + name + '</div>'
         + '<div class="bdg-tier">' + (n > 0 ? ti.emoji + ' ' + ti.name : '○ Inactif') + '</div>'
         + '<div class="bdg-pb"><div class="bdg-pf" style="width:' + (n > 0 ? pct : 0) + '%"></div></div>'
         + '<div class="bdg-cnt">' + cntLbl + '</div>'
         + '</div>';
  }).join('');
}
