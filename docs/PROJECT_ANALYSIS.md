# Analyse du projet

Dépôt : kirgnaar/muscu-rpg (branche par défaut : `main`, langage principal : JavaScript).
Fichier cible : `docs/PROJECT_ANALYSIS.md`.

**Limite générale :** seuls l'arborescence (37 fichiers), les titres des PR, les branches et le README (`# muscu-rpg`) ont été fournis. Aucun contenu de code n'a été lu. Une fonctionnalité listée ci-dessous est donc seulement **présente en tant que fichier**, son fonctionnement est **non prouvé**.

**Note de structure :** le gabarit du rédacteur impose les sections ci-dessous. Les thèmes demandés par la consigne (Résumé, Architecture, Qualité, Produit, Feuille de route, Informations manquantes) y sont répartis. Les informations manquantes sont signalées dans chaque section, sous des sous-titres « Informations manquantes ».

## Resume de l'application

- Nom : `muscu-rpg`. Le dépôt n'a ni description ni topics, et le README ne contient que son titre.
- D'après les noms de fichiers, c'est une application web de musculation à thématique RPG, avec journal, records (PR), badges, statistiques, corps 3D, simulation, timer, authentification, synchronisation, PWA et multilingue. L'intention est déduite des noms (`js/render/*.js`, `js/tiers.js`, etc.) et le fonctionnement réel est **non prouvé**.
- Aucun objectif produit, public cible ni mode d'emploi n'est documenté dans les données fournies. `CLAUDE.md` existe (ajouté par la PR #1), mais son contenu n'a pas été fourni.

## Technologies identifiees

| Élément | Statut | Preuve |
|---|---|---|
| JavaScript, HTML, CSS | Prouvé | `index.html`, `js/*.js`, `css/*.css` |
| Absence de build et de gestionnaire de paquets | Prouvé par absence | aucun `package.json`, bundler ni lockfile |
| Firebase | Partiel : fichier de config présent | `js/firebase-config.js` |
| Services Firebase utilisés (Auth, Firestore, RTDB), SDK | Non prouvé | |
| Framework front-end | Non prouvé | pourrait être chargé par CDN dans `index.html`, non lu |
| Modules ES ou scripts classiques | Non prouvé | |
| Technologie de rendu 3D (Three.js, canvas, WebGL, CSS 3D) | Non prouvé | |
| Tests, CI, lint | Absents de l'arborescence | aucun dossier de tests, aucun `.github/` |
| Déploiement | Non prouvé | aucun `firebase.json` ni workflow |

## Analyse de l'architecture

**Organisation (déduite uniquement des noms de fichiers) :**
- Racine : `index.html`, `manifest.json`, `sw.js`, `README.md`, `CLAUDE.md`.
- `js/` (cœur) : `app.js` (orchestrateur probable, non prouvé), `data.js`, `exercises.js`, `tiers.js`, `timer.js`, `utils.js`, `lang.js` (probablement i18n), `auth.js`, `sync.js`, `firebase-config.js`.
- `js/render/` : `badges`, `corps`, `journal`, `pr`, `rpg`, `simulation`, `stats` (une vue par fonctionnalité).
- `js/body/` : `front.js`, `back.js`, `body3d.js`, `body3d_v56.js` à `body3d_v62.js`.
- `css/` : `main`, `components`, `charts`, `badges`, `badges-premium`.

La séparation données / rendu / auth-sync / corps est lisible dans les noms de fichiers. Non prouvés : ordre de chargement, dépendances entre modules, état partagé, usage de globals.

**Flux de données :** les modules existent, mais le stockage local, le schéma, le fournisseur d'authentification, la direction de la synchronisation, la gestion des conflits et le mode hors-ligne sont non prouvés. Seul indice faible : le titre de la PR #2 « Fix compatibilité cross-device ».

**PWA / service worker :**
- `manifest.json` et `sw.js` sont présents (prouvé). Le contenu du manifest est non prouvé.
- Aucun fichier d'icône n'figure dans l'arborescence, donc les icônes du manifest sont non prouvées.
- Le titre de la PR #4 évoque une stratégie network-first et `updateViaCache: none`. C'est la seule preuve, et elle ne dit pas si la PR a été fusionnée. Le cache versionné « SW v2 » est un indice (PR #3). L'enregistrement du SW et le précache sont non prouvés.

**Rendu 3D :** huit fichiers `body3d*` coexistent dans `js/body/` (prouvé). Le risque de duplication et de dette est réel, mais la duplication n'est pas démontrée. Non prouvés : version chargée par `index.html`, rôle de `body3d.js`, part de code partagé, rôle exact de `front.js` et `back.js`.

**Gouvernance :** README minimal, `CLAUDE.md` présent (contenu non fourni), PR #5 ouverte.

### Informations manquantes (architecture)
- Contenu de `index.html`, `CLAUDE.md`, `sw.js`, `manifest.json`.
- Contenu de `firebase-config.js`, `auth.js`, `sync.js`, `data.js`.
- Différences entre `body3d_v56` à `v62` et `body3d.js`.
- Différences entre `feature/reset-default-sessions` et `main`.
- Mode de déploiement.
- Règles de sécurité Firebase.

## Fonctionnalites existantes (avec preuves)

La preuve est uniquement la présence d'un fichier, sauf mention contraire. Le fonctionnement réel de chacune est non prouvé.

| Fonctionnalité | Fichier(s) prouvant la présence |
|---|---|
| Journal | `js/render/journal.js` |
| PR / records | `js/render/pr.js` |
| RPG | `js/render/rpg.js` |
| Badges | `js/render/badges.js`, `css/badges.css`, `css/badges-premium.css`. La PR #3 « Fix badges page » corrobore leur existence. |
| Statistiques / graphiques | `js/render/stats.js`, `css/charts.css` |
| Corps 3D | `js/render/corps.js`, `js/body/body3d.js`, `front.js`, `back.js` |
| Simulation | `js/render/simulation.js` |
| Timer | `js/timer.js` |
| Exercices / données | `js/exercises.js`, `js/data.js` |
| Paliers (tiers) | `js/tiers.js` |
| Authentification | `js/auth.js`, `js/firebase-config.js` |
| Synchronisation | `js/sync.js` |
| PWA | `manifest.json`, `sw.js`. Les PR #3 et #4 mentionnent le SW. |
| Multilingue | `js/lang.js` |
| Socle | `index.html`, `js/app.js`, `js/utils.js`, `css/main.css`, `css/components.css` |

## Fonctionnalites incompletes ou non prouvees

**Incomplet ou à risque :**
- Corps 3D : sept versions parallèles (`body3d_v56` à `v62`) en plus de `body3d.js`. La version active est inconnue et la dette n'est pas prouvée.
- Icônes PWA : aucun fichier image dans l'arborescence, icônes du manifest non prouvées.
- Hors-ligne PWA : non prouvé. Les PR #3 et #4 indiquent des corrections répétées sur le cache.

**Non prouvé :**
- Reset des séances par défaut : seule la branche `feature/reset-default-sessions` l'évoque, sans PR ni contenu.
- Export/import, notifications, mode social : aucune trace dans les données.
- Tests automatisés, CI/CD, gestionnaire de dépendances : absents.
- Fonctionnement réel de chaque fonctionnalité listée plus haut.

## Dette technique

- **Versions 3D multiples** : risque de duplication, de confusion et de code mort. Git suffit pour l'historique. Fichiers chargés et ampleur du code mort : non prouvés.
- **Aucun test, aucune CI** : pas de filet contre les régressions. Les PR #2, #3 et #4 sont des correctifs. Le processus de revue est non prouvé.
- **Aucun `package.json`**, donc pas de scripts lint, test ou build. Aucun `.gitignore` ni configuration lint/format dans l'arborescence.
- **Absence de build** : ordre de chargement et globals non prouvés.
- **CSS** : cinq feuilles. Le découpage peut être sain, et les doublons entre `badges.css` et `badges-premium.css` sont non prouvés.
- **Cache du service worker** : les PR #3 et #4 indiquent des problèmes déjà rencontrés, état actuel non prouvé. À vérifier : version de cache manuelle, précache obsolète (`body3d_v*`), purge des anciens caches.
- **Sécurité** : `js/firebase-config.js` est versionné. Une config web Firebase n'est pas forcément secrète, mais son contenu n'a pas été vu. Règles Firestore/RTDB, restrictions de clé API et sécurité de `auth.js`/`sync.js` sont non prouvées.
- **Documentation** : README vide, justesse de `CLAUDE.md` non prouvée, pas de description ni de topics.

### Informations manquantes (qualité)
- Contenu des fichiers clés (`index.html`, `sw.js`, `firebase-config.js`, `CLAUDE.md`, modules JS).
- Dates et activité des branches, historique des commits.
- Règles Firebase et déploiement.
- Fichiers cachés.
- Contenu et diff de la PR #5.

## Problemes prioritaires

| # | Priorité | Action |
|---|---|---|
| 1 | Haute | Auditer `firebase-config.js` et les règles de sécurité Firebase |
| 2 | Haute | Ajouter une CI minimale (lint + vérification de syntaxe) et un `.gitignore` |
| 3 | Moyenne | Identifier le fichier `body3d_*.js` actif, puis supprimer les autres s'ils sont obsolètes |
| 4 | Moyenne | Écrire des tests sur la logique pure (`utils.js`, `tiers.js`, `data.js`), testabilité non prouvée |
| 5 | Moyenne | Sécuriser la stratégie de cache de `sw.js` |
| 6 | Basse | Compléter README, description et topics, ouvrir des issues pour la dette, statuer sur la PR #5 et la branche `feature/reset-default-sessions` |

## Etat des Issues et Pull Requests

**Issues :** 0.

| PR | État | Titre |
|---|---|---|
| #5 | ouverte | docs: analyse initiale du projet (IA) |
| #4 | fermée | SW network-first + updateViaCache none |
| #3 | fermée | Fix badges page + cache SW v2 |
| #2 | fermée | Fix compatibilité cross-device + CLAUDE.md |
| #1 | fermée | Add CLAUDE.md with comprehensive codebase documentation |

- « Fermée » ne précise pas si la PR a été fusionnée ou rejetée. Le statut de fusion des PR #1 à #4 est non prouvé.
- D'après les titres, les cinq PR portent sur la documentation, des correctifs (compatibilité, badges) et le cache/SW. Aucune ne concerne une nouvelle fonctionnalité.
- La PR #5 est ouverte et non fusionnée, son contenu n'a pas été fourni.

**Branches :**
- `main` (défaut).
- `feature/reset-default-sessions` : travail en cours probable (non prouvé), sans PR associée.
- `docs/ai-project-analysis-20261019-1743` : probablement liée à la PR #5 (non prouvé).
- `claude/add-claude-documentation-9Q2jm` : probablement liée aux PR #1 et #2 (non prouvé).

### Informations manquantes (issues et PR)
- Statut fusionné ou rejeté, dates et descriptions des PR.
- Historique des commits et diff de `feature/reset-default-sessions`.
- Assets éventuels hors des 400 premiers fichiers. L'arborescence compte 37 fichiers et semble complète.

## Feuille de route proposee

Cette feuille de route est à valider. Elle découle des constats ci-dessus et n'est pas une preuve d'état.

### Court terme
1. Rédiger le README, ajouter une description et des topics au dépôt.
2. Statuer sur la PR #5.
3. Clarifier `feature/reset-default-sessions` (ouvrir une issue ou une PR, ou supprimer la branche).
4. Auditer `firebase-config.js` et les règles Firebase, ajouter un `.gitignore`.
5. Vérifier le manifest (icônes) et le comportement hors-ligne du SW.

### Moyen terme
6. Identifier la version active du module 3D, puis archiver ou supprimer `body3d_v56` à `v62` si elles sont obsolètes.
7. Créer des issues par fonctionnalité et pour la dette.
8. Mettre en place une CI simple (lint + syntaxe) et des tests minimaux (`utils.js`, `tiers.js`, `data.js`, puis `sync.js`, `auth.js`, `pr.js`, `rpg.js`).
9. Sécuriser la stratégie de cache de `sw.js`.

### Long terme
10. Documenter les règles RPG (paliers, badges).
11. Évaluer la robustesse de la synchronisation multi-appareils (PR #2).
12. Évaluer un export/import des données, aucune trace d'existence à ce jour.