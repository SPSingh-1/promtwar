/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useUIContext, useMoodContext } from "./WellnessContext";
import { MoodLevel } from "../types";
import { Phone, ShieldAlert, Heart, Wind, Sparkles, CheckCircle, Eye, EyeOff, ClipboardList, PenTool, BookOpen } from "lucide-react";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale";

export const SupportPanel: React.FC = () => {
  const { showToast } = useUIContext();
  const { addMoodEntry } = useMoodContext();

  // --- BREATHING PRANAYAMA STATE MACHINE ---
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (breathPhase === "idle") {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    breathTimerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Transition to next state in 4-7-8 sequence
          if (breathPhase === "inhale") {
            setBreathPhase("hold");
            return 7; // Hold for 7 seconds
          } else if (breathPhase === "hold") {
            setBreathPhase("exhale");
            return 8; // Exhale for 8 seconds
          } else if (breathPhase === "exhale") {
            setBreathPhase("inhale");
            return 4; // Loop back, Inhale for 4s
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [breathPhase]);

  const startBreathing = () => {
    setBreathPhase("inhale");
    setSecondsLeft(4);
    showToast("Starting 4-7-8 Calm Breath cycle. Expand chest with the circle...", "info");
  };

  const stopBreathing = () => {
    setBreathPhase("idle");
    setSecondsLeft(0);
    showToast("Breathing exercise completed. Nice job focusing!", "success");
  };

  const getPhaseText = () => {
    switch (breathPhase) {
      case "inhale": return "Breathe In Slowly...";
      case "hold": return "Hold Breath Deeply...";
      case "exhale": return "Exhale Gently (Hissing sound)...";
      default: return "Ready?";
    }
  };

  const getCircleScaleClass = () => {
    if (breathPhase === "inhale") return "scale-140 duration-[4000ms] bg-emerald-500/30";
    if (breathPhase === "hold") return "scale-140 bg-purple-500/30";
    if (breathPhase === "exhale") return "scale-100 duration-[8000ms] bg-teal-500/30";
    return "scale-100 bg-gray-200/50 dark:bg-neutral-850";
  };

  // --- 5-4-3-2-1 GROUNDING TECHNIQUE ---
  const [groundSights, setGroundSights] = useState<string[]>(["", "", "", "", ""]);
  const [groundTouches, setGroundTouches] = useState<string[]>(["", "", "", ""]);
  const [groundSounds, setGroundSounds] = useState<string[]>(["", "", ""]);
  const [groundScents, setGroundScents] = useState<string[]>(["", ""]);
  const [groundTaste, setGroundTaste] = useState<string>("");
  const [groundingLocked, setGroundingLocked] = useState<boolean>(false);

  const handleResetGrounding = () => {
    setGroundSights(["", "", "", "", ""]);
    setGroundTouches(["", "", "", ""]);
    setGroundSounds(["", "", ""]);
    setGroundScents(["", ""]);
    setGroundTaste("");
    setGroundingLocked(false);
    showToast("Grounding panel reset.", "info");
  };

  const handleLockGrounding = () => {
    setGroundingLocked(true);
    showToast("Anxiety Grounding slots compiled. Breathe slowly.", "success");
  };

  // --- SELF-CARE CHECKLIST (LocalStorage persisted) ---
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    const raw = localStorage.getItem("wellness_support_checklist");
    if (raw) {
      try { return JSON.parse(raw); } catch { return {}; }
    }
    return {
      water: false,
      posture: false,
      stretch: false,
      eyes: false,
      family: false,
      syllabus: false
    };
  });

  const handleChecklistToggle = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem("wellness_support_checklist", JSON.stringify(updated));
    if (updated[key]) {
      showToast("Awesome self-care achievement checked!", "success");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
          Support Desk & Exercises
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Interactive sensory exercises, physical checklist counters, and emergency certified helplines.
        </p>
      </div>

      {/* Grid structure: 4-7-8 breathing & Crisis Support info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Breathing Pranayama exercise block (Lg span 2) */}
        <section className="lg:col-span-2 rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col justify-between" role="region" aria-label="Interactive pranayama engine">
          <div>
            <div className="flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-neutral-800 mb-4">
              <Wind className="text-emerald-500 animate-spin-slow" size={20} />
              <h2 className="text-md font-bold text-gray-950 dark:text-neutral-200">
                4-7-8 Pranayama Calm (Anti-Panic Valve)
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mb-6">
              Specifically formulated to lower autonomic arousal. Inhale for 4 seconds, hold for 7 seconds, then exhale completely for 8 seconds. Complete 4 rounds.
            </p>
          </div>

          {/* BREATHING BOX CONTAINER */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              
              {/* Pulsating animation scale rings */}
              <div 
                id="breathing-pulsator"
                className={`absolute w-36 h-36 rounded-full border border-emerald-300 transition-all ease-linear ${getCircleScaleClass()}`}
              />

              {/* Absolute core button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-3">
                <span className="text-xs font-bold text-gray-400 dark:text-neutral-500">
                  {breathPhase !== "idle" ? `${secondsLeft}s` : "Relax"}
                </span>
                <p className="text-xs font-extrabold text-emerald-850 dark:text-emerald-400 transition-all duration-300 mt-1 max-w-[110px]">
                  {getPhaseText()}
                </p>
              </div>

            </div>

            {/* Buttons Controls */}
            <div className="mt-8 flex gap-4">
              {breathPhase === "idle" ? (
                <button
                  id="btn-breath-start"
                  onClick={startBreathing}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer"
                >
                  Begin Deep Breath
                </button>
              ) : (
                <button
                  id="btn-breath-stop"
                  onClick={stopBreathing}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400 cursor-pointer"
                >
                  Halt Exercise
                </button>
              )}
            </div>
          </div>
        </section>

        {/* CRISIS SUPPORT PANEL */}
        <section className="rounded-2xl border border-gray-150 bg-rose-50/25 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 shadow-xs flex flex-col justify-between" role="region" aria-label="Crisis Support contacts">
          <div className="space-y-4">
            <span className="rounded-md bg-rose-100 dark:bg-rose-950/50 border border-rose-200/45 px-2 py-0.5 text-4xs font-bold uppercase tracking-widest text-rose-800 dark:text-rose-450 flex items-center gap-1 self-start w-fit">
              <ShieldAlert size={12} />
              URGENT COUNSEL DESK
            </span>

            <h2 className="text-md font-bold text-gray-900 dark:text-white leading-tight">
              Indian Clinical Student Helplines
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
              Tackling syllabus loads, family comparisons, or mock test results can take an immense emotional toll. Speaking with certified counselors is completely anonymous and protects your well-being.
            </p>

            <div className="space-y-3 pt-2">
              
              {/* iCall Support line */}
              <div className="rounded-xl bg-white border border-rose-100 p-3.5 dark:bg-neutral-900 dark:border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">iCall (TISS, Mumbai)</h4>
                  <span className="text-5xs text-gray-400 block mt-0.5 uppercase tracking-wider font-mono">Mon-Sat, 10 AM - 8 PM</span>
                  <p className="text-sm font-bold text-gray-800 dark:text-neutral-200 mt-1">9152987821</p>
                </div>
                <a 
                  href="tel:9152987821" 
                  className="rounded-full bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition dark:bg-rose-950/45 dark:text-rose-400"
                  aria-label="Call iCall support hotline"
                >
                  <Phone size={15} />
                </a>
              </div>

              {/* Vandrevala support line */}
              <div className="rounded-xl bg-white border border-rose-100 p-3.5 dark:bg-neutral-900 dark:border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">Vandrevala Foundation</h4>
                  <span className="text-5xs text-gray-400 block mt-0.5 uppercase tracking-wider font-mono">24x7 Clinical Hotline</span>
                  <p className="text-sm font-bold text-gray-800 dark:text-neutral-200 mt-1">1860-2662-345</p>
                </div>
                <a 
                  href="tel:18602662345" 
                  className="rounded-full bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition dark:bg-rose-950/45 dark:text-rose-400"
                  aria-label="Call Vandrevala support hotline"
                >
                  <Phone size={15} />
                </a>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-150/50 dark:border-neutral-800/60 flex items-center gap-1.5 text-5xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
            <Heart size={10} className="fill-rose-500 text-rose-500 animate-pulse" />
            <span>Protecting Indian Students 365 Days</span>
          </div>
        </section>

      </div>

      {/* Grid: 5-4-3-2-1 Grounding & Self Care checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 5-4-3-2-1 SENSORY DE-ESCALATION CONSOLE */}
        <section className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="Sensory Grounding tool">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-neutral-800 mb-4 justify-between">
            <div className="flex items-center gap-1.5">
              <Eye className="text-purple-500" size={18} />
              <h2 className="text-md font-bold text-gray-950 dark:text-neutral-200">
                5-4-3-2-1 Anxiety Grounding Console
              </h2>
            </div>
            
            <button
              onClick={handleResetGrounding}
              className="text-5xs font-bold text-gray-400 hover:text-rose-500 uppercase tracking-widest"
            >
              Reset slots
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
            If experiencing rapid exam-driven breathing or heart racing, list sensory items in your surroundings to anchor yourself instantly.
          </p>

          <div className="space-y-3">
            
            {/* 5 Things You See */}
            <div className="space-y-1">
              <span className="block text-4xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                👁️ 5 Sights (Things you see on study desk, walls):
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {groundSights.map((val, idx) => (
                  <input
                    key={`sight-${idx}`}
                    type="text"
                    disabled={groundingLocked}
                    className="rounded-lg border border-gray-200 p-1.5 text-5xs bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    placeholder={`Sight ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const updated = [...groundSights];
                      updated[idx] = e.target.value.substring(0, 30);
                      setGroundSights(updated);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 4 Things You Touch */}
            <div className="space-y-1">
              <span className="block text-4xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                ✋ 4 Touch points (Cloth fabric, table smoothness, cold cup):
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {groundTouches.map((val, idx) => (
                  <input
                    key={`touch-${idx}`}
                    type="text"
                    disabled={groundingLocked}
                    className="rounded-lg border border-gray-200 p-1.5 text-5xs bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    placeholder={`Touch ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const updated = [...groundTouches];
                      updated[idx] = e.target.value.substring(0, 30);
                      setGroundTouches(updated);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 3 Things You Hear */}
            <div className="space-y-1">
              <span className="block text-4xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                👂 3 Sounds (Fan humming, street cars, page rustles):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {groundSounds.map((val, idx) => (
                  <input
                    key={`sound-${idx}`}
                    type="text"
                    disabled={groundingLocked}
                    className="rounded-lg border border-gray-200 p-1.5 text-5xs bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    placeholder={`Sound ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const updated = [...groundSounds];
                      updated[idx] = e.target.value.substring(0, 30);
                      setGroundSounds(updated);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 2 Things You Smell */}
            <div className="space-y-1">
              <span className="block text-4xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                👃 2 Scents (Aroma of tea, wet mud, book pages):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {groundScents.map((val, idx) => (
                  <input
                    key={`scent-${idx}`}
                    type="text"
                    disabled={groundingLocked}
                    className="rounded-lg border border-gray-200 p-1.5 text-5xs bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    placeholder={`Scent ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const updated = [...groundScents];
                      updated[idx] = e.target.value.substring(0, 30);
                      setGroundScents(updated);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 1 Thing You Taste */}
            <div className="space-y-1">
              <span className="block text-4xs font-bold uppercase tracking-widest text-purple-700 dark:text-purple-400">
                👅 1 Taste (Your toothpaste, tap water, mint candy):
              </span>
              <input
                type="text"
                disabled={groundingLocked}
                className="w-full rounded-lg border border-gray-200 p-1.5 text-5xs bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                placeholder="Enter taste details..."
                value={groundTaste}
                onChange={(e) => setGroundTaste(e.target.value.substring(0, 50))}
              />
            </div>

          </div>

          <div className="mt-4 flex justify-end gap-2">
            {!groundingLocked ? (
              <button
                _id="btn-ground-lock"
                onClick={handleLockGrounding}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-4xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
              >
                Assemble Grounding Console
              </button>
            ) : (
              <span className="text-4xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                🛡️ Sensory grounding compiled. Calming brain.
              </span>
            )}
          </div>
        </section>

        {/* SELF-CARE CHECKLIST CARD */}
        <section className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs" role="region" aria-label="Self-care daily habits checker">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-neutral-800 mb-4">
            <ClipboardList className="text-teal-500" size={18} />
            <h2 className="text-md font-bold text-gray-950 dark:text-neutral-200">
              Daily Core Self-Care checklist
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
            Do not let study sessions derail your organic physical needs. Check these boxes repeatedly across long preparation segments.
          </p>

          <div className="space-y-3">
            
            {/* Water */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-emerald-50/10 dark:border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4.5 w-4.5 rounded border-gray-300 text-emerald-600 accent-emerald-500"
                checked={checklist.water || false}
                onChange={() => handleChecklistToggle("water")}
              />
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-white leading-none block">Hydrate (6 glasses target)</span>
                <span className="text-4xs text-gray-400">Keeps memory cells primed for syllabus processing.</span>
              </div>
            </label>

            {/* Posture */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-emerald-50/10 dark:border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4.5 w-4.5 rounded border-gray-300 text-emerald-600 accent-emerald-500"
                checked={checklist.posture || false}
                onChange={() => handleChecklistToggle("posture")}
              />
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-white leading-none block">Spine Adjustments</span>
                <span className="text-4xs text-gray-400">Hunching over desk traps breathing pathways, inducing mental exhaustion.</span>
              </div>
            </label>

            {/* Stretch */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-emerald-50/10 dark:border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4.5 w-4.5 rounded border-gray-300 text-emerald-600 accent-emerald-500"
                checked={checklist.stretch || false}
                onChange={() => handleChecklistToggle("stretch")}
              />
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-white leading-none block">5-Minute Physical Walk</span>
                <span className="text-4xs text-gray-400">Step out of study room. Breathe natural air, reset visual accommodation.</span>
              </div>
            </label>

            {/* Eyes */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-emerald-50/10 dark:border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4.5 w-4.5 rounded border-gray-300 text-emerald-600 accent-emerald-500"
                checked={checklist.eyes || false}
                onChange={() => handleChecklistToggle("eyes")}
              />
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-white leading-none block">The 20-20-20 Optic Rule</span>
                <span className="text-4xs text-gray-400">Every 20 minutes study, stare at an object 20 feet away for 20 seconds.</span>
              </div>
            </label>

          </div>
        </section>

      </div>

      {/* 5-MINUTE GUIDED JOURNAL PROMPTS ACCORDION PANEL */}
      <section className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4" role="region" aria-label="Guided Journal Prompts Panel">
        <div className="flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-neutral-800">
          <BookOpen className="text-emerald-500 animate-pulse" size={18} />
          <h2 className="text-md font-bold text-gray-950 dark:text-neutral-200">
            5-Minute Rapid Reflective Guided Journal
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Pick an exam-focused cognitive alignment prompt. This helps flush negative projections from your working memory, freeing up mental space for retention.
        </p>

        {/* State and logic */}
        {(() => {
          const [selectedPromptIdx, setSelectedPromptIdx] = useState<number>(0);
          const [promptAnswer, setPromptAnswer] = useState<string>("");
          const [isSavingPrompt, setIsSavingPrompt] = useState<boolean>(false);

          const JOURNAL_PROMPTS = [
            {
              title: "Preparation Micro-Victories",
              question: "Write down 3 tiny things that went relatively well in your studies or focus blocks today (focusing on efforts rather than absolute mock scores)."
            },
            {
              title: "Exam Worry Objective Debunker",
              question: "Write down one acute fear you have about mock scores or upcoming cutoff marks, and list 2 logical arguments proving you are bigger than this single exam."
            },
            {
              title: "Family Study Boundary",
              question: "Write down a peaceful, clear study boundary you can explain to your parents or peers, helping reduce comparative pressure."
            }
          ];

          const handleSaveGuidedJournal = async (e: React.FormEvent) => {
            e.preventDefault();
            if (isSavingPrompt) return;
            if (!promptAnswer.trim()) {
              showToast("Please write some reflections first.", "warning");
              return;
            }

            setIsSavingPrompt(true);
            try {
              await addMoodEntry(
                MoodLevel.OKAY,
                ["Studies"], // Tagged under Studies
                5,           // Moderate intensity index
                `5-Minute Support Journal entry:\n"${promptAnswer}"`,
                JOURNAL_PROMPTS[selectedPromptIdx].question,
                promptAnswer,
                0            // Logged for today
              );
              setPromptAnswer("");
              showToast("Guided meditation journal logged directly to database!", "success");
            } catch {
              showToast("Failed to write guided journal.", "warning");
            } finally {
              setIsSavingPrompt(false);
            }
          };

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Prompt Buttons Selection */}
              <div className="md:col-span-1 space-y-2.5">
                <span className="block text-4xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                  Select Focus Reframer:
                </span>
                {JOURNAL_PROMPTS.map((p, idx) => {
                  const active = selectedPromptIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPromptIdx(idx);
                        setPromptAnswer("");
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold block transition-all ${
                        active
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/60"
                          : "bg-white text-gray-600 border-gray-150 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-350 dark:border-neutral-800 dark:hover:bg-neutral-800"
                      }`}
                    >
                      💡 {p.title}
                    </button>
                  );
                })}
              </div>

              {/* Input details form */}
              <form onSubmit={handleSaveGuidedJournal} className="md:col-span-2 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="block text-4xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    Active Guided Exercise Question:
                  </span>
                  <div className="text-xs bg-gray-50 dark:bg-neutral-800 p-3.5 rounded-xl border border-gray-100 dark:border-neutral-800 leading-relaxed font-semibold text-gray-700 dark:text-neutral-300">
                    📝 {JOURNAL_PROMPTS[selectedPromptIdx].question}
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Pour out reflections, debunks, and efforts freely..."
                    className="w-full text-xs rounded-xl border border-gray-200 bg-white p-3 text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-emerald-500"
                    value={promptAnswer}
                    onChange={(e) => setPromptAnswer(e.target.value)}
                  />
                  <div className="flex justify-between items-center text-5xs text-gray-400 font-mono">
                    <span>Rate limit: single-action logs</span>
                    <span>{promptAnswer.length} / 500 characters</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="btn-support-journal-submit"
                    type="submit"
                    disabled={isSavingPrompt}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPrompt ? "Saving Reflection..." : "Save Reflection into History"}
                  </button>
                </div>
              </form>

            </div>
          );
        })()}
      </section>

    </div>
  );
};
