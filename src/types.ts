/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MoodLevel {
  GREAT = "Great",
  GOOD = "Good",
  OKAY = "Okay",
  LOW = "Low",
  ANXIOUS = "Anxious",
  BURNOUT = "Burnout",
  NUMB = "Numb"
}

export interface MoodConfig {
  level: MoodLevel;
  emoji: string;
  label: string;
  color: string;
  bgClass: string;
  intensityScale: string; // Describes what 1-10 intensity means for this mood
  ariaLabel: string;
}

export type StressTrigger = 
  | "Studies"
  | "Family"
  | "Sleep"
  | "Comparison"
  | "Result Fear"
  | "Health"
  | "Other";

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodLevel;
  triggers: StressTrigger[];
  intensity: number; // 1-10 slider
  note: string; // Journal note with escaping/sanitization
  reflectionPrompt: string; // Guided prompt shown to user
  reflectionAnswer: string; // User's reflection text
  timestamp: string; // ISO8601 string
  burnoutRisk: boolean; // Flagged if weekly average indicates high stress + consecutive triggers
}

export type ExamType = 
  | "JEE"
  | "NEET"
  | "UPSC"
  | "CAT"
  | "GATE"
  | "CUET"
  | "Board Exams"
  | "Other";

export interface UserProfile {
  id: string;
  examType: ExamType;
  examDate: string; // YYYY-MM-DD
  streakCount: number;
  lastCheckIn: string; // YYYY-MM-DD format
  onboardingCompleted: boolean;
  reminderTime: string; // HH:MM
  theme: "light" | "dark" | "system";
}

export interface WellnessTip {
  id: string;
  moodRange: MoodLevel[];
  category: "Mindfulness" | "Study Habit" | "Sleep" | "Stress Relief" | "Self-Care";
  content: string;
  source: string;
}

export interface MotivationalQuote {
  quote: string;
  author: string;
  context: string;
}
