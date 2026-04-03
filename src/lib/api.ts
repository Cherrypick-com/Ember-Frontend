// src/lib/api.ts
// Central API client. Swap BASE_URL via NEXT_PUBLIC_API_URL env var.

import type { User, Goal, ScheduledCall, CallRecord, ProgressStats, OnboardingFormData, Recurrence } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Users ────────────────────────────────────────────────
export const api = {
  users: {
    create: (data: OnboardingFormData & { clerkId: string }) =>
      req<{ user: User }>('/api/users', { method: 'POST', body: JSON.stringify(data) }),

    get: (userId: string) =>
      req<{ user: User }>(`/api/users/${userId}`),

    update: (userId: string, data: Partial<Pick<User, 'buddyName' | 'buddyTone' | 'quietStart' | 'quietEnd'>>) =>
      req<{ user: User }>(`/api/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),

    progress: (userId: string) =>
      req<ProgressStats>(`/api/users/${userId}/progress`),
  },

  // ── Goals ───────────────────────────────────────────────
  goals: {
    list: (userId: string) =>
      req<{ goals: Goal[] }>(`/api/goals/${userId}`),

    create: (data: { userId: string; title: string; category: string; description?: string }) =>
      req<{ goal: Goal }>('/api/goals', { method: 'POST', body: JSON.stringify(data) }),

    update: (goalId: string, data: Partial<Pick<Goal, 'title' | 'description' | 'active'>>) =>
      req<{ goal: Goal }>(`/api/goals/${goalId}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (goalId: string) =>
      req<{ success: boolean }>(`/api/goals/${goalId}`, { method: 'DELETE' }),
  },

  // ── Calls ───────────────────────────────────────────────
  calls: {
    schedule: (data: {
      userId: string;
      goalIds: string[];
      label?: string;
      scheduledAtLocal: string;
      timezone: string;
      recurrence: Recurrence;
    }) => req<{ scheduledCallId: string }>('/api/calls', { method: 'POST', body: JSON.stringify(data) }),

    list: (userId: string) =>
      req<{ calls: ScheduledCall[] }>(`/api/calls/${userId}`),

    getRecord: (callRecordId: string) =>
      req<{ record: CallRecord }>(`/api/calls/record/${callRecordId}`),

    cancel: (scheduledCallId: string) =>
      req<{ success: boolean }>(`/api/calls/${scheduledCallId}`, { method: 'DELETE' }),
  },
};
