// src/app/onboarding/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Select, Divider } from '@/components/ui';
import type { BuddyTone, OnboardingFormData } from '@/types';

const TONES: { value: BuddyTone; emoji: string; name: string; desc: string }[] = [
  { value: 'gentle', emoji: '🌿', name: 'Kind & gentle',      desc: 'Warm, patient, nurturing' },
  { value: 'upbeat', emoji: '⚡', name: 'Upbeat & energizing', desc: 'High-energy, enthusiastic' },
  { value: 'firm',   emoji: '🎯', name: 'Firm & direct',       desc: 'No-nonsense, results-focused' },
  { value: 'calm',   emoji: '🌊', name: 'Calm & grounding',    desc: 'Peaceful, reflective' },
];

const CONSENT_TEXT =
  'I agree to receive automated AI voice calls from Ember at the phone number I provided, for the purpose of accountability check-ins. I can opt out at any time by pressing 9 during a call or visiting Settings.';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<OnboardingFormData>>({
    buddyName: 'Sage',
    buddyTone: 'gentle',
    timezone: 'America/Chicago',
    consentText: CONSENT_TEXT,
  });

  const set = (k: keyof OnboardingFormData, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  async function finish() {
    if (!form.consentGiven) {
      alert('Please confirm your consent to receive AI voice calls.');
      return;
    }
    setLoading(true);
    try {
      // In production: get clerkId from Clerk auth, then POST to API
      // const { userId } = useAuth();
      // await api.users.create({ ...form, clerkId: userId });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: 'var(--ember)', textAlign: 'center', marginBottom: 4 }}>
          ember
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-light)', marginBottom: '2rem' }}>
          Your personal accountability companion
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '2rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 100,
              background: i < step ? 'var(--ember)' : i === step ? 'var(--ember-glow)' : 'var(--cream-border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* ── Step 0: Name & phone ── */}
        {step === 0 && (
          <div>
            <h2 style={stepTitleStyle}>Nice to meet you 👋</h2>
            <p style={stepDescStyle}>We'll use your name so your buddy greets you personally on every call.</p>
            <Input label="Your first name" placeholder="e.g. Delaney" value={form.name || ''} onChange={e => set('name', e.target.value)} />
            <Input label="Your phone number" type="tel" placeholder="+1 (555) 000-0000" value={form.phone || ''} onChange={e => set('phone', e.target.value)} hint="This is the number Ember will call. Must be a real number you answer." />
            <Select label="Your timezone" value={form.timezone} onChange={e => set('timezone', e.target.value)}>
              <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
              <option value="America/Denver">America/Denver (Mountain)</option>
              <option value="America/Chicago">America/Chicago (Central)</option>
              <option value="America/New_York">America/New_York (Eastern)</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </Select>
            <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(1)}>
              Continue →
            </Button>
          </div>
        )}

        {/* ── Step 1: Buddy setup ── */}
        {step === 1 && (
          <div>
            <h2 style={stepTitleStyle}>Meet your buddy</h2>
            <p style={stepDescStyle}>Give your companion a name and pick a coaching style that resonates with you.</p>
            <Input label="Name your buddy" placeholder="e.g. Sage, Max, Luna, River…" value={form.buddyName || ''} onChange={e => set('buddyName', e.target.value)} />
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-mid)', marginBottom: 10 }}>Coaching style</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
              {TONES.map(tone => (
                <div key={tone.value} onClick={() => set('buddyTone', tone.value)}
                  style={{
                    padding: 14, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    border: `1.5px solid ${form.buddyTone === tone.value ? 'var(--ember)' : 'var(--cream-border)'}`,
                    background: form.buddyTone === tone.value ? 'var(--ember-light)' : 'white',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{tone.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tone.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{tone.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
              <Button variant="primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>Continue →</Button>
            </div>
          </div>
        )}

        {/* ── Step 2: First goal ── */}
        {step === 2 && (
          <div>
            <h2 style={stepTitleStyle}>Your first goal</h2>
            <p style={stepDescStyle}>What's one habit or goal you want Ember to help you stay on top of?</p>
            <Input label="Goal title" placeholder="e.g. Morning meditation, Daily workout…" value={form.goalTitle || ''} onChange={e => set('goalTitle', e.target.value)} />
            <Textarea label="Tell your buddy a little more (optional)" placeholder="e.g. 10 min on Headspace, before breakfast, no phone first thing…" rows={3} value={form.goalDescription || ''} onChange={e => set('goalDescription', e.target.value)} hint="This context helps your buddy check in more specifically." />
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
              <Button variant="primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>Continue →</Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Consent ── */}
        {step === 3 && (
          <div>
            <h2 style={stepTitleStyle}>One last thing</h2>
            <p style={stepDescStyle}>Ember calls your actual phone. We need your explicit consent before any call is placed.</p>
            <div style={consentBoxStyle}>{CONSENT_TEXT}</div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1.5rem' }}>
              <input type="checkbox" checked={!!form.consentGiven} onChange={e => set('consentGiven', e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--ember)' }} />
              <span style={{ fontSize: 13, color: 'var(--ink-mid)' }}>
                I agree to receive AI voice calls from Ember for accountability check-ins.
              </span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
              <Button variant="ember" style={{ flex: 1, justifyContent: 'center', fontSize: 15, padding: '13px 22px' }}
                onClick={finish} disabled={loading}>
                {loading ? 'Setting up…' : '🔥 Start with Ember'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  minHeight: '100vh', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  padding: '2rem', background: 'var(--cream)',
};
const cardStyle: React.CSSProperties = {
  width: '100%', maxWidth: 480,
  background: 'white',
  border: '1px solid var(--cream-border)',
  borderRadius: 24, padding: '2.5rem',
  boxShadow: 'var(--shadow-lg)',
};
const stepTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 20,
  fontWeight: 400, marginBottom: 4,
};
const stepDescStyle: React.CSSProperties = {
  fontSize: 13, color: 'var(--ink-light)', marginBottom: '1.5rem',
};
const consentBoxStyle: React.CSSProperties = {
  background: 'var(--cream)', border: '1px solid var(--cream-border)',
  borderRadius: 'var(--radius-sm)', padding: '1rem',
  fontSize: 12, color: 'var(--ink-mid)', lineHeight: 1.6,
  marginBottom: '1.25rem',
};
