/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/rpg.js
   Onglet RPG: score global, niveaux par groupe musculaire
══════════════════════════════════════════════════════════════════════════ */

function renderRPG() {
  $('v-rpg').querySelector('.stitle').textContent = APP.t('stitle_rpg');
  $('v-rpg').querySelector('.clabel').textContent = APP.t('label_score_global');

  var total  = APP.data.reduce(function(s, e) { return s + e.vol; }, 0);
  var avgLvl = Math.round(
    MUSCLES.reduce(function(s, m) { return s + getLevel(volByGroup(m)); }, 0) / MUSCLES.length
  );

  $('rpg-score').textContent = fmtV(total);
  $('rpg-sub').textContent   = total > 0
    ? APP.t('lvl_avg') + avgLvl
    : APP.t('lvl_keep_training');

  $('rpg-list').innerHTML = MUSCLES.map(function(m) {
    var vol  = volByGroup(m);
    var lvl  = getLevel(vol);
    var pct  = levelProgress(vol);
    var lc   = levelColor(lvl);
    var mc   = MCOL[m] || '#94a3b8';
    var xp   = lvl < 100 ? Math.ceil(levelThreshold(lvl + 1) - vol) : 0;

    return '<div class="rpgcard">'
         + '<div class="rpgtop">'
         + '<span class="rpgm" style="color:' + mc + '">' + m + '</span>'
         + '<span class="rpgl" style="color:' + lc + '">' + APP.t('lvl') + ' ' + lvl + '</span>'
         + '</div>'
         + '<div class="bar-bg"><div class="bar-fill" style="width:'
         + (pct * 100).toFixed(1) + '%;background:' + lc + '"></div></div>'
         + '<div class="rpginfo">'
         + '<span>' + fmtV(vol) + ' ' + APP.t('accumulated') + '</span>'
         + '<span>' + (lvl < 100 ? fmtV(xp) + ' → Niv. ' + (lvl + 1) : '🏆 MAX') + '</span>'
         + '</div>'
         + '</div>';
  }).join('');
}
