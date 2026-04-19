/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/pr.js
   Onglet PR Big 6: meilleur 1RM, tableau de charges 1-10 reps
   ══════════════════════════════════════════════════════════════════════════ */

function renderPR() {
  $('v-pr').querySelector('[data-i18n="stitle_pr"]').textContent = APP.t('stitle_pr');
  $('v-pr').querySelector('[data-i18n="stitle_pr_bonus"]').textContent = APP.t('stitle_pr_bonus');
  
  // Rendu Big 6
  var list = $('pr-list');
  list.innerHTML = BIG6.map(function(ex, i) {
    return _generatePRCard(ex, BIG6_COLORS[i]);
  }).join('');

  // Initialisation du sélecteur bonus si vide
  var bonusSel = $('pr-bonus-ex-sel');
  if (bonusSel.options.length === 0) {
    populateExerciseSelect(bonusSel, true);
    
    bonusSel.addEventListener('change', function() {
      renderPRBonus();
    });
    
    // Valeur par défaut (premier exercice avec des données qui n'est pas dans le Big 6)
    var exWithData = allExercisesWithData().filter(function(ex) {
      return BIG6.indexOf(ex) === -1;
    });
    if (exWithData.length > 0) {
      bonusSel.value = exWithData[0];
    }
  }

  renderPRBonus();
}

function renderPRBonus() {
  var ex = $('pr-bonus-ex-sel').value;
  var container = $('pr-bonus-container');
  if (!ex) {
    container.innerHTML = '<div class="card" style="text-align:center; padding:20px; color:var(--text2)">' + APP.t('label_chart_empty') + '</div>';
    return;
  }
  container.innerHTML = _generatePRCard(ex, 'var(--accent)');
}

function _generatePRCard(ex, color) {
  var entries = APP.data.filter(function(e) { return e.ex === ex && e.pds >= 1; });

  if (!entries.length) {
    var emptyReps = [1,2,3,4,5,6,7,8,9,10].map(function(r) {
      return '<div class="repcell' + (r >= 8 && r <= 12 ? ' hi' : '') + '">'
           + '<div class="rn">' + r + '</div>'
           + '<div class="rv">—</div>'
           + '</div>';
    }).join('');
    return '<div class="prcard" style="border-color:' + color + '">'
         + '<div class="prname" style="color:' + color + '">' + APP.t(ex) + '</div>'
         + '<div class="pr1rm" style="color:' + color + '">—</div>'
         + '<div class="prsub">' + APP.t('no_data') + '</div>'
         + '<div class="reptable">' + emptyReps + '</div>'
         + '</div>';
  }

  var best   = bestRM1Entry(ex);
  var rm1    = epley(best.pds, best.rep);
  
  // Calcul de la progression (diff avec la séance précédente)
  var exDates = allDates().filter(function(d) {
    return APP.data.some(function(e) { return e.ex === ex && e.date === d; });
  });
  
  var diffStr = '';
  if (exDates.length > 1) {
    var prevDate = exDates[1]; // exDates est trié du plus récent au plus ancien
    var prevRM = bestRM1ForDate(ex, prevDate);
    if (prevRM && prevRM !== rm1) {
      var diff = (rm1 - prevRM).toFixed(1);
      var diffColor = diff > 0 ? 'var(--green)' : 'var(--red)';
      diffStr = ' · <span style="color:' + diffColor + '">' + (diff > 0 ? '↑ +' : '↓ ') + diff + ' kg</span>';
    }
  }

  var repCells = [1,2,3,4,5,6,7,8,9,10].map(function(r) {
    var w  = repWeight(rm1, r);
    var hi = r >= 8 && r <= 12;
    return '<div class="repcell' + (hi ? ' hi' : '') + '">'
         + '<div class="rn">' + r + '</div>'
         + '<div class="rv">' + w + ' kg</div>'
         + '</div>';
  }).join('');

  return '<div class="prcard" style="border-color:' + color + '">'
       + '<div class="prname" style="color:' + color + '">' + APP.t(ex) + '</div>'
       + '<div class="pr1rm" style="color:' + color + '">' + rm1
       + ' <span style="font-size:14px;color:var(--text2)">kg</span></div>'
       + '<div class="prsub">📅 PR ' + APP.t('pr_on') + ' ' + fmtD(best.date)
       + ' &nbsp;·&nbsp; ' + best.ser + '×' + best.rep + ' @ ' + best.pds + ' kg'
       + diffStr + '</div>'
       + '<div class="reptable">' + repCells + '</div>'
       + '</div>';
}
