// src/app/dashboard/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, Pill, Button } from '@/components/ui';
import { ScheduleCallModal } from '@/components/ScheduleCallModal';

const MOCK_USER = { name: 'Delaney', buddyName: 'Sage', buddyTone: 'gentle' };
const MOCK_NEXT_CALL = { time: 'Today at 7:30 AM', label: 'Morning check-in', goals: ['🌿 Morning meditation', '💧 Hydration goal', '📵 No social media'] };
const MOCK_STATS = { totalCalls: 18, completionRate: 83, avgMood: '4.2' };
const MOCK_GOALS = [
  { title: 'Morning meditation', streak: 4, color: 'var(--sage)',  pill: 'sage'  as const },
  { title: 'French practice',    streak: 2, color: 'var(--sky)',   pill: 'sky'   as const },
  { title: 'No social media',    streak: 0, color: 'var(--rose)',  pill: 'rose'  as const },
  { title: 'Evening journaling', streak: 4, color: 'var(--gold)',  pill: 'gold'  as const },
];
const WEEK_DAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
const STREAK_STATUS = ['done', 'done', 'done', 'today', '', '', ''];

export default function DashboardPage() {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <main style={{ flex: 1 }}>
      <div style={pageStyle}>
        {/* Greeting */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, lineHeight: 1.15, marginBottom: 6 }}>
            Good morning, <em style={{ fontStyle: 'italic', color: 'var(--ember)' }}>{MOCK_USER.name}</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>
            Thursday, March 20 · Your 4-day streak is alive 🔥
          </p>
        </div>

        <div style={gridStyle}>
          {/* ── Left column ── */}
          <div>
            {/* Next call */}
            <div style={nextCallStyle}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,247,242,0.5)', marginBottom: 8 }}>
                Next call
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>
                {MOCK_NEXT_CALL.time}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(250,247,242,0.65)', marginBottom: '1.25rem' }}>
                {MOCK_USER.buddyName} · {MOCK_NEXT_CALL.label} · ~5 min
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: '1.25rem' }}>
                {MOCK_NEXT_CALL.goals.map(g => (
                  <span key={g} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 100, background: 'rgba(250,247,242,0.12)', color: 'rgba(250,247,242,0.85)', border: '1px solid rgba(250,247,242,0.15)' }}>{g}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setScheduleOpen(true)} style={creamBtnStyle}>Reschedule</button>
                <button style={outlineCreamBtnStyle}>Cancel call</button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.5rem' }}>
              {[
                { value: MOCK_STATS.totalCalls, label: 'Total calls' },
                { value: `${MOCK_STATS.completionRate}%`, label: 'Completion rate' },
                { value: MOCK_STATS.avgMood, label: 'Avg mood / 5' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly streak */}
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-light)', fontWeight: 500 }}>This week</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 400, marginTop: 4 }}>4-day streak</h3>
                </div>
                <span style={{ fontSize: 26 }}>🔥</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {WEEK_DAYS.map((day, i) => (
                  <div key={day} style={{
                    flex: 1, aspectRatio: '1', borderRadius: 8,
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 500, gap: 3,
                    border: '1px solid var(--cream-border)',
                    background: STREAK_STATUS[i] === 'today' ? 'var(--ember)' : STREAK_STATUS[i] === 'done' ? 'var(--ember-light)' : 'white',
                    color: STREAK_STATUS[i] === 'today' ? 'white' : STREAK_STATUS[i] === 'done' ? 'var(--ember)' : 'var(--ink-light)',
                  }}>
                    {STREAK_STATUS[i] !== '' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />}
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
              <div style={{ background: 'white', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--ember-light)', border: '2px solid var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic', color: 'var(--ember)', flexShrink: 0 }}>
                  {MOCK_USER.buddyName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 2 }}>{MOCK_USER.buddyName}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>🌿 Kind &amp; gentle</div>
                  <Link href="/settings" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, padding: '6px 14px', borderRadius: 100, border: '1px solid var(--cream-border)', color: 'var(--ink-mid)', textDecoration: 'none' }}>
                    Edit settings
                  </Link>
                </div>
              </div>
            </div>

            {/* Active goals */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={sidebarTitleStyle}>Active goals</div>
                <Link href="/goals" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 100, border: '1px solid var(--cream-border)', color: 'var(--ink-mid)', textDecoration: 'none' }}>View all</Link>
              </div>
              <Card style={{ padding: '1rem 1.25rem' }}>
                {MOCK_GOALS.map((g, i) => (
                  <div key={g.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < MOCK_GOALS.length - 1 ? '1px solid var(--cream-border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 14 }}>{g.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>
                          {g.streak > 0 ? `🔥 ${g.streak}-day streak` : 'First check-in'}
                        </div>
                      </div>
                    </div>
                    <Pill color={g.pill}>Daily</Pill>
                  </div>
                ))}
              </Card>
            </div>

            {/* Yesterday's summary */}
            <div>
              <div style={sidebarTitleStyle}>Yesterday's call</div>
              <Card style={{ padding: '1rem 1.25rem' }}>
                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 10 }}>
                  Great call! Delaney completed her morning meditation and journaling. Committed to avoiding social media until noon today.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pill color="sage">3 goals ✓</Pill>
                  <Link href="/calls" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 100, border: '1px solid var(--cream-border)', color: 'var(--ink-mid)', textDecoration: 'none' }}>
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
const sidebarTitleStyle: React.CSSProperties = { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--ink-light)', fontWeight: 500, marginBottom: 10 };
const nextCallStyle: React.CSSProperties = { background: 'var(--ink)', color: 'var(--cream)', borderRadius: 'var(--radius)', padding: '1.75rem', marginBottom: '1.5rem', position: 'relative' as const, overflow: 'hidden' };
const creamBtnStyle: React.CSSProperties = { background: 'var(--cream)', color: 'var(--ink)', fontSize: 13, padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 };
const outlineCreamBtnStyle: React.CSSProperties = { background: 'transparent', color: 'var(--cream)', fontSize: 13, padding: '8px 18px', borderRadius: 100, border: '1px solid rgba(250,247,242,0.25)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
