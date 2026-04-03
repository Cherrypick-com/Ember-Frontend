// src/app/goals/page.tsx
'use client';
import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { Card, Pill, Button, Input, Textarea, Modal } from '@/components/ui';
import type { GoalCategory } from '@/types';

const CATEGORIES: { value: GoalCategory; emoji: string; label: string }[] = [
  { value: 'mindfulness', emoji: '🧘', label: 'Mindfulness' },
  { value: 'fitness',     emoji: '💪', label: 'Fitness' },
  { value: 'learning',    emoji: '📚', label: 'Learning' },
  { value: 'health',      emoji: '🥗', label: 'Health' },
  { value: 'productivity',emoji: '⚡', label: 'Productivity' },
  { value: 'creative',    emoji: '✨', label: 'Creative' },
];

const MOCK_GOALS = [
  { id: '1', title: 'Morning meditation', category: 'mindfulness', desc: '10 min on Headspace, before breakfast, no phone first thing in the morning', streak: 4, active: true, color: 'var(--sage-light)', emoji: '🌿', pill: 'sage' as const },
  { id: '2', title: 'French practice',    category: 'learning',    desc: '15 min daily on Duolingo, plus one French podcast episode per week',        streak: 2, active: true, color: 'var(--sky-light)', emoji: '🇫🇷', pill: 'sky'  as const },
  { id: '3', title: 'No social media',    category: 'health',      desc: 'No Instagram or TikTok before noon. Only check socials twice a day max.',    streak: 0, active: true, color: 'var(--rose-light)', emoji: '📵', pill: 'rose' as const },
  { id: '4', title: 'Evening journaling', category: 'mindfulness', desc: '10 minutes of free writing before bed. Three things I\'m grateful for.',    streak: 4, active: true, color: 'var(--gold-light)', emoji: '📓', pill: 'gold' as const },
  { id: '5', title: 'Hydration goal',     category: 'health',      desc: '8 glasses of water per day. Keep a bottle on the desk at all times.',        streak: 4, active: true, color: 'var(--sage-light)', emoji: '💧', pill: 'sage' as const },
];

export default function GoalsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'mindfulness' as GoalCategory, description: '' });

  function saveGoal() {
    // TODO: call api.goals.create(...)
    setModalOpen(false);
    setNewGoal({ title: '', category: 'mindfulness', description: '' });
  }

  return (
    <>
      <Nav userName="D" />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginBottom: 4 }}>Your goals</h1>
            <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Everything Sage checks in on. Each goal becomes part of your buddy's context on every call.</p>
          </div>
          <Button variant="ember" onClick={() => setModalOpen(true)}>+ New goal</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {MOCK_GOALS.map(goal => (
            <div key={goal.id} style={goalCardStyle}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: goal.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {goal.emoji}
                </div>
                <Pill color="sage">Active</Pill>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 400, marginBottom: 4 }}>{goal.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 12, lineHeight: 1.5 }}>{goal.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: goal.streak > 0 ? 'var(--ember)' : 'var(--ink-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {goal.streak > 0 ? `🔥 ${goal.streak}-day streak` : 'No calls yet'}
                </span>
                <Pill color="gray">{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</Pill>
              </div>
            </div>
          ))}

          {/* Add new */}
          <button onClick={() => setModalOpen(true)} style={addCardStyle}>
            <span style={{ fontSize: 24 }}>+</span>
            <span>Add a new goal</span>
          </button>
        </div>
      </main>

      {/* Add Goal Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New goal" subtitle="Add something you want Sage to check in on during calls.">
        <Input label="Goal title" placeholder="e.g. Morning run, Bedtime routine…" value={newGoal.title} onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))} />

        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-mid)', marginBottom: 8 }}>Category</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.25rem' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setNewGoal(p => ({ ...p, category: cat.value }))}
              style={{ padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center' as const, fontSize: 12, fontFamily: 'var(--font-body)', transition: 'all 0.15s', border: `1.5px solid ${newGoal.category === cat.value ? 'var(--ember)' : 'var(--cream-border)'}`, background: newGoal.category === cat.value ? 'var(--ember-light)' : 'white', color: newGoal.category === cat.value ? 'var(--ember)' : 'var(--ink-mid)', fontWeight: newGoal.category === cat.value ? 500 : 400 }}>
              <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <Textarea label="Extra context for Sage (optional)" placeholder="Duration, method, time of day, specific rules…" rows={3} value={newGoal.description} onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="ember" onClick={saveGoal}>Add goal</Button>
        </div>
      </Modal>
    </>
  );
}

const goalCardStyle: React.CSSProperties = {
  background: 'white', border: '1px solid var(--cream-border)',
  borderRadius: 'var(--radius)', padding: '1.25rem',
  boxShadow: 'var(--shadow)', cursor: 'pointer',
  transition: 'transform 0.15s, box-shadow 0.15s',
};

const addCardStyle: React.CSSProperties = {
  background: 'var(--cream)', border: '1.5px dashed var(--cream-border)',
  borderRadius: 'var(--radius)', padding: '1.25rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 8, cursor: 'pointer', color: 'var(--ink-light)', fontSize: 14,
  transition: 'all 0.15s', minHeight: 160, fontFamily: 'var(--font-body)',
};
