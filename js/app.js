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

  t: function(key) {
    var lang = (APP.user && APP.user.langue) || 'fr';
    if (I18N[lang] && I18N[lang][key]) return I18N[lang][key];
    if (I18N['fr'][key]) return I18N['fr'][key];
    return key;
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

    // Gérer l'affichage plein écran (masquer les onglets) via CSS
    var appEl = document.getElementById('app');
    if (appEl) {
      var isFullPage = (name === 'profil' || name === 'settings');
      appEl.classList.toggle('full-page', isFullPage);
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
  if (hdrLvlName) hdrLvlName.textContent = APP.t('lvl') + ' ' + lvl;

  var hdrLvlBar = document.getElementById('hdr-lvl-bar');
  if (hdrLvlBar) hdrLvlBar.style.width = pct + '%';

  var d = new Date();
  var langCode = APP.user ? APP.user.langue : 'fr';
  var dayStr = d.toLocaleDateString(langCode + '-' + langCode.toUpperCase(), { weekday: 'long', day: 'numeric', month: 'long' });
  var hdrDate = document.getElementById('hdr-date');
  if (hdrDate) hdrDate.textContent = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

  if (APP.user) {
    var menuName = document.getElementById('menu-user-name');
    if (menuName) menuName.textContent = APP.user.prenom + ' ' + APP.user.nom;
    var menuStats = document.getElementById('menu-user-stats');
    if (menuStats) menuStats.textContent = APP.user.age + ' ' + APP.t('label_age').toLowerCase() + ' • ' + APP.user.poids + ' kg';
  }
}

function changeLang(val) {
  if (!APP.user) return;
  APP.user.langue = val;
  saveUser(APP.user);
  APP.updateStaticUI();
  APP.render();
  
  var msg = '';
  if (val === 'fr') msg = 'Langue : Français';
  else if (val === 'en') msg = 'Language: English';
  else if (val === 'de') msg = 'Sprache: Deutsch';
  else if (val === 'es') msg = 'Idioma: Español';
  else if (val === 'ja') msg = '言語: 日本語';
  
  if (typeof toast === 'function') toast(msg);
}

function confirmLang() {
  var val = document.getElementById('set-lang').value;
  changeLang(val);
}

APP.updateStaticUI = function() {
  // Tabs
  var tabSeances = document.querySelector('.tab[data-v="seances"] span:last-child');
  if (tabSeances) tabSeances.textContent = APP.t('tab_seances');
  var tabPR = document.querySelector('.tab[data-v="pr"] span:last-child');
  if (tabPR) tabPR.textContent = APP.t('tab_pr');
  var tabRPG = document.querySelector('.tab[data-v="rpg"] span:last-child');
  if (tabRPG) tabRPG.textContent = APP.t('tab_rpg');
  var tabSimu = document.querySelector('.tab[data-v="simulation"] span:last-child');
  if (tabSimu) tabSimu.textContent = APP.t('tab_simu');
  var tabStats = document.querySelector('.tab[data-v="stats"] span:last-child');
  if (tabStats) tabStats.textContent = APP.t('tab_stats');
  var tabBadges = document.querySelector('.tab[data-v="badges"] span:last-child');
  if (tabBadges) tabBadges.textContent = APP.t('tab_badges');

  // Menu burger
  var menuHome = document.querySelector('.menu-item[data-v="rpg"]');
  if (menuHome) menuHome.innerHTML = '<span>🏠</span> ' + APP.t('menu_home');
  var menuProfil = document.querySelector('.menu-item[data-v="profil"]');
  if (menuProfil) menuProfil.innerHTML = '<span>👤</span> ' + APP.t('menu_profil');
  var menuSettings = document.querySelector('.menu-item[data-v="settings"]');
  if (menuSettings) menuSettings.innerHTML = '<span>⚙️</span> ' + APP.t('menu_settings');

  var btnConfirm = document.getElementById('btn-confirm-lang');
  if (btnConfirm) btnConfirm.textContent = 'OK';

  // Journal View Labels
  var vSeances = $('v-seances');
  if (vSeances) {
    vSeances.querySelector('.stitle').textContent = APP.t('stitle_new_serie');
    var labels = $$('.flabel', vSeances);
    labels.forEach(function(l) {
      if (l.htmlFor === 'in-date') l.textContent = APP.t('label_date');
      if (l.htmlFor === 'sel-type') l.textContent = APP.t('label_type');
      if (l.htmlFor === 'sel-ex') l.textContent = APP.t('label_ex');
      if (l.htmlFor === 'in-ser') l.textContent = APP.t('label_ser');
      if (l.htmlFor === 'in-rep') l.textContent = APP.t('label_rep');
      if (l.htmlFor === 'in-pds') l.textContent = APP.t('label_pds');
    });
    $('btn-save').textContent = '✓ ' + APP.t('btn_save');
    var timerTitle = $('timer-card') ? $('timer-card').querySelector('.clabel span') : null;
    if (timerTitle) timerTitle.textContent = '⌛ ' + APP.t('label_timer');
    if ($('timer-start-btn')) $('timer-start-btn').textContent = '▶ ' + APP.t('timer_start');
    if ($('timer-stop-btn')) $('timer-stop-btn').textContent = '⏹ ' + APP.t('timer_stop');
    if ($('timer-reset-btn')) $('timer-reset-btn').textContent = '🔄 ' + APP.t('timer_reset');
    var journalTitle = vSeances.querySelector('.stitle.flex-between span');
    if (journalTitle) journalTitle.textContent = APP.t('stitle_journal');

    var pills = $$('.fpill', $('filter-bar'));
    if (pills.length >= 4) {
      pills[0].textContent = APP.t('filter_all');
      pills[1].textContent = APP.t('filter_ex');
      pills[2].textContent = APP.t('filter_type');
      pills[3].textContent = APP.t('filter_date');
    }

    var typeSel = $('sel-type');
    if (typeSel) {
      var curVal = typeSel.value;
      typeSel.innerHTML = '';
      ['hypertrophy', 'strength', 'hyperstrength', 'endurance', 'deload'].forEach(function(k) {
        var o = document.createElement('option');
        o.value = I18N['fr'][k];
        o.textContent = APP.t(k);
        typeSel.appendChild(o);
      });
      typeSel.value = curVal;
    }
  }

  // Profil View Labels
  var vProfil = $('v-profil');
  if (vProfil) {
    vProfil.querySelector('.clabel').textContent = APP.t('menu_profil');
    var profLabels = $$('.flabel', vProfil);
    if (profLabels.length >= 5) {
      profLabels[0].textContent = APP.t('label_prenom');
      profLabels[1].textContent = APP.t('label_nom');
      profLabels[2].textContent = APP.t('label_age');
      profLabels[3].textContent = APP.t('label_poids');
      profLabels[4].textContent = APP.t('label_taille');
    }
    vProfil.querySelector('button').textContent = APP.t('btn_save_profile');
  }

  // Settings View Labels
  var vSettings = $('v-settings');
  if (vSettings) {
    vSettings.querySelectorAll('.clabel')[0].textContent = APP.t('menu_settings');
    vSettings.querySelector('.flabel').textContent = APP.t('label_lang');
    vSettings.querySelectorAll('.clabel')[1].textContent = APP.t('label_theme');
    var themeLabels = $$('.theme-opt div:last-child', vSettings);
    if (themeLabels.length >= 3) {
      themeLabels[0].textContent = APP.t('theme_dark');
      themeLabels[1].textContent = APP.t('theme_light');
      themeLabels[2].textContent = APP.t('theme_amber');
    }
  }
};

function renderProfil() {
  $('v-profil').querySelector('.clabel').textContent = APP.t('menu_profil');
  var labels = $$('.flabel', $('v-profil'));
  labels[0].textContent = APP.t('label_prenom');
  labels[1].textContent = APP.t('label_nom');
  labels[2].textContent = APP.t('label_age');
  labels[3].textContent = APP.t('label_poids');
  labels[4].textContent = APP.t('label_taille');
  $('v-profil').querySelector('button').textContent = APP.t('btn_save_profile');

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
  if (typeof toast === 'function') toast(APP.user.langue === 'fr' ? 'Profil enregistré !' : 'Profile saved!');
}

function renderSettings() {
  if (!APP.user) return;
  APP.updateStaticUI();
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
  APP.updateStaticUI();

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
