// src/app/dashboard/layout.tsx
import { Nav } from '@/components/Nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav userName="D" />
      {children}
    </>
  );
}
