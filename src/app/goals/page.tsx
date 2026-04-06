// src/app/goals/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Nav } from '@/components/Nav';
import { api } from '@/lib/api';
import type { Goal, GoalCategory } from '@/types';

const CATEGORIES: { value: GoalCategory; emoji: string; label: string }[] = [
  { value: 'mindfulness', emoji: '🧘', label: 'Mindfulness' },
  { value: 'fitness',     emoji: '💪', label: 'Fitness' },
  { value: 'learning',    emoji: '📚', label: 'Learning' },
  { value: 'health',      emoji: '🌿', label: 'Health' },
  { value: 'productivity',emoji: '⚡', label: 'Productivity' },
  { value: 'creative',    emoji: '✨', label: 'Creative' },
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
      setNewGoal({ title: '', description: '', category: 'mindfulness', emoji: '🧘' });
    } catch (e) {
      console.error('Failed to create goal', e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteGoal(goalId: string) {
    try {
      await api.goals.delete(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
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
              Everything Sage checks in on. Each goal becomes part of your buddy's context on every call.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90"
          >
            + New goal
          </button>
        </div>

        {loading ? (
          <p className="text-center py-12 text-muted-foreground">Loading your goals...</p>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground mb-4">No goals yet. Add your first goal!</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-full bg-foreground text-background text-sm"
            >
              + Add a goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="border border-border rounded-xl p-4 flex items-start justify-between gap-4 bg-card">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{goal.emoji || '🎯'}</span>
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-1 inline-block">Active</span>
                    <h3 className="font-medium text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground mt-2 inline-block">
                      {CATEGORIES.find(c => c.value === goal.category)?.label || goal.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-muted-foreground hover:text-red-500 text-sm shrink-0"
                >
                  Remove
                </button>
              </div>
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">New goal</h2>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Goal title</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground"
                placehol
