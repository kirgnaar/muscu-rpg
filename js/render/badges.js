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
    trophy: `<path d="M30,20 L70,20 L70,50 C70,65 50,75 50,75 C50,75 30,65 30,50 Z" fill="${c}" ${glow}/>
            <path d="M30,30 L20,30 L20,45 C20,50 30,50 30,50" stroke="${c}" stroke-width="4" fill="none"/>
            <path d="M70,30 L80,30 L80,45 C80,50 70,50 70,50" stroke="${c}" stroke-width="4" fill="none"/>
            <rect x="40" y="75" width="20" height="5" fill="${c}"/>
            <rect x="30" y="80" width="40" height="5" fill="${c}"/>`,
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
  // Le filtrage se fait maintenant via les cartes de groupes musculaires
  $('muscle-badges-row').addEventListener('click', function(ev) {
    var card = ev.target.closest('.mbdg');
    if (!card) return;
    
    BADGES.groupFilter = card.dataset.grp || '';
    
    // Mise à jour visuelle immédiate des cartes de groupes
    $$('.mbdg', $('muscle-badges-row')).forEach(function(c) { 
      c.classList.toggle('on', (c.dataset.grp || '') === BADGES.groupFilter); 
    });
    
    renderBadgeGrid();
  });
}

// ── Render ────────────────────────────────────────────────────────────────
function renderBadges() {
  renderMuscleBadges();
  renderGlobalAchievements();
  renderSpecialAchievements();
  renderBadgeGrid();
}

// ── Muscle badges (Combined with Filter) ──────────────────────────────────
function renderMuscleBadges() {
  var row = $('muscle-badges-row');
  if (!row) return;
  
  // 1. Bouton "Tous"
  var allHtml = `<div class="mbdg ${BADGES.groupFilter === '' ? 'on' : ''}" data-grp="">
    <div class="mbdg-nm">Tous</div>
    <div class="mbdg-t">Exercices</div>
    <div class="mbdg-pb"><div class="mbdg-pf" style="width:100%; background:var(--accent)"></div></div>
  </div>`;

  // 2. Cartes de muscles
  var musclesHtml = MUSCLES.map(function(m) {
    var n    = seriesCountByGroup(m);
    var ti   = getTier(n);
    var pct  = (getTierProgress(n) * 100).toFixed(0);
    var active = BADGES.groupFilter === m ? 'on' : '';
    
    return `<div class="mbdg ${ti.cls} ${active}" data-grp="${m}">
      <div class="mbdg-nm">${m}</div>
      <div class="mbdg-t" style="color:${ti.col}">${ti.name}</div>
      <div class="mbdg-pb"><div class="mbdg-pf" style="width:${pct}%; background:linear-gradient(90deg, ${ti.col}, #fff)"></div></div>
    </div>`;
  }).join('');

  row.innerHTML = allHtml + musclesHtml;
}

// ── Global Stats Dashboard ────────────────────────────────────────────────
function renderGlobalAchievements() {
  var totalVol = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var totalSes = allDates().length;
  var prCount  = APP.data.filter(e => e.isPR).length;

  var html = `
    <div class="clabel" style="margin:25px 0 12px; color:var(--accent)">Statistiques de Carrière</div>
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

// ── Special "Hauts Faits" Achievements ───────────────────────────────────
function renderSpecialAchievements() {
  var totalVol = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var totalSes = allDates().length;
  var uniqueEx = new Set(APP.data.map(e => e.ex)).size;
  
  // Big 6 Total 1RM
  var big6Total = BIG6.reduce((sum, ex) => sum + bestRM1(ex), 0);
  
  // Max Session Volume
  var dailyVols = {};
  APP.data.forEach(e => dailyVols[e.date] = (dailyVols[e.date] || 0) + e.vol);
  var maxSessionVol = Math.max(0, ...Object.values(dailyVols));

  const specs = [
    { 
      id: 'titan', name: 'Le Titan du Volume', icon: 'trophy', val: totalVol, 
      paliere: [
        { n: 10000, l: 'Poids Plume', r: 'COMMUN', c: '#94a3b8' },
        { n: 100000, l: 'Poids Moyen', r: 'RARE', c: '#3b82f6' },
        { n: 500000, l: 'Poids Lourd', r: 'ÉPIQUE', c: '#a855f7' },
        { n: 1000000, l: 'Le Titan', r: 'LÉGENDAIRE', c: '#fbbf24' },
        { n: 5000000, l: 'Atlas', r: 'MYTHIQUE', c: '#22d3ee' }
      ]
    },
    { 
      id: 'pilier', name: 'Le Pilier du Club', icon: 'trophy', val: totalSes,
      paliere: [
        { n: 10, l: 'Visiteur', r: 'COMMUN', c: '#94a3b8' },
        { n: 50, l: 'Habitué', r: 'RARE', c: '#3b82f6' },
        { n: 100, l: 'Adepte', r: 'ÉPIQUE', c: '#a855f7' },
        { n: 250, l: 'Pilier de Fer', r: 'LÉGENDAIRE', c: '#fbbf24' },
        { n: 500, l: 'Légende Vivante', r: 'MYTHIQUE', c: '#22d3ee' }
      ]
    },
    { 
      id: 'club1000', name: 'Le Club des 1000 (Big 6)', icon: 'trophy', val: big6Total,
      paliere: [
        { n: 250, l: 'Initié', r: 'COMMUN', c: '#94a3b8' },
        { n: 500, l: 'Guerrier', r: 'RARE', c: '#3b82f6' },
        { n: 750, l: 'Hercule', r: 'ÉPIQUE', c: '#a855f7' },
        { n: 1000, l: 'Club des 1000', r: 'LÉGENDAIRE', c: '#fbbf24' },
        { n: 1250, l: 'Dieu de la Force', r: 'MYTHIQUE', c: '#22d3ee' }
      ]
    },
    { 
      id: 'cameleon', name: 'Le Caméléon', icon: 'trophy', val: uniqueEx,
      paliere: [
        { n: 10, l: 'Curieux', r: 'COMMUN', c: '#94a3b8' },
        { n: 25, l: 'Polyvalent', r: 'RARE', c: '#3b82f6' },
        { n: 50, l: 'Spécialiste', r: 'ÉPIQUE', c: '#a855f7' },
        { n: 75, l: 'Encyclopédie', r: 'LÉGENDAIRE', c: '#fbbf24' },
        { n: 100, l: 'Maître de la Salle', r: 'MYTHIQUE', c: '#22d3ee' }
      ]
    },
    { 
      id: 'explosif', name: 'L\'Explosif (Volume/Jour)', icon: 'trophy', val: maxSessionVol,
      paliere: [
        { n: 5000, l: 'Surchargé', r: 'COMMUN', c: '#94a3b8' },
        { n: 10000, l: 'Infatigable', r: 'RARE', c: '#3b82f6' },
        { n: 15000, l: 'Machine', r: 'ÉPIQUE', c: '#a855f7' },
        { n: 20000, l: 'Monolithe', r: 'LÉGENDAIRE', c: '#fbbf24' }
      ]
    }
  ];

  var html = '<div class="clabel" style="margin:25px 0 12px; color:var(--accent)">Hauts Faits Spéciaux</div><div id="special-ach-grid">';
  
  specs.forEach(s => {
    var current = s.paliere[0];
    for (var i = s.paliere.length - 1; i >= 0; i--) {
      if (s.val >= s.paliere[i].n) { current = s.paliere[i]; break; }
    }
    var earned = s.val >= s.paliere[0].n;
    var next = s.paliere.find(p => s.val < p.n);
    var pct = next ? (s.val / next.n * 100).toFixed(0) : 100;
    
    html += `
      <div class="bdg-card special-ach ${earned ? 'earned' : ''}" style="border-left: 4px solid ${current.c}">
        <div class="bdg-visual">${getPremiumVisual(s.icon, current.c, earned)}</div>
        <div class="bdg-info" style="flex:1">
          <div class="bdg-title">${earned ? current.l : s.name}</div>
          <div class="bdg-meta">
            ${s.name} <span class="bdg-rarity-pill" style="color:${current.c}">${current.r}</span>
          </div>
          <div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:${pct}%; background:${current.c}"></div></div>
          <div class="bdg-rate" style="color:#fff; opacity:1">Progression : ${s.val.toLocaleString()} ${s.id === 'cameleon' ? 'exercices' : (s.id === 'pilier' ? 'séances' : 'kg')}</div>
        </div>
      </div>`;
  });
  
  html += '</div>';

  // Point d'injection corrigé pour être compatible avec la fusion UI
  var grid = $('badge-grid');
  if (grid) {
    var old = document.getElementById('special-ach-box');
    if (old) old.remove();
    var box = document.createElement('div');
    box.id = 'special-ach-box';
    box.innerHTML = html;
    grid.parentNode.insertBefore(box, grid);
  }
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
      <div class="bdg-card ${ti.cls} ${earned ? 'earned' : ''}" data-rarity="${ti.label}">
        <div class="bdg-visual">${getPremiumVisual(type, ti.col, earned)}</div>
        <div class="bdg-info" style="flex:1">
          <div class="bdg-title">${name}</div>
          <div class="bdg-meta">
            ${group} <span class="bdg-rarity-pill" style="color:${ti.col}">${ti.label}</span>
          </div>
          <div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:${pct}%; background:${ti.col}; box-shadow:0 0 10px ${ti.col}"></div></div>
          ${earned ? `<div class="bdg-rate">Débloqué par seulement ${ti.rate} des athlètes</div>` : ''}
        </div>
        <div class="bdg-aside" style="text-align:right">
          <div class="bdg-stat-v">${earned ? max1RM + 'kg' : '--'}</div>
          <div class="bdg-stat-l">1RM MAX</div>
        </div>
      </div>`;
  }).join('');

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
