/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useMoodContext, useUIContext } from "./WellnessContext";
import { ExamType } from "../types";
import { Settings, ShieldCheck, Trash2, HelpCircle, Bell, SunDim, BookOpen, AlertCircle } from "lucide-react";

export const SettingsTab: React.FC = () => {
  const { profile, updateProfile, clearAllUserData } = useMoodContext();
  const { showToast } = useUIContext();

  // Settings states initialized from user profiles
  const [examType, setExamType] = useState<ExamType>(profile.examType);
  const [examDate, setExamDate] = useState<string>(profile.examDate);
  const [reminderTime, setReminderTime] = useState<string>(profile.reminderTime);
  const [theme, setTheme] = useState<"light" | "dark" | "system">(profile.theme);

  // Deletion double confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Save Config
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      examType,
      examDate,
      reminderTime,
      theme
    });
  };

  const handleWipeDatabase = async () => {
    await clearAllUserData();
    setShowConfirmDelete(false);
    showToast("Application data stores fully cleared.", "warning");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
          Preferences & Sandbox
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Tailor study trackers, reminders, visual color schemes, and delete private databases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COMPACT: PRIVACY PLEDGE SUMMARY */}
        <section className="rounded-2xl border border-gray-150 bg-emerald-500/10 p-5 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-xs flex flex-col justify-between" role="region" aria-label="Privacy Assurances Panel">
          <div className="space-y-3.5">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 p-2.5 w-10 h-10 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-950 dark:text-white leading-tight">
              100% Client-Side Privacy Notice
            </h3>
            <p className="text-xs text-gray-600 dark:text-neutral-350 leading-relaxed font-sans font-normal">
              Aura is structured with privacy as a foundational principle. Zero personal diary logs, schedules, or selected stress vectors are sent to any centralized network servers.
            </p>
            <p className="text-xs text-gray-600 dark:text-neutral-350 leading-relaxed font-sans font-normal border-t border-emerald-100/50 dark:border-neutral-800 pt-2.5">
              Everything compiles inside your client browser sandbox via **IDB** database structures. Complete anonymous self-care.
            </p>
          </div>

          <span className="text-5xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block mt-4">
            🔒 Localhost Locked System
          </span>
        </section>

        {/* MIDDLE LOGICS: CALENDAR AND REMINDERS (Spans 2 Column) */}
        <div className="md:col-span-2 space-y-6">
          
          <form onSubmit={handleSaveSettings} className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-5">
            
            <div className="flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-neutral-800">
              <Settings size={18} className="text-emerald-500" />
              <h2 className="text-md font-bold text-gray-950 dark:text-neutral-200">
                Personalization Center
              </h2>
            </div>

            {/* Exam Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-exam" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                  <BookOpen size={12} />
                  Active Target Exam
                </label>
                <select
                  id="settings-exam"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                >
                  <option value="JEE">JEE (Mains & Advanced)</option>
                  <option value="NEET">NEET Medical</option>
                  <option value="UPSC">UPSC Civil Services</option>
                  <option value="CAT">CAT (IIM Entrance)</option>
                  <option value="GATE">GATE Engineering</option>
                  <option value="CUET">CUET (UG/PG)</option>
                  <option value="Board Exams">Class 10/12 Board Exams</option>
                  <option value="Other">Other Competitive Exam</option>
                </select>
              </div>

              <div>
                <label htmlFor="settings-date" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                  Target Exam Date
                </label>
                <input
                  id="settings-date"
                  type="date"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
            </div>

            {/* Timings & Scheme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-reminder" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                  <Bell size={12} />
                  Daily reminder time
                </label>
                <input
                  id="settings-reminder"
                  type="time"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="settings-theme" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                  <SunDim size={12} />
                  Visual Palette theme
                </label>
                <select
                  id="settings-theme"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                >
                  <option value="light">Light Mode (Aesthetic Mint)</option>
                  <option value="dark">Dark Mode (Calm Obsidian)</option>
                  <option value="system">Follow Device Preference</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 dark:border-neutral-800 flex justify-end">
              <button
                id="btn-settings-save"
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer"
              >
                Save preferences
              </button>
            </div>

          </form>

          {/* DANGEROUS WIPE BOX */}
          <section className="rounded-2xl border border-rose-200/50 bg-rose-50/15 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 pb-2 border-b border-rose-100 dark:border-neutral-800">
              <Trash2 size={18} className="text-rose-500" />
              <h2 className="text-md font-bold text-rose-900 dark:text-rose-300">
                Wipe Local Databases
              </h2>
            </div>
            <p className="text-xs text-rose-800/80 dark:text-neutral-400 leading-relaxed font-sans">
              Delete all persistent IndexedDB mood logs, checklists, preparation countdown configurations, and daily trackers completely. This process is irreversible.
            </p>

            <div className="flex justify-end gap-2">
              {!showConfirmDelete ? (
                <button
                  id="btn-wipe-confirm-trigger"
                  onClick={() => setShowConfirmDelete(true)}
                  className="rounded-xl bg-rose-150 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer border border-rose-200 dark:border-rose-900/40"
                >
                  Request Data Purge
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-rose-200 dark:bg-neutral-900 dark:border-neutral-800">
                  <span className="text-4xs font-bold text-rose-700 animate-pulse flex items-center gap-1">
                    <AlertCircle size={12} />
                    Irreversible. Execute wipe?
                  </span>
                  <button
                    id="btn-confirm-cancel"
                    onClick={() => setShowConfirmDelete(false)}
                    className="text-xs text-gray-500 font-bold hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-confirm-delete"
                    onClick={handleWipeDatabase}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer"
                  >
                    Yes, Wipe DB
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
