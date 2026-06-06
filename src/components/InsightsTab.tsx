/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useMemo, useState } from "react";
import { useMoodContext, useUIContext } from "./WellnessContext";
import { analyzeMoodPatterns } from "../utils/wellnessData";
import { AlertTriangle, ShieldCheck, Zap, Sparkles, AlertCircle, TrendingUp, Calendar, Heart } from "lucide-react";

export const InsightsTab: React.FC = () => {
  const { entries, profile } = useMoodContext();
  const { setActiveTab } = useUIContext();

  const [loadingDeepInsights, setLoadingDeepInsights] = useState(false);
  const [deepInsights, setDeepInsights] = useState<{
    overallAssessment: string;
    copingStrategies: { title: string; description: string; actionText: string }[];
    burnoutWarning: string | null;
  } | null>(null);
  const [errorDeepInsights, setErrorDeepInsights] = useState<string | null>(null);

  const generateDeepInsights = async () => {
    setLoadingDeepInsights(true);
    setErrorDeepInsights(null);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          entries,
          examType: profile.examType,
          daysToExam
        })
      });
      if (!response.ok) {
        throw new Error("Failed to contact Gemini server endpoint.");
      }
      const data = await response.json();
      setDeepInsights(data);
    } catch (err: any) {
      console.error(err);
      setErrorDeepInsights(err.message || "An error occurred while fetching deep insights.");
    } finally {
      setLoadingDeepInsights(false);
    }
  };

  // Calculate countdown days to feed the analyzer
  const daysToExam = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(profile.examDate);
    examDate.setHours(0, 0, 0, 0);
    return Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [profile.examDate]);

  // Run the rule-based AI pattern engine
  const report = useMemo(() => {
    return analyzeMoodPatterns(entries, profile.examType, daysToExam);
  }, [entries, profile.examType, daysToExam]);

  // SVG calculations for Circular Progress Gauge (radius 40, circumference ~251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.weeklyAverageValue / 100) * circumference;

  // Determine colors based on average score
  const getGaugeColorClass = (score: number) => {
    if (score >= 75) return "stroke-emerald-500 text-emerald-600";
    if (score >= 55) return "stroke-teal-400 text-teal-600";
    if (score >= 40) return "stroke-amber-400 text-amber-600";
    return "stroke-rose-500 text-rose-600";
  };

  const getRiskBadgeStyles = (level: "Low" | "Medium" | "High") => {
    switch (level) {
      case "High":
        return "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400";
      case "Medium":
        return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/25 dark:border-amber-900/30 dark:text-amber-400";
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/25 dark:border-emerald-900/30 dark:text-emerald-400";
    }
  };

  const hasHistory = entries.length > 0;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
          AI Mental Insights
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Advanced analytics mapping check-in values and exam schedules to protect student cognitive endurance.
        </p>
      </div>

      {!hasHistory ? (
        <div className="text-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
          <AlertCircle className="mx-auto text-emerald-500 animate-pulse" size={36} />
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">No analytics logged yet</h3>
          <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">
            Log your mood, triggers, and notes for 2+ days to generate specialized burnout analytics.
          </p>
          <button
            onClick={() => setActiveTab("mood")}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer"
          >
            Create First Wellness Log
          </button>
        </div>
      ) : (
        <>
          {/* Gemini Deep AI Insights Card */}
          <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-6 dark:border-neutral-800 dark:from-neutral-900/60 dark:to-neutral-900 shadow-xs" role="region" aria-label="Gemini Deep AI Insights">
            {/* Decorative background glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl dark:bg-indigo-400/5" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl dark:bg-purple-400/5" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-indigo-905 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-500 animate-pulse" />
                  Gemini Deep AI Counselor
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  Unlock dynamic, hyper-personalized cognitive analysis powered by Gemini 2.5.
                </p>
              </div>
              {!deepInsights && !loadingDeepInsights && (
                <button
                  onClick={generateDeepInsights}
                  className="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4.5 py-2.5 shadow-sm active:translate-y-0.5 hover:-translate-y-0.5 transition duration-150 cursor-pointer dark:bg-indigo-500 dark:hover:bg-indigo-400 flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  Generate Deep Insights
                </button>
              )}
            </div>

            {loadingDeepInsights && (
              <div className="mt-6 flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs text-indigo-650 dark:text-indigo-400 font-semibold uppercase tracking-wider font-mono animate-pulse">
                  Consulting Aura AI...
                </p>
              </div>
            )}

            {errorDeepInsights && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400">
                <p className="font-semibold flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Failed to generate deep insights:
                </p>
                <p className="mt-1 font-mono">{errorDeepInsights}</p>
              </div>
            )}

            {deepInsights && (
              <div className="mt-6 space-y-5 border-t border-indigo-100/50 dark:border-neutral-800 pt-5 animate-fade-in">
                {deepInsights.burnoutWarning && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs dark:bg-rose-950/20 dark:border-rose-900 text-rose-800 dark:text-rose-400 font-semibold flex items-center gap-2">
                    <AlertTriangle className="animate-bounce shrink-0" size={16} />
                    <span>{deepInsights.burnoutWarning}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    Gemini Clinical Evaluation
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-neutral-300 leading-relaxed bg-white/50 dark:bg-neutral-950/30 p-4 rounded-xl border border-indigo-50/30 dark:border-neutral-850/40">
                    {deepInsights.overallAssessment}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    Tailored Coping Interventions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deepInsights.copingStrategies.map((s, idx) => (
                      <div key={idx} className="rounded-xl border border-indigo-50/50 bg-indigo-50/10 p-4 dark:border-neutral-800/50 dark:bg-neutral-900/50 flex flex-col justify-between hover:border-indigo-100 dark:hover:border-neutral-700 transition">
                        <div>
                          <span className="text-5xs uppercase bg-indigo-100/60 dark:bg-indigo-950/40 font-bold px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-400 font-mono">
                            Intervention {idx + 1}
                          </span>
                          <h5 className="mt-2.5 text-xs font-bold text-gray-900 dark:text-white">
                            {s.title}
                          </h5>
                          <p className="mt-1.5 text-4xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                            {s.description}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (s.actionText.toLowerCase().includes("breath") || s.actionText.toLowerCase().includes("pranayama") || s.actionText.toLowerCase().includes("grounding") || s.actionText.toLowerCase().includes("support")) {
                              setActiveTab("support");
                            } else {
                              setActiveTab("mood");
                            }
                          }}
                          className="mt-3.5 text-4xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5 dark:text-indigo-400 self-start text-left cursor-pointer"
                        >
                          Action: {s.actionText} ➔
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={generateDeepInsights}
                    className="rounded-xl border border-indigo-200 dark:border-neutral-700 hover:bg-indigo-50/30 dark:hover:bg-neutral-800/50 text-indigo-700 dark:text-indigo-400 font-semibold text-5xs px-3.5 py-2 transition cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={10} />
                    Re-analyze
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT BENTO BLOCK: MOOD GAUGE & DAY STATISTICS */}
          <div className="space-y-6">
            
            {/* Weekly Average Circular Gauge */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs text-center flex flex-col items-center justify-center min-h-[250px]" role="region" aria-label="Circular average wellness meter">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-200 mb-4">
                Weekly Wellness Score
              </h3>

              {/* SVG Ring Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(156, 163, 175, 0.12)"
                    strokeWidth="8"
                  />
                  {/* Fill Circle */}
                  <circle
                    id="insights-progress-circle"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    className={`${getGaugeColorClass(report.weeklyAverageValue)} transition-all duration-500`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Score labeling in absolute center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {report.weeklyAverageValue}
                  </span>
                  <span className="text-5xs uppercase tracking-widest text-gray-400 dark:text-neutral-500 font-bold">
                    Index Metric
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs font-medium text-gray-600 dark:text-neutral-300">
                Current rating: <span className="font-bold">{report.weeklyAverageValue >= 75 ? "Excellent Status 🎉" : report.weeklyAverageValue >= 55 ? "Stable Wave 🙂" : report.weeklyAverageValue >= 40 ? "Anxiety warning ⚠️" : "Urgent Rest Needed 😩"}</span>
              </div>
            </section>

            {/* Weekday Analysis (Best & Worst) */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="Weekday productivity statistics">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-200 mb-4 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-teal-500" />
                Weekday Variance Analysis
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-emerald-50/30 p-3 border border-emerald-100/20 dark:bg-emerald-950/5 dark:border-neutral-800">
                  <span className="block text-5xs uppercase tracking-widest font-mono text-emerald-600 dark:text-emerald-400">
                    Statistically Best
                  </span>
                  <p className="text-md font-bold text-gray-800 dark:text-white mt-1">
                    {report.bestDay}
                  </p>
                  <span className="text-5xs text-gray-400">Peak emotional clarity</span>
                </div>

                <div className="rounded-xl bg-orange-50/30 p-3 border border-orange-100/20 dark:bg-orange-950/5 dark:border-neutral-800">
                  <span className="block text-5xs uppercase tracking-widest font-mono text-orange-600 dark:text-orange-400">
                    Statistically Low
                  </span>
                  <p className="text-md font-bold text-gray-800 dark:text-white mt-1">
                    {report.worstDay}
                  </p>
                  <span className="text-5xs text-gray-400">Highest study fatigue</span>
                </div>
              </div>
            </section>

          </div>

          {/* MIDDLE COLUMN: STRESSOR CHART & BURNOUT RATIO */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Burnout Risk Detection Panel */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="Burnout risk profile">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-50 dark:border-neutral-800/60 mb-4">
                <h3 className="text-sm font-semibold text-gray-950 dark:text-neutral-200 flex items-center gap-1.5">
                  <Zap size={16} className="text-rose-500 animate-pulse" />
                  Burnout Risk Assessment
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getRiskBadgeStyles(report.burnoutRiskLevel)}`}>
                  {report.burnoutRiskLevel} Risk
                </span>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800/60">
                <div className="shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 p-2.5 h-10 w-10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="animate-bounce" size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                    Diagnostic Analysis
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-neutral-300 mt-1 leading-relaxed">
                    {report.burnoutRationale}
                  </p>
                </div>
              </div>

              {report.burnoutRiskLevel === "High" && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs dark:bg-rose-950/20 dark:border-rose-900">
                  <p className="text-rose-800 dark:text-rose-400 font-semibold flex items-center gap-1">
                    ⚠️ Acute distress detected. Call accredited helpline:
                  </p>
                  <p className="mt-1 text-rose-700 dark:text-rose-300">
                     iCall India: <strong>9152987821</strong> • Vandrevala Support: <strong>1860-2662-345</strong>
                  </p>
                </div>
              )}
            </section>

            {/* Stress Triggers Bar Chart */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="Stressor triggers comparison board">
              <h3 className="text-sm font-semibold text-gray-950 dark:text-neutral-200 mb-2">
                Identified Stress Triggers
              </h3>
              <p className="text-xs text-gray-400 mb-4 dark:text-neutral-500Label">
                Cumulative check-in stressors tally. Tackle the highest block first!
              </p>

              {report.topTriggers.length > 0 ? (
                <div className="space-y-3.5">
                  {report.topTriggers.map((item) => {
                    const maxCount = Math.max(...report.topTriggers.map((t) => t.count));
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={item.trigger} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-neutral-300">
                          <span>{item.trigger}</span>
                          <span>{item.count} time{item.count !== 1 ? "s" : ""}</span>
                        </div>
                        {/* Horizontal Bar */}
                        <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-neutral-500 italic">
                  No stress incidents logged yet. Your study cycles appear balanced!
                </p>
              )}
            </section>

            {/* Exam Proximity Report */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="Mood around exams report">
              <h3 className="text-sm font-semibold text-gray-950 dark:text-neutral-200 mb-3 flex items-center gap-1.5">
                <Calendar size={16} className="text-purple-500" />
                Mood around Exams
              </h3>
              <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed bg-purple-50/30 border border-purple-100/10 rounded-xl p-4 dark:bg-neutral-850 dark:border-neutral-800">
                {report.moodAroundExamsReport}
              </p>
            </section>

          </div>

        </div>
      </>
    )}

      {/* THREE ACTION RECOMMENDATIONS CARDS (Bento Grid Style) */}
      {hasHistory && (
        <section className="space-y-4" role="region" aria-label="AI customized guidance block">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-500 shrink-0" size={18} />
            <h3 className="text-md font-bold text-gray-900 dark:text-neutral-250">
              Personalized AI Study-Care Action Plan
            </h3>
          </div>

          <div id="ai-insights-bento" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {report.aiSuggestions.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-100 bg-emerald-50/10 p-5 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-xs flex flex-col justify-between hover:-translate-y-0.5 transition duration-150"
              >
                <div>
                  <span className="text-3xs uppercase fill-emerald-800 bg-emerald-100/40 font-bold px-2 py-0.5 rounded text-emerald-850 dark:bg-emerald-950/30 dark:text-emerald-300">
                    Strategy {idx + 1}
                  </span>
                  <h4 className="mt-3.5 text-xs font-bold text-gray-900 dark:text-white">
                    {s.title}
                  </h4>
                  <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400 leading-relaxed font-sans font-normal">
                    {s.text}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (s.action.includes("Breathing")) {
                      setActiveTab("support");
                    } else if (s.action.includes("Journal")) {
                      setActiveTab("mood");
                    } else if (s.action.includes("Support")) {
                      setActiveTab("support");
                    } else {
                      setActiveTab("mood");
                    }
                  }}
                  className="mt-4 text-2xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5 dark:text-emerald-400 self-start text-left cursor-pointer"
                >
                  Action Plan: {s.action} ➔
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
