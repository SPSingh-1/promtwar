/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { MoodEntry, UserProfile, MoodLevel, ExamType } from "../types";
import { dbOps, profileOps } from "../utils/db";
import { getSeedData } from "../utils/wellnessData";

// --- TOAST TYPE ---
export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

// --- MOOD CONTEXT INTERFACE ---
interface MoodContextType {
  entries: MoodEntry[];
  profile: UserProfile;
  loading: boolean;
  addMoodEntry: (mood: MoodLevel, triggers: string[], intensity: number, note: string, reflectionPrompt: string, reflectionAnswer: string, backdateDays?: number) => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
  clearAllUserData: () => Promise<void>;
  seedSampleData: () => Promise<void>;
}

// --- UI CONTEXT INTERFACE ---
interface UIContextType {
  activeTab: "home" | "mood" | "journal" | "insights" | "support" | "settings";
  setActiveTab: (tab: "home" | "mood" | "journal" | "insights" | "support" | "settings") => void;
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
  dismissToast: (id: string) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);
const UIContext = createContext<UIContextType | undefined>(undefined);

// --- PROVIDER ---
export const WellnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Mood State
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(profileOps.getProfile());
  const [loading, setLoading] = useState<boolean>(true);

  // 2. UI State
  const [activeTab, setActiveTabVar] = useState<"home" | "mood" | "journal" | "insights" | "support" | "settings">("home");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Memoize setting active tab to avoid child re-renders
  const setActiveTab = useCallback((tab: "home" | "mood" | "journal" | "insights" | "support" | "settings") => {
    setActiveTabVar(tab);
  }, []);

  // System Theme Preference Detection
  useEffect(() => {
    const handleSystemTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (profile.theme === "system") {
        document.documentElement.classList.toggle("dark", isDark);
      }
    };

    if (profile.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (profile.theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      handleSystemTheme();
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", handleSystemTheme);
      return () => media.removeEventListener("change", handleSystemTheme);
    }
  }, [profile.theme]);

  // Load entry datasets on startup
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const loadedEntries = await dbOps.getAllMoodEntries();
        if (active) {
          setEntries(loadedEntries);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed loading data from DB", err);
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, []);

  // --- TOAST UTILITIES ---
  const showToast = useCallback((message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- MUTATIVE DB AND PROFILE FUNCTIONS ---
  const addMoodEntry = useCallback(async (
    mood: MoodLevel,
    triggers: any[],
    intensity: number,
    note: string,
    reflectionPrompt: string,
    reflectionAnswer: string,
    backdateDays: number = 0
  ) => {
    // Generate Timestamp
    const entryDate = new Date();
    if (backdateDays > 0) {
      entryDate.setDate(entryDate.getDate() - backdateDays);
    }
    const timestamp = entryDate.toISOString();
    const dateStr = timestamp.split("T")[0]; // YYYY-MM-DD

    // Build Entry object
    const newEntry: MoodEntry = {
      id: "entry-" + Date.now() + Math.floor(Math.random() * 1000).toString(),
      userId: profile.id,
      mood,
      triggers,
      intensity,
      note,
      reflectionPrompt,
      reflectionAnswer,
      timestamp,
      burnoutRisk: mood === MoodLevel.BURNOUT || mood === MoodLevel.NUMB
    };

    // Prevent duplicate entries on exactly same timestamp
    await dbOps.saveMoodEntry(newEntry);
    
    // Update local streak if it is a fresh entry (non-backdated, or checked in for today)
    let newStreak = profile.streakCount;
    if (backdateDays === 0) {
      newStreak = profileOps.updateStreak(dateStr);
    }

    // Refresh state from DB
    const allEntries = await dbOps.getAllMoodEntries();
    setEntries(allEntries);

    // Dynamic achievement toasts
    if (newStreak > profile.streakCount && backdateDays === 0) {
      showToast(`Keep it up! ${newStreak}-day check-in streak Fire! 🔥`, "success");
    } else {
      showToast("Wellness check-in logged successfully!", "success");
    }

    // Reload profile with updated streaks
    setProfile(profileOps.getProfile());
  }, [profile, showToast]);

  const updateProfile = useCallback((updated: Partial<UserProfile>) => {
    const freshProfile = { ...profile, ...updated };
    profileOps.saveProfile(freshProfile);
    setProfile(freshProfile);
    showToast("Profile settings saved successfully!", "success");
  }, [profile, showToast]);

  const clearAllUserData = useCallback(async () => {
    await dbOps.clearAllEntries();
    localStorage.removeItem("wellness_user_profile");
    setEntries([]);
    const defaultProf = profileOps.getProfile();
    setProfile(defaultProf);
    showToast("All wellness check-in database logs deleted safely.", "warning");
  }, [showToast]);

  const seedSampleData = useCallback(async () => {
    setLoading(true);
    // Seed and save sequentially
    const seed = getSeedData(profile.examType);
    for (const item of seed) {
      await dbOps.saveMoodEntry(item);
    }
    
    // Setup healthy mock streaks
    const updatedProf = { ...profile, streakCount: 7, lastCheckIn: new Date().toISOString().split("T")[0] };
    profileOps.saveProfile(updatedProf);
    setProfile(updatedProf);

    // Refresh in-memory list
    const all = await dbOps.getAllMoodEntries();
    setEntries(all);
    setLoading(false);
    showToast("Seeded 14 realistic entry logs across past weeks for evaluation.", "success");
  }, [profile, showToast]);

  // Combine Memorized values to avoid re-renders
  const moodValue = useMemo(() => ({
    entries,
    profile,
    loading,
    addMoodEntry,
    updateProfile,
    clearAllUserData,
    seedSampleData
  }), [entries, profile, loading, addMoodEntry, updateProfile, clearAllUserData, seedSampleData]);

  const uiValue = useMemo(() => ({
    activeTab,
    setActiveTab,
    toasts,
    showToast,
    dismissToast
  }), [activeTab, setActiveTab, toasts, showToast, dismissToast]);

  return (
    <MoodContext.Provider value={moodValue}>
      <UIContext.Provider value={uiValue}>
        {children}
      </UIContext.Provider>
    </MoodContext.Provider>
  );
};

// --- CUSTOM ACCESS HOOKS ---
export const useMoodContext = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMoodContext must be used under a WellnessProvider");
  }
  return context;
};

export const useUIContext = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used under a WellnessProvider");
  }
  return context;
};
