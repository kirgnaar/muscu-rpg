/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/badges.js
   ULTRA PREMIUM VERSION — High-End RPG Achievement Engine
   ══════════════════════════════════════════════════════════════════════════ */

var BADGES = { groupFilter: '' };

// ── Visual Assets ─────────────────────────────────────────────────────────
function getPremiumVisual(type, color, isEarned) {
  const c = isEarned ? (color || 'var(--accent)') : '#4b5563';
  const glow = isEarned ? `filter="url(#glow)"` : '';
  
  const icons = {
    bench: `<rect x="10" y="70" width="80" height="6" rx="3" fill="${c}" opacity=".2"/>
           <path d="M20,65 L20,85 M80,65 L80,85" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
           <circle cx="50" cy="40" r="10" fill="${c}" ${glow}/>
           <path d="M30,55 L70,55" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
    
    squat: `<circle cx="50" cy="25" r="9" fill="${c}" ${glow}/>
           <path d="M50,34 L50,55 L35,85 M50,55 L65,85" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>
           <path d="M20,35 L80,35" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`,
    
    deadlift: `<path d="M10,90 L90,90" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".4"/>
              <circle cx="45" cy="40" r="9" fill="${c}" ${glow}/>
              <path d="M45,49 L45,75 L30,90 M45,75 L60,90" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>
              <rect x="20" y="80" width="60" height="10" rx="5" fill="${c}"/>`,
    
    pullup: `<path d="M10,20 L90,20" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity=".3"/>
            <circle cx="50" cy="45" r="9" fill="${c}" ${glow}/>
            <path d="M35,20 L45,40 L55,40 L65,20" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>`,
    
    curl: `<circle cx="50" cy="30" r="9" fill="${c}" ${glow}/>
          <path d="M50,39 L50,65 L40,90 L60,90" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M50,45 L70,35" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="75" cy="30" r="6" fill="${c}"/>`,
    
    generic: `<circle cx="50" cy="30" r="10" fill="${c}" ${glow}/>
             <path d="M50,40 L50,70 L35,90 L65,90" stroke="${c}" stroke-width="6" stroke-linecap="round" fill="none"/>
             <path d="M30,50 L70,50" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`
  };

  return `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    ${icons[type] || icons.generic}
  </svg>`;
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
      <div class="mbdg-t" style="color:${ti.col}">${ti.name}</div>
      <div class="mbdg-pb"><div class="mbdg-pf" style="width:${pct}%; background:linear-gradient(90deg, ${ti.col}, #fff)"></div></div>
    </div>`;
  }).join('');
}

// ── Global Stats Dashboard ────────────────────────────────────────────────
function renderGlobalAchievements() {
  var totalVol = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var totalSes = allDates().length;
  var prCount  = APP.data.filter(e => e.isPR).length;

  var html = `
    <div class="clabel" style="margin:25px 0 12px; color:var(--accent)">Tableau d'Honneur</div>
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
        <div class="ach-lbl">Records</div>
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

// ── Badge grid ────────────────────────────────────────────────────────────
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
      <div class="bdg-card ${ti.cls} ${earned ? 'earned' : ''}" data-rarity="${ti.name}">
        <div class="bdg-visual">${getPremiumVisual(type, ti.col, earned)}</div>
        <div class="bdg-info" style="flex:1">
          <div class="bdg-title">${name}</div>
          <div class="bdg-meta">
            ${group} <span class="bdg-rarity-pill" style="color:${ti.col}">${ti.name}</span>
          </div>
          <div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:${pct}%; background:${ti.col}; box-shadow:0 0 10px ${ti.col}"></div></div>
        </div>
        <div class="bdg-aside" style="text-align:right">
          <div class="bdg-stat-v">${earned ? max1RM + 'kg' : '--'}</div>
          <div class="bdg-stat-l">1RM MAX</div>
        </div>
      </div>`;
  }).join('');

  // GSAP Entrance Animation
  if (window.gsap) {
    gsap.from(".bdg-card", {
      opacity: 0,
      y: 20,
      stagger: 0.05,
      duration: 0.5,
      ease: "power2.out"
    });
  }
}
