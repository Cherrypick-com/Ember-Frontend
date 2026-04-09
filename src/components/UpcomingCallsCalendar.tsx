'use client';

import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, startOfWeek } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import type { Goal, ScheduledCall } from '@/types';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function shiftMonthKey(monthKey: string, delta: number, timeZone: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const mid = toDate(`${y}-${String(m).padStart(2, '0')}-15T12:00:00`, { timeZone });
  const next = addMonths(mid, delta);
  return formatInTimeZone(next, timeZone, 'yyyy-MM');
}

function isUpcomingCall(c: ScheduledCall, nowMs: number): boolean {
  if (c.status === 'completed' || c.status === 'missed' || c.status === 'failed') return false;
  return new Date(c.scheduledAt).getTime() >= nowMs;
}

function groupUpcomingByLocalDate(calls: ScheduledCall[], timeZone: string, nowMs: number): Map<string, ScheduledCall[]> {
  const map = new Map<string, ScheduledCall[]>();
  for (const c of calls) {
    if (!isUpcomingCall(c, nowMs)) continue;
    const key = formatInTimeZone(new Date(c.scheduledAt), timeZone, 'yyyy-MM-dd');
    const list = map.get(key) ?? [];
    list.push(c);
    map.set(key, list);
  }
  map.forEach((list) => {
    list.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  });
  return map;
}

function formatCallChipTime(iso: string, timeZone: string): string {
  return formatInTimeZone(new Date(iso), timeZone, 'h:mm a');
}

interface Props {
  timeZone: string;
  calls: ScheduledCall[];
  goals: Goal[];
}

export function UpcomingCallsCalendar({ timeZone, calls, goals }: Props) {
  const [monthKey, setMonthKey] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useEffect(() => {
    setMonthKey(formatInTimeZone(new Date(), timeZone, 'yyyy-MM'));
  }, [timeZone]);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const byDate = useMemo(() => groupUpcomingByLocalDate(calls, timeZone, nowMs), [calls, timeZone, nowMs]);
  const upcomingCalls = useMemo(
    () =>
      calls
        .filter((c) => isUpcomingCall(c, nowMs))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [calls, nowMs]
  );

  const { days, monthTitle, today } = useMemo(() => {
    if (!monthKey) return { days: [] as Date[], monthTitle: '', today: '' };
    const [yy, mm] = monthKey.split('-').map(Number);
    const monthStart = toDate(`${yy}-${String(mm).padStart(2, '0')}-01T12:00:00`, { timeZone });
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const monthTitle = formatInTimeZone(monthStart, timeZone, 'MMMM yyyy');
    const today = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
    return { days, monthTitle, today };
  }, [monthKey, timeZone]);

  const selectedCalls = selectedDateKey ? (byDate.get(selectedDateKey) ?? []) : [];

  if (!monthKey) return null;

  return (
    <div style={wrapStyle}>
      <div style={headerRowStyle}>
        <div style={sidebarTitleStyle}>Upcoming calls</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonthKey((k) => shiftMonthKey(k, -1, timeZone))}
            style={navBtnStyle}
          >
            ‹
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, minWidth: 140, textAlign: 'center' }}>
            {monthTitle}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonthKey((k) => shiftMonthKey(k, 1, timeZone))}
            style={navBtnStyle}
          >
            ›
          </button>
        </div>
      </div>

      <div style={weekHeaderRowStyle}>
        {WEEK_LABELS.map((l) => (
          <div key={l} style={weekHeaderCellStyle}>
            {l}
          </div>
        ))}
      </div>

      <div style={gridStyle}>
        {days.map((day) => {
          const dateKey = formatInTimeZone(day, timeZone, 'yyyy-MM-dd');
          const inMonth = dateKey.startsWith(monthKey);
          const isToday = dateKey === today;
          const dayCalls = byDate.get(dateKey) ?? [];
          const hasCalls = dayCalls.length > 0;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDateKey(dateKey === selectedDateKey ? null : dateKey)}
              style={{
                ...dayCellStyle,
                opacity: inMonth ? 1 : 0.35,
                background: isToday ? 'var(--ember-light)' : hasCalls ? 'rgba(200, 96, 42, 0.08)' : 'white',
                borderColor: isToday ? 'var(--ember)' : hasCalls ? 'rgba(200, 96, 42, 0.35)' : 'var(--cream-border)',
                outline: selectedDateKey === dateKey ? '2px solid var(--ember)' : 'none',
                outlineOffset: 0,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: isToday ? 600 : 500, color: inMonth ? 'var(--ink)' : 'var(--ink-light)' }}>
                {formatInTimeZone(day, timeZone, 'd')}
              </span>
              {hasCalls ? (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--ember)',
                    marginTop: 4,
                    lineHeight: 1.2,
                  }}
                >
                  {dayCalls.length === 1 ? formatCallChipTime(dayCalls[0].scheduledAt, timeZone) : `${dayCalls.length} calls`}
                </span>
              ) : (
                <span style={{ fontSize: 10, marginTop: 4, minHeight: 14 }} />
              )}
            </button>
          );
        })}
      </div>

      {selectedCalls.length > 0 && (
        <div style={detailStyle}>
          <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 8 }}>
            {formatInTimeZone(toDate(`${selectedDateKey}T12:00:00`, { timeZone }), timeZone, 'EEEE, MMM d')}
          </div>
          {selectedCalls.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--cream-border)',
                background: 'var(--cream-dark)',
                marginBottom: 8,
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 4 }}>
                {formatCallChipTime(c.scheduledAt, timeZone)}
                {c.label?.trim() ? (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)', fontWeight: 400 }}>
                    {' '}
                    · {c.label}
                  </span>
                ) : null}
              </div>
              {c.recurrence ? (
                <div style={{ fontSize: 11, color: 'var(--ink-light)', textTransform: 'capitalize', marginBottom: 6 }}>
                  Repeats {c.recurrence === 'weekdays' ? 'weekdays' : c.recurrence}
                </div>
              ) : null}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {c.goalIds.length === 0 ? (
                  <span style={{ fontSize: 11, color: 'var(--ink-light)' }}>No goals linked</span>
                ) : (
                  c.goalIds.map((gid) => {
                    const g = goals.find((x) => x.id === gid);
                    return (
                      <span
                        key={gid}
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 100,
                          background: 'white',
                          border: '1px solid var(--cream-border)',
                          color: 'var(--ink-mid)',
                        }}
                      >
                        {g ? `${g.emoji ? `${g.emoji} ` : ''}${g.title}` : gid}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {byDate.size === 0 && (
        <p style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 12, marginBottom: 0 }}>
          No upcoming calls scheduled. Use &ldquo;Schedule a call&rdquo; to add one.
        </p>
      )}

      {upcomingCalls.length > 0 && (
        <div style={detailStyle}>
          <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 8 }}>
            All upcoming calls
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingCalls.map((c) => (
              <div
                key={`list-${c.id}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--cream-border)',
                  background: 'white',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 4 }}>
                  {formatInTimeZone(new Date(c.scheduledAt), timeZone, 'EEE, MMM d')} · {formatCallChipTime(c.scheduledAt, timeZone)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-mid)', marginBottom: 6 }}>
                  {c.label?.trim() || 'Scheduled check-in'}
                  {c.recurrence ? ` · Repeats ${c.recurrence === 'weekdays' ? 'weekdays' : c.recurrence}` : ''}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {c.goalIds.length === 0 ? (
                    <span style={{ fontSize: 11, color: 'var(--ink-light)' }}>No goals linked</span>
                  ) : (
                    c.goalIds.map((gid) => {
                      const g = goals.find((x) => x.id === gid);
                      return (
                        <span
                          key={`list-goal-${c.id}-${gid}`}
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 100,
                            background: 'var(--cream-dark)',
                            border: '1px solid var(--cream-border)',
                            color: 'var(--ink-mid)',
                          }}
                        >
                          {g ? `${g.emoji ? `${g.emoji} ` : ''}${g.title}` : gid}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const wrapStyle: CSSProperties = {
  background: 'white',
  border: '1px solid var(--cream-border)',
  borderRadius: 'var(--radius)',
  padding: '1.25rem',
  marginBottom: '1.5rem',
  boxShadow: 'var(--shadow)',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1rem',
  flexWrap: 'wrap',
  gap: 10,
};

const sidebarTitleStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ink-light)',
  fontWeight: 500,
};

const navBtnStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: '1px solid var(--cream-border)',
  background: 'var(--cream)',
  color: 'var(--ink)',
  fontSize: 18,
  lineHeight: 1,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-body)',
};

const weekHeaderRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 4,
  marginBottom: 6,
};

const weekHeaderCellStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--ink-light)',
  textAlign: 'center',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 4,
};

const dayCellStyle: CSSProperties = {
  minHeight: 56,
  borderRadius: 10,
  border: '1px solid var(--cream-border)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 6,
  fontFamily: 'var(--font-body)',
  transition: 'background 0.15s ease, border-color 0.15s ease',
};

const detailStyle: CSSProperties = {
  marginTop: '1rem',
  paddingTop: '1rem',
  borderTop: '1px solid var(--cream-border)',
};
