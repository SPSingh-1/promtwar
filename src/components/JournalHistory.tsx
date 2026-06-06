/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useMoodContext, useUIContext } from "./WellnessContext";
import { MoodLevel, StressTrigger, MoodEntry } from "../types";
import { MOOD_LEVELS_CONFIG } from "./HomeDashboard";
import { Search, Download, Trash, Calendar, ArrowUpDown, Filter, Sparkles, AlertTriangle } from "lucide-react";

export const JournalHistory: React.FC = () => {
  const { entries, clearAllUserData } = useMoodContext();
  const { showToast } = useUIContext();

  // Search/Filter states
  const [search, setSearch] = useState<string>("");
  const [filterMood, setFilterMood] = useState<string>("All");
  const [filterTrigger, setFilterTrigger] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);

  // 1. Generate 30-day Heatmap dates ending today
  const heatmapDays = useMemo(() => {
    const list: { dateStr: string; label: string; entry: MoodEntry | null }[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      
      // Find matching entry on this date (latest if multiple)
      const match = entries.find((e) => e.timestamp.startsWith(dateStr));
      list.push({
        dateStr,
        label,
        entry: match || null
      });
    }
    return list;
  }, [entries]);

  // 2. Filter & Sort main chronological list
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => {
        // Keyword Search (in note, guided answers, or triggers)
        const matchKeyword =
          search === "" ||
          e.note.toLowerCase().includes(search.toLowerCase()) ||
          e.reflectionAnswer.toLowerCase().includes(search.toLowerCase()) ||
          e.triggers.some((t) => t.toLowerCase().includes(search.toLowerCase()));

        // Filter by Mood Level
        const matchMood = filterMood === "All" || e.mood === filterMood;

        // Filter by Stress Trigger
        const matchTrigger =
          filterTrigger === "All" || e.triggers.includes(filterTrigger as StressTrigger);

        // Filter by clicked Heatmap cell date (if clicked)
        const matchHeatmapCell = !selectedHeatmapDate || e.timestamp.startsWith(selectedHeatmapDate);

        return matchKeyword && matchMood && matchTrigger && matchHeatmapCell;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [entries, search, filterMood, filterTrigger, sortOrder, selectedHeatmapDate]);

  // 3. Export data utility
  const handleExportDataAsJSON = () => {
    if (entries.length === 0) {
      showToast("No records found to export.", "warning");
      return;
    }

    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Aura_Wellness_Data_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Confidential JSON data exported successfully!", "success");
    } catch (e) {
      showToast("Data export failed.", "warning");
    }
  };

  // Helper colors for heatmap blocks
  const getHeatmapColor = (mood: MoodLevel | undefined) => {
    if (!mood) return "bg-gray-100 dark:bg-neutral-800 text-gray-400";
    switch (mood) {
      case MoodLevel.GREAT: return "bg-emerald-500 fill-emerald-500 text-white";
      case MoodLevel.GOOD: return "bg-teal-400 fill-teal-400 text-white";
      case MoodLevel.OKAY: return "bg-neutral-300 fill-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200";
      case MoodLevel.LOW: return "bg-amber-400 fill-amber-400 text-gray-900";
      case MoodLevel.ANXIOUS: return "bg-indigo-400 fill-indigo-400 text-white";
      case MoodLevel.BURNOUT: return "bg-orange-400 fill-orange-400 text-white";
      case MoodLevel.NUMB: return "bg-violet-400 fill-violet-400 text-white";
      default: return "bg-gray-100 dark:bg-neutral-800 text-gray-400";
    }
  };

  const hasEntries = entries.length > 0;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
            Journal logs & Heatmap
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Track chronological timelines, search reflective logs, and study emotional patterns.
          </p>
        </div>

        {/* Action Button: Export */}
        <button
          id="btn-export-json"
          onClick={handleExportDataAsJSON}
          className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:bg-neutral-800 self-start sm:self-auto border border-gray-200 dark:border-neutral-800"
        >
          <Download size={14} />
          Export Private JSON Data
        </button>
      </div>

      {/* 1. 30-DAY MOOD HEATMAP CALENDAR */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="30 Day heatmap dashboard chart">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-50 dark:border-neutral-800 mb-4">
          <div>
            <h2 className="text-md font-semibold text-gray-900 dark:text-neutral-200 flex items-center gap-1.5">
              <Calendar size={18} className="text-purple-500" />
              30-Day Mental Heatmap
            </h2>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              Each block represents a chronological calendar day. Click a block to isolate logs for that specific day.
            </p>
          </div>

          {selectedHeatmapDate && (
            <button
              onClick={() => setSelectedHeatmapDate(null)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Clear Date Filter ✖
            </button>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 w-full">
            {heatmapDays.map((day) => {
              const activeFilter = selectedHeatmapDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedHeatmapDate(day.dateStr)}
                  className={`relative group aspect-square rounded-md p-1.5 font-mono text-3xs font-bold transition flex flex-col justify-between items-center ${getHeatmapColor(day.entry?.mood)} ${
                    activeFilter ? "ring-3 ring-emerald-500 outline-none" : "hover:scale-105"
                  }`}
                  aria-label={`Date: ${day.label}. Mood: ${day.entry?.mood || "Missing log"} `}
                >
                  <span className="block">{day.label.split(" ")[0]}</span>
                  <span className="text-2xs leading-none">{day.entry?.emoji || "•"}</span>

                  {/* Tooltip on Hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center gap-0.5 bg-gray-900 text-white rounded text-5xs px-2 py-1 z-30 transition pointer-events-none whitespace-nowrap shadow-md dark:bg-neutral-850 border border-neutral-750 font-sans">
                    <strong>{day.label}</strong>
                    <span>{day.entry ? `${day.entry.mood} (${day.entry.intensity}/10)` : "No entry logged"}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Map Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-5xs font-semibold text-gray-500 uppercase tracking-wider mt-2 border-t border-gray-50 dark:border-neutral-800/40 pt-3">
            <span>Wellness scale:</span>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Great</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-teal-400" /> Good</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-neutral-300 dark:bg-neutral-700" /> Okay</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> Low</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-400" /> Anxious</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-400" /> Burnout</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-violet-400" /> Numb</div>
          </div>
        </div>
      </section>

      {/* 2. CHRONOLOGICAL SEARCH AND FILTERS */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="Filters dashboard inputs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search keyword..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Mood */}
          <div>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 focus:outline-none"
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
            >
              <option value="All">Filter Mood (All)</option>
              {MOOD_LEVELS_CONFIG.map((m) => (
                <option key={m.level} value={m.level}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Triggers */}
          <div>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 focus:outline-none"
              value={filterTrigger}
              onChange={(e) => setFilterTrigger(e.target.value)}
            >
              <option value="All">Filter Stressor (All)</option>
              <option value="Studies">Studies / Syllabus</option>
              <option value="Family">Family Pressure</option>
              <option value="Sleep">Sleep Issues</option>
              <option value="Comparison">Peer Comparison</option>
              <option value="Result Fear">Result Anxiety</option>
              <option value="Health">Physical Health</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>

          {/* Toggle Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 px-4 py-2 text-xs text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 hover:dark:bg-neutral-800 transition"
          >
            <ArrowUpDown size={14} />
            Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
          </button>

        </div>
      </section>

      {/* 3. LOG LISTS ARCHITECTURE */}
      <section className="space-y-4">
        {filteredEntries.length > 0 ? (
          <div className="space-y-4">
            {filteredEntries.map((item) => {
              const config = MOOD_LEVELS_CONFIG.find((m) => m.level === item.mood) || MOOD_LEVELS_CONFIG[2];
              const dateLocale = new Date(item.timestamp).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              });
              const timeLocale = new Date(item.timestamp).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit"
              });

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-150 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 transition duration-150 hover:shadow-md"
                >
                  {/* Top line with mood configuration */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-50 dark:border-neutral-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{config.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {item.mood}
                          </h3>
                          <span className={`text-4xs font-bold px-2 py-0.5 rounded ${config.bgClass} ${config.color}`}>
                            Intensity: {item.intensity}/10
                          </span>
                        </div>
                        <span className="block text-4xs font-semibold text-gray-400 dark:text-neutral-500 font-mono">
                          {dateLocale} • {timeLocale}
                        </span>
                      </div>
                    </div>

                    {/* Stress Trigger Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.triggers.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-rose-50 px-2 py-0.5 text-5xs font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                        >
                          ⚠️ {t}
                        </span>
                      ))}
                      {item.triggers.length === 0 && (
                        <span className="rounded bg-gray-55 px-2 py-0.5 text-5xs font-bold uppercase tracking-widest text-gray-400 dark:bg-neutral-800 dark:text-neutral-500 font-mono">
                          Calm Wave
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note block & Reflection block */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Note details */}
                    <div>
                      <h4 className="text-2xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                        Journal Reflection
                      </h4>
                      <p className="mt-1.5 text-xs text-gray-700 dark:text-neutral-300 leading-relaxed font-sans font-normal whitespace-pre-line">
                        {item.note || <em className="text-gray-450 italic">No notes logged during check-in.</em>}
                      </p>
                    </div>

                    {/* Reflection questions details */}
                    {item.reflectionAnswer && (
                      <div className="rounded-xl bg-gray-50/50 p-3.5 dark:bg-neutral-800/30 border border-gray-100 dark:border-neutral-800/50">
                        <span className="block text-5xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                          PROMPT: {item.reflectionPrompt}
                        </span>
                        <p className="mt-1.5 text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-sans italic">
                          "{item.reflectionAnswer}"
                        </p>
                      </div>
                    )}

                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div id="no-filtered-data" className="text-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 dark:border-neutral-800 dark:bg-neutral-900">
            <AlertTriangle className="mx-auto text-amber-500 animate-bounce" size={32} />
            <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No filtered logs found</h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
              Try adjusting your keyword searches or filter configurations.
            </p>
          </div>
        )}
      </section>

    </div>
  );
};
