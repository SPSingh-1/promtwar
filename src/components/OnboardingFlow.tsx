/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useMoodContext, useUIContext } from "./WellnessContext";
import { ExamType } from "../types";
import { Sparkles, Brain, CheckCircle, Smartphone, ShieldCheck, Heart } from "lucide-react";

export const OnboardingFlow: React.FC = () => {
  const { profile, updateProfile } = useMoodContext();
  const { showToast } = useUIContext();
  const [slide, setSlide] = useState<number>(1);
  const [examType, setExamType] = useState(profile.examType);
  const [examDate, setExamDate] = useState(profile.examDate);

  const handleNext = () => {
    if (slide < 3) {
      setSlide(slide + 1);
    } else {
      // Final slide: save setup configuration and complete onboarding
      updateProfile({
        examType,
        examDate,
        onboardingCompleted: true
      });
      showToast("Welcome aboard! Your private mental space is ready.", "success");
    }
  };

  const handlePrev = () => {
    if (slide > 1) {
      setSlide(slide - 1);
    }
  };

  return (
    <div key="onboarding-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 dark:bg-black/80" role="dialog" aria-modal="true" aria-labelledby="onboard-title">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(slide / 3) * 100}%` }}
          />
        </div>

        {/* Slide Contents */}
        <div className="p-6 md:p-8">
          
          {slide === 1 && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-600 dark:text-emerald-400">
                <Brain id="icon-brain" size={40} className="animate-pulse" />
              </div>
              <h2 id="onboard-title" className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Aura Mental Space
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed max-w-sm">
                Empathetic, structured mood tracking tailored for Indian students tackling high-pressure competitive examinations (**JEE, NEET, UPSC, Boards**).
              </p>
              <div className="mt-6 space-y-3 text-left w-full max-w-xs text-xs text-gray-500 dark:text-neutral-400">
                <div id="feat-1" className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  <span>Interactive 7-Level Mood Logging</span>
                </div>
                <div id="feat-2" className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  <span>Stress-Trigger Mapping (Sleep, Syllabus, Peers)</span>
                </div>
                <div id="feat-3" className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  <span>Active Pranayama Deep Breathing Exercises</span>
                </div>
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="flex flex-col items-center">
              <div className="mb-4 rounded-full bg-purple-50 dark:bg-purple-950/40 p-4 text-purple-600 dark:text-purple-400">
                <ShieldCheck size={40} />
              </div>
              <h2 id="onboard-title" className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white text-center">
                Strict Privacy Guard
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-neutral-300 text-center leading-relaxed">
                Your coordinates and reflections never touch a remote server. Everything resides encrypted in your browser's local **IndexedDB** database.
              </p>

              {/* Set Up Target Form */}
              <div className="mt-6 w-full space-y-4">
                <div>
                  <label htmlFor="onboard-exam" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                    What Exam Are You Preparing For?
                  </label>
                  <select
                    id="onboard-exam"
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
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
                  <label htmlFor="onboard-date" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                    Target Exam / Goal Date
                  </label>
                  <input
                    id="onboard-date"
                    type="date"
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {slide === 3 && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-600 dark:text-rose-400">
                <Heart size={40} className="animate-beat" />
              </div>
              <h2 id="onboard-title" className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                You Are Not Alone
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                Competitive preparations can be immensely isolating. Aura monitors distress trends and links you with accredited national helplines (**iCall & Vandrevala**) whenever you require external breathing room.
              </p>
              <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50/45 p-3 text-left dark:border-rose-950/30 dark:bg-rose-950/10">
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                  🔒 No personal identity info is stored, analyzed, or shared. Enjoy completely anonymous clinical self-care.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {slide > 1 ? (
              <button
                id="btn-onboard-prev"
                onClick={handlePrev}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              id="btn-onboard-next"
              onClick={handleNext}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              {slide === 3 ? "Let's Begin" : "Next Option"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
