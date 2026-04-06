// src/app/goals/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Nav } from '@/components/Nav';
import { Card, Pill, Button, Input, Textarea, Modal } from '@/components/ui';
import type { GoalCategory } from '@/types';

const CATEGORIES: { value: GoalCategory; emoji: string; label: string }[] = [
  { value: 'mindfulness', emoji: '🧘', label: 'Mindfulness' },
  { value: 'fitness',     emoji: '💪', label: 'Fitness' },
  { value: 'learning',    emoji: '📚', label: 'Learning' },
  { value: 'health',      emoji: '🌿', label: 'Health' },
  { value: 'productivity',emoji: '⚡', label: 'Productivity' },
  { value: 'creative',    emoji: '✨', label: 'Creative' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ember-backend-production-79dc.up.railway.app';
const USER_ID = 'd05adcfb-62d3-45ee-9911-df183097e3a0';

type Goal = {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  emoji: string;
  active: boolean;
  streak?: number;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'mindfulness' as GoalCategory,
    emoji: '🧘',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const res = await fetch(`${API_BASE}/api/goals/${USER_ID}`);
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (e) {
      console.error('Failed to fetch goals', e);
    } finally {
      setLoading(false);
    }
  }

  async function createGoal() {
    if (!newGoal.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, ...newGoal }),
      });
      if (res.ok) {
        await fetchGoals();
        setShowModal(false);
        setNewGoal({ title: '', description: '', category: 'mindfulness', emoji: '🧘' });
      }
    } catch (e) {
      console.error('Failed to create goal', e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteGoal(goalId: string) {
    try {
      await fetch(`${API_BASE}/api/goals/${goalId}`, { method: 'DELETE' });
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (e) {
      console.error('Failed to delete goal', e);
    }
  }

  const getCategoryEmoji = (category: string) =>
    CATEGORIES.find(c => c.value === category)?.emoji || '🎯';

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Your goals</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Everything Sage checks in on. Each goal becomes part of your buddy's context on every call.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ New goal</Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your goals...</div>
        ) : goals.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted-foreground mb-4">No goals yet. Add your first goal to get started!</p>
            <Button onClick={() => setShowModal(true)}>+ Add a goal</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <Card key={goal.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{goal.emoji || getCategoryEmoji(goal.category)}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Pill variant="success">Active</Pill>
                    </div>
                    <h3 className="font-medium text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    {goal.streak ? (
                      <p className="text-xs text-orange-500 mt-1">🔥 {goal.streak}-day streak</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">No calls yet</p>
                    )}
                    <Pill className="mt-2">{CATEGORIES.find(c => c.value === goal.category)?.label || goal.category}</Pill>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-muted-foreground hover:text-destructive text-sm shrink-0"
                >
                  Remove
                </button>
              </Card>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="mt-6 w-full border border-dashed border-border rounded-xl py-4 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors text-sm"
        >
          + Add a new goal
        </button>
      </main>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">New goal</h2>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Goal title</label>
              <Input
                placeholder="e.g. Morning meditation"
                value={newGoal.title}
                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <Textarea
                placeholder="Describe what this goal looks like in practice..."
                value={newGoal.description}
                onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setNewGoal({ ...newGoal, category: cat.value, emoji: cat.emoji })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      newGoal.category === cat.value
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={createGoal} disabled={saving || !newGoal.title.trim()} className="flex-1">
                {saving ? 'Saving...' : 'Save goal'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
