/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — utils.js
   Fonctions utilitaires partagées: format, formules, toast, date
══════════════════════════════════════════════════════════════════════════ */

// ── Formule Epley (1RM estimé) ────────────────────────────────────────────
/**
 * 1RM estimé via la formule d'Epley, arrondi au 0.5kg
 * @param {number} poids - poids de la série (kg)
 * @param {number} reps  - nombre de répétitions
 * @returns {number}
 */
function epley(poids, reps) {
  if (!poids || !reps || poids <= 0 || reps <= 0) return 0;
  return Math.round(poids * (1 + reps / 30) * 2) / 2;
}

/**
 * Charge recommandée pour N reps depuis un 1RM
 * Formule inverse d'Epley, arrondie au 0.5kg
 */
function repWeight(rm1, reps) {
  if (!rm1 || !reps) return 0;
  return Math.round(rm1 / (1 + reps / 30) * 2) / 2;
}

// ── Formatage ─────────────────────────────────────────────────────────────
/**
 * Formater un volume en kg/k/M
 */
function fmtV(v) {
  v = v || 0;
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M kg';
  if (v >= 1000)    return Math.round(v / 1000) + 'k kg';
  return Math.round(v) + ' kg';
}

/**
 * Formater une date ISO en "4 avr."
 */
function fmtD(d) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  });
}

/**
 * Formater une date ISO en "lundi 4 avril"
 */
function fmtDLong(d) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
}

/**
 * Date du jour en format ISO YYYY-MM-DD
 */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Toast ─────────────────────────────────────────────────────────────────
var _toastTimer = null;

/**
 * Afficher un toast
 * @param {string} msg    - message
 * @param {string} type   - '' | 'pr' | 'err'
 */
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

/**
 * Créer un élément avec des attributs
 */
function el(tag, attrs, text) {
  var e = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function(k) {
    if (k === 'class') e.className = attrs[k];
    else e.setAttribute(k, attrs[k]);
  });
  if (text !== undefined) e.textContent = text;
  return e;
}

// ── Export / Import JSON ──────────────────────────────────────────────────
/**
 * Exporter les données via Share Sheet iOS ou fallback clipboard
 */
function exportData() {
  var data = APP.data;
  if (!data.length) { toast('Aucune donnée à exporter', 'err'); return; }
  var payload = {
    version:  2,
    exported: new Date().toISOString(),
    app:      'Muscu RPG — CdB Sucy Judo',
    entries:  data
  };
  var json     = JSON.stringify(payload, null, 2);
  var dateStr  = todayISO();
  var filename = 'muscu-rpg-' + dateStr + '.json';

  // iOS Share Sheet
  if (navigator.share && navigator.canShare) {
    var file = new File([json], filename, { type: 'application/json' });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Muscu RPG — Sauvegarde ' + dateStr })
        .then(function() { toast('Export partagé (' + data.length + ' séries)', ''); })
        .catch(function(err) {
          if (err.name !== 'AbortError') fallbackExport(json, filename);
        });
      return;
    }
  }
  fallbackExport(json, filename);
}

function fallbackExport(json, filename) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(json)
      .then(function() { toast('JSON copié dans le presse-papier', ''); })
      .catch(function() { showJsonOverlay(json); });
  } else {
    showJsonOverlay(json);
  }
}

function showJsonOverlay(json) {
  var overlay = el('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;flex-direction:column;padding:20px;gap:12px;';
  var title = el('div', {}, 'Copier le JSON ci-dessous');
  title.style.cssText = 'color:#f1f5ff;font-weight:700;font-size:16px;';
  var ta = el('textarea');
  ta.value = json;
  ta.readOnly = true;
  ta.style.cssText = 'flex:1;background:#1a2235;color:#f1f5ff;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;font-size:11px;font-family:monospace;';
  var btn = el('button', {}, '✕ Fermer');
  btn.style.cssText = 'background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:14px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;';
  btn.addEventListener('click', function() { document.body.removeChild(overlay); });
  overlay.appendChild(title);
  overlay.appendChild(ta);
  overlay.appendChild(btn);
  document.body.appendChild(overlay);
  ta.focus(); ta.select();
}

/**
 * Importer depuis un fichier JSON
 */
function importData(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var payload  = JSON.parse(e.target.result);
      var entries  = Array.isArray(payload) ? payload : (payload.entries || []);
      if (!Array.isArray(entries)) throw new Error('Format invalide');
      var existing = new Set(APP.data.map(function(d) { return d.id; }));
      var newOnes  = entries.filter(function(d) { return !existing.has(d.id); });
      APP.data = APP.data.concat(newOnes);
      APP.save();
      APP.render();
      toast(newOnes.length + ' nouvelles séries importées', '');
    } catch(err) {
      toast('Erreur : fichier JSON invalide', 'err');
    }
  };
  reader.readAsText(file);
}
