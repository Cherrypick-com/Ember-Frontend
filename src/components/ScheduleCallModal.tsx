// src/components/ScheduleCallModal.tsx
'use client';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Modal, Button, Input, Divider } from './ui';
import type { Goal, Recurrence } from '@/types';

const USER_ID = 'd05adcfb-62d3-45ee-9911-df183097e3a0';

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: null, label: 'One time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ScheduleCallModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    label: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:30',
    recurrence: 'daily' as Recurrence,
    goalIds: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setGoalsLoading(true);
      try {
        const data = await api.goals.list(USER_ID);
        if (!cancelled) {
          const list = (data.goals || []).filter((g) => g.active);
          setGoals(list);
          setForm((p) => ({
            ...p,
            goalIds: p.goalIds.filter((id) => list.some((g) => g.id === id)),
          }));
        }
      } catch (e) {
        console.error('Failed to load goals', e);
        if (!cancelled) setGoals([]);
      } finally {
        if (!cancelled) setGoalsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function toggleGoal(id: string) {
    setForm((p) => ({
      ...p,
      goalIds: p.goalIds.includes(id) ? p.goalIds.filter((g) => g !== id) : [...p.goalIds, id],
    }));
  }

  async function save() {
    setLoading(true);
    try {
      await api.calls.schedule({
        userId: USER_ID,
        goalIds: form.goalIds,
        label: form.label,
        scheduledAtLocal: `${form.date}T${form.time}:00`,
        timezone: 'America/Los_Angeles',
        recurrence: form.recurrence,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule a call" subtitle="Sage will call your phone at the scheduled time.">
      <Input
        label="Call label (optional)"
        placeholder="e.g. Morning check-in, End of day…"
        value={form.label}
        onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Time</label>
          <input type="time" style={inputStyle} value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Repeat</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {RECURRENCE_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setForm((p) => ({ ...p, recurrence: opt.value }))}
              style={{
                padding: '8px 16px',
                borderRadius: 100,
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                border: `1.5px solid ${form.recurrence === opt.value ? 'var(--ink)' : 'var(--cream-border)'}`,
                background: form.recurrence === opt.value ? 'var(--ink)' : 'white',
                color: form.recurrence === opt.value ? 'var(--cream)' : 'var(--ink-mid)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Goals to discuss</label>
        <p style={{ fontSize: 12, color: 'var(--ink-light)', marginBottom: 8 }}>Sage will focus the call on these goals.</p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, maxHeight: 200, overflowY: 'auto' }}>
          {goalsLoading ? (
            <p style={{ fontSize: 13, color: 'var(--ink-light)', padding: 10 }}>Loading goals…</p>
          ) : goals.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-light)', padding: 10 }}>No active goals yet. Add goals on the Goals page.</p>
          ) : (
            goals.map((goal) => (
              <label
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: `1.5px solid ${form.goalIds.includes(goal.id) ? 'var(--ember)' : 'var(--cream-border)'}`,
                  background: form.goalIds.includes(goal.id) ? 'var(--ember-light)' : 'white',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.goalIds.includes(goal.id)}
                  onChange={() => {}}
                  style={{ accentColor: 'var(--ember)', pointerEvents: 'none' }}
                />
                <span style={{ fontSize: 14 }}>
                  {goal.emoji ? `${goal.emoji} ` : ''}
                  {goal.title}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="ember" onClick={save} disabled={loading}>
          {loading ? 'Scheduling…' : 'Schedule call'}
        </Button>
      </div>
    </Modal>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--ink-mid)',
  marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--cream-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  background: 'white',
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
};
