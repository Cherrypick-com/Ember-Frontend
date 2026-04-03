// src/app/calls/page.tsx
'use client';
import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { Pill, Button } from '@/components/ui';
import { ScheduleCallModal } from '@/components/ScheduleCallModal';

const MOCK_CALLS = [
  {
    id: '1', date: 'Wednesday, March 19', time: '7:31 AM',
    label: 'Morning check-in', duration: '4 min 22 sec',
    summary: 'Great call! Delaney completed her morning meditation and evening journaling. She\'s staying consistent with hydration and committed to avoiding social media until noon. Mentioned feeling a little tired this week but overall positive energy.',
    goals: [{ label: '🌿 Meditation', color: 'sage' as const }, { label: '📓 Journaling', color: 'gold' as const }, { label: '💧 Hydration', color: 'sky' as const }],
    mood: 4, missed: false,
    commitments: ['Will avoid social media until noon today', 'Wants to try a 15-min meditation tomorrow', 'Will listen to a French podcast on her commute'],
  },
  {
    id: '2', date: 'Tuesday, March 18', time: '7:29 AM',
    label: 'Morning check-in', duration: '3 min 08 sec',
    summary: 'Solid check-in. Delaney completed meditation and journaling but skipped French practice. She acknowledged it and committed to doubling up the following day. Mood was good — shared she\'s excited about a work project.',
    goals: [{ label: '🌿 Meditation', color: 'sage' as const }, { label: '📓 Journaling', color: 'gold' as const }],
    mood: 5, missed: false,
    commitments: ['Will do French practice today to make up for yesterday', 'Keeping bedtime routine consistent this week'],
  },
  {
    id: '3', date: 'Monday, March 17', time: '7:30 AM',
    label: 'Morning check-in', duration: 'Missed',
    summary: 'No answer after 3 attempts. Sage left an encouraging voicemail. No summary available for this call.',
    goals: [], mood: null, missed: true, commitments: [],
  },
  {
    id: '4', date: 'Sunday, March 16', time: '8:02 AM',
    label: 'Weekend check-in', duration: '6 min 44 sec',
    summary: 'Wonderful weekend call. All goals completed. Delaney mentioned she\'s starting to feel the meditation making a real difference in her mornings. Sage celebrated her consistency and they set an intention for the week ahead.',
    goals: [{ label: '🌿 Meditation', color: 'sage' as const }, { label: '📓 Journaling', color: 'gold' as const }, { label: '🇫🇷 French', color: 'sky' as const }, { label: '💧 Hydration', color: 'sky' as const }],
    mood: 5, missed: false,
    commitments: ['Aim for 7 days straight this week', 'Add a new goal: no social media before noon'],
  },
];

export default function CallsPage() {
  const [expanded, setExpanded] = useState<string | null>('1');
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <>
      <Nav userName="D" />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginBottom: 4 }}>Call history</h1>
            <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Every conversation with Sage, including summaries, completed goals, and commitments made.</p>
          </div>
          <Button variant="ember" onClick={() => setScheduleOpen(true)}>+ Schedule a call</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_CALLS.map(call => (
            <div key={call.id}
              style={{ background: 'white', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius)', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow)', opacity: call.missed ? 0.7 : 1, cursor: call.missed ? 'default' : 'pointer', transition: 'all 0.15s' }}
              onClick={() => !call.missed && setExpanded(expanded === call.id ? null : call.id)}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>{call.date} · {call.time}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-light)' }}>Sage · {call.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-light)' }}>{call.duration}</span>
                  {call.missed
                    ? <Pill color="rose">Voicemail left</Pill>
                    : <Pill color="sage">{call.goals.length} goals ✓</Pill>
                  }
                </div>
              </div>

              {/* Summary */}
              <p style={{ fontSize: 14, color: call.missed ? 'var(--ink-light)' : 'var(--ink)', lineHeight: 1.6, marginBottom: 12 }}>
                {call.summary}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 8 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {call.goals.map(g => <Pill key={g.label} color={g.color}>{g.label}</Pill>)}
                </div>
                {call.mood && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-light)' }}>Mood</span>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: n <= call.mood! ? 'var(--sage)' : 'var(--cream-border)' }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded commitments */}
              {expanded === call.id && call.commitments.length > 0 && (
                <div style={{ background: 'var(--cream)', borderTop: '1px solid var(--cream-border)', padding: '1rem 0 0', marginTop: '1rem' }}>
                  <div style={{ fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'var(--ink-light)', marginBottom: 10, fontWeight: 500 }}>
                    Commitments made
                  </div>
                  {call.commitments.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--ink-mid)' }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <ScheduleCallModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </>
  );
}
