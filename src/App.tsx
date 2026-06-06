/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { WellnessProvider, useMoodContext, useUIContext } from "./components/WellnessContext";
import { HomeDashboard } from "./components/HomeDashboard";
import { MoodLogger } from "./components/MoodLogger";
import { JournalHistory } from "./components/JournalHistory";
import { InsightsTab } from "./components/InsightsTab";
import { SupportPanel } from "./components/SupportPanel";
import { SettingsTab } from "./components/SettingsTab";
import { OnboardingFlow } from "./components/OnboardingFlow";

// Design Icons from lucide-react
import { 
  Home, 
  BookOpen, 
  History, 
  BarChart4, 
  Heart, 
  Settings, 
  Plus, 
  Sparkles,
  CheckCircle,
  X,
  Flame,
  ShieldCheck
} from "lucide-react";

/**
 * Inner Application Router & Layout Wrapper
 */
function MainAppContent() {
  const { profile, loading } = useMoodContext();
  const { activeTab, setActiveTab, toasts, dismissToast } = useUIContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-950 font-sans" role="alert" aria-busy="true">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Pulsating Loader skeleton */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
            Compiling wellness sandbox...
          </p>
        </div>
      </div>
    );
  }

  // Active view router
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeDashboard key="view-home" />;
      case "mood":
        return <MoodLogger key="view-mood" />;
      case "journal":
        return <JournalHistory key="view-journal" />;
      case "insights":
        return <InsightsTab key="view-insights" />;
      case "support":
        return <SupportPanel key="view-support" />;
      case "settings":
        return <SettingsTab key="view-settings" />;
      default:
        return <HomeDashboard key="view-home-fallback" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col font-sans">
      
      {/* 1. KEYBOARD ACCESS HOOK */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-55 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* 2. HEADER BAR (DESKTOP & MOBILE HEADER COUPLER) */}
      <header className="sticky top-0 z-40 bg-white/80 border-b border-gray-150 backdrop-blur-md dark:bg-neutral-900/80 dark:border-neutral-800" role="banner">
        <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between">
          
          {/* Logo Frame */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="rounded-lg bg-emerald-600 p-1.5 text-white shadow-xs dark:bg-emerald-500">
              <Heart size={14} className="fill-white" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-tight text-gray-950 dark:text-white leading-none">
                Aura Wellness
              </h2>
              <span className="text-6xs text-gray-400 block mt-0.5 font-bold uppercase tracking-widest leading-none">
                Privacy-First Desk
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5" role="navigation" aria-label="Desktop Primary Navigation">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer transition ${
                activeTab === "home" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300" : "text-gray-500 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <Home size={12} />
              Home
            </button>
            <button
              id="nav-btn-mood"
              onClick={() => setActiveTab("mood")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer transition ${
                activeTab === "mood" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300" : "text-gray-500 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <BookOpen size={12} />
              Log Mood
            </button>
            <button
              onClick={() => setActiveTab("journal")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer transition ${
                activeTab === "journal" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300" : "text-gray-500 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <History size={12} />
              Journal
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer transition ${
                activeTab === "insights" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300" : "text-gray-500 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <BarChart4 size={12} />
              Insights
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer transition ${
                activeTab === "support" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300" : "text-gray-500 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <Heart size={12} />
              Support
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer transition ${
                activeTab === "settings" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300" : "text-gray-500 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
              aria-label="App settings panel"
            >
              <Settings size={12} />
              Settings
            </button>
          </nav>

          {/* Quick Header Right Widgets */}
          <div className="flex items-center gap-2">
            {profile.streakCount > 0 && (
              <span className="bg-orange-50 text-orange-700 border border-orange-100 rounded-lg px-2 py-0.5 text-6xs font-bold uppercase tracking-wider dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400 flex items-center gap-0.5 select-none animate-slide-in-right">
                🔥 {profile.streakCount} D Streak
              </span>
            )}
            
            {/* Exam Badge */}
            <span className="hidden sm:inline bg-purple-50 text-purple-700 border border-purple-100 rounded-lg px-2 py-0.5 text-6xs font-bold uppercase tracking-widest dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-300">
              🇮🇳 Exam: {profile.examType}
            </span>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTAINER AREA */}
      <main 
        id="main-content" 
        className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24 md:pb-12" 
        role="main" 
        tabIndex={-1}
      >
        {renderActiveScreen()}
      </main>

      {/* 4. ONBOARDING OVERLAY GATEWAY */}
      {!profile.onboardingCompleted && <OnboardingFlow />}

      {/* 5. FLOATING ACTION BUTTON (FAB) FOR MOBILE LOGGER */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-10 animate-fade-in">
        <button
          id="fab-quick-log"
          onClick={() => setActiveTab("mood")}
          className="flex items-center justify-center rounded-full bg-emerald-600 p-4 text-white shadow-lg hover:bg-emerald-500 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-150 transition cursor-pointer dark:bg-emerald-500 dark:hover:bg-emerald-400"
          aria-label="Log check-in mood diary"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* 6. BOTTOM TAB BAR FOR MOBILE COMPLIANCE */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-150 py-1 flex items-center justify-around dark:bg-neutral-900 dark:border-neutral-800 shadow-lg"
        role="navigation"
        aria-label="Mobile Navigation Drawer"
      >
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition min-w-[50px] min-h-[44px] ${
            activeTab === "home" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-neutral-500"
          }`}
          aria-label="Go to Home"
        >
          <Home size={18} />
          <span className="text-6xs font-bold uppercase tracking-wider mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("journal")}
          className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition min-w-[50px] min-h-[44px] ${
            activeTab === "journal" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-neutral-500"
          }`}
          aria-label="Go to Journal"
        >
          <History size={18} />
          <span className="text-6xs font-bold uppercase tracking-wider mt-0.5">Journal</span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition min-w-[50px] min-h-[44px] ${
            activeTab === "insights" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-neutral-500"
          }`}
          aria-label="Go to Insights"
        >
          <BarChart4 size={18} />
          <span className="text-6xs font-bold uppercase tracking-wider mt-0.5">Insights</span>
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition min-w-[50px] min-h-[44px] ${
            activeTab === "support" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-neutral-500"
          }`}
          aria-label="Go to Support Desk"
        >
          <Heart size={18} />
          <span className="text-6xs font-bold uppercase tracking-wider mt-0.5">Support</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition min-w-[50px] min-h-[44px] ${
            activeTab === "settings" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-neutral-500"
          }`}
          aria-label="Go to Settings"
        >
          <Settings size={18} />
          <span className="text-6xs font-bold uppercase tracking-wider mt-0.5">Settings</span>
        </button>
      </nav>

      {/* 7. TOAST NOTIFICATION CORNER */}
      <div 
        className="fixed bottom-24 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none md:bottom-6 md:left-6" 
        role="live" 
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl p-3.5 shadow-lg border border-gray-100 dark:border-neutral-800 text-xs font-semibold leading-relaxed animate-slide-in p-4 bg-white dark:bg-neutral-900 ${
              toast.type === "success"
                ? "text-emerald-800 border-l-4 border-l-emerald-500 dark:text-emerald-300"
                : toast.type === "warning"
                ? "text-rose-800 border-l-4 border-l-rose-500 dark:text-rose-305"
                : "text-indigo-800 border-l-4 border-l-indigo-500 dark:text-indigo-305"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className={toast.type === "success" ? "text-emerald-500" : toast.type === "warning" ? "text-rose-500" : "text-indigo-500"} />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition duration-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <WellnessProvider>
      <MainAppContent />
    </WellnessProvider>
  );
}
