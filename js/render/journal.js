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
  // Traduction des labels statiques (non gérés par APP.updateStaticUI)
  $('v-seances').querySelector('.stitle').textContent = APP.t('stitle_new_serie');
  var labels = $$('.flabel', $('v-seances'));
  for (var i = 0; i < labels.length; i++) {
    var l = labels[i];
    if (l.htmlFor === 'in-date') l.textContent = APP.t('label_date');
    if (l.htmlFor === 'sel-type') l.textContent = APP.t('label_type');
    if (l.htmlFor === 'sel-ex') l.textContent = APP.t('label_ex');
    if (l.htmlFor === 'in-ser') l.textContent = APP.t('label_ser');
    if (l.htmlFor === 'in-rep') l.textContent = APP.t('label_rep');
    if (l.htmlFor === 'in-pds') l.textContent = APP.t('label_pds');
  }
  $('btn-save').textContent = '✓ ' + APP.t('btn_save');
  $('timer-card').querySelector('.clabel span').textContent = '⌛ ' + APP.t('label_timer');
  $('timer-start-btn').textContent = '▶ ' + APP.t('timer_start');
  $('timer-stop-btn').textContent = '⏹ ' + APP.t('timer_stop');
  $('timer-reset-btn').textContent = '🔄 ' + APP.t('timer_reset');
  $('v-seances').querySelector('.stitle.flex-between span').textContent = APP.t('stitle_journal');

  var pills = $$('.fpill', $('filter-bar'));
  pills[0].textContent = APP.t('filter_all');
  pills[1].textContent = APP.t('filter_ex');
  pills[2].textContent = APP.t('filter_type');
  pills[3].textContent = APP.t('filter_date');

  // Peupler les types de séances traduits
  var typeSel = $('sel-type');
  typeSel.innerHTML = '';
  var typeKeys = ['hypertrophy', 'strength', 'hyperstrength', 'endurance', 'deload'];
  for (var i = 0; i < typeKeys.length; i++) {
    var k = typeKeys[i];
    var o = document.createElement('option');
    o.value = I18N['fr'][k]; // On garde les valeurs FR en DB pour la compatibilité
    o.textContent = APP.t(k);
    typeSel.appendChild(o);
  }

  var fTypeSel = $('f-type-sel');
  fTypeSel.innerHTML = '<option value="">' + APP.t('filter_all_types') + '</option>';
  for (var j = 0; j < typeKeys.length; j++) {
    var key = typeKeys[j];
    var o2 = document.createElement('option');
    o2.value = I18N['fr'][key];
    o2.textContent = APP.t(key);
    fTypeSel.appendChild(o2);
  }

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
    var best   = bestRM1(exNm);
    var isPR   = rm1 > best && best > 0;
    prev.style.display = 'block';
    
    var label1RM = APP.user.langue === 'ja' ? '1RM 推定' : '⚡ 1RM ' + APP.t('progress').toLowerCase();
    var recordTxt = APP.user.langue === 'fr' ? 'Nouveau record !' : 'New record!';
    
    prev.innerHTML = label1RM + ' : <strong>' + rm1 + ' kg</strong>'
      + (isPR ? ' &nbsp;·&nbsp; 🏆 <em style="color:var(--gold)">' + recordTxt + '</em>' : '');
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

  var exData = null;
  for (var i = 0; i < EX.length; i++) {
    if (EX[i][0] === ex) { exData = EX[i]; break; }
  }
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
    var prTxt = APP.user.langue === 'fr' ? '🏆 NOUVEAU PR ! ' : '🏆 NEW PR! ';
    toast(prTxt + entry.rm1 + ' kg', 'pr');
  } else if (entry.isLevelUp) {
    var lvlTxt = APP.user.langue === 'fr' ? '✨ LEVEL UP ! Niveau ' : '✨ LEVEL UP! Level ';
    toast(lvlTxt + entry.newLvl, 'pr');
  } else {
    var savedTxt = APP.user.langue === 'fr' ? '✓ Enregistré · ' : '✓ Saved · ';
    toast(savedTxt + fmtV(entry.vol), '');
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
    toast(APP.user.langue === 'fr' ? 'Série supprimée' : 'Set deleted', '');
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
  var pills = $$('.fpill', $('filter-bar'));
  for (var i = 0; i < pills.length; i++) {
    pills[i].classList.remove('on');
  }
  pill.classList.add('on');
  JOURNAL.filterType = pill.dataset.ftype;
  JOURNAL.filterVal  = '';
  var filterSelects = ['f-ex-sel','f-type-sel','f-date-sel'];
  for (var j = 0; j < filterSelects.length; j++) {
    $(filterSelects[j]).style.display = 'none';
  }
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
  var dates = allDates();
  for (var i = 0; i < dates.length; i++) {
    var d = dates[i];
    var o = document.createElement('option');
    o.value = d;
    o.textContent = fmtDLong(d);
    dateSel.appendChild(o);
  }
  if (JOURNAL.filterType === 'date') dateSel.value = JOURNAL.filterVal;

  var filtered = applyFilter(APP.data.slice());
  $('jcount').textContent = filtered.length + ' / ' + APP.data.length + ' ' + APP.t('sets');

  if (!APP.data.length) {
    list.innerHTML = '<div class="empty"><span class="empty-icon">🏋️</span><p>' + APP.t('no_sets') + '</p></div>';
    return;
  }
  if (!filtered.length) {
    list.innerHTML = '<div class="empty"><span class="empty-icon">🔍</span><p>' + APP.t('no_sets_filter') + '</p></div>';
    return;
  }

  // Trier par date desc, puis id desc
  var sorted = filtered.slice().sort(function(a, b) {
    return b.date.localeCompare(a.date) || b.id - a.id;
  });

  // Grouper par date
  var groups = {};
  for (var k = 0; k < sorted.length; k++) {
    var e = sorted[k];
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  }

  var html = '';
  var groupDates = Object.keys(groups).sort().reverse();
  for (var l = 0; l < groupDates.length; l++) {
    var date = groupDates[l];
    var items  = groups[date];
    var dayVol = 0;
    for (var m = 0; m < items.length; m++) {
      dayVol += items[m].vol;
    }
    html += '<div class="date-group-hdr">'
          + '<span class="date-group-label">' + fmtDLong(date) + '</span>'
          + '<span class="date-group-vol">' + fmtV(dayVol) + '</span>'
          + '</div>';
    for (var n = 0; n < items.length; n++) {
      var entry = items[n];
      var c  = TCOL[entry.type] || '#94a3b8';
      var pr = entry.isPR ? ' <span style="font-size:14px" title="Record Personnel !">🏆</span>' : '';

      // Get translated type name
      var typeKey = {
        'Hypertrophie': 'hypertrophy',
        'Force': 'strength',
        'Hyperforce (PR)': 'hyperstrength',
        'Endurance musculaire': 'endurance',
        'Décharge': 'deload'
      }[entry.type] || '';
      var translatedType = typeKey ? APP.t(typeKey) : entry.type;

      html += '<div class="sitem" data-id="' + entry.id + '">'
            + '<div class="sdot" style="background:' + c + '"></div>'
            + '<div class="sinfo">'
            + '<div class="sname">' + APP.t(entry.ex) + pr + '</div>'
            + '<div class="smeta">' + translatedType + ' \u00b7 ' + entry.ser + '\u00d7' + entry.rep + ' \u00b7 ' + entry.pds + ' kg</div>'
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:2px">'
            + '<div class="svol">' + fmtV(entry.vol) + '</div>'
            + '<button class="del-btn">\uD83D\uDDD1</button>'
            + '</div>'
            + '</div>';
    }
  }


  list.innerHTML = html;
}
