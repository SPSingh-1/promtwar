/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { useMoodContext, useUIContext } from "./WellnessContext";
import { MoodLevel, StressTrigger } from "../types";
import { MOTIVATIONAL_QUOTES, WELLNESS_TIPS } from "../utils/wellnessData";
import { Flame, Calendar, Sparkles, Plus, AlertCircle, ArrowRight, Heart } from "lucide-react";

/**
 * Mood levels configure block for emojis, weights, and styling.
 */
export const MOOD_LEVELS_CONFIG = [
  { level: MoodLevel.GREAT, emoji: "😄", label: "Great", color: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30", intensityScale: "Productive, peaceful, happy, fully focused" },
  { level: MoodLevel.GOOD, emoji: "😊", label: "Good", color: "text-teal-600 dark:text-teal-400", bgClass: "bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/30", intensityScale: "Comfortable, calm, ready to study" },
  { level: MoodLevel.OKAY, emoji: "😐", label: "Okay", color: "text-neutral-600 dark:text-neutral-400", bgClass: "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-150 dark:border-neutral-800", intensityScale: "Moderate focus, feeling neutral" },
  { level: MoodLevel.LOW, emoji: "😟", label: "Low", color: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30", intensityScale: "Exhausted, low retention, isolated" },
  { level: MoodLevel.ANXIOUS, emoji: "😰", label: "Anxious", color: "text-indigo-600 dark:text-indigo-400", bgClass: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30", intensityScale: "Result panic, racing heart, can't focus" },
  { level: MoodLevel.BURNOUT, emoji: "😩", label: "Burnout", color: "text-orange-600 dark:text-orange-400", bgClass: "bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30", intensityScale: "Physical collapse, hopeless, numb brain" },
  { level: MoodLevel.NUMB, emoji: "😶", label: "Numb", color: "text-violet-600 dark:text-violet-400", bgClass: "bg-violet-50 dark:bg-violet-950/20 border-violet-150 dark:border-violet-900/30", intensityScale: "Detached, unresponsive to efforts" }
];

export const HomeDashboard: React.FC = () => {
  const { entries, profile, addMoodEntry, seedSampleData } = useMoodContext();
  const { setActiveTab, showToast } = useUIContext();

  // 1. Calculate Countdown
  const countdownDetails = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(profile.examDate);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: diffDays,
      isOver: diffDays < 0,
      isToday: diffDays === 0
    };
  }, [profile.examDate]);

  // 2. Select Tip of the Day (Rotates based on day of month)
  const dailyTip = useMemo(() => {
    const day = new Date().getDate();
    return WELLNESS_TIPS[day % WELLNESS_TIPS.length];
  }, []);

  // 3. Select Motivational Quote (Rotates based on day of week)
  const dailyQuote = useMemo(() => {
    const day = new Date().getDay();
    return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
  }, []);

  // 4. Quick-Log Handlers
  const handleQuickLog = async (mood: MoodLevel) => {
    try {
      await addMoodEntry(
        mood,
        [], // Empty triggers for quick log
        5,  // Neutral intensity
        "Quick-logged on Home Screen.",
        "What went well in today's quick check-in?",
        "No specific comments.",
        0   // Today
      );
      showToast(`Quick logged today as ${mood}! Add triggers in the Mood tab.`, "success");
    } catch (e) {
      showToast("Could not save quick check-in.", "warning");
    }
  };

  // 5. Weekly Mood Trend Data (Past 7 days)
  const trendData = useMemo(() => {
    const points: { dateStr: string; label: string; score: number }[] = [];
    const now = new Date();
    
    // Create 7 dates ending today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
      points.push({ dateStr, label: dayLabel, score: 0 });
    }

    // Map scores: GREAT=100, GOOD=80, OKAY=60, LOW=40, ANXIOUS=30, NUMB=20, BURNOUT=10
    const moodMapping: Record<MoodLevel, number> = {
      [MoodLevel.GREAT]: 100,
      [MoodLevel.GOOD]: 80,
      [MoodLevel.OKAY]: 60,
      [MoodLevel.LOW]: 40,
      [MoodLevel.ANXIOUS]: 30,
      [MoodLevel.NUMB]: 20,
      [MoodLevel.BURNOUT]: 10,
    };

    points.forEach((pt) => {
      // Find matching entry on same date
      const match = entries.find((e) => e.timestamp.startsWith(pt.dateStr));
      if (match) {
        pt.score = moodMapping[match.mood];
      } else {
        pt.score = 0; // Means missing
      }
    });

    return points;
  }, [entries]);

  // SVG dimensions for the trend chart
  const hasHistory = useMemo(() => entries.length > 0, [entries]);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Panel */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 dark:from-emerald-950/20 dark:via-neutral-900 border border-emerald-100/40 dark:border-neutral-800" role="region" aria-label="Welcome Status Summary">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
            Keep Calming, Keep Preparing.
          </h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400 max-w-lg">
            Aura protects your resilience while studying for the **{profile.examType}** exam. Check in daily to detect burnout before it halts your momentum.
          </p>
        </div>

        {/* Quick Seed Action for evaluating review (if empty) */}
        {!hasHistory && (
          <div className="flex flex-col items-start gap-2 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl p-3 bg-white/50 dark:bg-neutral-900 max-w-sm">
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              No entries compiled yet. Aura is fully offline and privacy-preserved.
            </p>
            <button
              id="btn-seed-data"
              onClick={seedSampleData}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
            >
              <Sparkles size={12} />
              Seed 14-Day Demo Entries
            </button>
          </div>
        )}

        {/* Streak & Countdown Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Streak Badge */}
          <div 
            id="streak-badge"
            className="flex items-center gap-2.5 rounded-xl bg-orange-50 px-4 py-2.5 text-orange-700 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400 animate-slide-in-right"
          >
            <Flame className="animate-pulse" size={20} />
            <div>
              <span className="block text-xs uppercase tracking-wider text-orange-500 font-bold">Check-in Streak</span>
              <span className="text-lg font-bold">{profile.streakCount} Day{profile.streakCount !== 1 ? "s" : ""} 🔥</span>
            </div>
          </div>

          {/* Exam Countdown Badge */}
          <div 
            id="exam-countdown-badge"
            className="flex items-center gap-2.5 rounded-xl bg-purple-50 px-4 py-2.5 text-purple-700 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400"
          >
            <Calendar size={20} />
            <div>
              <span className="block text-xs uppercase tracking-wider text-purple-500 font-bold">{profile.examType} Countdown</span>
              <span className="text-lg font-bold">
                {countdownDetails.isOver ? (
                  "Completed"
                ) : countdownDetails.isToday ? (
                  "Exam is Today!"
                ) : (
                  `${countdownDetails.days} Day${countdownDetails.days !== 1 ? "s" : ""} Left`
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Quick Log & Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Mood Log Panel */}
        <section className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/80 shadow-xs" role="region" aria-label="Today mood logging shortcut">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-md font-semibold text-gray-900 dark:text-neutral-200 flex items-center gap-2">
              <Plus id="plus-icon" size={18} className="text-emerald-500" />
              How are you feeling right now?
            </h2>
            <button
              id="goto-mood-logger"
              onClick={() => setActiveTab("mood")}
              className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-0.5 dark:text-emerald-400"
            >
              Full Log Grid <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {MOOD_LEVELS_CONFIG.map((m) => (
              <button
                key={m.level}
                onClick={() => handleQuickLog(m.level)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 bg-gray-50/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all dark:bg-neutral-800/60 dark:border-neutral-800 dark:hover:bg-emerald-950/10 dark:hover:border-emerald-900/60 group"
                aria-label={`Quick Log: ${m.label}`}
              >
                <span className="text-3xl transition-transform group-hover:scale-120 group-active:scale-95 duration-150">
                  {m.emoji}
                </span>
                <span className="mt-1.5 text-2xs font-semibold text-gray-500 dark:text-neutral-400">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Quotes Panel */}
        <section className="rounded-2xl border border-gray-100 bg-emerald-50/30 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 shadow-xs flex flex-col justify-between" role="region" aria-label="Daily exam motivation Quote">
          <div>
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 text-4xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              Exam Fuel
            </span>
            <p className="mt-3 text-sm italic text-gray-700 dark:text-neutral-300 leading-relaxed font-serif">
              "{dailyQuote.quote}"
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-emerald-100/40 dark:border-neutral-800 pt-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
              — {dailyQuote.author}
            </span>
            <span className="text-5xs text-gray-400 uppercase tracking-widest font-mono">
              Daily Recharge
            </span>
          </div>
        </section>

      </div>

      {/* Grid: Trend Line & Tip of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend Line Chart */}
        <section className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/80 shadow-xs" role="region" aria-label="Weekly mood trend analyzer">
          <h2 className="text-md font-semibold text-gray-900 dark:text-neutral-200">
            7-Day Wellness Journey
          </h2>
          <p className="text-xs text-gray-500 mb-4 dark:text-neutral-400">
            Visualization of logged check-in values over the past week (higher score indicates higher emotional safety).
          </p>

          {/* SVG RENDERING */}
          <div className="h-44 w-full flex items-center justify-center bg-gray-50/50 dark:bg-neutral-800/30 rounded-xl p-2 relative overflow-hidden">
            {hasHistory ? (
              <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible" aria-label="7 Day mood timeline chart">
                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(156, 163, 175, 0.15)" strokeDasharray="3" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(156, 163, 175, 0.15)" strokeDasharray="3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(156, 163, 175, 0.15)" strokeDasharray="3" />

                {/* Y-Axis guide names */}
                <text x="5" y="25" className="text-5xs fill-gray-400 font-mono">GREAT</text>
                <text x="5" y="75" className="text-5xs fill-gray-400 font-mono">OKAY</text>
                <text x="5" y="125" className="text-5xs fill-gray-400 font-mono">BURNOUT</text>

                {/* Draw Trend Line path */}
                {(() => {
                  const width = 600;
                  const step = width / 6;
                  const points = trendData.map((pt, i) => {
                    const x = i * step + 30; // inset helper
                    // Map score 0-100 to y coordinate (20 is top, 130 is bottom)
                    // If no log recorded (score 0), map to y coordinate 130 but show dashed or disconnected indicators
                    const score = pt.score > 0 ? pt.score : 30; // default anxiety line
                    const y = 140 - (score / 100) * 110;
                    return { x, y, active: pt.score > 0 };
                  });

                  // Compile SVG polyline path
                  const pathD = points
                    .filter(p => p.active)
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                    .join(" ");

                  return (
                    <>
                      {/* Gradient Fill under line */}
                      {pathD && <path 
                        d={`${pathD} L ${points[points.length-1].x} 140 L ${points[0].x} 140 Z`} 
                        fill="url(#grad-chart)" 
                        className="opacity-20 dark:opacity-10"
                      />}

                      {/* Main Trend Stroke Line */}
                      {pathD ? (
                        <path 
                          d={pathD} 
                          fill="none" 
                          stroke="#7CB342" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      ) : (
                        <path d="M 30 130 Q 300 130 570 130" fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4" />
                      )}

                      {/* Interactive dot markers */}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          {p.active ? (
                            <>
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="5.5" 
                                className="fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-neutral-900" 
                                strokeWidth="2.5" 
                              />
                              <circle cx={p.x} cy={p.y} r="10" className="fill-emerald-500 opacity-0 hover:opacity-20 transition" cursor="pointer" />
                            </>
                          ) : (
                            <circle cx={p.x} cy={135} r="3" className="fill-gray-300 dark:fill-neutral-700" />
                          )}
                          <text 
                            x={p.x} 
                            y="155" 
                            textAnchor="middle" 
                            className="text-5xs fill-gray-400 dark:fill-neutral-500 font-mono font-bold"
                          >
                            {trendData[idx].label}
                          </text>
                        </g>
                      ))}

                      {/* Gradients configurations */}
                      <defs>
                        <linearGradient id="grad-chart" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#7CB342" />
                          <stop offset="100%" stopColor="#7CB342" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div id="no-history-placeholder" className="text-center p-4">
                <p className="text-sm font-semibold text-gray-400 dark:text-neutral-500">
                  No weekly mood history logged yet.
                </p>
                <button
                  onClick={() => setActiveTab("mood")}
                  className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold underline"
                >
                  Create your first log to start chart
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Rotating Tip of the Day */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/80 shadow-xs flex flex-col justify-between" role="region" aria-label="Rotating mental wellness advice">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-md mb-2">
              <Sparkles className="animate-spin-slow shrink-0" size={18} />
              <h3>Pranayama Tip of Day</h3>
            </div>
            
            <span className="rounded-md bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              {dailyTip.category}
            </span>
            <p className="mt-3 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
              {dailyTip.content}
            </p>
          </div>

          <div className="mt-4 border-t border-gray-100 dark:border-neutral-800 pt-3 flex items-center justify-between text-4xs text-gray-400 font-mono uppercase tracking-wider">
            <span>Verified By: {dailyTip.source}</span>
            <Heart size={10} className="text-rose-500 fill-rose-500" />
          </div>
        </section>

      </div>

    </div>
  );
};
