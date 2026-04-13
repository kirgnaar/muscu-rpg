/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/stats.js
   Onglet Stats: KPIs, sélecteur exercice, graphiques Canvas (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var STATS = { currentEx: '' };

/**
 * Initialisation de l'onglet Stats
 */
function initStats() {
  populateExerciseSelect($('stat-ex-sel'), false);
  var emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = '-- ' + (APP.user.langue === 'fr' ? 'Choisir un exercice' : 'Choose an exercise') + ' --';
  $('stat-ex-sel').insertBefore(emptyOpt, $('stat-ex-sel').firstChild);
  $('stat-ex-sel').value = '';

  $('stat-ex-sel').addEventListener('change', function() {
    STATS.currentEx = this.value;
    renderStatsCharts(STATS.currentEx);
  });

  $('btn-export').addEventListener('click', exportData);
  $('btn-import').addEventListener('change', function(e) {
    if (e.target.files[0]) {
      importData(e.target.files[0]);
    }
    this.value = '';
  });
}

/**
 * Rendu des KPIs globaux
 */
function renderStats() {
  $('v-stats').querySelector('.stitle').textContent = APP.t('stitle_stats');
  $('btn-export').textContent = '⬆️ ' + APP.t('btn_export');
  $('v-stats').querySelector('label[for="btn-import"]').textContent = '⬇️ ' + APP.t('btn_import');
  
  var kpis = $$('.kpi-l', $('v-stats'));
  kpis[0].textContent = APP.t('label_vol_total');
  kpis[1].textContent = APP.t('label_sessions');
  kpis[2].textContent = APP.t('label_pr_done');
  kpis[3].textContent = APP.t('label_ex_diff');
  
  $('v-stats').querySelector('.fgroup .flabel').textContent = APP.t('label_ex_analyze');
  $('chart-empty').querySelector('div').textContent = APP.t('label_chart_empty');

  var data = APP.data;
  var total = 0;
  var sessionsSet = {};
  var prs = 0;
  var exSet = {};

  for (var i = 0; i < data.length; i++) {
    var e = data[i];
    total += e.vol;
    sessionsSet[e.date] = true;
    if (e.isPR) prs++;
    exSet[e.ex] = true;
  }

  var sessionCount = 0;
  for (var d in sessionsSet) sessionCount++;
  var exUniqCount = 0;
  for (var ex in exSet) exUniqCount++;

  $('st-vol').textContent = fmtV(total);
  $('st-ses').textContent = sessionCount;
  $('st-pr').textContent  = prs;
  $('st-ex').textContent  = exUniqCount;

  renderStatsCharts(STATS.currentEx);
}

/**
 * Rendu des graphiques pour un exercice
 */
function renderStatsCharts(exName) {
  var cardVol = $('chart-vol-card');
  var cardPR  = $('chart-pr-card');
  var cardEmp = $('chart-empty');

  if (!exName) {
    cardVol.style.display = 'none';
    cardPR.style.display  = 'none';
    cardEmp.style.display = 'none';
    return;
  }

  var history = exerciseHistory(exName);
  if (!history.length) {
    cardVol.style.display = 'none';
    cardPR.style.display  = 'none';
    cardEmp.style.display = 'block';
    return;
  }

  cardEmp.style.display = 'none';

  var exData = null;
  for (var i = 0; i < EX.length; i++) {
    if (EX[i][0] === exName) { exData = EX[i]; break; }
  }
  var color = exData ? (MCOL[exData[2].p || exData[2]] || '#3b82f6') : '#3b82f6';

  var dates = [];
  var vols = [];
  var rms = [];
  for (var j = 0; j < history.length; j++) {
    dates.push(history[j].date);
    vols.push(history[j].vol);
    rms.push(history[j].rm1);
  }

  cardVol.style.display = 'block';
  $('chart-vol-title').textContent = APP.t('label_chart_vol') + ' — ' + exName;
  $('chart-vol-legend').innerHTML  = '<span><span class="ch-dot" style="background:' + color + '"></span>Volume (kg)</span>';
  setTimeout(function() { drawChart('chart-vol', dates, [{ values: vols, color: color }]); }, 30);

  cardPR.style.display = 'block';
  $('chart-pr-title').textContent = APP.t('label_chart_pr') + ' — ' + exName + (BIG6.indexOf(exName) !== -1 ? ' 🏆' : '');
  // Correction de la légende : Afficher Hybride au lieu d'Epley
  $('chart-pr-legend').innerHTML  = '<span><span class="ch-dot" style="background:#10b981"></span>' + (APP.user.langue === 'fr' ? '1RM estimé Hybride' : 'Est. Hybrid 1RM') + ' (kg)</span>';
  setTimeout(function() { drawChart('chart-pr', dates, [{ values: rms, color: '#10b981' }]); }, 30);
}


/**
 * Moteur de rendu Canvas
 */
function drawChart(canvasId, labels, datasets) {
  var canvas = $(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W   = canvas.offsetWidth;
  var H   = canvas.offsetHeight;
  if (!W || !H) return;

  canvas.width  = W * window.devicePixelRatio;
  canvas.height = H * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx.clearRect(0, 0, W, H);

  if (!labels.length) return;

  var PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  var cW  = W - PAD.left - PAD.right;
  var cH  = H - PAD.top  - PAD.bottom;

  var allVals = [];
  for (var i = 0; i < datasets.length; i++) {
    allVals = allVals.concat(datasets[i].values);
  }
  
  var minV = Math.min.apply(null, allVals);
  var maxV = Math.max.apply(null, allVals);
  if (minV === maxV) { minV = 0; maxV = maxV * 1.2 || 10; }
  var range = maxV - minV;
  minV = Math.max(0, minV - range * 0.1);
  maxV = maxV + range * 0.05;

  var xPos = function(idx) {
    return PAD.left + (labels.length === 1 ? cW / 2 : idx / (labels.length - 1) * cW);
  };
  var yPos = function(val) {
    return PAD.top + cH - (val - minV) / (maxV - minV) * cH;
  };

  ctx.font = '9px -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(122,138,170,0.8)';
  ctx.textAlign = 'right';
  var steps = 4;
  for (var k = 0; k <= steps; k++) {
    var y   = PAD.top + k / steps * cH;
    var v = maxV - k / steps * (maxV - minV);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();
    var lbl = v >= 1000 ? Math.round(v / 1000) + 'k' : Math.round(v) + '';
    ctx.fillText(lbl, PAD.left - 6, y + 3);
  }

  ctx.textAlign = 'center';
  var step = Math.max(1, Math.ceil(labels.length / 6));
  for (var l = 0; l < labels.length; l += step) {
    var parts = labels[l].split('-');
    var dl    = parseInt(parts[2]) + '/' + parseInt(parts[1]);
    ctx.fillText(dl, xPos(l), PAD.top + cH + 14);
  }

  for (var m = 0; m < datasets.length; m++) {
    var ds = datasets[m];
    if (!ds.values.length) continue;
    var col = ds.color;

    ctx.beginPath();
    for (var n = 0; n < ds.values.length; n++) {
      if (n === 0) ctx.moveTo(xPos(n), yPos(ds.values[n]));
      else ctx.lineTo(xPos(n), yPos(ds.values[n]));
    }
    ctx.lineTo(xPos(ds.values.length - 1), PAD.top + cH);
    ctx.lineTo(xPos(0), PAD.top + cH);
    ctx.closePath();
    
    var r_comp = parseInt(col.slice(1,3), 16);
    var g_comp = parseInt(col.slice(3,5), 16);
    var b_comp = parseInt(col.slice(5,7), 16);
    ctx.fillStyle = 'rgba(' + r_comp + ',' + g_comp + ',' + b_comp + ',0.12)';
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = col;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    for (var p = 0; p < ds.values.length; p++) {
      if (p === 0) ctx.moveTo(xPos(p), yPos(ds.values[p]));
      else ctx.lineTo(xPos(p), yPos(ds.values[p]));
    }
    ctx.stroke();

    for (var r_idx = 0; r_idx < ds.values.length; r_idx++) {
      ctx.beginPath();
      ctx.arc(xPos(r_idx), yPos(ds.values[r_idx]), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
  }
}
