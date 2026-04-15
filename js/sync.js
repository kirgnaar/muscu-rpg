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
      if (confirm("Voulez-vous sauvegarder vos données locales sur votre nouveau compte Cloud ?")) {
        await pushToCloud(uid, localData);
      }
    }
  } else {
    const cloudData = cloudSnap.data();

    // S'il y a des données des deux côtés, on propose le choix
    if (localData.sessions.length > 0 && cloudData.sessions && cloudData.sessions.length > 0) {
      const choice = prompt(
        "Conflit de synchronisation détecté !\n\n" +
        "1: IMPORTER (Garder les données du Cloud)\n" +
        "2: EXPORTER (Garder les données de ce téléphone)\n" +
        "3: FUSIONNER (Mélanger les deux et supprimer les doublons)\n\n" +
        "Tapez 1, 2 ou 3 :"
      );

      if (choice === "1") {
        applyCloudToLocal(cloudData);
        alert("Importation réussie !");
      } else if (choice === "2") {
        await pushToCloud(uid, localData);
        alert("Exportation réussie !");
      } else if (choice === "3") {
        const merged = mergeData(localData, cloudData);
        applyCloudToLocal(merged);
        await pushToCloud(uid, merged);
        alert("Fusion réussie (" + merged.sessions.length + " séances au total) !");
      }
    } else {
      // Sinon, synchronisation automatique classique par date
      if (cloudData.updatedAt > localData.updatedAt) {
        applyCloudToLocal(cloudData);
      } else if (localData.updatedAt > cloudData.updatedAt) {
        await pushToCloud(uid, localData);
      }
    }
  }
  updateSyncIndicator('synced');
}

function mergeData(local, cloud) {
  const allSessions = [...local.sessions, ...(cloud.sessions || [])];
  const uniqueSessions = [];
  const ids = new Set();

  allSessions.forEach(s => {
    if (!ids.has(s.id)) {
      uniqueSessions.push(s);
      ids.add(s.id);
    }
  });

  return {
    sessions: uniqueSessions,
    user: cloud.user || local.user,
    blocks: cloud.blocks || local.blocks,
    updatedAt: Date.now()
  };
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
