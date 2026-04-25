/* ══════════════════════════════════════════════════════════════════════════
   MUSCU RPG — sync.js
   Synchronisation Firestore bidirectionnelle — sans confirm/prompt/alert
   (confirm() et prompt() sont bloqués dans les PWA iOS en mode standalone)
   ══════════════════════════════════════════════════════════════════════════ */

import { db } from './firebase-config.js';
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── Indicateur de sync (partagé avec auth.js via window.setSyncStatus) ──
function _setSyncStatus(status) {
  var el = document.getElementById('sync-status');
  var labels = {
    syncing: '🔄 Synchronisation...',
    synced:  '☁️ Synchronisé',
    offline: '🌐 Hors ligne',
    error:   '⚠️ Erreur sync'
  };
  if (el) {
    el.textContent = labels[status] || status;
    el.style.color = status === 'synced' ? 'var(--green)' : 'inherit';
  }
}

// ── Lecture des données locales ───────────────────────────────────────────
function _getLocalData() {
  try {
    return {
      sessions:  JSON.parse(localStorage.getItem('mrpg_v2')       || '[]'),
      user:      JSON.parse(localStorage.getItem('mrpg_user')      || 'null'),
      blocks:    JSON.parse(localStorage.getItem('mrpg_blocks')    || '[]'),
      cycles:    JSON.parse(localStorage.getItem('mrpg_cycles')    || '[]'),
      planning:  JSON.parse(localStorage.getItem('mrpg_planning')  || '[]'),
      weightLog: JSON.parse(localStorage.getItem('mrpg_weight_log')|| '[]'),
      updatedAt: parseInt(localStorage.getItem('mrpg_last_sync')   || '0')
    };
  } catch(e) {
    return { sessions:[], user:null, blocks:[], cycles:[], planning:[], weightLog:[], updatedAt:0 };
  }
}

// ── Application des données cloud en local ────────────────────────────────
function _applyCloudToLocal(cloudData) {
  try {
    if (cloudData.sessions)  localStorage.setItem('mrpg_v2',        JSON.stringify(cloudData.sessions));
    if (cloudData.user)      localStorage.setItem('mrpg_user',      JSON.stringify(cloudData.user));
    if (cloudData.blocks)    localStorage.setItem('mrpg_blocks',    JSON.stringify(cloudData.blocks));
    if (cloudData.cycles)    localStorage.setItem('mrpg_cycles',    JSON.stringify(cloudData.cycles));
    if (cloudData.planning)  localStorage.setItem('mrpg_planning',  JSON.stringify(cloudData.planning));
    if (cloudData.weightLog) localStorage.setItem('mrpg_weight_log',JSON.stringify(cloudData.weightLog));
    localStorage.setItem('mrpg_last_sync', String(cloudData.updatedAt || Date.now()));
  } catch(e) {
    console.error('[sync] _applyCloudToLocal error:', e);
  }

  // Recharger l'état APP en mémoire
  if (window.APP) {
    try {
      if (typeof loadData === 'function')  APP.data = loadData();
      if (typeof loadUser === 'function')  APP.user = loadUser();
      if (window.PLAN  && typeof PLAN.load  === 'function') PLAN.load();
      if (window.SIM   && typeof SIM.load   === 'function') SIM.load();
      if (window.CORPS && typeof CORPS.loadWlog === 'function') CORPS.loadWlog();
      if (typeof APP.render === 'function') APP.render();
    } catch(e) {
      console.warn('[sync] APP reload error:', e);
    }
  }
}

// ── Fusion intelligente (union sans doublons par id) ─────────────────────
function _mergeData(local, cloud) {
  var allSessions = (local.sessions || []).concat(cloud.sessions || []);
  var seen = {};
  var unique = [];
  for (var i = 0; i < allSessions.length; i++) {
    if (!seen[allSessions[i].id]) {
      seen[allSessions[i].id] = true;
      unique.push(allSessions[i]);
    }
  }
  return {
    sessions:  unique,
    user:      cloud.user      || local.user,
    blocks:    cloud.blocks    || local.blocks,
    cycles:    cloud.cycles    || local.cycles,
    planning:  cloud.planning  || local.planning,
    weightLog: cloud.weightLog || local.weightLog,
    updatedAt: Date.now()
  };
}

// ── Affichage de la modale de conflit (non-bloquante) ────────────────────
// Remplace les confirm()/prompt() qui sont bloqués en iOS PWA standalone.
function _showConflictModal(localData, cloudData) {
  // Évite un double affichage
  if (document.getElementById('sync-conflict-modal')) return;

  var localCount = (localData.sessions || []).length;
  var cloudCount = (cloudData.sessions || []).length;

  var modal = document.createElement('div');
  modal.id = 'sync-conflict-modal';
  modal.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999',
    'background:rgba(0,0,0,0.85)',
    'display:flex', 'flex-direction:column',
    'align-items:center', 'justify-content:center',
    'padding:24px', 'gap:12px'
  ].join(';');

  modal.innerHTML = [
    '<div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;max-width:340px;width:100%">',
      '<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px">⚡ Conflit de données</div>',
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:20px;line-height:1.6">',
        'Des données existent sur cet appareil (<strong style="color:#fff">' + localCount + ' séances</strong>) ',
        'et dans le Cloud (<strong style="color:#fff">' + cloudCount + ' séances</strong>).',
      '</div>',
      '<div style="display:flex;flex-direction:column;gap:10px">',
        '<button id="sync-btn-merge"  style="padding:12px;border-radius:10px;background:var(--accent,#22d3ee);color:#000;font-weight:800;font-size:14px;border:none;cursor:pointer">',
          '🔀 Fusionner (' + (localCount + cloudCount) + ' séances max)',
        '</button>',
        '<button id="sync-btn-cloud"  style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.08);color:#fff;font-size:14px;border:none;cursor:pointer">',
          '⬇️ Importer le Cloud (' + cloudCount + ' séances)',
        '</button>',
        '<button id="sync-btn-local"  style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.08);color:#fff;font-size:14px;border:none;cursor:pointer">',
          '⬆️ Garder cet appareil (' + localCount + ' séances)',
        '</button>',
      '</div>',
    '</div>'
  ].join('');

  document.body.appendChild(modal);

  function _close() {
    var m = document.getElementById('sync-conflict-modal');
    if (m) document.body.removeChild(m);
  }

  document.getElementById('sync-btn-merge').addEventListener('click', function() {
    var merged = _mergeData(localData, cloudData);
    _applyCloudToLocal(merged);
    pushToCloud(window._syncUID, merged);
    _close();
    if (typeof toast === 'function') toast('✅ Fusion : ' + merged.sessions.length + ' séances');
  });

  document.getElementById('sync-btn-cloud').addEventListener('click', function() {
    _applyCloudToLocal(cloudData);
    _close();
    if (typeof toast === 'function') toast('⬇️ Cloud importé');
  });

  document.getElementById('sync-btn-local').addEventListener('click', function() {
    pushToCloud(window._syncUID, localData);
    _close();
    if (typeof toast === 'function') toast('⬆️ Appareil exporté vers le Cloud');
  });
}

// ── Point d'entrée principal ──────────────────────────────────────────────
export async function syncData(uid) {
  window._syncUID = uid; // conservé pour la modale de conflit
  _setSyncStatus('syncing');

  var userDocRef = doc(db, 'users', uid);
  var localData  = _getLocalData();

  try {
    var cloudSnap = await getDoc(userDocRef);

    if (!cloudSnap.exists()) {
      // Cas A : premier login, Cloud vide
      if (localData.sessions.length > 0 || localData.user) {
        // Envoi automatique sans demande — on ne perd rien
        await pushToCloud(uid, localData);
        if (typeof toast === 'function') toast('☁️ Données sauvegardées dans le Cloud');
      }
      _setSyncStatus('synced');
      return;
    }

    var cloudData = cloudSnap.data();

    // Cas B : conflit réel — les deux côtés ont des séances
    if (localData.sessions.length > 0 &&
        cloudData.sessions && cloudData.sessions.length > 0 &&
        localData.updatedAt !== (cloudData.updatedAt || 0)) {
      _showConflictModal(localData, cloudData);
      return; // La modale gère la suite
    }

    // Cas C : sync automatique sans conflit
    if (cloudData.updatedAt > localData.updatedAt) {
      _applyCloudToLocal(cloudData);
      _setSyncStatus('synced');
    } else if (localData.updatedAt > (cloudData.updatedAt || 0)) {
      await pushToCloud(uid, localData);
    } else {
      _setSyncStatus('synced');
    }

  } catch(e) {
    console.error('[sync] syncData error:', e);
    _setSyncStatus('error');
  }
}

// ── Push vers Firestore ───────────────────────────────────────────────────
export async function pushToCloud(uid, data) {
  if (!uid) return;
  _setSyncStatus('syncing');
  var userDocRef = doc(db, 'users', uid);
  var timestamp  = Date.now();

  // Inclure toutes les clés (y compris les nouvelles : cycles, planning, weightLog)
  var payload = {
    sessions:  data.sessions  || [],
    user:      data.user      || null,
    blocks:    data.blocks    || [],
    cycles:    data.cycles    || [],
    planning:  data.planning  || [],
    weightLog: data.weightLog || [],
    updatedAt: timestamp
  };

  try {
    await setDoc(userDocRef, payload);
    localStorage.setItem('mrpg_last_sync', String(timestamp));
    _setSyncStatus('synced');
  } catch(e) {
    console.error('[sync] pushToCloud error:', e);
    _setSyncStatus('error');
  }
}
