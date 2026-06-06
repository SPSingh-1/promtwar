/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoodEntry, UserProfile, MoodLevel, ExamType } from "../types";

/**
 * Escapes HTML symbols to prevent XSS attacks.
 */
export function sanitizeInput(text: string): string {
  if (!text) return "";
  // String length limit (500 characters max for journal notes, as demanded by spec)
  const trimmed = text.substring(0, 500);
  return trimmed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

const DB_NAME = "MentalWellnessDB";
const DB_VERSION = 1;
const STORE_NAME = "moodEntries";

/**
 * Opens the IndexedDB database for mood history.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

/**
 * Native IndexedDB operations wrapper for high-efficiency persistent storing.
 */
export const dbOps = {
  /**
   * Save a MoodEntry to IndexedDB (or fallback to LocalStorage if fail)
   */
  async saveMoodEntry(entry: MoodEntry): Promise<void> {
    // Basic validation
    if (!Object.values(MoodLevel).includes(entry.mood)) {
      throw new Error(`Invalid mood value: ${entry.mood}`);
    }
    
    // Sanitize note & reflection answers
    entry.note = sanitizeInput(entry.note);
    entry.reflectionAnswer = sanitizeInput(entry.reflectionAnswer);

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(transaction.objectStoreNames[0]);
        const request = store.put(entry);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error || new Error("Could not store entry."));
        };
      });
    } catch (err) {
      console.warn("IndexedDB failed, writing to fallback LocalStorage", err);
      // Fallback
      const entries = this.getLocalStorageFallbackEntries();
      const existingIdx = entries.findIndex((e) => e.id === entry.id);
      if (existingIdx >= 0) {
        entries[existingIdx] = entry;
      } else {
        entries.push(entry);
      }
      localStorage.setItem(`fallback_${STORE_NAME}`, JSON.stringify(entries));
    }
  },

  /**
   * Retrieve all MoodEntries sorted by timestamp descending
   */
  async getAllMoodEntries(): Promise<MoodEntry[]> {
    try {
      const db = await openDB();
      const entries: MoodEntry[] = await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error || new Error("Could not fetch entries."));
        };
      });

      // Combine with fallback entries if any exist
      const fallback = this.getLocalStorageFallbackEntries();
      const combined = [...entries, ...fallback];
      
      // Deduplicate by ID
      const seen = new Set<string>();
      const dedupedBy = combined.filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });

      return dedupedBy.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.warn("IndexedDB failed, reading from fallback LocalStorage", err);
      return this.getLocalStorageFallbackEntries().sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
  },

  /**
   * Clear all entries in the database
   */
  async clearAllEntries(): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn("Could not clear IndexedDB:", e);
    }
    localStorage.removeItem(`fallback_${STORE_NAME}`);
  },

  getLocalStorageFallbackEntries(): MoodEntry[] {
    const raw = localStorage.getItem(`fallback_${STORE_NAME}`);
    if (!raw) return [];
    try {
      const entries = JSON.parse(raw) as MoodEntry[];
      return Array.isArray(entries) ? entries : [];
    } catch {
      return [];
    }
  }
};

const DEFAULT_PROFILE: UserProfile = {
  id: "local-student-user",
  examType: "JEE",
  examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 60 days in future
  streakCount: 0,
  lastCheckIn: "",
  onboardingCompleted: false,
  reminderTime: "21:00",
  theme: "system"
};

/**
 * Profile and streak management operations using robust fallback logic.
 */
export const profileOps = {
  getProfile(): UserProfile {
    const raw = localStorage.getItem("wellness_user_profile");
    if (!raw) return DEFAULT_PROFILE;
    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem("wellness_user_profile", JSON.stringify(profile));
  },

  /**
   * Calculates check-in streak logic.
   * Gap of 1 day is fine (if checked in yesterday or today, streak continues).
   * Gap of 2+ days resets the streak.
   * @param entryDateStr Date string of the current wellness entry in YYYY-MM-DD
   */
  updateStreak(entryDateStr: string): number {
    const profile = this.getProfile();
    const lastCheckIn = profile.lastCheckIn;

    if (!lastCheckIn) {
      // First time check-in ever
      profile.streakCount = 1;
      profile.lastCheckIn = entryDateStr;
      this.saveProfile(profile);
      return 1;
    }

    if (lastCheckIn === entryDateStr) {
      // Already checked in today, keep physical streak
      return profile.streakCount;
    }

    const lastDate = new Date(lastCheckIn);
    const currentDate = new Date(entryDateStr);
    
    // Clear time portions to get precise calendar days
    lastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const diffMs = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day!
      profile.streakCount += 1;
    } else if (diffDays > 1) {
      // Gap of 2+ days, reset streak to 1
      profile.streakCount = 1;
    } else {
      // Older date check-in (re-entry into history), don't update streak count or lastCheckIn
      return profile.streakCount;
    }

    profile.lastCheckIn = entryDateStr;
    this.saveProfile(profile);
    return profile.streakCount;
  }
};
