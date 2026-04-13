/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — app.js
   Orchestrateur principal: état global, init, routing, render (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var APP = {
  data:    [],
  user:    null,
  view:    'seances',

  save: function() {
    saveData(APP.data);
  },

  toggleMenu: function() {
    document.getElementById('side-menu').classList.toggle('open');
    document.getElementById('menu-overlay').classList.toggle('open');
    document.getElementById('burger').classList.toggle('open');
  },

  closeMenu: function() {
    document.getElementById('side-menu').classList.remove('open');
    document.getElementById('menu-overlay').classList.remove('open');
    document.getElementById('burger').classList.remove('open');
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

    // Masquer la barre d'onglets pour le profil et les paramètres
    var tabsBar = document.querySelector('.tabs');
    if (tabsBar) {
      var isFullPage = (name === 'profil' || name === 'settings');
      tabsBar.style.display = isFullPage ? 'none' : 'flex';
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
      case 'profil':  renderProfil();   break;
      case 'settings': renderSettings(); break;
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

  if (APP.user) {
    var menuName = document.getElementById('menu-user-name');
    if (menuName) menuName.textContent = APP.user.prenom + ' ' + APP.user.nom;
    var menuStats = document.getElementById('menu-user-stats');
    if (menuStats) menuStats.textContent = APP.user.age + ' ans • ' + APP.user.poids + ' kg';
  }
}

function renderProfil() {
  if (!APP.user) return;
  document.getElementById('prof-prenom').value = APP.user.prenom;
  document.getElementById('prof-nom').value = APP.user.nom;
  document.getElementById('prof-age').value = APP.user.age;
  document.getElementById('prof-poids').value = APP.user.poids;
  document.getElementById('prof-taille').value = APP.user.taille;
}

function saveProfile() {
  APP.user.prenom = document.getElementById('prof-prenom').value;
  APP.user.nom = document.getElementById('prof-nom').value;
  APP.user.age = parseInt(document.getElementById('prof-age').value) || 0;
  APP.user.poids = parseFloat(document.getElementById('prof-poids').value) || 0;
  APP.user.taille = parseInt(document.getElementById('prof-taille').value) || 0;
  saveUser(APP.user);
  renderHeader();
  if (typeof toast === 'function') toast('Profil enregistré !');
}

function renderSettings() {
  if (!APP.user) return;
  document.getElementById('set-lang').value = APP.user.langue;
  
  var opts = document.querySelectorAll('.theme-opt');
  for (var i = 0; i < opts.length; i++) {
    opts[i].classList.toggle('active', opts[i].dataset.theme === APP.user.theme);
    opts[i].style.borderColor = opts[i].dataset.theme === APP.user.theme ? 'var(--accent)' : 'transparent';
  }
}

function setTheme(theme) {
  APP.user.theme = theme;
  saveUser(APP.user);
  applyTheme(theme);
  renderSettings();
}

function applyTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-amber');
  if (theme !== 'dark') {
    document.body.classList.add('theme-' + theme);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  APP.data = loadData();
  APP.user = loadUser();
  applyTheme(APP.user.theme);

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

  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', APP.toggleMenu);

  var overlay = document.getElementById('menu-overlay');
  if (overlay) overlay.addEventListener('click', APP.closeMenu);

  APP.render();
});
