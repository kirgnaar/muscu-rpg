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
    // SÉCURITÉ : ne jamais écraser les séances locales avec un tableau vide.
    // L'appelant doit s'assurer que cloudData.sessions est non-vide s'il veut
    // remplacer les séances locales (sauf si l'utilisateur a explicitement choisi).
    if (Array.isArray(cloudData.sessions) && cloudData.sessions.length > 0) {
      localStorage.setItem('mrpg_v2', JSON.stringify(cloudData.sessions));
    }
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

// ── Application forcée (choix explicite de l'utilisateur dans la modale) ──
// Contrairement à _applyCloudToLocal, écrase aussi les séances avec un tableau vide.
function _forceApplyCloudToLocal(cloudData) {
  try {
    if (Array.isArray(cloudData.sessions)) {
      localStorage.setItem('mrpg_v2', JSON.stringify(cloudData.sessions));
    }
    if (cloudData.user)      localStorage.setItem('mrpg_user',      JSON.stringify(cloudData.user));
    if (cloudData.blocks)    localStorage.setItem('mrpg_blocks',    JSON.stringify(cloudData.blocks));
    if (cloudData.cycles)    localStorage.setItem('mrpg_cycles',    JSON.stringify(cloudData.cycles));
    if (cloudData.planning)  localStorage.setItem('mrpg_planning',  JSON.stringify(cloudData.planning));
    if (cloudData.weightLog) localStorage.setItem('mrpg_weight_log',JSON.stringify(cloudData.weightLog));
    localStorage.setItem('mrpg_last_sync', String(cloudData.updatedAt || Date.now()));
  } catch(e) {
    console.error('[sync] _forceApplyCloudToLocal error:', e);
  }

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
function _showConflictModal(localData, cloudData) {
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
    _forceApplyCloudToLocal(merged);
    pushToCloud(window._syncUID, merged);
    _close();
    if (typeof toast === 'function') toast('✅ Fusion : ' + merged.sessions.length + ' séances');
  });

  document.getElementById('sync-btn-cloud').addEventListener('click', function() {
    // Choix explicite de l'utilisateur → on utilise _forceApplyCloudToLocal
    // pour respecter son choix même si le cloud a moins de séances.
    _forceApplyCloudToLocal(cloudData);
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
  window._syncUID = uid;
  _setSyncStatus('syncing');

  var userDocRef = doc(db, 'users', uid);
  var localData  = _getLocalData();
  var localCount = localData.sessions.length;

  console.log('[sync] syncData — local:', localCount, 'séances, updatedAt:', localData.updatedAt);

  try {
    var cloudSnap = await getDoc(userDocRef);

    // ── Cas A : cloud inexistant ──────────────────────────────────────────
    // Ne pousser que si on a vraiment des séances — évite de polluer le cloud
    // avec sessions:[] (qui provoquerait ensuite un écrasement erroné des données locales).
    if (!cloudSnap.exists()) {
      if (localCount > 0) {
        await pushToCloud(uid, localData);
        if (typeof toast === 'function') toast('☁️ Données sauvegardées dans le Cloud');
      }
      _setSyncStatus('synced');
      return;
    }

    var cloudData  = cloudSnap.data();
    var cloudCount = Array.isArray(cloudData.sessions) ? cloudData.sessions.length : 0;

    console.log('[sync] cloud:', cloudCount, 'séances, updatedAt:', cloudData.updatedAt);

    // ── Cas B : local vide → cloud est la seule source de vérité ─────────
    if (localCount === 0) {
      if (cloudCount > 0) {
        _applyCloudToLocal(cloudData);
        if (typeof toast === 'function') toast('⬇️ Données restaurées depuis le Cloud');
      }
      _setSyncStatus('synced');
      return;
    }

    // ── À partir d'ici, local a des séances ──────────────────────────────

    // Cas C : cloud vide → toujours pousser le local (ne jamais laisser un
    // cloud vide écraser des données locales existantes).
    if (cloudCount === 0) {
      console.log('[sync] cloud vide, local non-vide → push local');
      await pushToCloud(uid, localData);
      return;
    }

    // ── Cas D : les deux côtés ont des séances ────────────────────────────
    var localTs = localData.updatedAt;
    var cloudTs = cloudData.updatedAt || 0;

    // Déjà synchronisé : même timestamp et même nombre de séances
    if (localTs !== 0 && localTs === cloudTs && localCount === cloudCount) {
      console.log('[sync] déjà synchronisé');
      _setSyncStatus('synced');
      return;
    }

    // Local plus riche (plus de séances) ET au moins aussi récent → push local.
    // Ce cas couvre l'ajout de nouvelles séances depuis la dernière sync.
    if (localCount > cloudCount && localTs >= cloudTs) {
      console.log('[sync] local plus riche → push local');
      await pushToCloud(uid, localData);
      return;
    }

    // Local aussi riche ET plus récent → push local.
    if (localCount === cloudCount && localTs > cloudTs) {
      console.log('[sync] local plus récent → push local');
      await pushToCloud(uid, localData);
      return;
    }

    // Dans tous les autres cas, impossible de trancher automatiquement
    // sans risque de perte → laisser l'utilisateur décider.
    console.log('[sync] conflit détecté → modale');
    _showConflictModal(localData, cloudData);

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
