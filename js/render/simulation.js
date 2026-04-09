/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/simulation.js
   🧪 Gestion des Blocs de Programmation et Simulation d'XP
   ══════════════════════════════════════════════════════════════════════════ */

var SIM = {
  blocks: [],      // [{id, name, exercises: [{ex, ser, rep, pds, grp}]}]
  currentBlock: null, // Bloc en cours d'édition
  dbKey: 'mrpg_blocks'
};

// ── Initialisation ────────────────────────────────────────────────────────
function initSimulation() {
  SIM.blocks = loadBlocks();
  populateExerciseSelect($('sim-ex-sel'), true);
  
  // Listeners principaux
  $('sim-new-block-btn').addEventListener('click', () => handleNewBlock());
  $('sim-save-block-btn').addEventListener('click', () => saveCurrentBlock());
  $('sim-add-ex-btn').addEventListener('click', () => handleAddExToBlock());
  $('sim-confirm-btn').addEventListener('click', () => confirmSession());
  $('sim-back-btn').addEventListener('click', () => closeEditor());
  
  // Délégation sur la liste des blocs
  $('sim-blocks-list').addEventListener('click', function(ev) {
    var btnEdit = ev.target.closest('.sim-block-edit');
    var btnDel = ev.target.closest('.sim-block-del');
    
    if (btnEdit) {
      var id = parseInt(btnEdit.dataset.id);
      openEditor(id);
    }
    if (btnDel) {
      var id = parseInt(btnDel.dataset.id);
      deleteBlock(id);
    }
  });

  // Délégation sur la liste des exercices du bloc
  $('sim-ex-list').addEventListener('click', function(ev) {
    var btn = ev.target.closest('.sim-ex-del');
    if (!btn) return;
    var idx = parseInt(btn.dataset.idx);
    SIM.currentBlock.exercises.splice(idx, 1);
    renderEditor();
  });

  // Listener pour les modifications en direct dans l'éditeur
  $('sim-ex-list').addEventListener('input', function(ev) {
    var input = ev.target;
    var idx = parseInt(input.dataset.idx);
    var field = input.dataset.field;
    if (!field || isNaN(idx)) return;

    var val = parseFloat(input.value) || 0;
    SIM.currentBlock.exercises[idx][field] = val;
    calculateSimResults(SIM.currentBlock.exercises);
  });
}

// ── Persistence ───────────────────────────────────────────────────────────
function loadBlocks() {
  var raw = localStorage.getItem(SIM.dbKey);
  return raw ? JSON.parse(raw) : [];
}

function saveBlocks() {
  localStorage.setItem(SIM.dbKey, JSON.stringify(SIM.blocks));
}

// ── Logique des Blocs ─────────────────────────────────────────────────────
function handleNewBlock() {
  var newId = Date.now();
  SIM.currentBlock = {
    id: newId,
    name: "Nouveau Programme",
    type: "Hypertrophie",
    exercises: []
  };
  openEditor();
}

function openEditor(id) {
  if (id) {
    var block = SIM.blocks.find(b => b.id === id);
    if (block) SIM.currentBlock = JSON.parse(JSON.stringify(block)); // Clone
  }
  
  // Valeur par défaut si type absent (compatibilité ancienne version)
  if (!SIM.currentBlock.type) SIM.currentBlock.type = "Hypertrophie";

  $('sim-blocks-list').style.display = 'none';
  $('v-simulation').querySelector('.stitle span').style.display = 'none';
  $('sim-new-block-btn').style.display = 'none';
  
  $('sim-editor').style.display = 'block';
  $('sim-block-name').value = SIM.currentBlock.name;
  $('sim-block-type').value = SIM.currentBlock.type;
  
  renderEditor();
}

function closeEditor() {
  SIM.currentBlock = null;
  $('sim-editor').style.display = 'none';
  $('sim-blocks-list').style.display = 'block';
  $('v-simulation').querySelector('.stitle span').style.display = 'inline';
  $('sim-new-block-btn').style.display = 'inline';
  renderSimulation();
}

function saveCurrentBlock() {
  if (!SIM.currentBlock) return;
  SIM.currentBlock.name = $('sim-block-name').value || "Sans nom";
  SIM.currentBlock.type = $('sim-block-type').value;
  
  var idx = SIM.blocks.findIndex(b => b.id === SIM.currentBlock.id);
  if (idx !== -1) {
    SIM.blocks[idx] = JSON.parse(JSON.stringify(SIM.currentBlock));
  } else {
    SIM.blocks.push(JSON.parse(JSON.stringify(SIM.currentBlock)));
  }
  
  saveBlocks();
  toast('Programme sauvegardé');
  closeEditor();
}

function deleteBlock(id) {
  if (!confirm("Supprimer ce programme ?")) return;
  SIM.blocks = SIM.blocks.filter(b => b.id !== id);
  saveBlocks();
  renderSimulation();
}

function handleAddExToBlock() {
  var exName = $('sim-ex-sel').value;
  var ser = parseInt($('sim-ser').value);
  var rep = parseInt($('sim-rep').value);
  var pds = parseFloat($('sim-pds').value);

  if (!exName || !ser || !rep || isNaN(pds)) {
    toast('Champs invalides', 'err');
    return;
  }

  var exData = EX.find(e => e[0] === exName);
  SIM.currentBlock.exercises.push({
    ex: exName,
    ser: ser,
    rep: rep,
    pds: pds,
    grp: exData ? exData[2] : ''
  });

  renderEditor();
}

// ── Rendering ─────────────────────────────────────────────────────────────
function renderSimulation() {
  var list = $('sim-blocks-list');
  if (SIM.blocks.length === 0) {
    list.innerHTML = '<div class="empty"><p>Aucun programme enregistré.<br>Crée ton premier bloc !</p></div>';
    return;
  }

  list.innerHTML = SIM.blocks.map(b => {
    var dist = calculateMuscleDistribution(b.exercises);
    var distHtml = dist.length > 0 ? `
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px">
        ${dist.map(d => `<span style="font-size:9px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px; color:var(--text2)">${d.grp} ${d.pct}%</span>`).join('')}
      </div>` : '';

    return `
      <div class="card" style="margin-bottom:10px">
        <div class="flex-between">
          <div>
            <div style="font-weight:800; color:#fff">${b.name}</div>
            <div style="font-size:11px; color:var(--accent); font-weight:700">${b.type || 'Hypertrophie'}</div>
            <div style="font-size:10px; color:var(--text2); margin-top:2px">${b.exercises.length} exercices</div>
          </div>
          <div style="display:flex; gap:8px">
            <button class="btn btn-s sim-block-edit" data-id="${b.id}">Éditer</button>
            <button class="btn btn-s sim-block-del" data-id="${b.id}" style="background:rgba(239,68,68,0.1); color:#ef4444">✕</button>
          </div>
        </div>
        ${distHtml}
      </div>
    `;
  }).join('');
}

function calculateMuscleDistribution(exercises) {
  if (!exercises.length) return [];
  var counts = {};
  var total = 0;
  exercises.forEach(ex => {
    if (ex.grp) {
      counts[ex.grp] = (counts[ex.grp] || 0) + ex.ser;
      total += ex.ser;
    }
  });
  if (total === 0) return [];
  return Object.keys(counts).map(grp => ({
    grp: grp,
    pct: Math.round((counts[grp] / total) * 100)
  })).sort((a, b) => b.pct - a.pct);
}

function renderEditor() {
  var list = $('sim-ex-list');
  var exList = SIM.currentBlock.exercises;
  
  if (exList.length === 0) {
    list.innerHTML = '<div class="empty" style="padding:20px"><p>Liste vide.</p></div>';
    calculateSimResults([]);
    return;
  }

  list.innerHTML = exList.map((item, idx) => `
    <div class="sitem" style="flex-direction:column; align-items:stretch; gap:8px; padding:12px">
      <div class="flex-between">
        <div class="sname" style="font-size:14px">${item.ex}</div>
        <button class="sim-ex-del" data-idx="${idx}" style="background:none; border:none; color:#ef4444; font-size:18px; padding:0">✕</button>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px">
        <div>
          <label class="flabel" style="font-size:9px">Séries</label>
          <input type="number" class="sim-inline-input" data-idx="${idx}" data-field="ser" value="${item.ser}">
        </div>
        <div>
          <label class="flabel" style="font-size:9px">Reps</label>
          <input type="number" class="sim-inline-input" data-idx="${idx}" data-field="rep" value="${item.rep}">
        </div>
        <div>
          <label class="flabel" style="font-size:9px">Poids (kg)</label>
          <input type="number" class="sim-inline-input" data-idx="${idx}" data-field="pds" step="0.5" value="${item.pds}">
        </div>
      </div>
    </div>
  `).join('');

  calculateSimResults(exList);
}

function calculateSimResults(simList) {
  var currentVol = APP.data.reduce((s, e) => s + e.vol, 0);
  var simVolGain = simList.reduce((s, e) => s + (e.ser * e.rep * e.pds), 0);
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

  // Impact Musculaire
  var muscleGains = {};
  simList.forEach(item => { if (item.grp) muscleGains[item.grp] = (muscleGains[item.grp] || 0) + item.ser; });

  var muscleHtml = '<div class="clabel" style="margin-bottom:8px">Impact Musculaire</div>';
  Object.keys(muscleGains).forEach(grp => {
    var currentSets = seriesCountByGroup(grp);
    var newSets = currentSets + muscleGains[grp];
    var curT = getTier(currentSets);
    var nxtT = getTier(newSets);
    muscleHtml += `
      <div class="card" style="margin-bottom:8px; border-left: 3px solid ${nxtT.col}">
        <div class="flex-between">
          <div>
            <div style="font-size:13px; font-weight:800">${grp}</div>
            <div style="font-size:11px; color:var(--text2)">${currentSets} → ${newSets} séries</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px; font-weight:800; color:${nxtT.col}">${nxtT.name}</div>
            ${nxtT.min > curT.min ? '<div style="font-size:9px; color:var(--accent)">UPGRADE !</div>' : ''}
          </div>
        </div>
      </div>`;
  });
  $('sim-muscle-results').innerHTML = muscleHtml;
}

// ── Validation de Séance ──────────────────────────────────────────────────
function confirmSession() {
  if (!SIM.currentBlock || SIM.currentBlock.exercises.length === 0) return;
  if (!confirm("Confirmer que cette séance a été effectuée ? Les données seront ajoutées au journal.")) return;

  var date = todayISO();
  var type = SIM.currentBlock.type || "Hypertrophie";

  SIM.currentBlock.exercises.forEach(item => {
    addEntry({
      date: date,
      type: type,
      ex: item.ex,
      grp: item.grp,
      ser: item.ser,
      rep: item.rep,
      pds: item.pds
    });
  });

  APP.render();
  toast('Séance enregistrée dans le journal !');
  closeEditor();
  APP.switchView('seances');
}
