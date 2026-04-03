// src/components/ui.tsx
// Reusable primitives used across all pages.
'use client';
import React from 'react';
import clsx from 'clsx';

// ── Button ────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ember' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}
export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', className)}
      style={styles.btn[variant]}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void; }
export function Card({ children, className, style, onClick }: CardProps) {
  return (
    <div className={clsx('card', className)} style={{ ...cardStyle, ...style }} onClick={onClick}>
      {children}
    </div>
  );
}

// ── Pill / Badge ──────────────────────────────────────────
type PillColor = 'sage' | 'ember' | 'gold' | 'rose' | 'sky' | 'gray';
interface PillProps { color?: PillColor; children: React.ReactNode; }
export function Pill({ color = 'gray', children }: PillProps) {
  return <span style={{ ...pillBase, ...pillColors[color] }}>{children}</span>;
}

// ── Input ─────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; hint?: string; }
export function Input({ label, hint, className, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={inputStyle} className={className} {...props} />
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; hint?: string; }
export function Textarea({ label, hint, ...props }: TextareaProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea style={{ ...inputStyle, resize: 'none' }} {...props} />
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; }
export function Select({ label, children, ...props }: SelectProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select style={inputStyle} {...props}>{children}</select>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; }
export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  if (!open) return null;
  return (
    <div style={backdropStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, marginBottom: 4 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: '1.5rem' }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────
export function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--cream-border)', margin: '1.5rem 0' }} />;
}

// ── Inline styles (avoids needing Tailwind / CSS modules) ──
const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--cream-border)',
  borderRadius: 'var(--radius)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow)',
};

const pillBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  fontSize: 12, padding: '4px 12px',
  borderRadius: 100, fontWeight: 500,
};

const pillColors: Record<PillColor, React.CSSProperties> = {
  sage:  { background: 'var(--sage-light)',  color: 'var(--sage)' },
  ember: { background: 'var(--ember-light)', color: 'var(--ember)' },
  gold:  { background: 'var(--gold-light)',  color: 'var(--gold)' },
  rose:  { background: 'var(--rose-light)',  color: 'var(--rose)' },
  sky:   { background: 'var(--sky-light)',   color: 'var(--sky)' },
  gray:  { background: 'var(--cream-dark)',  color: 'var(--ink-mid)' },
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500,
  color: 'var(--ink-mid)', marginBottom: 6,
};

const hintStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--ink-light)', marginTop: 5,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid var(--cream-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14, background: 'white',
  color: 'var(--ink)', outline: 'none',
  fontFamily: 'var(--font-body)',
};

const backdropStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(28,23,20,0.4)',
  zIndex: 200,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '1rem',
};

const modalStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 20,
  padding: '2rem',
  width: '100%', maxWidth: 460,
  boxShadow: 'var(--shadow-lg)',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const styles = {
  btn: {
    primary: { background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 100, padding: '10px 22px', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.15s', cursor: 'pointer' } as React.CSSProperties,
    ember:   { background: 'var(--ember)', color: 'white', border: 'none', borderRadius: 100, padding: '10px 22px', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.15s', cursor: 'pointer' } as React.CSSProperties,
    ghost:   { background: 'transparent', color: 'var(--ink-mid)', border: '1px solid var(--cream-border)', borderRadius: 100, padding: '10px 22px', fontSize: 14, fontWeight: 400, display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.15s', cursor: 'pointer' } as React.CSSProperties,
    danger:  { background: 'transparent', color: '#B84040', border: '1px solid #E8C0C0', borderRadius: 100, padding: '10px 22px', fontSize: 14, fontWeight: 400, display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.15s', cursor: 'pointer' } as React.CSSProperties,
  },
};
