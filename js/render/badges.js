/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/badges.js
   ULTRA PREMIUM VERSION — High-End RPG Achievement Engine (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var BADGES = { groupFilter: '' };

function getPremiumVisual(type, color, isEarned) {
  var c = isEarned ? (color || 'var(--accent)') : '#4b5563';
  var glow = isEarned ? 'filter="url(#glow)"' : '';
  var icons = {
    bench: '<rect x="10" y="70" width="80" height="6" rx="3" fill="'+c+'" opacity=".2"/><path d="M20,65 L20,85 M80,65 L80,85" stroke="'+c+'" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="40" r="10" fill="'+c+'" '+glow+'/><path d="M30,55 L70,55" stroke="'+c+'" stroke-width="6" stroke-linecap="round"/>',
    squat: '<circle cx="50" cy="25" r="9" fill="'+c+'" '+glow+'/><path d="M50,34 L50,55 L35,85 M50,55 L65,85" stroke="'+c+'" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M20,35 L80,35" stroke="'+c+'" stroke-width="8" stroke-linecap="round"/>',
    deadlift: '<path d="M10,90 L90,90" stroke="'+c+'" stroke-width="4" stroke-linecap="round" opacity=".4"/><circle cx="45" cy="40" r="9" fill="'+c+'" '+glow+'/><path d="M45,49 L45,75 L30,90 M45,75 L60,90" stroke="'+c+'" stroke-width="7" stroke-linecap="round" fill="none"/><rect x="20" y="80" width="60" height="10" rx="5" fill="'+c+'"/>',
    pullup: '<path d="M10,20 L90,20" stroke="'+c+'" stroke-width="6" stroke-linecap="round" opacity=".3"/><circle cx="50" cy="45" r="9" fill="'+c+'" '+glow+'/><path d="M35,20 L45,40 L55,40 L65,20" stroke="'+c+'" stroke-width="7" stroke-linecap="round" fill="none"/>',
    curl: '<circle cx="50" cy="30" r="9" fill="'+c+'" '+glow+'/><path d="M50,39 L50,65 L40,90 L60,90" stroke="'+c+'" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M50,45 L70,35" stroke="'+c+'" stroke-width="7" stroke-linecap="round"/><circle cx="75" cy="30" r="6" fill="'+c+'"/>',
    trophy: '<path d="M30,20 L70,20 L70,50 C70,65 50,75 50,75 C50,75 30,65 30,50 Z" fill="'+c+'" '+glow+'/><path d="M30,30 L20,30 L20,45 C20,50 30,50 30,50" stroke="'+c+'" stroke-width="4" fill="none"/><path d="M70,30 L80,30 L80,45 C80,50 70,50 70,50" stroke="'+c+'" stroke-width="4" fill="none"/><rect x="40" y="75" width="20" height="5" fill="'+c+'"/><rect x="30" y="80" width="40" height="5" fill="'+c+'"/>',
    generic: '<circle cx="50" cy="30" r="10" fill="'+c+'" '+glow+'/><path d="M50,40 L50,70 L35,90 L65,90" stroke="'+c+'" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M30,50 L70,50" stroke="'+c+'" stroke-width="6" stroke-linecap="round"/>'
  };
  return '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter></defs>'+(icons[type] || icons.generic)+'</svg>';
}

function initBadges() {
  var row = document.getElementById('muscle-badges-row');
  if (row) {
    row.addEventListener('click', function(ev) {
      var card = ev.target.closest('.mbdg');
      if (!card) return;
      BADGES.groupFilter = card.dataset.grp || '';
      var cards = row.querySelectorAll('.mbdg');
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.toggle('on', (cards[i].dataset.grp || '') === BADGES.groupFilter);
      }
      renderBadgeGrid();
    });
  }
}

function renderBadges() {
  renderMuscleBadges();
  renderGlobalAchievements();
  renderBadgeGrid();
}

function renderMuscleBadges() {
  var row = document.getElementById('muscle-badges-row');
  if (!row) return;
  var allHtml = '<div class="mbdg '+(BADGES.groupFilter===''?'on':'')+'" data-grp=""><div class="mbdg-nm">Tous</div><div class="mbdg-t">Exercices</div><div class="mbdg-pb"><div class="mbdg-pf" style="width:100%; background:var(--accent)"></div></div></div>';
  var specialProgress = calculateSpecialAchievementsProgress();
  var specHtml = '<div class="mbdg '+(BADGES.groupFilter==='special'?'on':'')+'" data-grp="special"><div class="mbdg-nm">Succès</div><div class="mbdg-t">Spéciaux</div><div class="mbdg-pb"><div class="mbdg-pf" style="width:'+specialProgress+'%; background:var(--gold)"></div></div></div>';
  var musclesHtml = '';
  for (var i = 0; i < MUSCLES.length; i++) {
    var m = MUSCLES[i];
    var n = seriesCountByGroup(m);
    var ti = getTier(n);
    var pct = (getTierProgress(n) * 100).toFixed(0);
    var active = BADGES.groupFilter === m ? 'on' : '';
    musclesHtml += '<div class="mbdg '+ti.cls+' '+active+'" data-grp="'+m+'"><div class="mbdg-nm">'+m+'</div><div class="mbdg-t" style="color:'+ti.col+'">'+ti.name+'</div><div class="mbdg-pb"><div class="mbdg-pf" style="width:'+pct+'%; background:linear-gradient(90deg, '+ti.col+', #fff)"></div></div></div>';
  }
  row.innerHTML = allHtml + specHtml + musclesHtml;
}

function calculateSpecialAchievementsProgress() {
  var totalVol = 0;
  for (var i = 0; i < APP.data.length; i++) totalVol += APP.data[i].vol;
  var totalSes = allDates().length;
  var exNames = [];
  for (var j = 0; j < APP.data.length; j++) {
    if (exNames.indexOf(APP.data[j].ex) === -1) exNames.push(APP.data[j].ex);
  }
  var uniqueEx = exNames.length;
  var big6Total = 0;
  for (var k = 0; k < BIG6.length; k++) big6Total += bestRM1(BIG6[k]);
  var dailyVols = {};
  for (var l = 0; l < APP.data.length; l++) {
    var e = APP.data[l];
    dailyVols[e.date] = (dailyVols[e.date] || 0) + e.vol;
  }
  var maxSessionVol = 0;
  for (var d in dailyVols) {
    if (dailyVols[d] > maxSessionVol) maxSessionVol = dailyVols[d];
  }
  var totalPRs = 0;
  for (var m = 0; m < APP.data.length; m++) {
    if (APP.data[m].isPR) totalPRs++;
  }
  var totalReps = 0;
  for (var n = 0; n < APP.data.length; n++) {
    totalReps += (APP.data[n].ser * APP.data[n].rep);
  }
  var maxWeight = 0;
  for (var o = 0; o < APP.data.length; o++) {
    if (BIG6.indexOf(APP.data[o].ex) !== -1 && APP.data[o].pds > maxWeight) {
      maxWeight = APP.data[o].pds;
    }
  }
  var specs = [
    {v:totalVol,m:5000000}, {v:totalSes,m:500}, {v:big6Total,m:1250}, {v:uniqueEx,m:100},
    {v:maxSessionVol,m:20000}, {v:totalPRs,m:250}, {v:totalReps,m:100000}, {v:maxWeight,m:300}
  ];
  var totalSumPct = 0;
  for (var p = 0; p < specs.length; p++) {
    totalSumPct += Math.min(100, (specs[p].v / specs[p].m * 100));
  }
  return (totalSumPct / specs.length).toFixed(0);
}

function renderGlobalAchievements() {
  var totalVol = 0;
  for (var i = 0; i < APP.data.length; i++) totalVol += APP.data[i].vol;
  var totalSes = allDates().length;
  var prCount = 0;
  for (var j = 0; j < APP.data.length; j++) {
    if (APP.data[j].isPR) prCount++;
  }
  var html = '<div class="clabel" style="margin:25px 0 12px; color:var(--accent)">Statistiques de Carrière</div><div class="ach-grid"><div class="ach-card"><div class="ach-val">'+fmtV(totalVol)+'</div><div class="ach-lbl">Volume (KG)</div></div><div class="ach-card"><div class="ach-val">'+totalSes+'</div><div class="ach-lbl">Séances</div></div><div class="ach-card"><div class="ach-val">'+prCount+'</div><div class="ach-lbl">Records</div></div></div>';
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

function renderSpecialAchievements() {
  var totalVol = 0;
  for (var i = 0; i < APP.data.length; i++) totalVol += APP.data[i].vol;
  var totalSes = allDates().length;
  var exNames = [];
  for (var j = 0; j < APP.data.length; j++) {
    if (exNames.indexOf(APP.data[j].ex) === -1) exNames.push(APP.data[j].ex);
  }
  var uniqueEx = exNames.length;
  var totalPRs = 0;
  for (var k = 0; k < APP.data.length; k++) {
    if (APP.data[k].isPR) totalPRs++;
  }
  var totalReps = 0;
  for (var l = 0; l < APP.data.length; l++) {
    totalReps += (APP.data[l].ser * APP.data[l].rep);
  }
  var exCounts = {};
  for (var m = 0; m < APP.data.length; m++) {
    exCounts[APP.data[m].ex] = (exCounts[APP.data[m].ex] || 0) + APP.data[m].ser;
  }
  var big6Done = 0;
  for (var n = 0; n < BIG6.length; n++) {
    if (exCounts[BIG6[n]]) big6Done++;
  }
  var maxWeight = 0;
  for (var o = 0; o < APP.data.length; o++) {
    if (BIG6.indexOf(APP.data[o].ex) !== -1 && APP.data[o].pds > maxWeight) {
      maxWeight = APP.data[o].pds;
    }
  }
  var specs = [
    {id:'titan', name:'Le Titan du Volume', icon:'trophy', val:totalVol, paliere:[{n:10000,l:'Poids Plume',r:'COMMUN',c:'#94a3b8'},{n:100000,l:'Poids Moyen',r:'RARE',c:'#3b82f6'},{n:500000,l:'Poids Lourd',r:'ÉPIQUE',c:'#a855f7'},{n:1000000,l:'Le Titan',r:'LÉGENDAIRE',c:'#fbbf24'},{n:5000000,l:'Atlas',r:'MYTHIQUE',c:'#22d3ee'}]},
    {id:'pilier', name:'Le Pilier du Club', icon:'trophy', val:totalSes, paliere:[{n:10,l:'Visiteur',r:'COMMUN',c:'#94a3b8'},{n:50,l:'Habitué',r:'RARE',c:'#3b82f6'},{n:100,l:'Adepte',r:'ÉPIQUE',c:'#a855f7'},{n:250,l:'Pilier de Fer',r:'LÉGENDAIRE',c:'#fbbf24'},{n:500,l:'Légende Vivante',r:'MYTHIQUE',c:'#22d3ee'}]},
    {id:'briseur', name:'Le Briseur de Limites', icon:'trophy', val:totalPRs, paliere:[{n:10,l:'Déterminé',r:'RARE',c:'#3b82f6'},{n:50,l:'Inarrêtable',r:'ÉPIQUE',c:'#a855f7'},{n:100,l:'Briseur de Plafond',r:'LÉGENDAIRE',c:'#fbbf24'},{n:250,l:'L\'Anomalie',r:'MYTHIQUE',c:'#22d3ee'}]},
    {id:'acharne', name:'L\'Acharné', icon:'trophy', val:totalReps, paliere:[{n:1000,l:'Cadence I',r:'COMMUN',c:'#94a3b8'},{n:10000,l:'Cadence II',r:'RARE',c:'#3b82f6'},{n:50000,l:'Mécanique',r:'ÉPIQUE',c:'#a855f7'},{n:100000,l:'L\'Horloge de Fer',r:'LÉGENDAIRE',c:'#fbbf24'}]},
    {id:'chelem', name:'Le Grand Chelem', icon:'trophy', val:big6Done, paliere:[{n:2,l:'Apprenti',r:'RARE',c:'#3b82f6'},{n:4,l:'Guerrier Complet',r:'ÉPIQUE',c:'#a855f7'},{n:6,l:'Le Grand Chelem',r:'LÉGENDAIRE',c:'#fbbf24'}]},
    {id:'monolithe', name:'Le Monolithe', icon:'trophy', val:maxWeight, paliere:[{n:100,l:'Acier',r:'RARE',c:'#3b82f6'},{n:150,l:'Béton',r:'ÉPIQUE',c:'#a855f7'},{n:200,l:'Monolithe',r:'LÉGENDAIRE',c:'#fbbf24'},{n:300,l:'La Montagne',r:'MYTHIQUE',c:'#22d3ee'}]},
    {id:'cameleon', name:'Le Caméléon', icon:'trophy', val:uniqueEx, paliere:[{n:10,l:'Curieux',r:'COMMUN',c:'#94a3b8'},{n:25,l:'Polyvalent',r:'RARE',c:'#3b82f6'},{n:50,l:'Spécialiste',r:'ÉPIQUE',c:'#a855f7'},{n:75,l:'Encyclopédie',r:'LÉGENDAIRE',c:'#fbbf24'},{n:100,l:'Maître de la Salle',r:'MYTHIQUE',c:'#22d3ee'}]}
  ];
  var html = '<div class="clabel" style="margin:25px 0 12px; color:var(--accent)">Hauts Faits Spéciaux</div><div id="special-ach-grid">';
  for (var q = 0; q < specs.length; q++) {
    var s = specs[q];
    var current = s.paliere[0];
    for (var r = s.paliere.length - 1; r >= 0; r--) {
      if (s.val >= s.paliere[r].n) { current = s.paliere[r]; break; }
    }
    var earned = s.val >= s.paliere[0].n;
    var next = null;
    for (var t = 0; t < s.paliere.length; t++) {
      if (s.val < s.paliere[t].n) { next = s.paliere[t]; break; }
    }
    var pct = next ? (s.val / next.n * 100).toFixed(0) : 100;
    var unit = 'kg';
    if (s.id === 'pilier') unit = 'séances';
    else if (s.id === 'cameleon') unit = 'exercices';
    else if (s.id === 'briseur') unit = 'PR';
    else if (s.id === 'acharne') unit = 'reps';
    else if (s.id === 'chelem') unit = '/ 6 ex';
    html += '<div class="bdg-card special-ach '+(earned?'earned':'')+'" style="border-left: 4px solid '+current.c+'"><div class="bdg-visual">'+getPremiumVisual(s.icon, current.c, earned)+'</div><div class="bdg-info" style="flex:1"><div class="bdg-title">'+(earned?current.l:s.name)+'</div><div class="bdg-meta">'+s.name+' <span class="bdg-rarity-pill" style="color:'+current.c+'">'+current.r+'</span></div><div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:'+pct+'%; background:'+current.c+'"></div></div><div class="bdg-rate" style="color:#fff; opacity:1">Progression : '+s.val.toLocaleString()+' '+unit+'</div></div></div>';
  }
  html += '</div>';
  var grid = document.getElementById('badge-grid');
  if (grid) {
    var old = document.getElementById('special-ach-box');
    if (old) old.remove();
    var box = document.createElement('div');
    box.id = 'special-ach-box';
    box.innerHTML = html;
    grid.parentNode.insertBefore(box, grid);
  }
}

function renderBadgeGrid() {
  var grid = document.getElementById('badge-grid');
  if (!grid) return;
  if (BADGES.groupFilter === 'special') {
    var oldBox = document.getElementById('special-ach-box');
    if (oldBox) oldBox.remove();
    renderSpecialAchievements();
    grid.style.display = 'none';
    var specBox = document.getElementById('special-ach-box');
    if (specBox) specBox.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  var specBox = document.getElementById('special-ach-box');
  if (specBox) specBox.style.display = 'none';
  var counts = {};
  var max1RMs = {};
  for (var i = 0; i < APP.data.length; i++) {
    var e = APP.data[i];
    counts[e.ex] = (counts[e.ex] || 0) + (e.ser || 0);
    var currentRM1 = epley(e.pds, e.rep);
    if (!max1RMs[e.ex] || currentRM1 > max1RMs[e.ex]) max1RMs[e.ex] = currentRM1;
  }
  var exList = [];
  for (var k = 0; k < EX.length; k++) {
    if (!BADGES.groupFilter || getMuscleInfluence(EX[k][0], BADGES.groupFilter) > 0) exList.push(EX[k]);
  }
  var unlocked = [];
  var locked = [];
  for (var l = 0; l < exList.length; l++) {
    if (counts[exList[l][0]] > 0) unlocked.push(exList[l]);
    else locked.push(exList[l]);
  }
  unlocked.sort(function(a, b) {
    return (counts[b[0]] || 0) - (counts[a[0]] || 0);
  });
  var allEx = unlocked.concat(locked);
  var htmlStr = '';
  for (var j = 0; j < allEx.length; j++) {
    var ex = allEx[j];
    var name = ex[0];
    var group = getPrimaryGroup(name);
    var n = counts[name] || 0;
    var ti = getTier(n);
    var pct = (getTierProgress(n) * 100).toFixed(0);
    var earned = n > 0;
    var max1RM = max1RMs[name] || 0;
    var type = 'generic';
    if (group === 'Pectoraux') type = 'bench';
    else if (group === 'Quadriceps') type = 'squat';
    else if (group === 'Dorsal') type = 'pullup';
    else if (group === 'Biceps') type = 'curl';
    else if (name.indexOf('Soulevé') !== -1) type = 'deadlift';
    if (ICON_MAP[name]) type = ICON_MAP[name];
    htmlStr += '<div class="bdg-card '+ti.cls+' '+(earned?'earned':'')+'" data-rarity="'+ti.label+'"><div class="bdg-visual">'+getPremiumVisual(type, ti.col, earned)+'</div><div class="bdg-info" style="flex:1"><div class="bdg-title">'+name+'</div><div class="bdg-meta">'+group+' <span class="bdg-rarity-pill" style="color:'+ti.col+'">'+ti.label+'</span></div><div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:'+pct+'%; background:'+ti.col+'; box-shadow:0 0 10px '+ti.col+'"></div></div>'+(earned?'<div class="bdg-rate">Débloqué par seulement '+ti.rate+' des athlètes</div>':'')+'</div><div class="bdg-aside" style="text-align:right"><div class="bdg-stat-v">'+(earned ? max1RM + 'kg' : '--')+'</div><div class="bdg-stat-l">1RM MAX</div></div></div>';
  }
  grid.innerHTML = htmlStr;
  if (window.gsap) {
    gsap.from(".bdg-card", { opacity: 0, y: 20, stagger: 0.05, duration: 0.5, ease: "power2.out" });
  }
}
