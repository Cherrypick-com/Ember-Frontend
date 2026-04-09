'use client';
import { useState, useEffect, type CSSProperties } from 'react';
import { Nav } from '@/components/Nav';
import { Card, Pill, Button, Input, Textarea, Modal, type PillColor } from '@/components/ui';
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

/** Soft well behind the emoji — matches category */
const CATEGORY_EMOJI_WELL: Record<GoalCategory, string> = {
  health: 'var(--sage-light)',
  mindfulness: 'var(--sage-light)',
  fitness: 'var(--rose-light)',
  learning: 'var(--sky-light)',
  productivity: 'var(--gold-light)',
  creative: 'var(--rose-light)',
  relationship: 'var(--ember-light)',
  other: 'var(--cream-dark)',
};

function categoryPillColor(category: GoalCategory): PillColor {
  const map: Record<GoalCategory, PillColor> = {
    health: 'sage',
    mindfulness: 'sage',
    fitness: 'rose',
    learning: 'sky',
    productivity: 'gold',
    creative: 'rose',
    relationship: 'ember',
    other: 'gray',
  };
  return map[category] ?? 'gray';
}

const goalCardStyle: CSSProperties = {
  borderRadius: 22,
  background: 'linear-gradient(165deg, #FFFDFB 0%, var(--cream-dark) 48%, #F5F0E8 100%)',
  border: '1px solid rgba(228, 221, 210, 0.65)',
  boxShadow: '0 4px 28px rgba(28, 23, 20, 0.06)',
  padding: '1.2rem 1.35rem',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
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
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {goals.map((goal) => (
              <Card key={goal.id} style={goalCardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background: CATEGORY_EMOJI_WELL[goal.category] ?? 'var(--cream-dark)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
                      fontSize: '2.125rem',
                      lineHeight: 1,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-hidden
                  >
                    {goal.emoji || '🎯'}
                  </div>
                  <div style={{ minWidth: 0, paddingTop: 2 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Pill color="sage">Active</Pill>
                      <Pill color={categoryPillColor(goal.category)}>
                        {CATEGORIES.find((c) => c.value === goal.category)?.label || goal.category}
                      </Pill>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.125rem',
                        fontWeight: 500,
                        color: 'var(--ink)',
                        margin: 0,
                        lineHeight: 1.35,
                      }}
                    >
                      {goal.title}
                    </h3>
                    {goal.description?.trim() ? (
                      <p style={{ fontSize: 14, marginTop: 10, marginBottom: 0, lineHeight: 1.55, color: 'var(--ink-mid)' }}>
                        {goal.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteGoal(goal.id)}
                  className="goal-remove"
                  style={{
                    flexShrink: 0,
                    fontSize: 13,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    padding: '4px 0',
                  }}
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
