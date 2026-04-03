// src/components/Nav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Goals', href: '/goals' },
  { label: 'Call history', href: '/calls' },
  { label: 'Settings', href: '/settings' },
];

export function Nav({ userName = 'D' }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <nav style={navStyle}>
      <Link href="/dashboard" style={logoStyle}>ember</Link>

      <div style={{ display: 'flex', gap: 4 }}>
        {TABS.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} style={active ? activeTabStyle : tabStyle}>
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Link href="/settings" style={avatarStyle}>
        {userName.charAt(0).toUpperCase()}
      </Link>
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  background: 'var(--cream)',
  borderBottom: '1px solid var(--cream-border)',
  padding: '0 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 60,
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 20,
  color: 'var(--ember)',
  fontStyle: 'italic',
  textDecoration: 'none',
};

const tabStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  padding: '7px 14px',
  borderRadius: 100,
  color: 'var(--ink-mid)',
  textDecoration: 'none',
  transition: 'all 0.15s',
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  background: 'var(--ink)',
  color: 'var(--cream)',
  fontWeight: 500,
};

const avatarStyle: React.CSSProperties = {
  width: 34, height: 34,
  borderRadius: '50%',
  background: 'var(--ember-light)',
  border: '1.5px solid var(--ember)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 14,
  fontFamily: 'var(--font-display)',
  fontStyle: 'italic',
  color: 'var(--ember)',
  fontWeight: 500,
  textDecoration: 'none',
};
