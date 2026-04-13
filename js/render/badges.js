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
      renderBadges(); // Re-render everything with the new filter
    });
  }
}

function renderBadges() {
  $('v-badges').querySelector('.stitle').textContent = APP.t('stitle_badges');
  var clabels = $('v-badges').querySelectorAll('.clabel');
  if (clabels.length > 1) clabels[1].textContent = APP.t('label_muscles');

  // One pass over data for all badge calculations
  var stats = {
    totalVol: 0,
    prCount: 0,
    repCount: 0,
    uniqueExCount: 0,
    uniqueExMap: {},
    muscleSeries: {},
    muscleVols: {},
    exCounts: {},
    maxS: 0, maxB: 0, maxD: 0,
    dailyVols: {}
  };

  for (var mIdx = 0; mIdx < MUSCLES.length; mIdx++) {
    var mName = MUSCLES[mIdx];
    stats.muscleSeries[mName] = 0;
    stats.muscleVols[mName] = 0;
  }

  for (var i = 0; i < APP.data.length; i++) {
    var d = APP.data[i];
    stats.totalVol += d.vol;
    if (d.isPR) stats.prCount++;
    stats.repCount += (d.rep * d.ser);

    if (!stats.uniqueExMap[d.ex]) {
      stats.uniqueExMap[d.ex] = true;
      stats.uniqueExCount++;
    }

    stats.exCounts[d.ex] = (stats.exCounts[d.ex] || 0) + d.ser;
    stats.dailyVols[d.date] = (stats.dailyVols[d.date] || 0) + d.vol;

    if (d.ex === "Squat barre" && d.pds > stats.maxS) stats.maxS = d.pds;
    if (d.ex === "Développé couché barre" && d.pds > stats.maxB) stats.maxB = d.pds;
    if (d.ex === "Soulevé de terre conventionnel" && d.pds > stats.maxD) stats.maxD = d.pds;

    for (var k = 0; k < MUSCLES.length; k++) {
      var m = MUSCLES[k];
      var influence = getMuscleInfluence(d.ex, m);
      if (influence > 0) {
        stats.muscleSeries[m] += d.ser;
        stats.muscleVols[m] += (d.vol * influence);
      }
    }
  }

  renderMuscleBadges(stats);
  renderGlobalAchievements(stats);
  renderBadgeGrid(stats);

  if (typeof BODY3D !== 'undefined' && BODY3D.isInitialized) {
    BODY3D.updateColors(stats.muscleVols);
  }
}

function renderMuscleBadges(stats) {
  var row = document.getElementById('muscle-badges-row');
  if (!row) return;

  var sessions = 0;
  for (var date in stats.dailyVols) sessions++;

  var vPct = Math.min(100, (stats.totalVol / 1000000) * 100);
  var sPct = Math.min(100, (sessions / 100) * 100);
  var ePct = Math.min(100, (stats.uniqueExCount / 50) * 100);
  var pPct = Math.min(100, (stats.prCount / 100) * 100);
  var rPct = Math.min(100, (stats.repCount / 10000) * 100);
  var specialProgress = ((vPct + sPct + ePct + pPct + rPct) / 5).toFixed(0);

  var allTxt = APP.t('all');
  var allExTxt = APP.t('exercises');
  var allHtml = '<div class="mbdg '+(BADGES.groupFilter===''?'on':'')+'" data-grp=""><div class="mbdg-nm">'+allTxt+'</div><div class="mbdg-t">'+allExTxt+'</div><div class="mbdg-pb"><div class="mbdg-pf" style="width:100%; background:var(--accent)"></div></div></div>';
  
  var succTxt = APP.t('achievements');
  var specTxt = APP.t('special');
  var specHtml = '<div class="mbdg '+(BADGES.groupFilter==='special'?'on':'')+'" data-grp="special"><div class="mbdg-nm">'+succTxt+'</div><div class="mbdg-t">'+specTxt+'</div><div class="mbdg-pb"><div class="mbdg-pf" style="width:'+specialProgress+'%; background:var(--gold)"></div></div></div>';
  
  var musclesHtml = '';
  for (var i = 0; i < MUSCLES.length; i++) {
    var m = MUSCLES[i];
    var n = stats.muscleSeries[m] || 0;
    var ti = getTier(n);
    var pct = (getTierProgress(n) * 100).toFixed(0);
    var active = BADGES.groupFilter === m ? 'on' : '';
    
    var mKey = {'Pectoraux':'pecs','Dorsaux':'back','Épaules':'shoulders','Biceps':'biceps','Triceps':'triceps','Quadriceps':'quads','Ischios':'hams','Fessiers':'glutes','Mollets':'calves','Abdos':'abs'}[m]||m;
    var translatedM = APP.t(mKey);

    musclesHtml += '<div class="mbdg '+ti.cls+' '+active+'" data-grp="'+m+'"><div class="mbdg-nm">'+translatedM+'</div><div class="mbdg-t" style="color:'+ti.col+'">'+ti.name+'</div><div class="mbdg-pb"><div class="mbdg-pf" style="width:'+pct+'%; background:linear-gradient(90deg, '+ti.col+', #fff)"></div></div></div>';
  }
  row.innerHTML = allHtml + specHtml + musclesHtml;
}

function renderGlobalAchievements(stats) {
  var sessions = 0;
  for (var date in stats.dailyVols) sessions++;

  var html = '<div class="clabel" style="margin:25px 0 12px; color:var(--accent)">' + APP.t('career_stats') + '</div><div class="ach-grid"><div class="ach-card"><div class="ach-val">'+fmtV(stats.totalVol)+'</div><div class="ach-lbl">Volume (KG)</div></div><div class="ach-card"><div class="ach-val">'+sessions+'</div><div class="ach-lbl">' + APP.t('sessions') + '</div></div><div class="ach-card"><div class="ach-val">'+stats.prCount+'</div><div class="ach-lbl">' + APP.t('records') + '</div></div></div>';
  var target = document.querySelector('#v-badges .clabel[data-i18n="label_muscles"]');

  if (target) {
    var old = document.getElementById('global-ach-box');
    if (old) old.parentNode.removeChild(old);
    var box = document.createElement('div');
    box.id = 'global-ach-box';
    box.innerHTML = html;
    target.parentNode.insertBefore(box, target);
  }
}

function renderSpecialAchievements(stats) {
  var big6Done = 0;
  for (var n = 0; n < BIG6.length; n++) {
    if (stats.exCounts[BIG6[n]]) big6Done++;
  }

  var isFR = APP.user.langue === 'fr';
  var monoPaliere = [
    {n:100,l:isFR?'Acier':'Steel',r:isFR?'RARE':'RARE',c:'#3b82f6'},
    {n:150,l:isFR?'Béton':'Concrete',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},
    {n:200,l:isFR?'Monolithe':'Monolith',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'},
    {n:300,l:isFR?'La Montagne':'The Mountain',r:isFR?'MYTHIQUE':'MYTHIC',c:'#22d3ee'}
  ];
  var totalMonoPaliere = [
    {n:300,l:isFR?'Fondation':'Foundation',r:isFR?'RARE':'RARE',c:'#3b82f6'},
    {n:450,l:isFR?'Structure':'Structure',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},
    {n:600,l:isFR?'Monolithe Total':'Total Monolith',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'},
    {n:900,l:isFR?'Le Colosse':'The Colossus',r:isFR?'MYTHIQUE':'MYTHIC',c:'#22d3ee'}
  ];

  var sessions = 0;
  for (var date in stats.dailyVols) sessions++;

  var specs = [
    {id:'titan', name:isFR?'Le Titan du Volume':'Volume Titan', icon:'trophy', val:stats.totalVol, paliere:[{n:10000,l:isFR?'Poids Plume':'Featherweight',r:isFR?'COMMUN':'COMMON',c:'#94a3b8'},{n:100000,l:isFR?'Poids Moyen':'Middleweight',r:isFR?'RARE':'RARE',c:'#3b82f6'},{n:500000,l:isFR?'Poids Lourd':'Heavyweight',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},{n:1000000,l:isFR?'Le Titan':'The Titan',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'},{n:5000000,l:'Atlas',r:isFR?'MYTHIQUE':'MYTHIC',c:'#22d3ee'}]},
    {id:'pilier', name:isFR?'Le Pilier du Club':'Club Pillar', icon:'trophy', val:sessions, paliere:[{n:10,l:isFR?'Visiteur':'Visitor',r:isFR?'COMMUN':'COMMON',c:'#94a3b8'},{n:50,l:isFR?'Habitué':'Regular',r:isFR?'RARE':'RARE',c:'#3b82f6'},{n:100,l:isFR?'Adepte':'Adept',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},{n:250,l:isFR?'Pilier de Fer':'Iron Pillar',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'},{n:500,l:isFR?'Légende Vivante':'Living Legend',r:isFR?'MYTHIQUE':'MYTHIC',c:'#22d3ee'}]},
    {id:'briseur', name:isFR?'Le Briseur de Limites':'Limit Breaker', icon:'trophy', val:stats.prCount, paliere:[{n:10,l:isFR?'Déterminé':'Determined',r:isFR?'RARE':'RARE',c:'#3b82f6'},{n:50,l:isFR?'Inarrêtable':'Unstoppable',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},{n:100,l:isFR?'Briseur de Plafond':'Ceiling Breaker',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'},{n:250,l:isFR?'L\'Anomalie':'The Anomaly',r:isFR?'MYTHIQUE':'MYTHIC',c:'#22d3ee'}]},
    {id:'acharne', name:isFR?'L\'Acharné':'Hard Worker', icon:'trophy', val:stats.repCount, paliere:[{n:1000,l:isFR?'Cadence I':'Cadence I',r:isFR?'COMMUN':'COMMON',c:'#94a3b8'},{n:10000,l:isFR?'Cadence II':'Cadence II',r:isFR?'RARE':'RARE',c:'#3b82f6'},{n:50000,l:isFR?'Mécanique':'Mechanical',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},{n:100000,l:isFR?'L\'Horloge de Fer':'Iron Clock',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'}]},
    {id:'chelem', name:isFR?'Le Grand Chelem':'Grand Slam', icon:'trophy', val:big6Done, paliere:[{n:2,l:isFR?'Apprenti':'Apprentice',r:isFR?'RARE':'RARE',c:'#3b82f6'},{n:4,l:isFR?'Guerrier Complet':'Complete Warrior',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},{n:6,l:isFR?'Le Grand Chelem':'Grand Slam',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'}]},
    {id:'monolithe', name:isFR?'Le Monolithe (SBD)':'Monolith (SBD)', icon:'trophy', val:stats.maxS + stats.maxB + stats.maxD, paliere:totalMonoPaliere},
    {id:'monolithe_s', name:isFR?'Monolithe S (Squat)':'Monolith S (Squat)', icon:'trophy', val:stats.maxS, paliere:monoPaliere},
    {id:'monolithe_b', name:isFR?'Monolithe B (Couché)':'Monolith B (Bench)', icon:'trophy', val:stats.maxB, paliere:monoPaliere},
    {id:'monolithe_d', name:isFR?'Monolithe D (Terre)':'Monolith D (Deadlift)', icon:'trophy', val:stats.maxD, paliere:monoPaliere},
    {id:'cameleon', name:isFR?'Le Caméléon':'Chameleon', icon:'trophy', val:stats.uniqueExCount, paliere:[{n:10,l:isFR?'Curieux':'Curious',r:isFR?'COMMUN':'COMMON',c:'#94a3b8'},{n:25,l:isFR?'Polyvalent':'Versatile',r:isFR?'RARE':'RARE',c:'#3b82f6'},{n:50,l:isFR?'Spécialiste':'Specialist',r:isFR?'ÉPIQUE':'EPIC',c:'#a855f7'},{n:75,l:isFR?'Encyclopédie':'Encyclopedia',r:isFR?'LÉGENDAIRE':'LEGENDARY',c:'#fbbf24'},{n:100,l:isFR?'Maître de la Salle':'Gym Master',r:isFR?'MYTHIQUE':'MYTHIC',c:'#22d3ee'}]}
  ];

  var html = '<div class="clabel" style="margin:25px 0 12px; color:var(--accent)">' + APP.t('special_achievements') + '</div><div id="special-ach-grid">';
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
    if (s.id === 'pilier') unit = APP.t('sessions');
    else if (s.id === 'cameleon') unit = APP.t('diff_exercises');
    else if (s.id === 'briseur') unit = 'PR';
    else if (s.id === 'acharne') unit = 'reps';
    else if (s.id === 'chelem') unit = '/ 6 ex';
    html += '<div class="bdg-card special-ach '+(earned?'earned':'')+'" style="border-left: 4px solid '+current.c+'"><div class="bdg-visual">'+getPremiumVisual(s.icon, current.c, earned)+'</div><div class="bdg-info" style="flex:1"><div class="bdg-title">'+(earned?current.l:s.name)+'</div><div class="bdg-meta">'+s.name+' <span class="bdg-rarity-pill" style="color:'+current.c+'">'+current.r+'</span></div><div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:'+pct+'%; background:'+current.c+'"></div></div><div class="bdg-rate" style="color:#fff; opacity:1">'+APP.t('progress')+' : '+s.val.toLocaleString()+' '+unit+'</div></div></div>';
  }
  html += '</div>';
  var grid = document.getElementById('badge-grid');
  if (grid) {
    var old = document.getElementById('special-ach-box');
    if (old) old.parentNode.removeChild(old);
    var box = document.createElement('div');
    box.id = 'special-ach-box';
    box.innerHTML = html;
    grid.parentNode.insertBefore(box, grid);
  }
}

function renderBadgeGrid(stats) {
  var grid = document.getElementById('badge-grid');
  if (!grid) return;
  if (BADGES.groupFilter === 'special') {
    renderSpecialAchievements(stats);
    grid.style.display = 'none';
    var specBox = document.getElementById('special-ach-box');
    if (specBox) specBox.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  var specBox = document.getElementById('special-ach-box');
  if (specBox) specBox.style.display = 'none';
  
  var max1RMs = {};
  for (var i = 0; i < APP.data.length; i++) {
    var e = APP.data[i];
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
    if (stats.exCounts[exList[l][0]] > 0) unlocked.push(exList[l]);
    else locked.push(exList[l]);
  }
  unlocked.sort(function(a, b) {
    return (stats.exCounts[b[0]] || 0) - (stats.exCounts[a[0]] || 0);
  });
  var allEx = unlocked.concat(locked);
  var htmlStr = '';
  for (var j = 0; j < allEx.length; j++) {
    var ex = allEx[j];
    var name = ex[0];
    var group = getPrimaryGroup(name);
    var n = stats.exCounts[name] || 0;
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
    
    var mKey = {'Pectoraux':'pecs','Dorsaux':'back','Épaules':'shoulders','Biceps':'biceps','Triceps':'triceps','Quadriceps':'quads','Ischios':'hams','Fessiers':'glutes','Mollets':'calves','Abdos':'abs'}[group]||group;
    var translatedGroup = APP.t(mKey);

    var rateTxt = APP.t('unlocked_by').replace('{{rate}}', ti.rate);

    htmlStr += '<div class="bdg-card '+ti.cls+' '+(earned?'earned':'')+'" data-rarity="'+ti.label+'"><div class="bdg-visual">'+getPremiumVisual(type, ti.col, earned)+'</div><div class="bdg-info" style="flex:1"><div class="bdg-title">'+name+'</div><div class="bdg-meta">'+translatedGroup+' <span class="bdg-rarity-pill" style="color:'+ti.col+'">'+ti.label+'</span></div><div class="bdg-progress-bg"><div class="bdg-progress-fill" style="width:'+pct+'%; background:'+ti.col+'; box-shadow:0 0 10px '+ti.col+'"></div></div>'+(earned?'<div class="bdg-rate">'+rateTxt+'</div>':'')+'</div><div class="bdg-aside" style="text-align:right"><div class="bdg-stat-v">'+(earned ? max1RM + 'kg' : '--')+'</div><div class="bdg-stat-l">1RM MAX</div></div></div>';
  }
  grid.innerHTML = htmlStr;
  if (window.gsap && allEx.length < 50) {
    gsap.from(".bdg-card", { opacity: 0, y: 20, stagger: 0.05, duration: 0.5, ease: "power2.out" });
  }
}
