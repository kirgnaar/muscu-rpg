import { db } from './firebase-config.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function syncData(uid) {
  const userDocRef = doc(db, "users", uid);
  const cloudSnap = await getDoc(userDocRef);
  
  const localData = {
    sessions: JSON.parse(localStorage.getItem('mrpg_v2') || '[]'),
    user: JSON.parse(localStorage.getItem('mrpg_user') || 'null'),
    blocks: JSON.parse(localStorage.getItem('mrpg_blocks') || '[]'),
    updatedAt: parseInt(localStorage.getItem('mrpg_last_sync') || '0')
  };

  if (!cloudSnap.exists()) {
    // CAS A : Premier login, Cloud vide -> On propose la migration
    if (localData.sessions.length > 0 || localData.user) {
      if (confirm("Compte Cloud créé ! Voulez-vous synchroniser vos données locales (" + localData.sessions.length + " séances) vers votre compte Google ?")) {
        await pushToCloud(uid, localData);
        alert("Félicitations ! Vos données sont maintenant sauvegardées sur le Cloud.");
      }
    }
  } else {
    const cloudData = cloudSnap.data();
    
    // CAS B & C : Comparaison des dates de mise à jour
    if (cloudData.updatedAt > localData.updatedAt) {
      // Cloud plus récent -> On met à jour le local
      applyCloudToLocal(cloudData);
      if (localData.updatedAt > 0 && window.toast) {
        window.toast("Données fusionnées depuis le cloud");
      }
    } else if (localData.updatedAt > cloudData.updatedAt) {
      // Local plus récent -> On pousse vers le cloud
      await pushToCloud(uid, localData);
    }
  }
  updateSyncIndicator('synced');
}

export async function pushToCloud(uid, data) {
  updateSyncIndicator('syncing');
  const userDocRef = doc(db, "users", uid);
  const timestamp = Date.now();
  
  const payload = {
    sessions: data.sessions || [],
    user: data.user || null,
    blocks: data.blocks || [],
    updatedAt: timestamp
  };
  
  try {
    await setDoc(userDocRef, payload);
    localStorage.setItem('mrpg_last_sync', timestamp.toString());
    updateSyncIndicator('synced');
  } catch (e) {
    console.error("Sync error:", e);
    updateSyncIndicator('offline');
  }
}

function applyCloudToLocal(cloudData) {
  if (cloudData.sessions) localStorage.setItem('mrpg_v2', JSON.stringify(cloudData.sessions));
  if (cloudData.user)    localStorage.setItem('mrpg_user', JSON.stringify(cloudData.user));
  if (cloudData.blocks)  localStorage.setItem('mrpg_blocks', JSON.stringify(cloudData.blocks));
  localStorage.setItem('mrpg_last_sync', cloudData.updatedAt.toString());
  
  // Recharger les données dans l'instance APP
  if (window.APP) {
    if (typeof loadData === 'function') APP.data = loadData();
    if (typeof loadUser === 'function') APP.user = loadUser();
    if (window.SIM && typeof loadBlocks === 'function') SIM.blocks = loadBlocks();
    if (typeof APP.render === 'function') APP.render();
  }
}

function updateSyncIndicator(status) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  const labels = { syncing: '🔄 Sync...', synced: '☁️ Synchronisé', offline: '🌐 Hors ligne' };
  el.textContent = labels[status] || '';
  el.style.color = status === 'synced' ? 'var(--green)' : 'inherit';
}
