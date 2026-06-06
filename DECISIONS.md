# Technical Decisions Document 🧠🧭

This document details the architectural, performance, security, and accessibility decisions made during the design and construction of the Student Mental Wellness Tracker.

---

## 1. Architectural & Database Selection
### Decision: Client-Side SPA (Option A) with Native IndexedDB + LocalStorage Fallback
- **Rationale**: The core of the problem statement is a **Mental Wellness Tracker for highly competitive student preparation**. The priority is absolute data confidentiality because students are logging highly vulnerable thoughts regarding mock exam anxiety, family pressure, and burnout. 
- **Privacy By Design**: Storing study logs on remote cloud databases increases compliance risk, leakage liabilities, and requires mandatory authentication. To remove this friction, we chose an **offline-first, zero-telemetry architecture**.
- **Performance & Durability**: Simple `localStorage` has a stringent 5MB storage ceiling and is subject to aggressive browser eviction on Safari/Chrome. We implemented a **native IndexedDB (IDB)** layer, which can securely scale up to hundreds of megabytes of historical logs. We wrapped IDB operations in a robust helper class featuring automatic, silent fallbacks to standard LocalStorage if client database configurations fail in sandboxed iframe previews.

---

## 2. State & Re-render Management (Efficiency)
### Decision: Split Dual-Context Layer (`MoodContext` and `UIContext`)
- **Rationale**: For an offline dashboard displaying calendar charts, trend lines, and input logger panels, React state updates can easily trigger total core tree re-renders, impacting performance on mobile devices.
- **Split Domain Design**:
  - `MoodContext`: Encapsulates only database read-write state updates, database mock-seeding triggers, profile setups, and countdown arithmetic.
  - `UIContext`: Encapsulates swift, frequently updated UX coordinates (tab navigation selections, and toast alerts).
- This separation prevents navigation events or toast dismissals from triggering layout computations, keeping the UI highly lightweight and fast under Lighthouse test loads.

---

## 3. High-Performance Visual Charts
### Decision: Custom Interactive SVG Line Plotting & Matrix Grid Heatmaps
- **Rationale**: Third-party visualization engines (like eCharts/Visx/Recharts) introduce a heavy gzipped library payload (up to 150KB extra), are prone to typescript compile-mode failures, and frequently crash during rapid window resizing or in iframe preview boundaries.
- **SVG Advantage**: We constructed a **100% custom SVG Weekly Trend Line Chart** and a **Grid Heatmap Calendar**.
  - No DOM-blocking layouts: SVG renders directly alongside the native browser paint cycle.
  - Responsive: Incorporates dynamic aspect viewBox values and fluid percentage scaling.
  - Zero payload overhead: Hand-crafted SVG code adds exactly 0KB of extra node dependency weight while allowing custom hover states and tooltips.

---

## 4. XSS Security & Content Safety
### Decision: Custom Strict Unicode Escapers & Form Limit Enforcers
- **Rationale**: Since user notes are stored locally and rendered on lists and heatmap cells, we must guarantee they cannot execute malicious scripts if copied, exported, or seeded.
- **Implementations**:
  - We wrote a customized string-level HTML character escaper `sanitizeInput(text)` that escapes tags (`<`, `>`), ampersand (`&`), quotes (`"`, `'`), and safe forward slashes (`/`).
  - Implemented strong form limits (strictly truncating all reflections and journal note fields at `500` characters maximum) right before saving to IDB, completely checking memory-exhaustion or input-hijack possibilities.

---

## 5. UI/UX Design & Emotional Calming Codes
### Decision: Warm Off-Whites, Restful Greens, and Supportive Purples
- **Rationale**: Competitive exam preparation in India triggers excessive cognitive tension. High-contrast neon-orange, fire-red, or deep clinical blacks act as subconscious stress reminders, aggravating anxiety.
- **Theme Choice**: Soft off-white backgrounds, calm forest greens (`#10b981`), and soothing spiritual purples. We strictly avoided harsh alarm-red coloring for state trackers (even using soft pink-coral gradients for high-intensity or burnout markers to remain gentle).

---

## 6. Comprehensive Test Harness
### Decision: Pure Unit, Proximity Countdown, and Sanitizer Testing with Vitest
- **Rationale**: To achieve a robust QA profile without bloated configs, we selected `vitest` to run isolated unit configurations. It tests:
  - Complex calendar date-rollover checking.
  - Acute consecutive-day burnout severity algorithms.
  - Sanitizer protection filters.
  - Exam-marker countdown progress.
