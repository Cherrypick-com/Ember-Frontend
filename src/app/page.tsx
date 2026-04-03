// src/app/page.tsx
import { redirect } from 'next/navigation';

// In production: check if user is authenticated via Clerk
// If yes → redirect to /dashboard
// If no  → redirect to /onboarding
export default function RootPage() {
  // TODO: replace with Clerk auth check
  // const { userId } = auth();
  // if (userId) redirect('/dashboard');
  redirect('/onboarding');
}
