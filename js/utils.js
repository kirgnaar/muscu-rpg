/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — utils.js
   Fonctions utilitaires partagées: format, formules, toast, date (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

// ── Formules de Force (1RM estimé) ─────────────────────────────────────────
function epley(poids, reps) {
  if (!poids || !reps || poids <= 0 || reps <= 0) return 0;
  if (reps === 1) return poids;
  var epleyVal = poids * (1 + reps / 30);
  var brzyckiVal = poids * (36 / (37 - Math.min(reps, 36)));
  var res = (epleyVal + brzyckiVal) / 2;
  return Math.round(res * 2) / 2;
}

function repWeight(rm1, reps) {
  if (!rm1 || !reps) return 0;
  if (reps === 1) return rm1;
  var epleyInv = rm1 / (1 + reps / 30);
  var brzyckiInv = rm1 * (37 - Math.min(reps, 36)) / 36;
  var res = (epleyInv + brzyckiInv) / 2;
  return Math.round(res * 2) / 2;
}

// ── Formatage ─────────────────────────────────────────────────────────────
function fmtV(v) {
  v = v || 0;
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M kg';
  if (v >= 1000)    return Math.round(v / 1000) + 'k kg';
  return Math.round(v) + ' kg';
}

function fmtD(d) {
  if (!d) return '—';
  var langCode = (typeof APP !== 'undefined' && APP.user) ? APP.user.langue : 'fr';
  return new Date(d + 'T12:00:00').toLocaleDateString(langCode + '-' + langCode.toUpperCase(), {
    day: 'numeric', month: 'short'
  });
}

function fmtDLong(d) {
  if (!d) return '—';
  var langCode = (typeof APP !== 'undefined' && APP.user) ? APP.user.langue : 'fr';
  return new Date(d + 'T12:00:00').toLocaleDateString(langCode + '-' + langCode.toUpperCase(), {
    weekday: 'long', day: 'numeric', month: 'long'
  });
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Formules RPG (Équilibrage Hook & Long-Term) ───────────────────────────
/**
 * Nouvelle Courbe de Progression :
 * BASE = 500 (Le Niv. 1 s'atteint dès 500kg, très motivant)
 * EXP  = 2.8 (La difficulté explose à haut niveau pour le challenge)
 */
var RPG_BASE = 500;
var RPG_EXP  = 2.8;

function levelThreshold(n) {
  return RPG_BASE * Math.pow(n, RPG_EXP);
}

function getLevel(vol) {
  if (!vol || vol <= 0) return 0;
  return Math.min(100, Math.floor(Math.pow(vol / RPG_BASE, 1 / RPG_EXP)));
}

function levelProgress(vol) {
  var lvl = getLevel(vol);
  if (lvl >= 100) return 1;
  var low  = levelThreshold(lvl);
  var high = levelThreshold(lvl + 1);
  return Math.min(1, (vol - low) / (high - low));
}

/**
 * Palette de couleurs étendue pour marquer la progression visuelle
 */
function getColorForLevel(lvl) {
  if (lvl < 5)   return '#4b5563'; // Gris (Inactif)
  if (lvl < 15)  return '#22d3ee'; // Cyan (Éveil)
  if (lvl < 30)  return '#10b981'; // Vert (Apprenti)
  if (lvl < 50)  return '#3b82f6'; // Bleu (Guerrier)
  if (lvl < 70)  return '#8b5cf6'; // Violet (Expert)
  if (lvl < 85)  return '#ec4899'; // Rose (Maître)
  if (lvl < 95)  return '#f97316'; // Orange (Grand Maître)
  return '#fbbf24';                // Or (Légende)
}

// ── Toast ─────────────────────────────────────────────────────────────────
var _toastTimer = null;
function toast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type === 'pr' ? ' pr-toast' : type === 'err' ? ' err-toast' : '');
  t.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3000);
}

// ── DOM helpers ───────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function $$(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

function el(tag, attrs, text) {
  var e = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (attrs.hasOwnProperty(k)) {
        if (k === 'class') e.className = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
    }
  }
  if (text !== undefined) e.textContent = text;
  return e;
}

// ── Export / Import JSON ──────────────────────────────────────────────────
function exportData() {
  var data = APP.data;
  if (!data.length) { toast('Aucune donnée', 'err'); return; }
  var payload = {
    version:  2,
    exported: new Date().toISOString(),
    app:      'Muscu RPG — Tracker Gamifié',
    entries:  data
  };
  var json     = JSON.stringify(payload, null, 2);
  var dateStr  = todayISO();
  var filename = 'muscu-rpg-' + dateStr + '.json';

  if (navigator.share && navigator.canShare) {
    var file = new File([json], filename, { type: 'application/json' });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Muscu RPG' })
        .catch(function(err) {
          if (err.name !== 'AbortError') fallbackExport(json);
        });
      return;
    }
  }
  fallbackExport(json);
}

function fallbackExport(json) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(json)
      .then(function() { toast('Copié dans le presse-papier'); })
      .catch(function() { showJsonOverlay(json); });
  } else {
    showJsonOverlay(json);
  }
}

function showJsonOverlay(json) {
  var overlay = el('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;padding:20px;gap:12px;';
  var title = el('div', {style:'color:#fff;font-weight:700'}, 'Copier le JSON');
  var ta = el('textarea');
  ta.value = json;
  ta.readOnly = true;
  ta.style.cssText = 'flex:1;background:#111;color:#fff;padding:10px;font-family:monospace;';
  var btn = el('button', {}, '✕ Fermer');
  btn.addEventListener('click', function() { document.body.removeChild(overlay); });
  overlay.appendChild(title);
  overlay.appendChild(ta);
  overlay.appendChild(btn);
  document.body.appendChild(overlay);
}

function importData(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var payload  = JSON.parse(e.target.result);
      var entries  = Array.isArray(payload) ? payload : (payload.entries || []);
      
      var existingIds = {};
      for (var i = 0; i < APP.data.length; i++) existingIds[APP.data[i].id] = true;
      
      var newOnes = [];
      for (var j = 0; j < entries.length; j++) {
        if (!existingIds[entries[j].id]) newOnes.push(entries[j]);
      }
      
      APP.data = APP.data.concat(newOnes);
      APP.save();
      APP.render();
      toast(newOnes.length + ' séries importées');
    } catch(err) {
      toast('Erreur JSON', 'err');
    }
  };
  reader.readAsText(file);
}
