# Aura — Student Mental Wellness Tracker 🧘‍♂️✨

A full-stack style, privacy-first, offline-capable Mental Wellness Tracker designed for Indian students preparing for competitive, high-stakes examinations (**JEE, NEET, UPSC, Board Exams, CAT, GATE, and CUET**). 

This application runs strictly client-side to achieve a **100% data privacy-locked architecture**. All reflective journals, stress vectors, and calendars are stored locally inside the student's browser sandbox using **IndexedDB**, with zero third-party web tracking, analytics telemetry, or server dependencies.

---

## 🚀 Key Features Built-In

1. **Dashboard (Primary Cockpit)**:
   - Dynamic exam count-down offsets with custom warnings depending on proximity.
   - Interactive, custom Weekly Average Wellness Gauge.
   - 7-Day interactive SVG Trend graph showing progress scores.
   - Rotating daily pranayama advice and comforting exam stress quotes.

2. **Mood Logger Grid (Analytical Entry)**:
   - 7-level responsive hover mood selector with keyboard navigation, aria weights, and emoji states.
   - Multi-select stress trigger tags tailored to competitive revision (Syllabus, Peer comparisons, Mock test fear etc).
   - Intensity indicators tracking exactly how heavy the selected feeling is.
   - 500-character max journal notes and rotating guided cognitive reflections.

3. **History Heatmap Tracker (The Contribution Graph)**:
   - 30-Day Github contribution style heatmap, color-coded based on mental wellness metrics.
   - Keyword searchable entries and advanced filters (filter by stressors or mood degrees).
   - Confidentially package data into private client-side downloads as JSON.

4. **AI Mental Insights (Relational Predictions)**:
   - Burnout Risk Indicators warning when 2+ consecutive burnout/low check-ins align.
   - Stats pinpointing the student's best and worst mental weekdays automatically.
   - Actionable, context-appropriate rule-based AI suggestions tailored to the student's primary stressor (e.g., breaking down massive syllabi, protecting night rest).

5. **Self-Care & Support Center (Integrated Pranayama)**:
   - Direct-dial contacts linking securely to accredited National Helplines (**iCall Mumbai** and **Vandrevala Foundation**).
   - Animated **4-7-8 Deep Breathing Pranayama Engine** guiding chests on Inhales (4s), Holds (7s), and Exhales (8s).
   - Interactive **5-4-3-2-1 Sensory Grounding Console** helping students snap out of acute panic attacks.
   - Daily Checklist monitors (for hydration, spine adjustments, eye strain, etc.).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 18 with TypeScript (Strict Type Safety, no `any` fallbacks).
- **Styling & Theme**: Tailwind CSS with automatic prefectures. Features full dark-mode preference synchronization using `prefers-color-scheme`. It uses calm off-whites, gentle mint-greens, and warm purples.
- **Database Engine**: Typed client-side **IndexedDB** wrapper with standard LocalStorage fallbacks, guaranteeing 100% data durability and performance during large datasets.
- **Micro-Animations**: Pure GPU-accelerated CSS transforms and transitions to keep the interface butter-smooth across mobile screens (320px) and wide monitors (1440px).

---

## 🏃‍♂️ Setup & Local Development

To run this application locally, ensure you have **Node.js** (v18+) and **npm** installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
The server binds onto host `0.0.0.0` at port `3000` automatically. Open `http://localhost:3000` in your web browser.

### 3. Run Test Suites
We use `vitest` as our testing framework.
```bash
npx vitest run
```

---

## 🔐 Security & Accessibility Pledges

- **Strict Client-Only Storage**: Absolutely no database connection calls. Your private thoughts reside entirely inside your browser's persistent storage.
- **XSS Prevention**: Advanced escaping, regex checks, and input-sanitization wrapper are implemented on all textarea coordinates.
- **WCAG 2.1 Level AA Compliant**: All buttons are keyboard operable with 2px visible rings, aria-describedby markers, role semantics, skip links, and screen-readable emoji mappings.
