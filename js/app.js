/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — app.js
   Orchestrateur principal: état global, init, routing, render
══════════════════════════════════════════════════════════════════════════ */

// ── État global ───────────────────────────────────────────────────────────
var APP = {
  data:    [],
  view:    'seances',

  // ── Persistance ────────────────────────────────────────────────────────
  save: function() {
    saveData(APP.data);
  },

  // ── Routing ────────────────────────────────────────────────────────────
  switchView: function(name) {
    APP.view = name;

    // Tabs
    $$('.tab').forEach(function(t) {
      t.classList.toggle('on', t.dataset.v === name);
    });

    // Views
    $$('.view').forEach(function(v) {
      v.classList.toggle('on', v.id === 'v-' + name);
    });

    // Render uniquement la vue active
    APP.renderView(name);

    // Mises à jour spécifiques après changement de vue
    if (name === 'badges' && typeof BODY3D !== 'undefined') {
      if (!BODY3D.isReady) {
        BODY3D.init();
      } else {
        BODY3D.onResize();
        BODY3D.updateColors();
      }
    }
  },

  // ── Render une vue ────────────────────────────────────────────────────
  renderView: function(name) {
    switch(name) {
      case 'seances': renderJournal();  break;
      case 'pr':      renderPR();       break;
      case 'rpg':     renderRPG();      break;
      case 'stats':   renderStats();    break;
      case 'badges':  renderBadges();   break;
    }
    renderHeader();
  },

  // ── Render global (toutes vues) ──────────────────────────────────────
  render: function() {
    APP.renderView(APP.view);
  },
};

// ── Render header ─────────────────────────────────────────────────────────
function renderHeader() {
  var total = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var lvl = getLevel(total);
  var nextThr = levelThreshold(lvl + 1);
  var currThr = levelThreshold(lvl);
  var pct = ((total - currThr) / (nextThr - currThr) * 100).toFixed(0);

  $('hdr-xp').textContent = fmtV(total);
  $('hdr-lvl-name').textContent = levelName(lvl);
  $('hdr-lvl-bar').style.width = pct + '%';

  var d = new Date();
  var dayStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  $('hdr-date').textContent = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
}

// ── Initialisation ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  // 1. Charger les données
  APP.data = loadData();

  // 2. Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function(err) {
      console.warn('[SW] Registration failed:', err);
    });
  }

  // 3. Init composants
  initJournal();
  initStats();
  initBadges();
  if (typeof TIMER !== 'undefined') TIMER.init();

  // 4. Tab bar — event delegation (iOS-friendly)
  var tabsEl = document.querySelector('.tabs');
  tabsEl.addEventListener('click', function(ev) {
    var tab = ev.target.closest('.tab');
    if (!tab || !tab.dataset.v) return;
    APP.switchView(tab.dataset.v);
  });

  // 5. Render initial
  APP.render();
});
