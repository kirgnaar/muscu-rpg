/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/badges.js
   VISUAL PRO REBORN — High-fidelity exercise illustrations & Hevy-style UI
   ══════════════════════════════════════════════════════════════════════════ */

var BADGES = { groupFilter: '' };

// ── VISUAL GENERATOR (Pro Blueprint Style) ────────────────────────────────
function getVisualSVG(type, color) {
  const c = color || 'var(--text2)';
  const acc = 'var(--accent)';
  
  const poses = {
    bench: `<rect x="10" y="75" width="80" height="4" rx="2" fill="${c}" opacity=".2"/>`
          +`<path d="M25,70 L25,85 M75,70 L75,85" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`
          +`<circle cx="50" cy="45" r="8" fill="${acc}" opacity=".8"/>`
          +`<path d="M35,60 L65,60 M30,55 L70,55" stroke="${acc}" stroke-width="4" stroke-linecap="round"/>`
          +`<path d="M20,40 L80,40" stroke="${c}" stroke-width="2" stroke-dasharray="4 2"/>`,
    
    squat: `<circle cx="50" cy="20" r="7" fill="${acc}" opacity=".8"/>`
          +`<path d="M50,27 L50,45 L35,65 L30,85 M50,45 L65,65 L70,85" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none"/>`
          +`<path d="M25,30 L75,30" stroke="${acc}" stroke-width="6" stroke-linecap="round"/>`,
    
    deadlift: `<path d="M10,85 L90,85" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`
             +`<circle cx="40" cy="40" r="7" fill="${acc}" opacity=".8"/>`
             +`<path d="M40,47 L40,70 L30,85 M40,70 L50,85" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none"/>`
             +`<rect x="15" y="78" width="70" height="8" rx="4" fill="${acc}"/>`,
    
    pullup: `<path d="M10,15 L90,15" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".3"/>`
           +`<circle cx="50" cy="40" r="7" fill="${acc}" opacity=".8"/>`
           +`<path d="M30,15 L40,35 L60,35 L70,15" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none"/>`,
    
    curl: `<circle cx="50" cy="25" r="7" fill="${acc}" opacity=".8"/>`
         +`<path d="M50,32 L50,55 L40,85 L60,85" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none"/>`
         +`<path d="M50,40 L65,30" stroke="${acc}" stroke-width="5" stroke-linecap="round"/>`
         +`<circle cx="68" cy="25" r="5" fill="${acc}"/>`,
    
    generic: `<circle cx="50" cy="30" r="8" fill="${acc}" opacity=".6"/>`
            +`<path d="M50,38 L50,65 L40,85 L60,85" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/>`
            +`<path d="M30,45 L70,45" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`
  };

  return `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">${poses[type] || poses.generic}</svg>`;
}

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
    return `<div class="mbdg ${ti.cls}">
      <div class="mbdg-nm">${m}</div>
      <div class="mbdg-t">${ti.name}</div>
      <div class="mbdg-pb"><div class="mbdg-pf" style="width:${pct}%; background:${ti.col}"></div></div>
    </div>`;
  }).join('');
}

// ── Global Achievements (Hevy Style Dashboard) ────────────────────────────
function renderGlobalAchievements() {
  var totalVol = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var totalSes = allDates().length;
  var prCount = APP.data.filter(e => e.isPR).length;

  var html = `
    <div class="clabel" style="margin:20px 0 10px">Statistiques Globales</div>
    <div class="ach-grid">
      <div class="ach-card">
        <div class="ach-val">${fmtV(totalVol)}</div>
        <div class="ach-lbl">Volume (KG)</div>
      </div>
      <div class="ach-card">
        <div class="ach-val">${totalSes}</div>
        <div class="ach-lbl">Séances</div>
      </div>
      <div class="ach-card">
        <div class="ach-val">${prCount}</div>
        <div class="ach-lbl">Records (PR)</div>
      </div>
    </div>`;
           
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
    return `<button class="bfpill ${g === BADGES.groupFilter ? 'on' : ''}" data-grp="${g}">${g || 'Tous'}</button>`;
  }).join('');
}

// ── Badge grid (Visual Pro Grid) ──────────────────────────────────────────
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

  var unlocked = exList.filter(function(e) { return counts[e[0]] > 0; });
  var locked   = exList.filter(function(e) { return !counts[e[0]]; });
  unlocked.sort(function(a, b) { return (counts[b[0]] || 0) - (counts[a[0]] || 0); });

  grid.innerHTML = unlocked.concat(locked).map(function(ex) {
    var name    = ex[0];
    var group   = ex[2];
    var n       = counts[name] || 0;
    var ti      = getTier(n);
    var pct     = (getTierProgress(n) * 100).toFixed(0);
    var earned  = n > 0;
    var max1RM  = max1RMs[name] || 0;
    
    var type = ICON_MAP[name] || 'generic';
    if (group === 'Pectoraux') type = 'bench';
    if (group === 'Quadriceps') type = 'squat';
    if (group === 'Dorsal') type = 'pullup';
    if (group === 'Biceps') type = 'curl';
    if (name.includes('Soulevé')) type = 'deadlift';

    return `
      <div class="bdg-card ${ti.cls} ${earned ? 'earned' : ''}">
        <div class="bdg-visual">${getVisualSVG(type, earned ? '#7a8aaa' : '#2d3748')}</div>
        <div class="bdg-content">
          <div class="bdg-title">${name}</div>
          <div class="bdg-meta">${group} · ${ti.name}</div>
          <div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:${pct}%; background:${ti.col}"></div></div>
        </div>
        <div class="bdg-aside">
          <div class="bdg-stat-v">${earned ? max1RM + 'kg' : '--'}</div>
          <div class="bdg-stat-l">1RM MAX</div>
        </div>
      </div>`;
  }).join('');
}
