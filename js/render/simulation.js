/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/simulation.js
   🧪 Onglet Simulation: Programmer une séance et voir les gains d'XP
   ══════════════════════════════════════════════════════════════════════════ */

var SIM = {
  list: [], // Liste des exercices simulés: [{ex, ser, rep, pds, vol, grp}]
};

function initSimulation() {
  populateExerciseSelect($('sim-ex-sel'), true);
  
  $('sim-add-btn').addEventListener('click', handleSimAdd);
  $('sim-clear-btn').addEventListener('click', handleSimClear);
  
  // Délégation pour supprimer un item de la simu
  $('sim-list').addEventListener('click', function(ev) {
    var btn = ev.target.closest('.sim-del-btn');
    if (!btn) return;
    var idx = parseInt(btn.dataset.idx);
    SIM.list.splice(idx, 1);
    renderSimulation();
  });
}

function handleSimAdd() {
  var exName = $('sim-ex-sel').value;
  var ser = parseInt($('sim-ser').value);
  var rep = parseInt($('sim-rep').value);
  var pds = parseFloat($('sim-pds').value);

  if (!exName || !ser || !rep || isNaN(pds)) {
    toast('Remplis tous les champs simu', 'err');
    return;
  }

  var exData = EX.find(e => e[0] === exName);
  var vol = ser * rep * pds;

  SIM.list.push({
    ex: exName,
    ser: ser,
    rep: rep,
    pds: pds,
    vol: vol,
    grp: exData ? exData[2] : ''
  });

  renderSimulation();
}

function handleSimClear() {
  SIM.list = [];
  renderSimulation();
}

function renderSimulation() {
  var listEl = $('sim-list');
  var resultsEl = $('sim-results');
  
  if (SIM.list.length === 0) {
    listEl.innerHTML = '<div class="empty"><p>Aucun exercice programmé.</p></div>';
    resultsEl.style.display = 'none';
    return;
  }

  resultsEl.style.display = 'block';
  
  // Rendre la liste
  var html = '';
  SIM.list.forEach((item, idx) => {
    html += `
      <div class="sitem">
        <div class="sinfo">
          <div class="sname">${item.ex}</div>
          <div class="smeta">${item.ser}×${item.rep} · ${item.pds} kg</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px">
          <div class="svol">${fmtV(item.vol)}</div>
          <button class="sim-del-btn" data-idx="${idx}" style="background:none; border:none; color:#ef4444; font-size:18px; cursor:pointer">✕</button>
        </div>
      </div>`;
  });
  listEl.innerHTML = html;

  calculateSimResults();
}

function calculateSimResults() {
  // 1. Gain Global
  var currentVol = APP.data.reduce((s, e) => s + e.vol, 0);
  var simVolGain = SIM.list.reduce((s, e) => s + e.vol, 0);
  var newVolTotal = currentVol + simVolGain;

  var currentLvl = getLevel(currentVol);
  var nextLvl = getLevel(newVolTotal);

  $('sim-xp-gain').textContent = `+ ${fmtV(simVolGain)} XP`;
  
  var lvlHtml = `<div style="font-weight:700">Niveau Global : ${currentLvl} → ${nextLvl}</div>`;
  if (nextLvl > currentLvl) {
    lvlHtml += `<div style="color:var(--green); font-size:12px; margin-top:4px">✨ Montée de niveau confirmée !</div>`;
  } else {
    var nextThr = levelThreshold(nextLvl + 1);
    var remaining = nextThr - newVolTotal;
    lvlHtml += `<div style="color:var(--text2); font-size:11px; margin-top:4px">Encore ${fmtV(remaining)} XP pour le niveau ${currentLvl + 1}</div>`;
  }
  $('sim-lvl-preview').innerHTML = lvlHtml;

  // 2. Gains par Muscles (Tiers)
  // On calcule l'augmentation des séries par groupe
  var muscleGains = {};
  SIM.list.forEach(item => {
    if (item.grp) {
      muscleGains[item.grp] = (muscleGains[item.grp] || 0) + item.ser;
    }
  });

  var muscleHtml = '<div class="clabel" style="margin-bottom:8px">Impact Musculaire</div>';
  Object.keys(muscleGains).forEach(grp => {
    var currentSets = seriesCountByGroup(grp);
    var newSets = currentSets + muscleGains[grp];
    
    var currentTier = getTier(currentSets);
    var nextTier = getTier(newSets);
    
    var color = nextTier.col;
    var tierLabel = nextTier.name;
    
    muscleHtml += `
      <div class="card" style="margin-bottom:8px; border-left: 3px solid ${color}">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <div>
            <div style="font-size:13px; font-weight:800">${grp}</div>
            <div style="font-size:11px; color:var(--text2)">${currentSets} → ${newSets} séries</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px; font-weight:800; color:${color}">${tierLabel}</div>
            ${nextTier.min > currentTier.min ? '<div style="font-size:9px; color:var(--accent)">UPGRADE !</div>' : ''}
          </div>
        </div>
      </div>`;
  });
  
  $('sim-muscle-results').innerHTML = muscleHtml;
}
