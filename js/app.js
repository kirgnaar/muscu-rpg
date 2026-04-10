/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — app.js
   Orchestrateur principal: état global, init, routing, render (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var APP = {
  data:    [],
  view:    'seances',

  save: function() {
    saveData(APP.data);
  },

  switchView: function(name) {
    APP.view = name;

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('on', tabs[i].dataset.v === name);
    }

    var views = document.querySelectorAll('.view');
    for (var j = 0; j < views.length; j++) {
      views[j].classList.toggle('on', views[j].id === 'v-' + name);
    }

    APP.renderView(name);

    // Initialisation différée du mannequin 3D quand on affiche l'onglet Badges
    if (name === 'badges' && typeof BODY3D !== 'undefined') {
      if (!BODY3D.isInitialized) {
        BODY3D.init();
      } else {
        BODY3D.onResize();
        BODY3D.updateColors();
      }
    }
  },

  renderView: function(name) {
    switch(name) {
      case 'seances': renderJournal();  break;
      case 'pr':      renderPR();       break;
      case 'rpg':     renderRPG();      break;
      case 'simulation': renderSimulation(); break;
      case 'stats':   renderStats();    break;
      case 'badges':  renderBadges();   break;
    }
    renderHeader();
  },

  render: function() {
    APP.renderView(APP.view);
  },
};

function renderHeader() {
  var total = 0;
  for (var i = 0; i < APP.data.length; i++) total += APP.data[i].vol;
  var lvl = getLevel(total);
  var nextThr = levelThreshold(lvl + 1);
  var currThr = levelThreshold(lvl);
  var pct = ((total - currThr) / (nextThr - currThr) * 100).toFixed(0);

  var hdrXp = document.getElementById('hdr-xp');
  if (hdrXp) hdrXp.textContent = fmtV(total);
  
  var hdrLvlName = document.getElementById('hdr-lvl-name');
  if (hdrLvlName) hdrLvlName.textContent = levelName(lvl);
  
  var hdrLvlBar = document.getElementById('hdr-lvl-bar');
  if (hdrLvlBar) hdrLvlBar.style.width = pct + '%';

  var d = new Date();
  var dayStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  var hdrDate = document.getElementById('hdr-date');
  if (hdrDate) hdrDate.textContent = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
}

document.addEventListener('DOMContentLoaded', function() {
  APP.data = loadData();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function(err) {
      console.warn('[SW] Registration failed:', err);
    });
  }

  initJournal();
  initStats();
  initBadges();
  initSimulation();
  if (typeof TIMER !== 'undefined') TIMER.init();

  var tabsEl = document.querySelector('.tabs');
  if (tabsEl) {
    tabsEl.addEventListener('click', function(ev) {
      var tab = ev.target.closest('.tab');
      if (!tab || !tab.dataset.v) return;
      APP.switchView(tab.dataset.v);
    });
  }

  APP.render();
});
