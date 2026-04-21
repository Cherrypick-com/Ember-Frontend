// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { addDays, startOfWeek } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { Card, Pill, Button } from '@/components/ui';
import { ScheduleCallModal } from '@/components/ScheduleCallModal';
import UpcomingCallsCalendar from '@/components/UpcomingCallsCalendar';
import { api } from '@/lib/api';
import type { BuddyTone, Goal, ProgressStats, ScheduledCall, User } from '@/types';

const USER_ID = 'd05adcfb-62d3-45ee-9911-df183097e3a0';

const WEEK_DAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

const GOAL_PILL_ROTATION = ['sage', 'sky', 'rose', 'gold', 'ember'] as const;
const GOAL_DOT_COLORS = ['var(--sage)', 'var(--sky)', 'var(--rose)', 'var(--gold)', 'var(--ember)'] as const;

const BUDDY_TONE_LABEL: Record<BuddyTone, string> = {
  gentle: '🌿 Kind & gentle',
  upbeat: '⚡ Upbeat & motivating',
  firm: '💪 Clear & direct',
  calm: '🌊 Calm & steady',
};

function formatNextCallTime(scheduledAt: string, timeZone: string): string {
  const d = new Date(scheduledAt);
  const now = new Date();
  const todayKey = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
  const callKey = formatInTimeZone(d, timeZone, 'yyyy-MM-dd');
  const tomorrowKey = formatInTimeZone(addDays(toZonedTime(now, timeZone), 1), timeZone, 'yyyy-MM-dd');
  const timeStr = formatInTimeZone(d, timeZone, 'h:mm a');
  if (callKey === todayKey) return `Today at ${timeStr}`;
  if (callKey === tomorrowKey) return `Tomorrow at ${timeStr}`;
  const dayPart = formatInTimeZone(d, timeZone, 'EEEE');
  return `${dayPart} at ${timeStr}`;
}

function pickNextCall(calls: ScheduledCall[]): ScheduledCall | null {
  const now = Date.now();
  const upcoming = calls
    .filter((c) => c.status === 'pending' || c.status === 'dialing')
    .filter((c) => new Date(c.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return upcoming[0] ?? null;
}

function greetingForHour(timeZone: string): string {
  const h = parseInt(formatInTimeZone(new Date(), timeZone, 'H'), 10);
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTodayLine(timeZone: string): string {
  return formatInTimeZone(new Date(), timeZone, 'EEEE, MMMM d');
}

function maxGoalStreak(goals: Goal[]): number {
  const active = goals.filter((g) => g.active);
  if (active.length === 0) return 0;
  return Math.max(...active.map((g) => g.streakCount));
}

function buildWeekStreakStatus(
  timeZone: string,
  recentRecords: ProgressStats['recentRecords']
): ('done' | 'today' | '')[] {
  const now = new Date();
  const callDayKeys = new Set(
    recentRecords.map((r) => formatInTimeZone(new Date(r.calledAt), timeZone, 'yyyy-MM-dd'))
  );
  const todayKey = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
  const tzNow = toZonedTime(now, timeZone);
  const weekStart = startOfWeek(tzNow, { weekStartsOn: 1 });

  const out: ('done' | 'today' | '')[] = [];
  for (let i = 0; i < 7; i++) {
    const cellDate = addDays(weekStart, i);
    const cellKey = formatInTimeZone(cellDate, timeZone, 'yyyy-MM-dd');
    const isToday = cellKey === todayKey;

    if (cellKey > todayKey) {
      out.push('');
      continue;
    }
    const hadCall = callDayKeys.has(cellKey);
    if (isToday) out.push(hadCall ? 'done' : 'today');
    else out.push(hadCall ? 'done' : '');
  }
  return out;
}

export default function DashboardPage() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [cancellingCall, setCancellingCall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [calls, setCalls] = useState<ScheduledCall[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [userRes, progressRes, goalsRes, callsRes] = await Promise.all([
          api.users.get(USER_ID),
          api.users.progress(USER_ID),
          api.goals.list(USER_ID),
          api.calls.list(USER_ID),
        ]);
        if (cancelled) return;
        setUser(userRes.user);
        setProgress(progressRes);
        setGoals(goalsRes.goals || []);
        setCalls(callsRes.calls || []);
      } catch (e) {
        console.error('Failed to load dashboard', e);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const timeZone = user?.timezone || 'America/Los_Angeles';
  const activeGoals = useMemo(() => goals.filter((g) => g.active), [goals]);
  const streakDays = maxGoalStreak(goals);
  const nextCall = useMemo(() => pickNextCall(calls), [calls]);
  const recentRecord = progress?.recentRecords?.[0];
  const streakStatus = useMemo(
    () => buildWeekStreakStatus(timeZone, progress?.recentRecords ?? []),
    [timeZone, progress?.recentRecords]
  );

  const nextCallGoalChips = useMemo(() => {
    if (!nextCall) return [];
    return nextCall.goalIds
      .map((id) => goals.find((g) => g.id === id))
      .filter((g): g is Goal => Boolean(g))
      .map((g) => `${g.emoji ? `${g.emoji} ` : ''}${g.title}`);
  }, [nextCall, goals]);

  async function handleCancelNextCall() {
    if (!nextCall) return;
    if (!window.confirm('Are you sure you want to cancel this call?')) return;
    setCancellingCall(true);
    try {
      await api.calls.cancel(nextCall.id);
      const callsRes = await api.calls.list(USER_ID);
      setCalls(callsRes.calls || []);
      setCalendarRefreshKey((k) => k + 1);
    } catch (e) {
      console.error('Failed to cancel call', e);
      window.alert(e instanceof Error ? e.message : 'Could not cancel the call. Please try again.');
    } finally {
      setCancellingCall(false);
    }
  }

  if (loading) {
    return (
      <main style={{ flex: 1 }}>
        <div style={{ ...pageStyle, textAlign: 'center', paddingTop: '4rem', color: 'var(--ink-light)' }}>
          Loading your dashboard…
        </div>
        <ScheduleCallModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ flex: 1 }}>
        <div style={{ ...pageStyle, textAlign: 'center', paddingTop: '4rem', color: 'var(--ink-light)' }}>
          Couldn&apos;t load your profile. Check the API and try again.
        </div>
        <ScheduleCallModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      </main>
    );
  }

  const streakPhrase =
    streakDays > 0 ? `Your ${streakDays}-day streak is alive 🔥` : 'Build a streak with daily check-ins 🔥';

  return (
    <main style={{ flex: 1 }}>
      <div style={pageStyle}>
        {/* Greeting */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, lineHeight: 1.15, marginBottom: 6 }}>
            {greetingForHour(timeZone)}, <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>{user.name}</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>
            {formatTodayLine(timeZone)} · {streakPhrase}
          </p>
        </div>

        <div style={gridStyle}>
          {/* ── Left column ── */}
          <div>
            {/* Next call */}
            <div style={nextCallStyle}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,247,242,0.5)',
                  marginBottom: 8,
                }}
              >
                Next call
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>
                {nextCall ? formatNextCallTime(nextCall.scheduledAt, timeZone) : 'No upcoming calls'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(250,247,242,0.65)', marginBottom: '1.25rem' }}>
                {user.buddyName}
                {nextCall ? (
                  <>
                    {' '}
                    · {nextCall.label?.trim() || 'Scheduled check-in'} · ~5 min
                  </>
                ) : (
                  <> · Schedule when you’re ready</>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: '1.25rem' }}>
                {nextCallGoalChips.length > 0 ? (
                  nextCallGoalChips.map((g) => (
                    <span
                      key={g}
                      style={{
                        fontSize: 12,
                        padding: '4px 12px',
                        borderRadius: 100,
                        background: 'rgba(250,247,242,0.12)',
                        color: 'rgba(250,247,242,0.85)',
                        border: '1px solid rgba(250,247,242,0.15)',
                      }}
                    >
                      {g}
                    </span>
                  ))
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      padding: '4px 12px',
                      borderRadius: 100,
                      background: 'rgba(250,247,242,0.08)',
                      color: 'rgba(250,247,242,0.55)',
                      border: '1px solid rgba(250,247,242,0.12)',
                    }}
                  >
                    {nextCall ? 'No goals linked — add goals on the Goals page' : 'Pick goals when you schedule'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setScheduleOpen(true)} style={creamBtnStyle}>
                  Schedule
                </button>
                {nextCall ? (
                  <button
                    type="button"
                    style={{
                      ...outlineCreamBtnStyle,
                      opacity: cancellingCall ? 0.6 : 1,
                      cursor: cancellingCall ? 'wait' : 'pointer',
                    }}
                    disabled={cancellingCall}
                    onClick={() => void handleCancelNextCall()}
                  >
                    Cancel call
                  </button>
                ) : null}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.5rem' }}>
              {[
                { value: progress?.totalCalls ?? '—', label: 'Total calls' },
                { value: progress != null ? `${progress.completionRate}%` : '—', label: 'Completion rate' },
                { value: progress?.avgMood ?? '—', label: 'Avg mood / 5' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'white',
                    border: '1px solid var(--cream-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <UpcomingCallsCalendar key={calendarRefreshKey} />

            {/* Weekly streak */}
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-light)',
                      fontWeight: 500,
                    }}
                  >
                    This week
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 400, marginTop: 4 }}>
                    {streakDays > 0 ? `${streakDays}-day streak` : 'Start your streak'}
                  </h3>
                </div>
                <span style={{ fontSize: 26 }}>🔥</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {WEEK_DAYS.map((day, i) => (
                  <div
                    key={day}
                    style={{
                      flex: 1,
                      aspectRatio: '1',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 500,
                      gap: 3,
                      border: '1px solid var(--cream-border)',
                      background:
                        streakStatus[i] === 'today'
                          ? 'var(--ember)'
                          : streakStatus[i] === 'done'
                            ? 'var(--ember-light)'
                            : 'white',
                      color:
                        streakStatus[i] === 'today'
                          ? 'white'
                          : streakStatus[i] === 'done'
                            ? 'var(--ember)'
                            : 'var(--ink-light)',
                    }}
                  >
                    {streakStatus[i] !== '' && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />
                    )}
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Button variant="ember" onClick={() => setScheduleOpen(true)} style={{ marginBottom: '1rem' }}>
              + Schedule a call
            </Button>
          </div>

          {/* ── Right sidebar ── */}
          <div>
            {/* Buddy card */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sidebarTitleStyle}>Your buddy</div>
              <div
                style={{
                  background: 'white',
                  border: '1px solid var(--cream-border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--ember-light)',
                    border: '2px solid var(--ember)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontStyle: 'italic',
                    color: 'var(--ember)',
                    flexShrink: 0,
                  }}
                >
                  {user.buddyName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 2 }}>{user.buddyName}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{BUDDY_TONE_LABEL[user.buddyTone]}</div>
                  <Link
                    href="/settings"
                    style={{
                      display: 'inline-block',
                      marginTop: 8,
                      fontSize: 12,
                      padding: '6px 14px',
                      borderRadius: 100,
                      border: '1px solid var(--cream-border)',
                      color: 'var(--ink-mid)',
                      textDecoration: 'none',
                    }}
                  >
                    Edit settings
                  </Link>
                </div>
              </div>
            </div>

            {/* Active goals */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={sidebarTitleStyle}>Active goals</div>
                <Link
                  href="/goals"
                  style={{
                    fontSize: 12,
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: '1px solid var(--cream-border)',
                    color: 'var(--ink-mid)',
                    textDecoration: 'none',
                  }}
                >
                  View all
                </Link>
              </div>
              <Card style={{ padding: '1rem 1.25rem' }}>
                {activeGoals.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--ink-light)', margin: 0 }}>No active goals yet.</p>
                ) : (
                  activeGoals.map((g, i) => (
                    <div
                      key={g.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: i < activeGoals.length - 1 ? '1px solid var(--cream-border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: GOAL_DOT_COLORS[i % GOAL_DOT_COLORS.length],
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 14 }}>{g.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>
                            {g.streakCount > 0 ? `🔥 ${g.streakCount}-day streak` : 'First check-in'}
                          </div>
                        </div>
                      </div>
                      <Pill color={GOAL_PILL_ROTATION[i % GOAL_PILL_ROTATION.length]}>Daily</Pill>
                    </div>
                  ))
                )}
              </Card>
            </div>

            {/* Recent call */}
            <div>
              <div style={sidebarTitleStyle}>Recent call</div>
              <Card style={{ padding: '1rem 1.25rem' }}>
                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 10 }}>
                  {recentRecord?.summary?.trim()
                    ? recentRecord.summary
                    : 'No call summaries yet. After your next check-in, a short recap will show up here.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pill color="sage">
                    {recentRecord ? `${recentRecord.completedGoalIds?.length ?? 0} goals ✓` : '—'}
                  </Pill>
                  <Link
                    href="/calls"
                    style={{
                      fontSize: 12,
                      padding: '6px 14px',
                      borderRadius: 100,
                      border: '1px solid var(--cream-border)',
                      color: 'var(--ink-mid)',
                      textDecoration: 'none',
                    }}
                  >
                    Full summary
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ScheduleCallModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </main>
  );
}

const pageStyle: React.CSSProperties = { maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem 4rem' };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' };
const sidebarTitleStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--ink-light)',
  fontWeight: 500,
  marginBottom: 10,
};
const nextCallStyle: React.CSSProperties = {
  background: 'var(--ink)',
  color: 'var(--cream)',
  borderRadius: 'var(--radius)',
  padding: '1.75rem',
  marginBottom: '1.5rem',
  position: 'relative' as const,
  overflow: 'hidden',
};
const creamBtnStyle: React.CSSProperties = {
  background: 'var(--cream)',
  color: 'var(--ink)',
  fontSize: 13,
  padding: '8px 18px',
  borderRadius: 100,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
};
const outlineCreamBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--cream)',
  fontSize: 13,
  padding: '8px 18px',
  borderRadius: 100,
  border: '1px solid rgba(250,247,242,0.25)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
};
