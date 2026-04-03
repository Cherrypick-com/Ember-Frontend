// src/types/index.ts

export type BuddyTone = 'gentle' | 'upbeat' | 'firm' | 'calm';
export type CallStatus = 'pending' | 'dialing' | 'in_progress' | 'completed' | 'missed' | 'failed';
export type GoalCategory = 'health' | 'mindfulness' | 'fitness' | 'learning' | 'productivity' | 'relationship' | 'creative' | 'other';
export type Recurrence = 'daily' | 'weekdays' | 'weekly' | null;

export interface User {
  id: string;
  name: string;
  phone: string;
  timezone: string;
  buddyName: string;
  buddyTone: BuddyTone;
  quietStart: string;
  quietEnd: string;
  consentGiven: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  description?: string;
  active: boolean;
  streakCount: number;
  lastCompletedAt?: string;
  createdAt: string;
}

export interface ScheduledCall {
  id: string;
  userId: string;
  goalIds: string[];
  label?: string;
  scheduledAt: string; // UTC ISO string
  recurrence: Recurrence;
  status: CallStatus;
  retryCount: number;
  callRecords: CallRecord[];
}

export interface CallRecord {
  id: string;
  scheduledCallId: string;
  userId: string;
  status: CallStatus;
  durationSecs?: number;
  transcript?: string;
  summary?: string;
  commitments?: Commitment[];
  completedGoalIds: string[];
  moodScore?: number; // 1–5
  distressDetected: boolean;
  voicemailLeft: boolean;
  calledAt: string;
  endedAt?: string;
  user?: { name: string; buddyName: string };
}

export interface Commitment {
  text: string;
  deadline?: string;
}

export interface ProgressStats {
  totalCalls: number;
  completedCalls: number;
  completionRate: number;
  avgMood: string | null;
  goals: { streakCount: number; title: string }[];
  recentRecords: Pick<CallRecord, 'moodScore' | 'summary' | 'calledAt' | 'completedGoalIds'>[];
}

// ── Onboarding form shape ────────────────────────────────
export interface OnboardingFormData {
  name: string;
  phone: string;
  timezone: string;
  buddyName: string;
  buddyTone: BuddyTone;
  goalTitle: string;
  goalDescription?: string;
  consentGiven: boolean;
  consentText: string;
}
