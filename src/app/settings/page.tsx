// src/app/settings/page.tsx
'use client';
import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { Button, Input, Divider } from '@/components/ui';
import type { BuddyTone } from '@/types';

const TONES: { value: BuddyTone; emoji: string; name: string; desc: string }[] = [
  { value: 'gentle', emoji: '🌿', name: 'Kind & gentle',       desc: 'Warm, patient, nurturing' },
  { value: 'upbeat', emoji: '⚡', name: 'Upbeat & energizing',  desc: 'High-energy, enthusiastic' },
  { value: 'firm',   emoji: '🎯', name: 'Firm & direct',        desc: 'No-nonsense, results-focused' },
  { value: 'calm',   emoji: '🌊', name: 'Calm & grounding',     desc: 'Peaceful, reflective' },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    name: 'Delaney',
    phone: '+15550001234',
    timezone: 'America/Chicago',
    buddyName: 'Sage',
    buddyTone: 'gentle' as BuddyTone,
    quietStart: '22:00',
    quietEnd: '07:00',
  });

  function save() {
    // TODO: call api.users.update(...)
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <Nav userName="D" />
      <main style={{ maxWidth: 620, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)', marginBottom: '2.5rem' }}>Manage your account, buddy, and call preferences.</p>

        {/* ── Account ── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Account</h2>
          <Input label="Your name" value={settings.name} onChange={e => setSettings(p => ({ ...p, name: e.target.value }))} />
          <Input label="Phone number" type="tel" value={settings.phone} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} hint="This is the number Ember calls. Changes require re-verification." />
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Timezone</label>
            <select style={inputStyle} value={settings.timezone} onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))}>
              <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
              <option value="America/Denver">America/Denver (Mountain)</option>
              <option value="America/Chicago">America/Chicago (Central)</option>
              <option value="America/New_York">America/New_York (Eastern)</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
            </select>
          </div>
        </section>

        <Divider />

        {/* ── Buddy ── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Your buddy</h2>
          <Input label="Buddy's name" value={settings.buddyName} onChange={e => setSettings(p => ({ ...p, buddyName: e.target.value }))} />

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Coaching style</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TONES.map(tone => (
                <div key={tone.value} onClick={() => setSettings(p => ({ ...p, buddyTone: tone.value }))}
                  style={{ padding: 14, borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: `1.5px solid ${settings.buddyTone === tone.value ? 'var(--ember)' : 'var(--cream-border)'}`, background: settings.buddyTone === tone.value ? 'var(--ember-light)' : 'white', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{tone.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tone.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{tone.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Quiet hours ── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Quiet hours</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: '1rem' }}>
            Ember will never call you during these hours. Calls scheduled within quiet hours will be automatically rescheduled to just after quiet hours end.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Do not disturb from</label>
              <input type="time" style={inputStyle} value={settings.quietStart} onChange={e => setSettings(p => ({ ...p, quietStart: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Until</label>
              <input type="time" style={inputStyle} value={settings.quietEnd} onChange={e => setSettings(p => ({ ...p, quietEnd: e.target.value }))} />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Danger zone ── */}
        <section style={sectionStyle}>
          <h2 style={{ ...sectionTitleStyle, color: '#B84040' }}>Stop all calls</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: '1rem' }}>
            Pause all scheduled calls immediately. You can re-enable calling from this page at any time.
          </p>
          <Button variant="danger">Pause all calls</Button>
        </section>

        <Divider />

        {/* Save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="ember" onClick={save}>Save changes</Button>
          {saved && <span style={{ fontSize: 13, color: 'var(--sage)' }}>✓ Saved!</span>}
        </div>
      </main>
    </>
  );
}

const sectionStyle: React.CSSProperties = { marginBottom: '0.5rem' };
const sectionTitleStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, marginBottom: '1.25rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink-mid)', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'white', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-body)' };
