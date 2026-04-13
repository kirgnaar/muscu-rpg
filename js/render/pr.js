/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/pr.js
   Onglet PR Big 6: meilleur 1RM, tableau de charges 1-10 reps
══════════════════════════════════════════════════════════════════════════ */

function renderPR() {
  $('v-pr').querySelector('.stitle').textContent = APP.t('stitle_pr');
  var list = $('pr-list');
  list.innerHTML = BIG6.map(function(ex, i) {
    var color   = BIG6_COLORS[i];
    var entries = APP.data.filter(function(e) { return e.ex === ex && e.pds >= 10; });

    if (!entries.length) {
      var emptyReps = [1,2,3,4,5,6,7,8,9,10].map(function(r) {
        return '<div class="repcell' + (r >= 8 && r <= 12 ? ' hi' : '') + '">'
             + '<div class="rn">' + r + '</div>'
             + '<div class="rv">—</div>'
             + '</div>';
      }).join('');
      return '<div class="prcard" style="border-color:' + color + '">'
           + '<div class="prname" style="color:' + color + '">' + ex + '</div>'
           + '<div class="pr1rm" style="color:' + color + '">—</div>'
           + '<div class="prsub">' + (APP.user.langue === 'fr' ? 'Aucune donnée' : 'No data') + '</div>'
           + '<div class="reptable">' + emptyReps + '</div>'
           + '</div>';
    }

    var best   = bestRM1Entry(ex);
    var rm1    = epley(best.pds, best.rep);
    var lastD  = allDates().filter(function(d) {
      return APP.data.some(function(e) { return e.ex === ex && e.date === d; });
    })[0];
    var lastRM = lastD ? bestRM1ForDate(ex, lastD) : 0;
    var diff   = lastRM && rm1 && lastRM !== rm1 ? (lastRM > rm1 ? ' · ↑ +' + (lastRM - rm1) + ' kg' : ' · ↓ ' + (lastRM - rm1) + ' kg') : '';

    var repCells = [1,2,3,4,5,6,7,8,9,10].map(function(r) {
      var w  = repWeight(rm1, r);
      var hi = r >= 8 && r <= 12;
      return '<div class="repcell' + (hi ? ' hi' : '') + '">'
           + '<div class="rn">' + r + '</div>'
           + '<div class="rv">' + w + ' kg</div>'
           + '</div>';
    }).join('');

    return '<div class="prcard" style="border-color:' + color + '">'
         + '<div class="prname" style="color:' + color + '">' + ex + '</div>'
         + '<div class="pr1rm" style="color:' + color + '">' + rm1
         + ' <span style="font-size:14px;color:var(--text2)">kg</span></div>'
         + '<div class="prsub">📅 PR ' + (APP.user.langue === 'fr' ? 'du' : 'on') + ' ' + fmtD(best.date)
         + ' &nbsp;·&nbsp; ' + best.ser + '×' + best.rep + ' @ ' + best.pds + ' kg'
         + diff + '</div>'
         + '<div class="reptable">' + repCells + '</div>'
         + '</div>';
  }).join('');
}
