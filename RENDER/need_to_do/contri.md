## ⚙ IMPLEMENTATION PLAN — LIVE GitHub Contributions Heatmap on Website

---

### 📍 Objective

Embed a real-time updating, theme-synchronized GitHub contribution graph on the website, replicating GitHub's visual experience (including seasonal themes like Halloween).

---

### 📂 Architecture Overview

| Layer                                           | Responsibility                   |
| ----------------------------------------------- | -------------------------------- |
| GitHub GraphQL API                              | Fetch contribution data + color  |
| Backend API (FastAPI / Cloud Function / Django) | Cache + secure token             |
| Firestore / Local Cache                         | Avoid rate-limit, refresh daily  |
| Frontend Renderer                               | Build grid UI replicating GitHub |
| CSS Theme Binding                               | Apply GitHub or custom theme     |

---

### 🧱 Major Components

1️⃣ Backend service to fetch + expose GitHub contribution data
2️⃣ Database cache (optional but recommended)
3️⃣ Frontend grid renderer
4️⃣ CSS theme system
5️⃣ Scheduled auto-refresh (CRON style)

---

## PHASE 1 — Backend Setup (Data Fetch Layer)

### Tasks

* Create a GitHub PAT (Personal Access Token with read:user)
* Define `/api/github-contributions` endpoint
* Implement GraphQL query (pull: date, count, color)
* Apply caching:

  * Store response (Cloud Run ↔ Firestore)
  * Define "refresh interval" = 12 hours
* Add simple auth control (to avoid public scraping)

### Milestones

✔ Ability to fetch raw JSON
✔ API returns normalized, compact dataset
✔ PAT secured via Secret Manager

---

## PHASE 2 — Theme-Syncing Strategy

### Plan

* Use returned `color` field (already mapped by GitHub)
* Do NOT map manually unless overriding
* Add toggle:
  | Mode | Output |
  |------|--------|
  | Follow GitHub | Use color returned |
  | Custom Dark/Light | Map by `contributionLevel` |
  | Seasonal custom | Hard override |

### Optional

* Detect GitHub seasonal theme **daily**
* Save computed theme to Firestore

---

## PHASE 3 — Frontend Rendering UI

### Plan

* Render grid by **weeks → days**
* Create `<div>` columns representing weeks
* Use CSS variables for colors
* Add hover tooltip: `Date | Count | Level`
* Add month name row above grid

### Animations

* Fade-in on load
* Optional growing tiles (0.2s stagger)

---

## PHASE 4 — Auto Refresh + Cron Jobs

### Implementation

| Platform    | Method                   |
| ----------- | ------------------------ |
| Cloud Run   | Scheduled Job            |
| Firebase    | Cloud Scheduler          |
| FastAPI     | Celery beat              |
| Vercel/Next | Revalidate every N hours |

### Refresh Frequency

* Recommended: every **12 hours**
* If high traffic: every **24 hours**

---

## PHASE 5 — Fallback + Performance Rules

### Rules

| Scenario             | Action                 |
| -------------------- | ---------------------- |
| GitHub not reachable | Return cached copy     |
| GraphQL rate limit   | Reduce frequency       |
| User offline         | Load from localStorage |
| API latency          | Show skeleton heatmap  |

### Minimize load

* Cache JSON in browser
* Compress payload (remove 0-count squares)

---

## PHASE 6 — Deployment

### Steps

1. Configure env (GitHub PAT) in secret manager
2. Deploy backend API
3. Connect frontend renderer
4. Add Cloud Scheduler CRON
5. Monitor API usage log

### Required Secrets

* `GITHUB_TOKEN`
* Optional: `FIRESTORE_KEY`

---

## PHASE 7 — Documentation & Configuration Options

| Feature             | Config                |
| ------------------- | --------------------- |
| Theme Follow GitHub | `THEME_MODE='github'` |
| Force Light         | `'light'`             |
| Force Dark          | `'dark'`              |
| Force Seasonal      | `'halloween'`         |
| Refresh Hours       | `CRON_HOURS=12`       |

User Facing Controls:

* Theme Selector
* Year Selector (Default: current year)
* Toggle: "Show Tooltip Data"

---

## 🔥 Deliverables

| Output                      | Description                   |
| --------------------------- | ----------------------------- |
| `/api/github-contributions` | Returns JSON grid             |
| `<ContributionsHeatmap/>`   | Reusable component            |
| `theme.css`                 | GitHub and Seasonal variables |
| Scheduler file              | CRON config                   |
