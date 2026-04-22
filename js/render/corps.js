/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/corps.js
   ⚖️ Suivi du poids + 💪 Ratios de force + 🏆 Wilks 2020 / Dots
   ══════════════════════════════════════════════════════════════════════════ */

// ── État ──────────────────────────────────────────────────────────────────
var CORPS = {
  wlogKey:  'mrpg_weight_log',
  wPeriod:  '1m',
  wlog:     []   // [{date:'YYYY-MM-DD', poids:75.2}]
};

// ── Persistance du log de poids ───────────────────────────────────────────
CORPS.loadWlog = function() {
  var raw = localStorage.getItem(CORPS.wlogKey);
  CORPS.wlog = raw ? JSON.parse(raw) : [];
  CORPS.wlog.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
};

CORPS.saveWlog = function() {
  localStorage.setItem(CORPS.wlogKey, JSON.stringify(CORPS.wlog));
};

CORPS.addEntry = function(date, poids) {
  // Un seul enregistrement par date — écrase si même date
  var found = false;
  for (var i = 0; i < CORPS.wlog.length; i++) {
    if (CORPS.wlog[i].date === date) { CORPS.wlog[i].poids = poids; found = true; break; }
  }
  if (!found) CORPS.wlog.push({ date: date, poids: poids });
  CORPS.wlog.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
  CORPS.saveWlog();
  // Sync poids courant dans le profil
  if (APP.user) { APP.user.poids = poids; saveUser(APP.user); }
};

// ── Initialisation ────────────────────────────────────────────────────────
function initCorps() {
  CORPS.loadWlog();

  // Sous-onglets
  document.getElementById('prof-tab-id').addEventListener('click',    function() { _switchProfTab('id'); });
  document.getElementById('prof-tab-poids').addEventListener('click', function() { _switchProfTab('poids'); });
  document.getElementById('prof-tab-force').addEventListener('click', function() { _switchProfTab('force'); });

  // Bouton ajouter poids
  document.getElementById('wlog-add-btn').addEventListener('click', function() {
    var d = document.getElementById('wlog-date').value;
    var p = parseFloat(document.getElementById('wlog-poids').value);
    if (!d || isNaN(p) || p <= 0) { toast('Remplis la date et le poids !'); return; }
    CORPS.addEntry(d, p);
    toast('Poids enregistré ✅');
    renderWeightView();
  });

  // Sélecteur de période
  document.getElementById('wlog-period-bar').addEventListener('click', function(ev) {
    var btn = ev.target.closest('.plan-period-btn');
    if (!btn) return;
    CORPS.wPeriod = btn.dataset.period;
    document.querySelectorAll('#wlog-period-bar .plan-period-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.period === CORPS.wPeriod);
    });
    renderWeightChart();
  });
}

// ── Rendu global Profil ───────────────────────────────────────────────────
function renderProfTabs() {
  _switchProfTab('id'); // onglet par défaut
}

function _switchProfTab(tab) {
  document.getElementById('prof-tab-id').classList.toggle('active',    tab === 'id');
  document.getElementById('prof-tab-poids').classList.toggle('active', tab === 'poids');
  document.getElementById('prof-tab-force').classList.toggle('active', tab === 'force');
  document.getElementById('prof-id-view').style.display    = tab === 'id'    ? 'block' : 'none';
  document.getElementById('prof-poids-view').style.display = tab === 'poids' ? 'block' : 'none';
  document.getElementById('prof-force-view').style.display = tab === 'force' ? 'block' : 'none';
  if (tab === 'poids') renderWeightView();
  if (tab === 'force') renderForceView();
}

// ══════════════════════════════════════════════════════════════════════════
// ⚖️  ONGLET POIDS
// ══════════════════════════════════════════════════════════════════════════

function renderWeightView() {
  // Pré-remplir les champs
  var today = new Date();
  var mm = ('0' + (today.getMonth() + 1)).slice(-2);
  var dd = ('0' + today.getDate()).slice(-2);
  var todayStr = today.getFullYear() + '-' + mm + '-' + dd;
  document.getElementById('wlog-date').value = todayStr;

  // Pré-remplir poids = dernier log ou poids du profil
  var lastPoids = CORPS.wlog.length ? CORPS.wlog[CORPS.wlog.length - 1].poids : (APP.user ? APP.user.poids : '');
  document.getElementById('wlog-poids').value = lastPoids || '';

  renderWeightStats();
  renderWeightChart();
  renderWeightHistory();
}

// ── Stats résumé ─────────────────────────────────────────────────────────
function renderWeightStats() {
  var el = document.getElementById('wlog-stats');
  if (CORPS.wlog.length === 0) { el.innerHTML = ''; return; }

  var vals = CORPS.wlog.map(function(e) { return e.poids; });
  var cur  = vals[vals.length - 1];
  var mn   = Math.min.apply(null, vals);
  var mx   = Math.max.apply(null, vals);
  var avg  = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;

  // Tendance sur 30 jours (régression linéaire)
  var trend30 = _weightTrend(30);

  el.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px">' +
      _statBox('Actuel',   cur.toFixed(1) + ' kg',  'var(--accent)') +
      _statBox('Min',      mn.toFixed(1)  + ' kg',  'var(--green)') +
      _statBox('Max',      mx.toFixed(1)  + ' kg',  '#ef4444') +
      _statBox('Moy.',     avg.toFixed(1) + ' kg',  'var(--text2)') +
    '</div>' +
    '<div class="card" style="display:flex;align-items:center;gap:10px;padding:10px">' +
      '<span style="font-size:20px">' + (trend30 >= 0 ? '📈' : '📉') + '</span>' +
      '<div><div style="font-size:11px;color:var(--text2)">Tendance 30 jours</div>' +
      '<div style="font-weight:800;color:' + (trend30 >= 0 ? '#ef4444' : 'var(--green)') + '">' +
        (trend30 >= 0 ? '+' : '') + trend30.toFixed(2) + ' kg / mois</div></div>' +
    '</div>';
}

function _statBox(label, val, color) {
  return '<div class="card" style="padding:10px;text-align:center">' +
    '<div style="font-size:11px;color:var(--text2)">' + label + '</div>' +
    '<div style="font-size:16px;font-weight:900;color:' + color + '">' + val + '</div>' +
    '</div>';
}

// Régression linéaire sur les N derniers jours → kg/mois
function _weightTrend(days) {
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  var cutStr = cutoff.getFullYear() + '-' + ('0'+(cutoff.getMonth()+1)).slice(-2) + '-' + ('0'+cutoff.getDate()).slice(-2);
  var pts = CORPS.wlog.filter(function(e) { return e.date >= cutStr; });
  if (pts.length < 2) return 0;

  var n = pts.length;
  var baseTs = new Date(pts[0].date + 'T12:00:00').getTime();
  var xs = pts.map(function(e) { return (new Date(e.date + 'T12:00:00').getTime() - baseTs) / 86400000; });
  var ys = pts.map(function(e) { return e.poids; });

  var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (var i = 0; i < n; i++) { sumX += xs[i]; sumY += ys[i]; sumXY += xs[i]*ys[i]; sumX2 += xs[i]*xs[i]; }
  var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  return slope * 30; // kg/mois
}

// ── Filtre par période ────────────────────────────────────────────────────
function _filteredWlog() {
  if (CORPS.wPeriod === 'all' || CORPS.wlog.length === 0) return CORPS.wlog;
  var days = { '1m': 30, '3m': 90, '6m': 180, '1y': 365 }[CORPS.wPeriod] || 30;
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  var cutStr = cutoff.getFullYear() + '-' + ('0'+(cutoff.getMonth()+1)).slice(-2) + '-' + ('0'+cutoff.getDate()).slice(-2);
  return CORPS.wlog.filter(function(e) { return e.date >= cutStr; });
}

// ── Graphique SVG ─────────────────────────────────────────────────────────
function renderWeightChart() {
  var el  = document.getElementById('wlog-chart');
  var pts = _filteredWlog();

  if (pts.length < 2) {
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text2);font-size:13px">Pas assez de données pour le graphique.<br>Enregistre au moins 2 poids.</div>';
    return;
  }

  var W = el.offsetWidth || 320;
  var H = 180;
  var PAD = { top: 14, right: 14, bottom: 28, left: 38 };
  var cW = W - PAD.left - PAD.right;
  var cH = H - PAD.top  - PAD.bottom;

  var vals    = pts.map(function(p) { return p.poids; });
  var minV    = Math.min.apply(null, vals);
  var maxV    = Math.max.apply(null, vals);
  var range   = maxV - minV || 1;
  var padV    = range * 0.12;
  var yMin    = minV - padV;
  var yMax    = maxV + padV;

  var baseTs  = new Date(pts[0].date + 'T12:00:00').getTime();
  var lastTs  = new Date(pts[pts.length - 1].date + 'T12:00:00').getTime();
  var tsRange = lastTs - baseTs || 1;

  function sx(ts)  { return PAD.left + ((ts - baseTs) / tsRange) * cW; }
  function sy(v)   { return PAD.top  + (1 - (v - yMin) / (yMax - yMin)) * cH; }
  function ptDate(d) { return new Date(d + 'T12:00:00').getTime(); }

  // ── Moyenne mobile 7 jours ──────────────────────────────────────────
  var maPoints = [];
  for (var i = 0; i < pts.length; i++) {
    var ts0 = ptDate(pts[i].date);
    var window7 = pts.filter(function(p) {
      var t = ptDate(p.date);
      return t >= ts0 - 3 * 86400000 && t <= ts0 + 3 * 86400000;
    });
    var ma = window7.reduce(function(s, p) { return s + p.poids; }, 0) / window7.length;
    maPoints.push({ ts: ts0, v: ma });
  }

  // ── Régression linéaire complète ────────────────────────────────────
  var n = pts.length;
  var xs = pts.map(function(p) { return ptDate(p.date); });
  var ys = vals;
  var sumX=0, sumY=0, sumXY=0, sumX2=0;
  for (var i = 0; i < n; i++) { sumX += xs[i]; sumY += ys[i]; sumXY += xs[i]*ys[i]; sumX2 += xs[i]*xs[i]; }
  var slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX) || 0;
  var intercept = (sumY - slope*sumX) / n;
  var regY1 = slope * baseTs + intercept;
  var regY2 = slope * lastTs + intercept;

  // ── Construction SVG ────────────────────────────────────────────────
  var svg = '<svg width="' + W + '" height="' + H + '" style="display:block">';

  // Grille horizontale (5 lignes)
  for (var gi = 0; gi <= 4; gi++) {
    var gv = yMin + (yMax - yMin) * gi / 4;
    var gy = sy(gv);
    svg += '<line x1="' + PAD.left + '" y1="' + gy + '" x2="' + (PAD.left + cW) + '" y2="' + gy + '" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>';
    svg += '<text x="' + (PAD.left - 4) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="9" fill="rgba(255,255,255,0.4)">' + gv.toFixed(1) + '</text>';
  }

  // Labels dates (3-5 points)
  var labelCount = Math.min(pts.length, 5);
  for (var li = 0; li < labelCount; li++) {
    var lIdx = Math.round(li * (pts.length - 1) / (labelCount - 1 || 1));
    var lPt  = pts[lIdx];
    var lTs  = ptDate(lPt.date);
    var lx   = sx(lTs);
    var parts = lPt.date.split('-');
    svg += '<text x="' + lx + '" y="' + (H - 4) + '" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.4)">' + parts[2] + '/' + parts[1] + '</text>';
  }

  // Ligne de tendance
  svg += '<line x1="' + sx(baseTs) + '" y1="' + sy(regY1) + '" x2="' + sx(lastTs) + '" y2="' + sy(regY2) + '" stroke="rgba(239,68,68,0.5)" stroke-width="1.5" stroke-dasharray="5,4"/>';

  // Aire sous la courbe brute
  var areaPath = 'M ' + sx(ptDate(pts[0].date)) + ' ' + (PAD.top + cH);
  for (var pi = 0; pi < pts.length; pi++) {
    areaPath += ' L ' + sx(ptDate(pts[pi].date)) + ' ' + sy(pts[pi].poids);
  }
  areaPath += ' L ' + sx(ptDate(pts[pts.length-1].date)) + ' ' + (PAD.top + cH) + ' Z';
  svg += '<path d="' + areaPath + '" fill="rgba(var(--accent-rgb,99,102,241),0.08)" stroke="none"/>';

  // Courbe brute
  var linePath = '';
  for (var pi = 0; pi < pts.length; pi++) {
    linePath += (pi === 0 ? 'M ' : ' L ') + sx(ptDate(pts[pi].date)) + ' ' + sy(pts[pi].poids);
  }
  svg += '<path d="' + linePath + '" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>';

  // Moyenne mobile (accent color)
  var maPath = '';
  for (var mi = 0; mi < maPoints.length; mi++) {
    maPath += (mi === 0 ? 'M ' : ' L ') + sx(maPoints[mi].ts) + ' ' + sy(maPoints[mi].v);
  }
  svg += '<path d="' + maPath + '" fill="none" stroke="var(--accent)" stroke-width="2.5"/>';

  // Points clés (premier, dernier, min, max)
  var keyIdxs = [0, pts.length - 1];
  var minIdx = vals.indexOf(Math.min.apply(null, vals));
  var maxIdx = vals.indexOf(Math.max.apply(null, vals));
  if (keyIdxs.indexOf(minIdx) === -1) keyIdxs.push(minIdx);
  if (keyIdxs.indexOf(maxIdx) === -1) keyIdxs.push(maxIdx);
  keyIdxs.forEach(function(idx) {
    var p = pts[idx];
    var px = sx(ptDate(p.date));
    var py = sy(p.poids);
    svg += '<circle cx="' + px + '" cy="' + py + '" r="4" fill="var(--accent)" stroke="#0a0f1e" stroke-width="2"/>';
    svg += '<text x="' + px + '" y="' + (py - 8) + '" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">' + p.poids.toFixed(1) + '</text>';
  });

  // Légende
  svg += '<line x1="' + (W - 110) + '" y1="10" x2="' + (W - 95) + '" y2="10" stroke="var(--accent)" stroke-width="2.5"/>';
  svg += '<text x="' + (W - 92) + '" y="14" font-size="9" fill="rgba(255,255,255,0.6)">Moy. mobile 7j</text>';
  svg += '<line x1="' + (W - 110) + '" y1="22" x2="' + (W - 95) + '" y2="22" stroke="rgba(239,68,68,0.6)" stroke-width="1.5" stroke-dasharray="4,3"/>';
  svg += '<text x="' + (W - 92) + '" y="26" font-size="9" fill="rgba(255,255,255,0.6)">Tendance</text>';

  svg += '</svg>';
  el.innerHTML = svg;
}

// ── Historique (20 derniers) ──────────────────────────────────────────────
function renderWeightHistory() {
  var el  = document.getElementById('wlog-history');
  var log = CORPS.wlog.slice().reverse().slice(0, 20);
  if (log.length === 0) { el.innerHTML = '<p style="color:var(--text2);font-size:13px">Aucune donnée.</p>'; return; }

  var html = '';
  for (var i = 0; i < log.length; i++) {
    var entry = log[i];
    var prev  = log[i + 1];
    var diff  = prev ? (entry.poids - prev.poids) : null;
    var diffHtml = diff !== null
      ? '<span style="font-size:11px;color:' + (diff > 0 ? '#ef4444' : diff < 0 ? 'var(--green)' : 'var(--text2)') + '">' +
          (diff > 0 ? '▲' : diff < 0 ? '▼' : '=') + ' ' + Math.abs(diff).toFixed(1) + ' kg' +
        '</span>'
      : '';
    var parts = entry.date.split('-');
    html += '<div class="flex-between" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span style="font-size:13px;color:var(--text2)">' + parts[2] + '/' + parts[1] + '/' + parts[0] + '</span>' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        diffHtml +
        '<span style="font-size:14px;font-weight:800;color:#fff">' + entry.poids.toFixed(1) + ' kg</span>' +
        '<button class="wlog-del-btn" data-date="' + entry.date + '" style="background:none;border:none;color:rgba(239,68,68,0.5);font-size:14px;cursor:pointer;padding:0">✕</button>' +
      '</div></div>';
  }
  el.innerHTML = html;

  // Suppression
  el.querySelectorAll('.wlog-del-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var date = this.dataset.date;
      CORPS.wlog = CORPS.wlog.filter(function(e) { return e.date !== date; });
      CORPS.saveWlog();
      renderWeightView();
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 💪  ONGLET FORCE
// ══════════════════════════════════════════════════════════════════════════

// Exercices ciblés → catégorie
var _FORCE_LIFTS = [
  { label: 'Squat',        exNames: ['Squat barre', 'Squat avant barre', 'Squat barre haute', 'Squat barre (pause)'] },
  { label: 'Développé couché', exNames: ['Développé couché barre', 'Développé couché barre (pause)'] },
  { label: 'Soulevé de terre', exNames: ['Soulevé de terre conventionnel', 'Soulevé de terre roumain', 'Soulevé de terre sumo'] },
  { label: 'Développé militaire', exNames: ['Développé militaire barre', 'Développé militaire haltères', 'Développé militaire'] }
];

// Standards ratio 1RM / poids de corps (Symmetric Strength)
var _STANDARDS = {
  'M': {
    'Squat':              [0.75, 1.25, 1.75, 2.25, 2.75],
    'Développé couché':   [0.5,  0.75, 1.25, 1.75, 2.0],
    'Soulevé de terre':   [1.0,  1.5,  2.0,  2.5,  3.0],
    'Développé militaire':[0.35, 0.55, 0.75, 1.0,  1.35]
  },
  'F': {
    'Squat':              [0.5,  0.75, 1.0,  1.5,  2.0],
    'Développé couché':   [0.25, 0.5,  0.75, 1.0,  1.5],
    'Soulevé de terre':   [0.75, 1.0,  1.25, 1.75, 2.5],
    'Développé militaire':[0.2,  0.35, 0.5,  0.75, 1.0]
  }
};
var _LEVELS = ['Débutant', 'Novice', 'Intermédiaire', 'Avancé', 'Élite'];
var _LEVEL_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#f97316', '#a855f7'];

// Récupère le meilleur 1RM estimé (Epley) pour un ensemble d'exercices
function _getBest1RM(exNames) {
  var best = 0;
  if (!APP.data) return 0;
  for (var i = 0; i < APP.data.length; i++) {
    var e = APP.data[i];
    if (exNames.indexOf(e.ex) === -1) continue;
    var rm = epley(e.pds, e.rep);
    if (rm > best) best = rm;
  }
  return best;
}

function renderForceView() {
  renderForceRatios();
  renderWilksDots();
}

// ── Tableau ratios force / poids de corps ─────────────────────────────────
function renderForceRatios() {
  var el     = document.getElementById('force-ratio-table');
  var bw     = APP.user ? APP.user.poids : 0;
  var sexe   = (APP.user && APP.user.sexe) ? APP.user.sexe : 'M';
  var stds   = _STANDARDS[sexe];

  if (!bw || bw < 20) {
    el.innerHTML = '<p style="color:var(--text2);font-size:13px">Renseigne ton poids dans l\'onglet Identité.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < _FORCE_LIFTS.length; i++) {
    var lift    = _FORCE_LIFTS[i];
    var rm1     = _getBest1RM(lift.exNames);
    var ratio   = rm1 > 0 ? rm1 / bw : 0;
    var thresholds = stds[lift.label] || [1,1,1,1,1];

    // Niveau actuel
    var lvl = 0;
    for (var l = 0; l < thresholds.length; l++) { if (ratio >= thresholds[l]) lvl = l + 1; }
    var lvlLabel = lvl > 0 ? _LEVELS[lvl - 1] : 'Non classé';
    var lvlColor = lvl > 0 ? _LEVEL_COLORS[lvl - 1] : '#475569';
    var nextThresh = lvl < thresholds.length ? thresholds[lvl] : null;
    var pct = nextThresh ? Math.min(100, (ratio / nextThresh) * 100) : 100;

    html +=
      '<div style="margin-bottom:14px">' +
        '<div class="flex-between" style="margin-bottom:4px">' +
          '<span style="font-size:13px;font-weight:700;color:#fff">' + lift.label + '</span>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            (rm1 > 0 ? '<span style="font-size:11px;color:var(--text2)">~' + rm1.toFixed(1) + ' kg · x' + ratio.toFixed(2) + '</span>' : '<span style="font-size:11px;color:var(--text2)">Aucun PR</span>') +
            '<span style="font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;background:' + lvlColor + '22;color:' + lvlColor + '">' + lvlLabel + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,0.07);border-radius:6px;height:8px;overflow:hidden">' +
          '<div style="height:100%;width:' + pct.toFixed(0) + '%;background:' + lvlColor + ';border-radius:6px;transition:width 0.4s"></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:3px">' +
          thresholds.map(function(t, ti) {
            return '<span style="font-size:8px;color:' + _LEVEL_COLORS[ti] + ';font-weight:700">×' + t + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
  }
  el.innerHTML = html || '<p style="color:var(--text2);font-size:13px">Aucun PR enregistré.</p>';
}

// ── Wilks 2020 ────────────────────────────────────────────────────────────
function _wilks2020(bw, total, sexe) {
  var a, b, c, d, e, f;
  if (sexe === 'M') {
    a=-216.0475144; b=16.2606339; c=-0.002388645; d=-0.00113732; e=7.01863e-6; f=-1.291e-8;
  } else {
    a=594.31747775582; b=-27.23842536447; c=0.82112226871; d=-0.00930733913; e=4.731582e-5; f=-9.054e-8;
  }
  var denom = a + b*bw + c*bw*bw + d*bw*bw*bw + e*Math.pow(bw,4) + f*Math.pow(bw,5);
  if (denom <= 0) return 0;
  return total * (600 / denom);
}

// ── Dots ──────────────────────────────────────────────────────────────────
function _dots(bw, total, sexe) {
  var a, b, c, d, e;
  if (sexe === 'M') {
    a=-307.75076; b=24.0900756; c=-0.1918759221; d=7.391293e-4; e=-1.093e-6;
  } else {
    a=-57.96288; b=13.6175032; c=-0.1126655495; d=5.158568e-4; e=-1.091e-6;
  }
  var denom = a + b*bw + c*bw*bw + d*bw*bw*bw + e*Math.pow(bw,4);
  if (denom <= 0) return 0;
  return total * (500 / denom);
}

function _coefLevel(score, type) {
  // Niveaux indicatifs (les scores varient par formule)
  var thresholds = type === 'wilks'
    ? [ [300,'Amateur'], [380,'Régional'], [450,'National'], [500,'Élite'], [600,'World Class'] ]
    : [ [250,'Amateur'], [330,'Régional'], [400,'National'], [450,'Élite'], [550,'World Class'] ];
  var label = 'Débutant', color = '#64748b';
  for (var i = 0; i < thresholds.length; i++) {
    if (score >= thresholds[i][0]) { label = thresholds[i][1]; color = _LEVEL_COLORS[Math.min(i, 4)]; }
  }
  return { label: label, color: color };
}

function renderWilksDots() {
  var el   = document.getElementById('force-wilks-dots');
  var bw   = APP.user ? APP.user.poids : 0;
  var sexe = (APP.user && APP.user.sexe) ? APP.user.sexe : 'M';

  if (!bw || bw < 20) {
    el.innerHTML = '<p style="color:var(--text2);font-size:13px">Renseigne ton poids dans l\'onglet Identité.</p>';
    return;
  }

  var squat = _getBest1RM(_FORCE_LIFTS[0].exNames);
  var bench = _getBest1RM(_FORCE_LIFTS[1].exNames);
  var dead  = _getBest1RM(_FORCE_LIFTS[2].exNames);
  var total = squat + bench + dead;

  if (total < 10) {
    el.innerHTML = '<p style="color:var(--text2);font-size:13px">Besoin de PR pour Squat, Développé couché et Soulevé de terre.</p>'; return;
  }

  var wilks = _wilks2020(bw, total, sexe);
  var dots  = _dots(bw, total, sexe);
  var wLvl  = _coefLevel(wilks, 'wilks');
  var dLvl  = _coefLevel(dots,  'dots');

  var html =
    '<div style="margin-bottom:12px;font-size:12px;color:var(--text2)">' +
      'Total = Squat ' + squat.toFixed(0) + ' + Bench ' + bench.toFixed(0) + ' + DL ' + dead.toFixed(0) + ' = <strong style="color:#fff">' + total.toFixed(0) + ' kg</strong>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      _coefCard('Wilks 2020', wilks, wLvl) +
      _coefCard('Dots',       dots,  dLvl) +
    '</div>' +
    '<div style="margin-top:10px;font-size:10px;color:var(--text2);line-height:1.6">' +
      'Basé sur 1RM Epley (pds × (1 + reps/30)). ' +
      'Sexe : ' + (sexe === 'M' ? 'Homme' : 'Femme') + ' · Poids : ' + bw + ' kg.' +
    '</div>';

  el.innerHTML = html;
}

function _coefCard(name, score, lvl) {
  var maxScore = 700;
  var pct = Math.min(100, (score / maxScore) * 100);
  return '<div class="card" style="padding:14px;text-align:center;border-left:3px solid ' + lvl.color + '">' +
    '<div style="font-size:11px;color:var(--text2);margin-bottom:4px">' + name + '</div>' +
    '<div style="font-size:32px;font-weight:900;color:' + lvl.color + '">' + score.toFixed(1) + '</div>' +
    '<div style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:6px;background:' + lvl.color + '22;color:' + lvl.color + ';margin:6px auto;display:inline-block">' + lvl.label + '</div>' +
    '<div style="background:rgba(255,255,255,0.07);border-radius:4px;height:6px;margin-top:8px;overflow:hidden">' +
      '<div style="height:100%;width:' + pct.toFixed(0) + '%;background:' + lvl.color + ';border-radius:4px"></div>' +
    '</div>' +
    '</div>';
}
