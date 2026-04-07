/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/stats.js
   Onglet Stats: KPIs, sélecteur exercice, graphiques Canvas
══════════════════════════════════════════════════════════════════════════ */

var STATS = { currentEx: '' };

// ── Init ──────────────────────────────────────────────────────────────────
function initStats() {
  // Select exercice pour les graphiques
  populateExerciseSelect($('stat-ex-sel'), false);
  var emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.textContent = '-- Choisir un exercice --';
  $('stat-ex-sel').insertBefore(emptyOpt, $('stat-ex-sel').firstChild);
  $('stat-ex-sel').value = '';

  $('stat-ex-sel').addEventListener('change', function() {
    STATS.currentEx = this.value;
    renderStatsCharts(STATS.currentEx);
  });

  // Export / Import
  $('btn-export').addEventListener('click', exportData);
  $('btn-import').addEventListener('change', function(e) {
    importData(e.target.files[0]);
    this.value = '';
  });
}

// ── Render ────────────────────────────────────────────────────────────────
function renderStats() {
  var data     = APP.data;
  var total    = data.reduce(function(s, e) { return s + e.vol; }, 0);
  var sessions = new Set(data.map(function(e) { return e.date; })).size;
  var prs      = data.filter(function(e) { return e.isPR; }).length;
  var exUniq   = new Set(data.map(function(e) { return e.ex; })).size;

  $('st-vol').textContent = fmtV(total);
  $('st-ses').textContent = sessions;
  $('st-pr').textContent  = prs;
  $('st-ex').textContent  = exUniq;

  renderStatsCharts(STATS.currentEx);
}

// ── Charts ────────────────────────────────────────────────────────────────
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

  var exData = EX.find(function(e) { return e[0] === exName; });
  var color  = exData ? (MCOL[exData[2]] || '#3b82f6') : '#3b82f6';
  var dates  = history.map(function(h) { return h.date; });
  var vols   = history.map(function(h) { return h.vol; });
  var rms    = history.map(function(h) { return h.rm1; });

  // Volume chart
  cardVol.style.display = 'block';
  $('chart-vol-title').textContent = 'Volume par séance — ' + exName;
  $('chart-vol-legend').innerHTML  = '<span><span class="ch-dot" style="background:' + color + '"></span>Volume (kg)</span>';
  setTimeout(function() { drawChart('chart-vol', dates, [{ values: vols, color: color }]); }, 30);

  // 1RM chart
  cardPR.style.display = 'block';
  $('chart-pr-title').textContent = '1RM estimé — ' + exName + (BIG6.indexOf(exName) !== -1 ? ' 🏆' : '');
  $('chart-pr-legend').innerHTML  = '<span><span class="ch-dot" style="background:#10b981"></span>1RM estimé Epley (kg)</span>';
  setTimeout(function() { drawChart('chart-pr', dates, [{ values: rms, color: '#10b981' }]); }, 30);
}

// ── Canvas chart renderer ─────────────────────────────────────────────────
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

  var allVals = datasets.flatMap(function(d) { return d.values; });
  var minV = Math.min.apply(null, allVals);
  var maxV = Math.max.apply(null, allVals);
  if (minV === maxV) { minV = 0; maxV = maxV * 1.2 || 10; }
  var range = maxV - minV;
  minV = Math.max(0, minV - range * 0.1);
  maxV = maxV + range * 0.05;

  function xPos(i) {
    return PAD.left + (labels.length === 1 ? cW / 2 : i / (labels.length - 1) * cW);
  }
  function yPos(v) {
    return PAD.top + cH - (v - minV) / (maxV - minV) * cH;
  }

  // Grid lines + Y labels
  ctx.font = '9px -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(122,138,170,0.8)';
  ctx.textAlign = 'right';
  var steps = 4;
  for (var i = 0; i <= steps; i++) {
    var y   = PAD.top + i / steps * cH;
    var val = maxV - i / steps * (maxV - minV);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();
    var lbl = val >= 1000 ? Math.round(val / 1000) + 'k' : Math.round(val) + '';
    ctx.fillText(lbl, PAD.left - 6, y + 3);
  }

  // X labels (max 6)
  ctx.textAlign = 'center';
  var step = Math.max(1, Math.ceil(labels.length / 6));
  for (var j = 0; j < labels.length; j += step) {
    var parts = labels[j].split('-');
    var dl    = parseInt(parts[2]) + '/' + parseInt(parts[1]);
    ctx.fillText(dl, xPos(j), PAD.top + cH + 14);
  }

  // Datasets
  datasets.forEach(function(ds) {
    if (!ds.values.length) return;
    var col = ds.color;

    // Area fill
    ctx.beginPath();
    ds.values.forEach(function(v, k) {
      if (k === 0) ctx.moveTo(xPos(k), yPos(v));
      else ctx.lineTo(xPos(k), yPos(v));
    });
    ctx.lineTo(xPos(ds.values.length - 1), PAD.top + cH);
    ctx.lineTo(xPos(0), PAD.top + cH);
    ctx.closePath();
    var r = parseInt(col.slice(1,3), 16);
    var g = parseInt(col.slice(3,5), 16);
    var b = parseInt(col.slice(5,7), 16);
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.12)';
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = col;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ds.values.forEach(function(v, k) {
      if (k === 0) ctx.moveTo(xPos(k), yPos(v));
      else ctx.lineTo(xPos(k), yPos(v));
    });
    ctx.stroke();

    // Dots
    ds.values.forEach(function(v, k) {
      ctx.beginPath();
      ctx.arc(xPos(k), yPos(v), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    });
  });
}
