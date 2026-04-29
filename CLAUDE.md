# CLAUDE.md — Muscu RPG

Guidance for AI assistants working in this repository.

---

## Project Overview

**Muscu RPG** is a gamified weightlifting tracker built as a Progressive Web App (PWA). It is designed for any amateur or athlete who wants a tracker that feels like an RPG character they embody. The UI is entirely in **French** (with i18n support for 5 languages via `lang.js`).

- No backend, no build step, no package manager, no framework
- Pure vanilla JavaScript (ES5-compatible), HTML, and CSS
- Persistence via `localStorage` only
- Offline-capable via a Service Worker
- Firebase Auth (Google Sign-In) + Firestore sync (optional, modular ES module)

---

## Repository Layout

```
muscu-rpg/
├── index.html              # Single HTML file — all tabs defined here
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first strategy)
├── css/
│   ├── main.css            # Variables, reset, layout, typography
│   ├── components.css      # Reusable UI components (cards, buttons, forms, calendar)
│   ├── badges.css          # Badge and tier styling
│   ├── badges-premium.css  # Premium/advanced badge styles
│   └── charts.css          # Canvas chart styles
├── js/
│   ├── exercises.js        # Static DB: 102 exercises, muscle groups, Big 6 list
│   ├── lang.js             # i18n — 5 languages (fr, en, es, pt, de), key→string map
│   ├── data.js             # localStorage CRUD, PR detection, aggregate queries
│   ├── tiers.js            # Tier thresholds (Bronze→Platine) and RPG level math
│   ├── utils.js            # Epley formula, formatting, export/import JSON, toasts
│   ├── timer.js            # Rest timer (global TIMER object)
│   ├── firebase-config.js  # Firebase init (ES module, indexedDBLocalPersistence)
│   ├── auth.js             # Google Auth via signInWithRedirect (ES module)
│   ├── sync.js             # Firestore bidirectional sync (ES module)
│   ├── app.js              # Global APP state, tab routing, init — loaded LAST
│   ├── body/
│   │   ├── body3d_v62.js   # Three.js 3D body renderer (BODY3D global)
│   │   ├── front.js        # Front-body SVG rendering (with CDN fallback)
│   │   └── back.js         # Back-body SVG rendering
│   └── render/
│       ├── journal.js      # "Séances" tab: add form, journal list, filters
│       ├── pr.js           # "PR Big 6" tab: 1RM cards and rep-weight tables
│       ├── rpg.js          # "RPG" tab: global score, per-muscle-group level cards
│       ├── simulation.js   # "Planning" tab: calendar + session library + cycles
│       ├── stats.js        # "Stats" tab: KPI cards, Canvas time-series charts
│       ├── badges.js       # "Badges" tab: SVG icons, body maps, tier filter
│       └── corps.js        # "Profil" sub-tab: weight log, strength ratios, Wilks/Dots
└── assets/icons/           # PWA icons (192px, 512px)
```

---

## JavaScript Load Order

Script tags in `index.html` must remain in this exact order — there is no bundler:

1. `body-highlighter` CDN (optional; front.js/back.js fall back to inline SVG)
2. `exercises.js` — static data, no dependencies
3. `lang.js`, `tiers.js`, `utils.js`, `data.js`, `timer.js` — core logic
4. Three.js CDN + GSAP CDN
5. `body/body3d_v62.js`, `body/front.js`, `body/back.js`
6. `render/journal.js`, `render/pr.js`, `render/rpg.js`, `render/simulation.js`, `render/stats.js`, `render/badges.js`, `render/corps.js`
7. `app.js` — orchestrator, **must be last** (classic script)
8. `<script type="module">` inline — imports `auth.js` and `sync.js` (ES modules), exposes `window.Auth` and `window.pushToCloud`

**Key constraint:** `auth.js`, `firebase-config.js`, and `sync.js` use ES module `import`/`export` syntax and must be loaded as `type="module"`. All other files are classic scripts loaded globally.

If you add a new JS file, insert its `<script>` tag in the correct position.

---

## Running the App

Open `index.html` directly in a browser — no server needed.

For service-worker features (offline support, installability) you need HTTPS or `localhost`. A minimal local server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

There are **no automated tests**. Verification is manual via the browser DevTools.

---

## Data Model

### Workout entries — `mrpg_v2`
All workout data lives in localStorage under the key **`mrpg_v2`** as a JSON array:

```javascript
{
  id:   Number,          // Date.now() + random suffix
  date: "YYYY-MM-DD",
  type: String,          // training type — see SESSION_TYPES below
  ex:   String,          // exercise name (must match exercises.js)
  grp:  String,          // muscle group (must match exercises.js)
  ser:  Number,          // sets
  rep:  Number,          // reps per set
  pds:  Number,          // weight in kg
  vol:  Number,          // computed: ser × rep × pds
  rm1:  Number,          // computed: epley(pds, rep), rounded to 0.5 kg
  isPR: Boolean          // true if new max 1RM for this exercise (Big 6 only)
}
```

### User profile — `mrpg_user`
```javascript
{
  prenom: String, nom: String, age: Number,
  poids: Number,   // kg
  taille: Number,  // cm
  sexe: 'M'|'F',
  langue: 'fr'|'en'|'es'|'pt'|'de'
}
```

### Planning — `mrpg_planning`
Calendar entries, managed by `PLAN` object in `simulation.js`:
```javascript
{ id: Number, date: "YYYY-MM-DD", blockId: Number, note: String }
```

### Session library (blocks) — `mrpg_blocks`
Session templates, managed by `SIM` object in `simulation.js`:
```javascript
{
  id: Number,       // 1000–1011 reserved for DEFAULT_BLOCKS
  name: String,
  type: String,     // one of SESSION_TYPES
  exercises: [{ ex, ser, rep, pds, grp }]
}
```

### Cycles — `mrpg_cycles`
Weekly training patterns, managed by `CYCLES` object in `simulation.js`:
```javascript
{ id: Number, name: String, duration: String, sessions: Array, repeat: Number }
```

### Weight log — `mrpg_weight_log`
Body weight tracking, managed by `CORPS` object in `corps.js`:
```javascript
[{ date: "YYYY-MM-DD", poids: Number }]
```

### Session types (`SESSION_TYPES` global, all files)
- `"Hypertrophie"`
- `"Force"`
- `"Hyperforce (PR)"`
- `"Endurance musculaire"`
- `"Décharge"`

Changes to any schema require a new localStorage key and a migration path.

---

## Core Formulas

### Epley 1RM (`utils.js`)
```javascript
rm1 = weight * (1 + reps / 30)   // rounded to nearest 0.5 kg
```

Inverse (weight for a given 1RM and rep count):
```javascript
weight = rm1 / (1 + reps / 30)   // rounded to nearest 0.5 kg
```

### RPG Level (`tiers.js`)
XP required for level N: `5000 × N^1.9` (cumulative). Calibrated so a regular beginner reaches level 10 in ~3 months.

### Tier Thresholds (`tiers.js`)
Thresholds are per-exercise series (set) counts:

| Tier     | Series |
|----------|--------|
| Aucun    | 0      |
| Bronze   | 10     |
| Argent   | 25     |
| Or       | 50     |
| Diamant  | 100    |
| Platine  | 200    |

---

## Exercise Database (`exercises.js`)

- **102 exercises** grouped by muscular chain and muscle group
- Each exercise has: `name`, `grp` (muscle group), `chain`, `type` (`"Poly"` / `"Mono"`)
- **Big 6** (used for PR tracking and `pr.js` tab):
  1. Squat barre
  2. Développé couché barre
  3. Soulevé de terre conventionnel
  4. Développé militaire barre
  5. Rowing barre
  6. Leg press 45°
- Adding a new exercise: add an entry to the appropriate array in `exercises.js`. The `grp` value must match one of the 13 existing muscle group keys.

---

## Planning Tab (`simulation.js`)

The "Planning" tab (formerly "Simulation") has three sub-views:

1. **📅 Calendrier** — 7-column week grid, selectable period (1 week / 2 weeks / 1 month / 3 months), navigation by offset. Each day cell shows session badges; tap `+` to add a session, tap a badge to view details and log.
2. **🔄 Cycle** — weekly templates that generate calendar entries automatically.
3. **📋 Séances** — session library (blocks) with full editor: name, type, exercise list.

### Default sessions — PP Judo program
When `mrpg_blocks` is empty, `loadBlocks()` seeds `DEFAULT_BLOCKS` (IDs 1000–1011):
- `1000` — 🦵 Jambes (Force) — fixed Monday session
- `1001–1005` — 💪 Muscu A→E (Hypertrophie) — Wednesday rotation
- `1006–1010` — 💪 Muscu 1→5 (Hypertrophie) — Sunday rotation
- `1011` — ⚡ Full Body (Hypertrophie) — fixed Friday session

When `mrpg_planning` is empty, `PLAN.generateDefaultSchedule()` seeds 5 weeks of entries starting from the current Monday.

### Session type flow
The session type is set **once per session** (not per exercise). When logging a planned session via the detail modal, the `<select id="plan-detail-type">` shows the block's default type but the user can change it. `_logPlanEntry()` reads this selector and applies the selected type to all exercises in the log.

### iOS safety
All destructive actions use a **double-tap confirmation** pattern (first tap sets a pending state, second tap executes). Native `confirm()` / `prompt()` / `alert()` are blocked in iOS PWA standalone mode — never use them.

---

## Firebase Auth & Sync

### Auth strategy
- Uses `signInWithRedirect` (not `signInWithPopup` — popups are blocked on iOS PWA WKWebView)
- Persistence: `indexedDBLocalPersistence` (declared in `firebase-config.js`) — survives cross-origin redirect
- `getRedirectResult()` called at init to recover the user after redirect
- `onAuthStateChanged` is the authoritative source of truth
- Auth state cached in `localStorage` key `mrpg_auth_cache` to avoid flash on reload

### Module boundary
`auth.js`, `firebase-config.js`, and `sync.js` are ES modules (`import`/`export`). They are loaded via a `<script type="module">` block at the bottom of `index.html`, which exposes `window.Auth` and `window.pushToCloud` for consumption by classic scripts.

### Cloud sync payload
`pushToCloud(uid, payload)` syncs:
- `payload.sessions` — workout entries (`mrpg_v2`)
- `payload.user` — profile (`mrpg_user`)
- `payload.blocks` — session library (`mrpg_blocks`)
- `payload.planning` — calendar entries (`mrpg_planning`)
- `payload.cycles` — cycle templates (`mrpg_cycles`)

---

## Code Conventions

### Naming
- **Functions:** camelCase — `epley()`, `renderJournal()`, `handleSave()`
- **Constants / globals:** SCREAMING_SNAKE_CASE — `APP`, `BIG6`, `TIERS`, `DB_KEY`
- **Private/internal:** prefixed with `_` — `_fallbackFront()`, `_toastTimer`

### File Header Pattern
Every JS file starts with:
```javascript
/* ══════════════════════════════════════════════════════════════════
   MODULE NAME — short description
══════════════════════════════════════════════════════════════════ */
```

Section headers inside files:
```javascript
// ── Section Name ───────────────────────────────────────────────────
```

### DOM Helpers (defined in `app.js`, available globally)
```javascript
$(id)          // document.getElementById(id)
$$(sel, ctx)   // (ctx||document).querySelectorAll(sel)
```

### Vanilla ES5 Style
- Use `var` or `let`/`const` (project mixes both)
- Avoid arrow functions if the file already uses `function` expressions consistently
- No transpilation — what you write runs directly in the browser
- Language of comments and UI strings: **French** (except `auth.js`/`sync.js` which can use English)
- Exception: `firebase-config.js`, `auth.js`, `sync.js` may use ES module syntax and modern JS

### i18n
All UI strings rendered by classic scripts go through `APP.t(key)` which looks up `I18N[lang][key]` from `lang.js`. The default language is `'fr'`. When adding new UI text, add the key/value to all 5 language objects in `lang.js`.

### Event Handling
Use event delegation on stable container elements rather than binding fresh listeners on every render. See `journal.js` for the reference pattern.

---

## Global State (`app.js`)

```javascript
APP = {
  data: [],          // all entries loaded from localStorage (mrpg_v2)
  user: null,        // user profile object (mrpg_user) or null
  view: 'seances'    // current active tab
}
```

`APP.data` is the single source of truth. Always reload from `loadData()` (`data.js`) after a write, then call the appropriate `render*()` function.

---

## Tab / View Routing

Tabs are: `seances`, `pr`, `rpg`, `simulation`, `stats`, `badges`, `profil`, `settings`

`app.js::switchView(name)` handles tab switching:
1. Hides/shows `.view` sections (toggle class `on`)
2. Updates `.tab` active state via `data-v` attribute
3. Calls `APP.renderView(name)` which dispatches to the matching render function

**Adding a new tab:**
1. New section `<div id="v-newtab" class="view">` in `index.html`
2. A `render/newTab.js` render function
3. A `<script>` tag before `app.js`
4. A new `case 'newtab': renderNewTab(); break;` in `APP.renderView()`
5. A new `.tab` button in the tab bar

---

## Service Worker (`sw.js`)

Cache name: `muscu-rpg-v{N}` (currently at v123+)

**Always bump the version number** when deploying changes to any cached asset. When adding new static assets (CSS, JS, images), add them to the `ASSETS` array in `sw.js`.

The SW ignores Firebase Auth URLs (`/__/auth/`, `googleapis.com`) to prevent PWA blocking on iOS.

---

## Styling Guidelines

- CSS custom properties (variables) defined in `main.css` `:root` block — use these for colors and spacing
- Component styles go in `components.css` (includes calendar grid, modals, sub-tabs)
- Avoid inline styles in JS; prefer toggling CSS classes
- The app uses a **dark navy theme** (`#0a0f1e` background)

---

## What NOT to Do

- Do not introduce a build tool (webpack, Vite, etc.) without explicit instruction
- Do not add `package.json` or npm dependencies unless asked
- Do not use ES modules (`import`/`export`) in classic script files — they break the direct-file-open workflow; only `auth.js`, `firebase-config.js`, `sync.js` use ES modules
- Do not write to localStorage keys other than documented ones without versioning
- Do not add English strings to the UI — all user-facing text is French
- Do not modify the JS load order in `index.html` without updating this file
- Do not use `confirm()`, `prompt()`, or `alert()` — they are blocked in iOS PWA standalone mode; use the double-tap confirmation pattern or toast messages instead

---

## Deployment

Deploy by copying all files to any static hosting provider (GitHub Pages, Netlify, nginx). No build step required. For HTTPS (required for PWA install prompts, service workers, and Firebase Auth redirect flow in production), configure the hosting provider accordingly.

**GitHub Pages note:** The Firebase project must have `kirgnaar.github.io` in the authorized domains list (Firebase Console → Authentication → Settings → Authorized domains).
