'use client';
import { useState, useEffect } from 'react';
import { Nav } from '@/components/Nav';
import { Card, Pill, Button, Input, Textarea, Modal } from '@/components/ui';
import { api } from '@/lib/api';
import type { Goal, GoalCategory } from '@/types';

const CATEGORIES = [
  { value: 'mindfulness' as GoalCategory, emoji: '🧘', label: 'Mindfulness' },
  { value: 'fitness' as GoalCategory, emoji: '💪', label: 'Fitness' },
  { value: 'learning' as GoalCategory, emoji: '📚', label: 'Learning' },
  { value: 'health' as GoalCategory, emoji: '🌿', label: 'Health' },
  { value: 'productivity' as GoalCategory, emoji: '⚡', label: 'Productivity' },
  { value: 'creative' as GoalCategory, emoji: '✨', label: 'Creative' },
];

const USER_ID = 'd05adcfb-62d3-45ee-9911-df183097e3a0';

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

  useEffect(() => { fetchGoals(); }, []);

  async function fetchGoals() {
    try {
      const data = await api.goals.list(USER_ID);
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
      await api.goals.create({ userId: USER_ID, ...newGoal });
      await fetchGoals();
      setShowModal(false);
      setNewGoal({ title: '', description: '', category: 'mindfulness' as GoalCategory, emoji: '🧘' });
    } catch (e) {
      console.error('Failed to create goal', e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteGoal(goalId: string) {
    try {
      await api.goals.delete(goalId);
      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (e) {
      console.error('Failed to delete goal', e);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Your goals</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Everything Sage checks in on. Each goal becomes part of your buddy context on every call.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ New goal</Button>
        </div>

        {loading ? (
          <p className="text-center py-12 text-muted-foreground">Loading your goals...</p>
        ) : goals.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted-foreground mb-4">No goals yet. Add your first goal!</p>
            <Button onClick={() => setShowModal(true)}>+ Add a goal</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{goal.emoji || '🎯'}</span>
                  <div>
                    <Pill color="sage">Active</Pill>
                    <h3 className="font-medium text-foreground mt-1">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    <Pill color="gray">{CATEGORIES.find((c) => c.value === goal.category)?.label || goal.category}</Pill>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-muted-foreground hover:text-red-500 text-sm shrink-0"
                >
                  Remove
                </button>
              </Card>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="mt-6 w-full border border-dashed border-border rounded-xl py-4 text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          + Add a new goal
        </button>
      </main>

      {showModal && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title="New goal">
          <div className="p-6 space-y-4">
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Goal title</label>
              <Input
                placeholder="e.g. Morning meditation"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <Textarea
                placeholder="Describe what this goal looks like in practice..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
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
              <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
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
