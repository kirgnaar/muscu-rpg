/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — render/simulation.js
   🧪 Gestion des Blocs de Programmation et Simulation d'XP (ES5 Stable)
   ══════════════════════════════════════════════════════════════════════════ */

var SIM = {
  blocks: [],
  currentBlock: null,
  dbKey: 'mrpg_blocks'
};

function initSimulation() {
  SIM.blocks = loadBlocks();
  populateExerciseSelect($('sim-ex-sel'), true);

  $('sim-new-block-btn').addEventListener('click', function() { handleNewBlock(); });
  $('sim-save-block-btn').addEventListener('click', function() { saveCurrentBlock(); });
  $('sim-add-ex-btn').addEventListener('click', function() { handleAddExToBlock(); });
  $('sim-confirm-btn').addEventListener('click', function() { confirmSession(); });
  $('sim-back-btn').addEventListener('click', function() { closeEditor(); });

  $('sim-blocks-list').addEventListener('click', function(ev) {
    var btnEdit = ev.target.closest('.sim-block-edit');
    var btnDel = ev.target.closest('.sim-block-del');
    if (btnEdit) openEditor(parseInt(btnEdit.dataset.id));
    if (btnDel) deleteBlock(parseInt(btnDel.dataset.id));
  });

  $('sim-ex-list').addEventListener('click', function(ev) {
    var btn = ev.target.closest('.sim-ex-del');
    if (!btn) return;
    SIM.currentBlock.exercises.splice(parseInt(btn.dataset.idx), 1);
    renderEditor();
  });

  $('sim-ex-list').addEventListener('input', function(ev) {
    var input = ev.target;
    var idx = parseInt(input.dataset.idx);
    var field = input.dataset.field;
    if (!field || isNaN(idx)) return;
    SIM.currentBlock.exercises[idx][field] = parseFloat(input.value) || 0;
    calculateSimResults(SIM.currentBlock.exercises);
  });
}

function loadBlocks() {
  var raw = localStorage.getItem(SIM.dbKey);
  return raw ? JSON.parse(raw) : [];
}

function saveBlocks() {
  localStorage.setItem(SIM.dbKey, JSON.stringify(SIM.blocks));
}

function handleNewBlock() {
  SIM.currentBlock = { id: Date.now(), name: APP.t('new_program'), type: "Hypertrophie", exercises: [] };
  openEditor();
}

function openEditor(id) {
  if (id) {
    for (var i = 0; i < SIM.blocks.length; i++) {
      if (SIM.blocks[i].id === id) {
        SIM.currentBlock = JSON.parse(JSON.stringify(SIM.blocks[i]));
        break;
      }
    }
  }
  if (!SIM.currentBlock.type) SIM.currentBlock.type = "Hypertrophie";
  $('sim-blocks-list').style.display = 'none';
  var stitle = $('v-simulation').querySelector('.stitle span');
  if (stitle) stitle.style.display = 'none';
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
  var stitle = $('v-simulation').querySelector('.stitle span');
  if (stitle) stitle.style.display = 'inline';
  $('sim-new-block-btn').style.display = 'inline';
  renderSimulation();
}

function saveCurrentBlock() {
  if (!SIM.currentBlock) return;
  SIM.currentBlock.name = $('sim-block-name').value || APP.t('untitled');
  SIM.currentBlock.type = $('sim-block-type').value;
  var foundIdx = -1;
  for (var i = 0; i < SIM.blocks.length; i++) {
    if (SIM.blocks[i].id === SIM.currentBlock.id) {
      foundIdx = i;
      break;
    }
  }
  if (foundIdx !== -1) SIM.blocks[foundIdx] = JSON.parse(JSON.stringify(SIM.currentBlock));
  else SIM.blocks.push(JSON.parse(JSON.stringify(SIM.currentBlock)));
  saveBlocks();
  toast('Sauvegardé');
  closeEditor();
}

function deleteBlock(id) {
  if (!confirm(APP.t('confirm_delete'))) return;
  var newBlocks = [];
  for (var i = 0; i < SIM.blocks.length; i++) {
    if (SIM.blocks[i].id !== id) newBlocks.push(SIM.blocks[i]);
  }
  SIM.blocks = newBlocks;
  saveBlocks();
  renderSimulation();
}

function handleAddExToBlock() {
  var exName = $('sim-ex-sel').value;
  var ser = parseInt($('sim-ser').value);
  var rep = parseInt($('sim-rep').value);
  var pds = parseFloat($('sim-pds').value);
  if (!exName || !ser || !rep || isNaN(pds)) { toast('Champs invalides', 'err'); return; }
  SIM.currentBlock.exercises.push({ ex: exName, ser: ser, rep: rep, pds: pds, grp: getPrimaryGroup(exName) });
  renderEditor();
}

function renderSimulation() {
  $('v-simulation').querySelector('.stitle span').textContent = APP.t('stitle_programs');
  $('sim-new-block-btn').textContent = '+ ' + APP.t('btn_new');

  var list = $('sim-blocks-list');
  if (SIM.blocks.length === 0) { list.innerHTML = '<div class="empty"><p>' + APP.t('no_programs') + '</p></div>'; return; }
  var html = '';
  for (var i = 0; i < SIM.blocks.length; i++) {
    var b = SIM.blocks[i];
    var dist = calculateMuscleDistribution(b.exercises);
    var distHtml = '';
    if (dist.length > 0) {
      distHtml = '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px">';
      for (var j = 0; j < dist.length; j++) {
        distHtml += '<span style="font-size:9px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px; color:var(--text2)">' + dist[j].grp + ' ' + dist[j].pct + '%</span>';
      }
      distHtml += '</div>';
    }

    var typeKey = {
      'Hypertrophie': 'hypertrophy',
      'Force': 'strength',
      'Hyperforce (PR)': 'hyperstrength',
      'Endurance musculaire': 'endurance',
      'Décharge': 'deload'
    }[b.type] || '';
    var translatedType = typeKey ? APP.t(typeKey) : b.type;

    html += '<div class="card" style="margin-bottom:10px"><div class="flex-between"><div><div style="font-weight:800; color:#fff">' + b.name + '</div><div style="font-size:11px; color:var(--accent); font-weight:700">' + translatedType + '</div><div style="font-size:10px; color:var(--text2); margin-top:2px">' + b.exercises.length + ' ' + APP.t('exercises').toLowerCase() + '</div></div><div style="display:flex; gap:8px"><button class="btn btn-s sim-block-edit" data-id="' + b.id + '">' + APP.t('edit') + '</button><button class="btn btn-s sim-block-del" data-id="' + b.id + '" style="background:rgba(239,68,68,0.1); color:#ef4444">✕</button></div></div>' + distHtml + '</div>';
  }
  list.innerHTML = html;
}


function calculateMuscleDistribution(exercises) {
  if (!exercises.length) return [];
  var weightedCounts = {};
  var totalWeighted = 0;
  for (var i = 0; i < exercises.length; i++) {
    var ex = exercises[i];
    for (var k = 0; k < MUSCLES.length; k++) {
      var m = MUSCLES[k];
      var influence = getMuscleInfluence(ex.ex, m);
      if (influence > 0) {
        var w = ex.ser * influence;
        weightedCounts[m] = (weightedCounts[m] || 0) + w;
        totalWeighted += w;
      }
    }
  }
  if (totalWeighted === 0) return [];
  var results = [];
  for (var grp in weightedCounts) {
    results.push({ grp: grp, pct: Math.round((weightedCounts[grp] / totalWeighted) * 100) });
  }
  results.sort(function(a, b) { return b.pct - a.pct; });
  var filtered = [];
  for (var l = 0; l < results.length; l++) { if (results[l].pct > 0) filtered.push(results[l]); }
  return filtered;
}

function renderEditor() {
  var editor = $('sim-editor');
  editor.querySelector('.fgroup .flabel').textContent = APP.t('label_prog_type');
  editor.querySelectorAll('.fgroup .flabel')[1].textContent = APP.t('label_add_ex');
  var subLabels = editor.querySelectorAll('.card div .flabel');
  subLabels[0].textContent = APP.t('label_ser');
  subLabels[1].textContent = APP.t('label_rep');
  subLabels[2].textContent = APP.t('label_pds');
  $('sim-add-ex-btn').textContent = '+ ' + APP.t('btn_add_list');
  editor.querySelector('.stitle').textContent = APP.t('stitle_content_block');
  $('sim-results').querySelector('.stitle').textContent = APP.t('stitle_gains');
  $('sim-results').querySelector('.clabel').textContent = APP.t('label_gain_global');
  $('sim-confirm-btn').textContent = '⚡ ' + APP.t('btn_confirm_session');
  $('sim-back-btn').textContent = APP.t('btn_back');

  // Peupler les types de séances traduits pour l'éditeur
  var typeSel = $('sim-block-type');
  var currentType = SIM.currentBlock.type || "Hypertrophie";
  typeSel.innerHTML = '';
  var typeKeys = ['hypertrophy', 'strength', 'hyperstrength', 'endurance', 'deload'];
  for (var i = 0; i < typeKeys.length; i++) {
    var k = typeKeys[i];
    var o = document.createElement('option');
    o.value = I18N['fr'][k];
    o.textContent = APP.t(k);
    typeSel.appendChild(o);
  }
  typeSel.value = currentType;

  var list = $('sim-ex-list');
  var exList = SIM.currentBlock.exercises;
  if (exList.length === 0) { list.innerHTML = '<div class="empty" style="padding:20px"><p>' + (APP.user.langue === 'fr' ? 'Liste vide.' : 'Empty list.') + '</p></div>'; calculateSimResults([]); return; }
  var html = '';
  for (var i = 0; i < exList.length; i++) {
    var item = exList[i];
    html += '<div class="sitem" style="flex-direction:column; align-items:stretch; gap:8px; padding:12px"><div class="flex-between"><div class="sname" style="font-size:14px">' + APP.t(item.ex) + '</div><button class="sim-ex-del" data-idx="' + i + '" style="background:none; border:none; color:#ef4444; font-size:18px; padding:0">✕</button></div><div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px"><div><label class="flabel" style="font-size:9px">' + APP.t('label_ser') + '</label><input type="number" class="sim-inline-input" data-idx="' + i + '" data-field="ser" value="' + item.ser + '"></div><div><label class="flabel" style="font-size:9px">' + APP.t('label_rep') + '</label><input type="number" class="sim-inline-input" data-idx="' + i + '" data-field="rep" value="' + item.rep + '"></div><div><label class="flabel" style="font-size:9px">' + APP.t('label_pds') + '</label><input type="number" class="sim-inline-input" data-idx="' + i + '" data-field="pds" step="0.5" value="' + item.pds + '"></div></div></div>';
  }
  list.innerHTML = html;
  calculateSimResults(exList);
}

function calculateSimResults(simList) {
  var currentVol = 0;
  for (var i = 0; i < APP.data.length; i++) currentVol += APP.data[i].vol;
  var simVolGain = 0;
  for (var j = 0; j < simList.length; j++) simVolGain += (simList[j].ser * simList[j].rep * simList[j].pds);
  var newVolTotal = currentVol + simVolGain;
  var currentLvl = getLevel(currentVol);
  var nextLvl = getLevel(newVolTotal);
  var xpLabel = APP.t('global_level');
  $('sim-xp-gain').textContent = '+ ' + fmtV(simVolGain) + ' XP';
  var lvlHtml = '<div style="font-weight:700">' + xpLabel + ' : ' + currentLvl + ' ➔ ' + nextLvl + '</div>';
  if (nextLvl > currentLvl) {
    lvlHtml += '<div style="color:var(--green); font-size:12px; margin-top:4px; font-weight:800">✨ ' + APP.t('level_up_global') + '</div>';
  } else {
    var nextThr = levelThreshold(nextLvl + 1);
    var remaining = nextThr - newVolTotal;
    var remTxt = APP.t('xp_left_for').replace('{{xp}}', fmtV(remaining)).replace('{{lvl}}', currentLvl + 1);
    lvlHtml += '<div style="color:var(--text2); font-size:11px; margin-top:4px">' + remTxt + '</div>';
  }
  $('sim-lvl-preview').innerHTML = lvlHtml;
  var muscleGains = {};
  for (var k = 0; k < simList.length; k++) {
    var item = simList[k];
    for (var m = 0; m < MUSCLES.length; m++) {
      var grp = MUSCLES[m];
      var influence = getMuscleInfluence(item.ex, grp);
      if (influence > 0) muscleGains[grp] = (muscleGains[grp] || 0) + (item.ser * item.rep * item.pds * influence);
    }
  }
  var muscleHtml = '<div class="clabel" style="margin-bottom:8px">Progression par Muscle (RPG)</div>';
  for (var grpName in muscleGains) {
    var currentVolGrp = volByGroup(grpName);
    var gainVolGrp = muscleGains[grpName];
    var newVolGrp = currentVolGrp + gainVolGrp;
    var curL = getLevel(currentVolGrp);
    var nxtL = getLevel(newVolGrp);
    var color = levelColor(nxtL);
    var missingXP = levelThreshold(curL + 1) - newVolGrp;
    var subText = nxtL > curL 
      ? '<span style="color:var(--green); font-weight:800">LEVEL UP ! (+' + (nxtL - curL) + ')</span>' 
      : '<span style="opacity:0.6">' + APP.t('xp_missing').replace('{{xp}}', fmtV(missingXP)) + '</span>';
    muscleHtml += '<div class="card" style="margin-bottom:8px; border-left: 4px solid ' + color + '; padding: 12px"><div class="flex-between"><div><div style="font-size:14px; font-weight:900; color:#fff">' + grpName + '</div><div style="font-size:12px; color:' + color + '; font-weight:700">' + APP.t('lvl') + ' ' + curL + ' ➔ ' + nxtL + '</div></div><div style="text-align:right"><div style="font-size:11px; font-weight:600">' + subText + '</div><div style="font-size:9px; color:var(--text2); margin-top:2px">+ ' + fmtV(gainVolGrp) + ' XP</div></div></div><div class="bar-bg" style="height:4px; margin-top:8px"><div class="bar-fill" style="width:' + (levelProgress(newVolGrp)*100).toFixed(0) + '%; background:' + color + '"></div></div></div>';
  }
  $('sim-muscle-results').innerHTML = muscleHtml;
}

function confirmSession() {
  if (!SIM.currentBlock || SIM.currentBlock.exercises.length === 0) return;
  if (!confirm(APP.t('confirm_session'))) return;
  var date = todayISO();
  var type = SIM.currentBlock.type || "Hypertrophie";
  for (var i = 0; i < SIM.currentBlock.exercises.length; i++) {
    var item = SIM.currentBlock.exercises[i];
    addEntry({ date: date, type: type, ex: item.ex, grp: item.grp, ser: item.ser, rep: item.rep, pds: item.pds });
  }
  APP.render();
  toast('Séance enregistrée !');
  closeEditor();
  APP.switchView('seances');
}
