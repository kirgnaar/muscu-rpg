# CLAUDE.md — Muscu RPG

Guidance for AI assistants working in this repository.

---

## Project Overview

**Muscu RPG** is a gamified weightlifting tracker built as a Progressive Web App (PWA). It targets members of the "CdB Sucy Judo" sports club. The UI is entirely in **French**.

- No backend, no build step, no package manager, no framework
- Pure vanilla JavaScript (ES5-compatible), HTML, and CSS
- Persistence via `localStorage` only
- Offline-capable via a Service Worker

---

## Repository Layout

```
muscu-rpg/
├── index.html              # Single HTML file — all tabs defined here
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first strategy)
├── css/
│   ├── main.css            # Variables, reset, layout, typography
│   ├── components.css      # Reusable UI components (cards, buttons, forms)
│   ├── badges.css          # Badge and tier styling
│   └── charts.css          # Canvas chart styles
├── js/
│   ├── exercises.js        # Static DB: 102 exercises, muscle groups, Big 6 list
│   ├── data.js             # localStorage CRUD, PR detection, aggregate queries
│   ├── tiers.js            # Tier thresholds (Bronze→Platine) and RPG level math
│   ├── utils.js            # Epley formula, formatting, export/import JSON, toasts
│   ├── app.js              # Global APP state, tab routing, init — loaded LAST
│   ├── body/
│   │   ├── front.js        # Front-body SVG rendering (with CDN fallback)
│   │   └── back.js         # Back-body SVG rendering
│   └── render/
│       ├── journal.js      # "Séances" tab: add form, journal list, filters
│       ├── pr.js           # "PR Big 6" tab: 1RM cards and rep-weight tables
│       ├── rpg.js          # "RPG" tab: global score, per-muscle-group level cards
│       ├── stats.js        # "Stats" tab: KPI cards, Canvas time-series charts
│       └── badges.js       # "Badges" tab: SVG icons, body maps, tier filter
└── assets/icons/           # PWA icons (192px, 512px)
```

---

## JavaScript Load Order

Script tags in `index.html` must remain in this exact order — there is no bundler:

1. `body-highlighter` CDN (optional; front.js/back.js fall back to inline SVG)
2. `exercises.js` — static data, no dependencies
3. `tiers.js`, `utils.js`, `data.js` — core logic
4. `body/front.js`, `body/back.js`
5. `render/journal.js`, `render/pr.js`, `render/rpg.js`, `render/stats.js`, `render/badges.js`
6. `app.js` — orchestrator, **must be last**

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

All data lives in localStorage under the key **`mrpg_v2`** as a JSON array of entry objects:

```javascript
{
  id:   Number,          // Date.now() + random suffix
  date: "YYYY-MM-DD",
  type: String,          // training type — see TRAINING_TYPES below
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

**Training types (`type` field):**
- `"Hypertrophie"`
- `"Force"`
- `"Hyperforce (PR)"`
- `"Endurance musculaire"`
- `"Décharge"`

Changes to the schema require a new localStorage key (e.g., `mrpg_v3`) and a migration path in `data.js`.

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
- Language of comments and UI strings: **French**

### Event Handling
Use event delegation on stable container elements rather than binding fresh listeners on every render. See `journal.js` for the reference pattern.

---

## Global State (`app.js`)

```javascript
APP = {
  data: [],          // all entries loaded from localStorage
  view: 'seances'    // current active tab
}
```

`APP.data` is the single source of truth. Always reload from `loadData()` (`data.js`) after a write, then call the appropriate `render*()` function.

---

## Tab / View Routing

Tabs are: `seances`, `pr`, `rpg`, `stats`, `badges`

`app.js::showView(view)` handles tab switching:
1. Hides/shows `.tab-content` sections
2. Updates `.tab-btn` active state
3. Calls the matching render function

Adding a new tab requires:
1. A new section in `index.html`
2. A `render/newTab.js` render function
3. A `<script>` tag before `app.js`
4. A new case in `showView()`

---

## Service Worker (`sw.js`)

Cache name: `muscu-rpg-v1`

When adding new static assets (CSS, JS, images), add them to the `ASSETS` array in `sw.js`. When making breaking changes to cached assets, increment the cache version number.

---

## Styling Guidelines

- CSS custom properties (variables) defined in `main.css` `:root` block — use these for colors and spacing
- Component styles go in `components.css`
- Avoid inline styles in JS; prefer toggling CSS classes
- The app uses a **dark navy theme** (`#0a0f1e` background)

---

## What NOT to Do

- Do not introduce a build tool (webpack, Vite, etc.) without explicit instruction
- Do not add `package.json` or npm dependencies unless asked
- Do not use ES modules (`import`/`export`) — they break the direct-file-open workflow
- Do not write to localStorage keys other than `mrpg_v2` without versioning
- Do not add English strings to the UI — all user-facing text is French
- Do not modify the JS load order in `index.html` without updating this file

---

## Deployment

Deploy by copying all files to any static hosting provider (GitHub Pages, Netlify, nginx). No build step required. For HTTPS (required for PWA install prompts and service workers in production), configure the hosting provider accordingly.
