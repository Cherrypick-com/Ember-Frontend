# 🔥 Ember Web App — Next.js 14

The frontend for Ember, the AI voice accountability companion.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **No UI framework** — pure CSS variables + inline styles (easy to migrate to Tailwind later)
- **SWR** for data fetching
- **react-hook-form + zod** for form validation
- **Lucide React** for icons

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + Google Fonts
│   ├── globals.css             # Design system CSS variables
│   ├── page.tsx                # Root → redirects to /onboarding or /dashboard
│   ├── onboarding/
│   │   └── page.tsx            # 4-step onboarding flow
│   ├── dashboard/
│   │   ├── layout.tsx          # Wraps dashboard with Nav
│   │   └── page.tsx            # Main home screen
│   ├── goals/
│   │   └── page.tsx            # Goals grid + add goal modal
│   ├── calls/
│   │   └── page.tsx            # Call history + expandable summaries
│   └── settings/
│       └── page.tsx            # Buddy config, quiet hours, account
├── components/
│   ├── Nav.tsx                 # Sticky top navigation
│   ├── ui.tsx                  # Button, Card, Pill, Input, Modal, etc.
│   └── ScheduleCallModal.tsx   # Shared modal for scheduling calls
├── lib/
│   └── api.ts                  # All backend API calls in one place
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL, Clerk keys

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/onboarding` or `/dashboard` |
| `/onboarding` | 4-step setup: name/phone → buddy → goal → consent |
| `/dashboard` | Home: next call, streak, stats, goals sidebar |
| `/goals` | All goals, add/edit/delete |
| `/calls` | Full call history with summaries + commitments |
| `/settings` | Buddy config, quiet hours, pause calls |

---

## Connecting to the Backend

All API calls go through `src/lib/api.ts`. The base URL is set via `NEXT_PUBLIC_API_URL`.

For local development:
1. Start the backend: `cd ember-backend && npm run dev` (runs on port 3001)
2. Start this app: `npm run dev` (runs on port 3000)
3. The frontend will call `http://localhost:3001` for all API requests

---

## Adding Auth (Clerk)

1. Install: `npm install @clerk/nextjs`
2. Wrap `src/app/layout.tsx` with `<ClerkProvider>`
3. Add `clerkMiddleware()` to `src/middleware.ts`
4. Replace `TODO: Clerk auth` comments in `onboarding/page.tsx` and API calls

See [Clerk Next.js docs](https://clerk.com/docs/quickstarts/nextjs) for full setup.

---

## Deploy to Vercel

```bash
# Push to GitHub, then connect to Vercel
# Set env vars in Vercel dashboard:
#   NEXT_PUBLIC_API_URL → your Railway backend URL
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#   CLERK_SECRET_KEY
```

---

## Design System

All design tokens are in `src/app/globals.css` as CSS variables:

```css
--ember: #C8602A        /* Primary brand color */
--cream: #FAF7F2        /* Background */
--ink:   #1C1714        /* Text */
--sage:  #4A7C59        /* Success / completed */
--font-display: 'Lora'  /* Headings */
--font-body:    'DM Sans' /* Body text */
```

To customize the look, change these variables — every component respects them.
