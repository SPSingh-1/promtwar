/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useMoodContext, useUIContext } from "./WellnessContext";
import { MoodLevel, StressTrigger } from "../types";
import { getGuidedPrompt } from "../utils/wellnessData";
import { MOOD_LEVELS_CONFIG } from "./HomeDashboard";
import { Check, Calendar, Notebook, ListFilter, HelpCircle } from "lucide-react";

export const MoodLogger: React.FC = () => {
  const { addMoodEntry } = useMoodContext();
  const { setActiveTab, showToast } = useUIContext();

  // State Variables
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(MoodLevel.OKAY);
  const [intensity, setIntensity] = useState<number>(5);
  const [selectedTriggers, setSelectedTriggers] = useState<StressTrigger[]>([]);
  const [note, setNote] = useState<string>("");
  const [reflectionAnswer, setReflectionAnswer] = useState<string>("");
  const [backdateDays, setBackdateDays] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activePrompt = getGuidedPrompt(selectedMood);

  const TRIGGERS_AVAILABLE: StressTrigger[] = [
    "Studies",
    "Family",
    "Sleep",
    "Comparison",
    "Result Fear",
    "Health",
    "Other"
  ];

  // Toggle trigger tags
  const handleTriggerToggle = (tag: StressTrigger) => {
    setSelectedTriggers((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Submit Logger
  const handleSaveCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (note.length > 500) {
      showToast("Journal note exceeds 500 characters limit.", "warning");
      return;
    }

    if (reflectionAnswer.length > 500) {
      showToast("Reflection answer exceeds 500 characters limit.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct call to state management context
      await addMoodEntry(
        selectedMood,
        selectedTriggers,
        intensity,
        note,
        activePrompt,
        reflectionAnswer,
        backdateDays
      );

      // Reset form on success
      setSelectedMood(MoodLevel.OKAY);
      setIntensity(5);
      setSelectedTriggers([]);
      setNote("");
      setReflectionAnswer("");
      setBackdateDays(0);

      // Bounce user to history or insights to view entries
      setActiveTab("journal");
    } catch (err) {
      showToast("An error occurred while saving check-in.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedConfig = MOOD_LEVELS_CONFIG.find((c) => c.level === selectedMood) || MOOD_LEVELS_CONFIG[2];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
          Create A Wellness Entry
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Express yourself honestly. Checkins are fully confidential, encrypted, and stored locally.
        </p>
      </div>

      <form onSubmit={handleSaveCheckIn} id="journal-mood-form" className="space-y-6 rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        
        {/* 1. MOOD SELECTION ROW */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300">
            Step 1: Choose Your Current Mood Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {MOOD_LEVELS_CONFIG.map((m) => {
              const active = selectedMood === m.level;
              return (
                <button
                  key={m.level}
                  type="button"
                  onClick={() => setSelectedMood(m.level)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    active
                      ? `${m.bgClass} ring-2 ring-emerald-500/30 border-emerald-500 dark:ring-emerald-500/20`
                      : "border-gray-150 bg-white hover:bg-gray-50/50 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800"
                  }`}
                  aria-label={`Mood: ${m.label}, level ${m.level === MoodLevel.GREAT ? 1 : m.level === MoodLevel.GOOD ? 2 : 3} of 7`}
                >
                  <span className={`text-4xl transition duration-150 ${active ? "scale-110" : "scale-100"}`}>
                    {m.emoji}
                  </span>
                  <span className={`mt-2 text-2xs font-bold leading-none ${active ? m.color : "text-gray-500 dark:text-neutral-500"}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. INTENSITY SLIDER */}
        <div className="space-y-3 rounded-xl bg-gray-50/50 p-4 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800/60">
          <div className="flex items-center justify-between">
            <label htmlFor="intensity-range" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
              Step 2: Mood Intensity
            </label>
            <span className={`text-md font-bold px-2.5 py-0.5 rounded-md ${selectedConfig.bgClass} ${selectedConfig.color}`}>
              {intensity} / 10
            </span>
          </div>
          
          <input
            id="intensity-range"
            type="range"
            min="1"
            max="10"
            step="1"
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:bg-neutral-700 dark:accent-emerald-400"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
          />

          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400 mt-1">
            <HelpCircle size={13} className="text-emerald-500" />
            <span>Scale Context: <strong>{selectedConfig.intensityScale}</strong></span>
          </div>
        </div>

        {/* 3. STRESS TRIGGER BUTTONS */}
        <div id="trigger-selection" className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300">
            Step 3: What's impacting your well-being today? <span className="text-xs text-gray-400 font-normal">(Select multiple if applicable)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TRIGGERS_AVAILABLE.map((tag) => {
              const active = selectedTriggers.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTriggerToggle(tag)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    active
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/60"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800 dark:hover:bg-neutral-800"
                  }`}
                  aria-pressed={active}
                >
                  {active && <Check size={12} className="text-emerald-600 dark:text-emerald-400" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-COLUMN TEXT AREAS: JOURNAL AND REFLECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* JOURNAL NOTE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="journal-note" className="text-sm font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Notebook size={16} className="text-gray-400" />
                Step 4: Optional Journal Entry
              </label>
              <span className={`text-4xs font-semibold ${note.length > 500 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                {note.length} / 500
              </span>
            </div>
            <textarea
              id="journal-note"
              rows={4}
              maxLength={500}
              placeholder="How was your study slot? Any specific physics formula issues, mock test results, parental expectations... Express thoughts freely."
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-emerald-500"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* GUIDED REFLECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="reflection-answer" className="text-sm font-semibold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                <HelpCircle size={16} className="text-emerald-500" />
                Step 5: Guided Reflection Prompt
              </label>
              <span className={`text-4xs font-semibold ${reflectionAnswer.length > 500 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                {reflectionAnswer.length} / 500
              </span>
            </div>
            {/* Display the prompt question */}
            <div className="text-xs bg-emerald-50/40 border border-emerald-100/30 rounded-xl p-3 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-950/20 dark:text-emerald-300 leading-relaxed font-medium">
              💡 {activePrompt}
            </div>
            <textarea
              id="reflection-answer"
              rows={2.5}
              maxLength={500}
              placeholder="Reflect and answer honestly..."
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-emerald-500"
              value={reflectionAnswer}
              onChange={(e) => setReflectionAnswer(e.target.value)}
            />
          </div>

        </div>

        {/* 5. BACKDATED LOG FEATURE */}
        <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <label htmlFor="backdate-select" className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
              Log date option:
            </label>
            <select
              id="backdate-select"
              className="rounded-lg border border-gray-200 bg-white p-1 text-xs text-gray-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              value={backdateDays}
              onChange={(e) => setBackdateDays(parseInt(e.target.value))}
            >
              <option value="0">Today</option>
              <option value="1">Yesterday</option>
              <option value="2">2 Days Ago</option>
              <option value="3">3 Days Ago</option>
              <option value="4">4 Days Ago</option>
              <option value="5">5 Days Ago</option>
              <option value="6">6 Days Ago</option>
            </select>
          </div>

          <button
            id="btn-save-log"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer disabled:opacity-50 transition"
          >
            {isSubmitting ? "Saving Entry..." : "Save Today's Check-In"}
          </button>
        </div>

      </form>

    </div>
  );
};
