/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoodLevel, ExamType, WellnessTip, MotivationalQuote, MoodEntry, StressTrigger } from "../types";

export const WELLNESS_TIPS: WellnessTip[] = [
  {
    id: "tip-1",
    moodRange: [MoodLevel.BURNOUT, MoodLevel.LOW, MoodLevel.NUMB],
    category: "Stress Relief",
    content: "If you are feeling overwhelmed by your syllabus, try the 'Rule of 3': Pick just three high-priority topics to revise today. Ignore the rest of the pile. One step at a time.",
    source: "Mental Wellness Team"
  },
  {
    id: "tip-2",
    moodRange: [MoodLevel.ANXIOUS, MoodLevel.BURNOUT],
    category: "Mindfulness",
    content: "Engage in 2 minutes of 'Box Breathing' right before starting a mock test: Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. This instantly calms the amygdala.",
    source: "Aura Breath coach"
  },
  {
    id: "tip-3",
    moodRange: [MoodLevel.OKAY, MoodLevel.LOW],
    category: "Study Habit",
    content: "The Pomodoro Technique (25 minutes study, 5 minutes screen-free break) secures your attention span and prevents cognitive exhaustion over long study sessions.",
    source: "Cognitive Psychology Desk"
  },
  {
    id: "tip-4",
    moodRange: [MoodLevel.GOOD, MoodLevel.GREAT],
    category: "Self-Care",
    content: "You're in a great state of mind! Use this positive momentum to tackle your most complex or challenging subjects (like HC Verma physics chapters or UPSC intense history papers).",
    source: "Student Success Guide"
  },
  {
    id: "tip-5",
    moodRange: [MoodLevel.NUMB, MoodLevel.LOW, MoodLevel.BURNOUT],
    category: "Sleep",
    content: "Sleep deprivation directly mimics depressive states. Sacrificing sleep for 2 extra hours of study actually reduces your retention score. Target at least 7 hours.",
    source: "Sleep Medicine India"
  },
  {
    id: "tip-6",
    moodRange: [MoodLevel.ANXIOUS, MoodLevel.OKAY],
    category: "Stress Relief",
    content: "Compare your current score only with your past self, not peers. Relative rankings are volatile, but persistent individual revision always leads to incremental mastery.",
    source: "JEE/NEET Counsel Desk"
  },
  {
    id: "tip-7",
    moodRange: [MoodLevel.BURNOUT, MoodLevel.LOW],
    category: "Mindfulness",
    content: "A 10-minute visual break where you look at trees or natural light helps reset your visual system (accommodation reflex) and clears brain fog.",
    source: "Aura Health"
  }
];

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    context: "Useful when dealing with low mock exam results."
  },
  {
    quote: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
    context: "For massive syllabi like UPSC or NEET."
  },
  {
    quote: "Calm mind brings inner strength and self-confidence, so that's very important for good health.",
    author: "Dalai Lama",
    context: "Before major exam days."
  },
  {
    quote: "Be not afraid of going slowly, be afraid only of standing still.",
    author: "Chinese Proverb",
    context: "Dealing with slow progress during preparation."
  },
  {
    quote: "The highest-stakes exams do not measure your human worth. They measure a specific set of answers on a specific day. You are far bigger than these numbers.",
    author: "Aura Counselor",
    context: "To counteract intense peer/family pressure."
  }
];

// Seed sample data for high-quality demo (30 days of entries)
export function getSeedData(examType: ExamType): MoodEntry[] {
  const seed: MoodEntry[] = [];
  const now = new Date();
  
  // Create 15 entries over the past 30 days
  const baseMoods = [
    { mood: MoodLevel.GOOD, triggers: ["Studies" as StressTrigger], note: "Revised organic chemistry, went well." },
    { mood: MoodLevel.GREAT, triggers: [] as StressTrigger[], note: "Mock test scores improved today!" },
    { mood: MoodLevel.OKAY, triggers: ["Sleep" as StressTrigger], note: "Slept only 5 hours. Feeling a bit sluggish but completed maths module." },
    { mood: MoodLevel.ANXIOUS, triggers: ["Comparison" as StressTrigger, "Result Fear" as StressTrigger], note: "Sharma ji's son got 99th percentile. Felt direct pressure." },
    { mood: MoodLevel.LOW, triggers: ["Studies" as StressTrigger, "Family" as StressTrigger], note: "Scolded for not studying 14 hours. Feeling locked in my room." },
    { mood: MoodLevel.BURNOUT, triggers: ["Studies" as StressTrigger, "Sleep" as StressTrigger], note: "Completely exhausted. Words are floating on the page." },
    { mood: MoodLevel.OKAY, triggers: ["Health" as StressTrigger], note: "Recovering from minor headache. Took it slow today." }
  ];

  for (let i = 25; i >= 0; i -= 2) {
    const entryDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const template = baseMoods[(i % baseMoods.length)];
    
    // Calculate intensity
    let intensity = 5;
    if (template.mood === MoodLevel.GREAT) intensity = 9;
    if (template.mood === MoodLevel.ANXIOUS) intensity = 8;
    if (template.mood === MoodLevel.BURNOUT) intensity = 10;
    if (template.mood === MoodLevel.LOW) intensity = 7;

    seed.push({
      id: `seed-id-${i}`,
      userId: "local-student-user",
      mood: template.mood,
      triggers: template.triggers,
      intensity,
      note: template.note,
      reflectionPrompt: "What is one thing you can control today?",
      reflectionAnswer: "My effort and attitude, not the results.",
      timestamp: entryDate.toISOString(),
      burnoutRisk: template.mood === MoodLevel.BURNOUT
    });
  }

  // Ensure last two days are high stress to test crisis alert if needed
  // Let's make it easy for user to see, but default seed has some variety
  return seed;
}

/**
 * Gets a prompt based on selected mood level
 */
export function getGuidedPrompt(mood: MoodLevel): string {
  switch (mood) {
    case MoodLevel.GREAT:
    case MoodLevel.GOOD:
      return "What specifically went well today, and how can you replicate this state tomorrow?";
    case MoodLevel.OKAY:
      return "What is one tiny self-care action or topic completion that would make today feel like a success?";
    case MoodLevel.LOW:
      return "Who is one trusted person you can talk to, or what is one comforting ritual you can do tonight?";
    case MoodLevel.ANXIOUS:
      return "Let's challenge the worry: what's the worst-case scenario, the best-case, and the most realistic outcome?";
    case MoodLevel.BURNOUT:
      return "If your body could speak right now, what basic physical need (sleep, water, quiet) would it ask for?";
    case MoodLevel.NUMB:
      return "Squeeze your toes, hold a warm cup, or listen to a sound. What are 3 sensory things you notice around you?";
    default:
      return "Write down whatever is on your mind. Free-write without judging your thoughts.";
  }
}

/**
 * Interface detailing custom analysis output.
 */
export interface AIAnalysisReport {
  weeklyAverageValue: number; // 0-100 score
  topTriggers: { trigger: StressTrigger; count: number }[];
  burnoutRiskLevel: "Low" | "Medium" | "High";
  burnoutRationale: string;
  bestDay: string;
  worstDay: string;
  moodAroundExamsReport: string;
  aiSuggestions: { title: string; text: string; action: string }[];
}

/**
 * Rule-based AI Wellness Analyzer (Works perfectly offline, privacy-guaranteed)
 */
export function analyzeMoodPatterns(entries: MoodEntry[], examType: ExamType, daysToExam: number): AIAnalysisReport {
  if (entries.length === 0) {
    return {
      weeklyAverageValue: 50,
      topTriggers: [],
      burnoutRiskLevel: "Low",
      burnoutRationale: "No entries logged yet. Start tracking your mood to see insights!",
      bestDay: "N/A",
      worstDay: "N/A",
      moodAroundExamsReport: "Log more entries to analyze your exam-related mood trends.",
      aiSuggestions: [
        {
          title: "Setup Your Target Exam",
          text: "Ensure your exam date is set up in Settings. This lets Aura map your mood trajectory directly against your preparation countdown.",
          action: "Go to Settings"
        }
      ]
    };
  }

  // 1. Calculate weighted average mood index (0-100)
  // GREAT: 95, GOOD: 80, OKAY: 60, LOW: 40, ANXIOUS: 30, NUMB: 20, BURNOUT: 10
  const moodWeights: Record<MoodLevel, number> = {
    [MoodLevel.GREAT]: 95,
    [MoodLevel.GOOD]: 80,
    [MoodLevel.OKAY]: 60,
    [MoodLevel.LOW]: 40,
    [MoodLevel.ANXIOUS]: 30,
    [MoodLevel.NUMB]: 20,
    [MoodLevel.BURNOUT]: 10,
  };

  const recentEntries = entries.slice(0, 7); // Last 7 logs for weekly score
  const totalWeight = recentEntries.reduce((sum, e) => sum + moodWeights[e.mood], 0);
  const weeklyAverageValue = recentEntries.length > 0 ? Math.round(totalWeight / recentEntries.length) : 60;

  // 2. Count top stress triggers
  const triggerCounts: Record<StressTrigger, number> = {
    Studies: 0,
    Family: 0,
    Sleep: 0,
    Comparison: 0,
    "Result Fear": 0,
    Health: 0,
    Other: 0
  };

  entries.forEach((e) => {
    e.triggers.forEach((t) => {
      if (triggerCounts[t] !== undefined) {
        triggerCounts[t]++;
      }
    });
  });

  const sortedTriggers = (Object.keys(triggerCounts) as StressTrigger[])
    .map((trigger) => ({ trigger, count: triggerCounts[trigger] }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count);

  // 3. Weekday Analysis (Best/Worst day)
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayScores: Record<number, { sum: number; count: number }> = {};
  for (let i = 0; i < 7; i++) dayScores[i] = { sum: 0, count: 0 };

  entries.forEach((e) => {
    const day = new Date(e.timestamp).getDay();
    dayScores[day].sum += moodWeights[e.mood];
    dayScores[day].count++;
  });

  let bestDayIdx = -1, worstDayIdx = -1;
  let maxAvg = -1, minAvg = 999;

  dayNames.forEach((_, idx) => {
    const d = dayScores[idx];
    if (d.count > 0) {
      const avg = d.sum / d.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        bestDayIdx = idx;
      }
      if (avg < minAvg) {
        minAvg = avg;
        worstDayIdx = idx;
      }
    }
  });

  const bestDay = bestDayIdx !== -1 ? dayNames[bestDayIdx] : "N/A";
  const worstDay = worstDayIdx !== -1 ? dayNames[worstDayIdx] : "N/A";

  // 4. Burnout risk analysis
  let consecutiveDistressedLogs = 0;
  let hasActiveSevereLogs = false;
  
  // Look at the latest 3 elements only for acute burnout warning
  const latestThree = entries.slice(0, 3);
  let burnoutCount = 0;
  let distressCount = 0;

  latestThree.forEach((e) => {
    if (e.mood === MoodLevel.BURNOUT || e.mood === MoodLevel.NUMB) {
      burnoutCount++;
    }
    if (e.mood === MoodLevel.LOW || e.mood === MoodLevel.ANXIOUS || e.mood === MoodLevel.BURNOUT || e.mood === MoodLevel.NUMB) {
      distressCount++;
    }
  });

  let burnoutRiskLevel: "Low" | "Medium" | "High" = "Low";
  let burnoutRationale = "Your psychological indicators are in the safe zone. Continue checking in regularly.";

  if (burnoutCount >= 2 || (distressCount >= 2 && triggerCounts["Sleep"] >= 2)) {
    burnoutRiskLevel = "High";
    burnoutRationale = `Critical Level. Recent logs show consecutive ${MoodLevel.BURNOUT} or extreme anxiety with high Sleep deprivation. Immediately reduce active studying hours and employ protective relaxation modes.`;
  } else if (distressCount >= 2 || triggerCounts["Studies"] >= 4) {
    burnoutRiskLevel = "Medium";
    burnoutRationale = "Moderate risk. High levels of study pressure and comparison stress are compounding. Ensure active breaks between revisions.";
  }

  // 5. Mood around exams custom reports (exam countdown)
  let moodAroundExamsReport = "";
  if (daysToExam < 0) {
    moodAroundExamsReport = `Your target exam, the ${examType}, has already concluded. Take some time to celebrate your dedication and recover. Set a new calendar date if another exam is scheduled.`;
  } else if (daysToExam <= 15) {
    moodAroundExamsReport = `With only ${daysToExam} days left for ${examType}, your logs indicate mood swings and acute anxiety. This is normal. Switch your study style from 'deep learning' (which increases stress) to passive 'active recall tests' and short summaries. Ensure 7.5 hours of sleep to avoid brain freeze.`;
  } else if (daysToExam <= 45) {
    moodAroundExamsReport = `${daysToExam} days remaining for ${examType}. Your average mood index of ${weeklyAverageValue}/100 shows steady progress. Watch out for '${sortedTriggers[0]?.trigger || "Studies"}' stress which tends to accumulate during this final high-intensity phase.`;
  } else {
    moodAroundExamsReport = `You have ample preparation runway (${daysToExam} days remaining). Your primary goal right now is maintaining study consistency. Prevent pre-haul exhaustion by establishing strict Sunday rest hours.`;
  }

  // 6. Generate action-oriented, personalized AI recommendations
  const aiSuggestions: { title: string; text: string; action: string }[] = [];

  // Advice based on primary stress trigger
  const primaryTrigger = sortedTriggers[0]?.trigger;
  if (primaryTrigger === "Studies") {
    aiSuggestions.push({
      title: "Break Down the Syllabus Monster",
      text: `Your primary stress comes from study volume. The Indian exam system rewards smart revision over raw grinding. Divide your daily page target by 2 and ensure you spend 30% of your schedule on active MCQs rather than rereading.`,
      action: "5-Min Guided Journal"
    });
  } else if (primaryTrigger === "Sleep") {
    aiSuggestions.push({
      title: "Protect Your Sleep Architecture",
      text: "Consistently low sleep degrades cognitive recall in competitive exams. Stop studying at least 45 minutes before sleep. Read an entertaining book or do our 4-7-8 Breathing Technique.",
      action: "Do Breathing Exercise"
    });
  } else if (primaryTrigger === "Comparison") {
    aiSuggestions.push({
      title: "Mute the Competitor Signals",
      text: "Whether on Telegram groups, WhatsApp, or coaching centers, delete/mute channels that trigger feelings of inadequacy. Relational comparative stress alters deep memory retrieval negatively.",
      action: "5-Min Guided Journal"
    });
  } else if (primaryTrigger === "Result Fear") {
    aiSuggestions.push({
      title: "Focus on Process, Not Cut-Offs",
      text: `JEE/NEET cut-offs vary wildly. Thinking about ranking percentiles only creates sympathetic nervous arousal. Reframe your mission: 'My only goal is to complete 3 custom test sets today with 100% focus.'`,
      action: "Use Grounding Technique"
    });
  }

  // General mood-based recommendations
  if (weeklyAverageValue < 40) {
    aiSuggestions.push({
      title: "Activate Self-Compassion Protocol",
      text: "Your average wellness rating is highly depressed. You are running on empty. It is critical to take an official half-day off. Visit a green park, eat your favorite street item, and tell yourself: 'I am doing my best under immense pressure.'",
      action: "View Support Desk"
    });
  } else {
    aiSuggestions.push({
      title: "Consolidate Positive Momentum",
      text: "You are holding up remarkably well. Establish an anchor habit: write down 3 quick daily gratitudes. This hardwires the brain to notice victories despite high study friction.",
      action: "Log Daily Mood"
    });
  }

  // Add standard checklist item
  aiSuggestions.push({
    title: "The 3-Point Calming Ritual",
    text: "Before studying any difficult physics or chemistry block, dedicate 4 rounds of slow pranayama breathing. This oxygenates the frontal lobes, boosting integration.",
    action: "Do Breathing Exercise"
  });

  return {
    weeklyAverageValue,
    topTriggers: sortedTriggers,
    burnoutRiskLevel,
    burnoutRationale,
    bestDay,
    worstDay,
    moodAroundExamsReport,
    aiSuggestions: aiSuggestions.slice(0, 3)
  };
}
