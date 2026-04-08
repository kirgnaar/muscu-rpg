/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/journal.js
   Onglet Séances: formulaire de saisie, journal groupé, filtres
══════════════════════════════════════════════════════════════════════════ */

// ── État filtre ───────────────────────────────────────────────────────────
var JOURNAL = {
  filterType: 'none',  // none | ex | type | date
  filterVal:  '',
};

// ── Initialisation ────────────────────────────────────────────────────────
function initJournal() {
  // Peupler le select exercice principal
  populateExerciseSelect($('sel-ex'), true);

  // Peupler le select exercice du filtre
  populateExerciseSelect($('f-ex-sel'), false);

  // Mettre la date d'aujourd'hui par défaut
  $('in-date').value = todayISO();

  // Preview 1RM live
  $('in-rep').addEventListener('input', updatePreview1RM);
  $('in-pds').addEventListener('input', updatePreview1RM);
  $('sel-ex').addEventListener('change', updatePreview1RM);

  // Bouton Enregistrer
  $('btn-save').addEventListener('click', handleSave);

  // Listener delete sur le journal (event delegation)
  var _lastTouchId = null;
  $('journal').addEventListener('touchend', function(ev) {
  var btn = ev.target.closest('.del-btn');
  if (!btn) return;
  if (ev.cancelable) ev.preventDefault();
  _lastTouchId = Date.now();
  var id = parseInt(btn.closest('.sitem').dataset.id);
  handleConfirmDelete(id, btn);
  }, { passive: false });

$('journal').addEventListener('click', function(ev) {
  if (_lastTouchId && Date.now() - _lastTouchId < 300) return;
  handleJournalClick(ev);
});
  // Filtres
  $('filter-bar').addEventListener('click', handleFilterPill);
  $('f-ex-sel').addEventListener('change', function() {
    JOURNAL.filterVal = this.value; renderJournal();
  });
  $('f-type-sel').addEventListener('change', function() {
    JOURNAL.filterVal = this.value; renderJournal();
  });
  $('f-date-sel').addEventListener('change', function() {
    JOURNAL.filterVal = this.value; renderJournal();
  });
}

// ── Preview 1RM ───────────────────────────────────────────────────────────
function updatePreview1RM() {
  var rep  = parseInt($('in-rep').value);
  var pds  = parseFloat($('in-pds').value);
  var exNm = $('sel-ex').value;
  var prev = $('preview-1rm');
  if (rep && pds && pds > 0) {
    var rm1    = epley(pds, rep);
    var isBig6 = BIG6.indexOf(exNm) !== -1;
    prev.style.display = 'block';
    prev.innerHTML = '⚡ 1RM estimé : <strong>' + rm1 + ' kg</strong>'
      + (isBig6 ? ' &nbsp;·&nbsp; 🏆 <em>Big 6 — PR possible !</em>' : '');
  } else {
    prev.style.display = 'none';
  }
}

// ── Enregistrement ────────────────────────────────────────────────────────
function handleSave() {
  var type = $('sel-type').value;
  var ex   = $('sel-ex').value;
  var ser  = parseInt($('in-ser').value);
  var rep  = parseInt($('in-rep').value);
  var pds  = parseFloat($('in-pds').value);
  var date = $('in-date').value || todayISO();

  if (!ex)                     { toast('Choisis un exercice', 'err'); return; }
  if (!ser || !rep || !pds)    { toast('Remplis tous les champs', 'err'); return; }
  if (ser < 1 || rep < 1 || pds <= 0) { toast('Valeurs incorrectes', 'err'); return; }

  var exData = EX.find(function(e) { return e[0] === ex; });
  var entry = addEntry({
    date: date,
    type: type,
    ex:   ex,
    grp:  exData ? exData[2] : '',
    ser:  ser,
    rep:  rep,
    pds:  pds,
  });

  // Reset form
  $('in-ser').value = '';
  $('in-rep').value = '';
  $('in-pds').value = '';
  $('in-date').value = todayISO();
  $('preview-1rm').style.display = 'none';

  APP.render();

  // Démarrer le chrono de repos
  if (typeof TIMER !== 'undefined') {
    TIMER.start();
  }

  if (entry.isPR) {
    toast('🏆 NOUVEAU PR ! ' + entry.rm1 + ' kg', 'pr');
  } else if (entry.isLevelUp) {
    toast('✨ LEVEL UP ! Niveau ' + entry.newLvl, 'pr');
  } else {
    toast('✓ Enregistré · ' + fmtV(entry.vol), '');
  }

  // Animation XP
  var xp = $('hdr-xp');
  xp.classList.add('xp-gain');
  setTimeout(function() { xp.classList.remove('xp-gain'); }, 600);
}

// ── Suppression ───────────────────────────────────────────────────────────
/**
 * Double-tap pour confirmer : 1er appui → état rouge, 2e appui → suppression.
 * Timeout de 3 s pour annuler automatiquement.
 */
function handleConfirmDelete(id, btn) {
  var item = btn.closest('.sitem');
  if (item.dataset.confirm === '1') {
    deleteEntry(id);
    APP.render();
    toast('Série supprimée', '');
  } else {
    item.dataset.confirm = '1';
    btn.dataset.confirm  = '1';
    btn.textContent      = '✕';
    setTimeout(function() {
      if (item.parentNode) {
        item.dataset.confirm = '';
        btn.dataset.confirm  = '';
        btn.textContent      = '\uD83D\uDDD1';
      }
    }, 3000);
  }
}

/** Gestionnaire click générique sur la zone journal (desktop). */
function handleJournalClick(ev) {
  var btn = ev.target.closest('.del-btn');
  if (!btn) return;
  var id = parseInt(btn.closest('.sitem').dataset.id);
  handleConfirmDelete(id, btn);
}

// ── Filtres ───────────────────────────────────────────────────────────────
function handleFilterPill(ev) {
  var pill = ev.target.closest('.fpill');
  if (!pill) return;
  $$('.fpill', $('filter-bar')).forEach(function(p) { p.classList.remove('on'); });
  pill.classList.add('on');
  JOURNAL.filterType = pill.dataset.ftype;
  JOURNAL.filterVal  = '';
  ['f-ex-sel','f-type-sel','f-date-sel'].forEach(function(id) {
    $(id).style.display = 'none';
  });
  if (JOURNAL.filterType === 'ex')   $('f-ex-sel').style.display   = 'block';
  if (JOURNAL.filterType === 'type') $('f-type-sel').style.display  = 'block';
  if (JOURNAL.filterType === 'date') $('f-date-sel').style.display  = 'block';
  renderJournal();
}

function applyFilter(entries) {
  if (JOURNAL.filterType === 'none' || !JOURNAL.filterVal) return entries;
  if (JOURNAL.filterType === 'ex')   return entries.filter(function(e) { return e.ex   === JOURNAL.filterVal; });
  if (JOURNAL.filterType === 'type') return entries.filter(function(e) { return e.type === JOURNAL.filterVal; });
  if (JOURNAL.filterType === 'date') return entries.filter(function(e) { return e.date === JOURNAL.filterVal; });
  return entries;
}

// ── Render ────────────────────────────────────────────────────────────────
function renderJournal() {
  var list = $('journal');

  // Mettre à jour la liste des dates dans le select filtre
  var dateSel = $('f-date-sel');
  while (dateSel.options.length > 1) dateSel.remove(1);
  allDates().forEach(function(d) {
    var o = document.createElement('option');
    o.value = d;
    o.textContent = fmtDLong(d);
    dateSel.appendChild(o);
  });
  if (JOURNAL.filterType === 'date') dateSel.value = JOURNAL.filterVal;

  var filtered = applyFilter(APP.data.slice());
  $('jcount').textContent = filtered.length + ' / ' + APP.data.length + ' séries';

  if (!APP.data.length) {
    list.innerHTML = '<div class="empty"><span class="empty-icon">🏋️</span><p>Aucune série.<br>Saisis ta première entrée !</p></div>';
    return;
  }
  if (!filtered.length) {
    list.innerHTML = '<div class="empty"><span class="empty-icon">🔍</span><p>Aucune série pour ce filtre.</p></div>';
    return;
  }

  // Trier par date desc, puis id desc
  var sorted = filtered.slice().sort(function(a, b) {
    return b.date.localeCompare(a.date) || b.id - a.id;
  });

  // Grouper par date
  var groups = {};
  sorted.forEach(function(e) {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });

  var html = '';
  Object.keys(groups).sort().reverse().forEach(function(date) {
    var items  = groups[date];
    var dayVol = items.reduce(function(s, e) { return s + e.vol; }, 0);
    html += '<div class="date-group-hdr">'
          + '<span class="date-group-label">' + fmtDLong(date) + '</span>'
          + '<span class="date-group-vol">' + fmtV(dayVol) + '</span>'
          + '</div>';
    items.forEach(function(e) {
      var c  = TCOL[e.type] || '#94a3b8';
      var pr = e.isPR ? '<span style="font-size:14px">🏆</span>' : '';
      html += '<div class="sitem" data-id="' + e.id + '">'
            + '<div class="sdot" style="background:' + c + '"></div>'
            + '<div class="sinfo">'
            + '<div class="sname">' + e.ex + '</div>'
            + '<div class="smeta">' + e.type + ' \u00b7 ' + e.ser + '\u00d7' + e.rep + ' \u00b7 ' + e.pds + ' kg</div>'
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:2px">'
            + '<div class="svol">' + fmtV(e.vol) + '</div>'
            + pr
            + '<button class="del-btn">\uD83D\uDDD1</button>'
            + '</div>'
            + '</div>';
    });
  });

  list.innerHTML = html;
}
