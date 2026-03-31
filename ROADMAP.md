# DSKDAO Portal — Roadmap

## Project Overview

DSKDAO Items Shop V2 is a Web3 gaming and community platform for the DSKDAO Discord community. It combines:
- A **Next.js 14** web portal with a dual-point economy (Redeemable + Soul-Bound points)
- An **item shop** with lootboxes, rarities, and NFT support
- **Mini-games** (Plinko, Ticket Arena)
- A **raffle system** with fair winner selection
- A **Discord bot** (discord.js) that syncs with the web platform
- Firebase/Firestore as the backend database
- Discord OAuth for authentication

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.1 (App Router) |
| Language | TypeScript 5.3 |
| UI | MUI v7, Tailwind CSS 3, Recharts |
| Auth | NextAuth 4 + Discord OAuth |
| Database | Firebase 10 / Firestore |
| Web3 | wagmi 2, viem 2, RainbowKit 2, ethers 6, Alchemy SDK |
| Discord | discord.js 14 |
| State | TanStack Query v5, React Context |
| Testing | Jest 30, Testing Library |
| Linting | ESLint 8 + TypeScript ESLint |

---

## Architecture (ASCII)

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / Client                     │
│  Next.js 14 App Router  ·  React 18  ·  MUI + Tailwind  │
│  Pages: dashboard, shop, raffles, games, admin, profile  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / Server Actions
┌────────────────────────▼────────────────────────────────┐
│                  Next.js API Routes (15)                  │
│  /api/auth  /api/users  /api/shop  /api/raffles          │
│  /api/games  /api/admin  /api/discord                    │
│  auth middleware (src/middleware/auth.ts)                 │
└───────┬──────────────────────────┬──────────────────────┘
        │                          │
┌───────▼──────────┐    ┌──────────▼──────────────────────┐
│  Service Layer   │    │         Discord Bot               │
│  userService     │    │  discordBotService.ts            │
│  enhanced-shop   │    │  Commands: /balance /award       │
│  gameService     │    │  /createraffle /endraffle        │
│  raffleService   │    │  /viewraffles                    │
│  purchaseService │    └──────────┬──────────────────────┘
└───────┬──────────┘               │
        │                          │
┌───────▼──────────────────────────▼──────────────────────┐
│                   Firebase / Firestore                    │
│  14 collections: users, items, purchases, transactions,  │
│  raffles, raffle_entries, games, game_sessions,          │
│  lootbox_contents, lootbox_openings, user_stats,         │
│  system_stats, activity_logs, notifications              │
└─────────────────────────────────────────────────────────┘
```

---

## Current State Assessment

### What Works
- Discord OAuth login and session management
- Dual-point economy (redeemable + soul-bound)
- Item shop with filtering, lootboxes, stock tracking
- Plinko mini-game (canvas, physics, multipliers)
- Ticket Arena game
- Raffle system (entry, winner selection, refunds)
- Admin dashboard (users, items, raffles, analytics)
- Discord bot (slash commands, button interactions, role sync)
- All 15 API routes implemented with auth middleware
- All 12 pages implemented
- 47+ passing unit tests + component/hook/API tests

### What's Incomplete / Broken

#### P0 — Critical
_(All P0 items resolved — auth middleware wired to all protected routes)_

#### P1 — Important
1. **React hook dependency warnings** — several `useEffect` calls have missing deps (linting warnings, not runtime bugs)
2. **No E2E tests** — Playwright not set up

#### P2 — Polish
3. **~40 console.log statements** in production code
4. **TypeScript warnings** in analytics aggregation
5. **Placeholder image utility** — no real image CDN configured
6. **Discord bot docs** — standalone-process setup not documented

---

## Prioritized Task List

### P0 — Critical (do first)
- [x] Wire authentication middleware onto all protected API routes
- [x] Add admin role check to all `/api/admin/*` routes
- [x] Verify shopService.ts stub is not used in purchase flow (confirmed: calls enhanced-shop via API)

### P1 — Important
- [x] Implement profile page Discord connection (redirects to Discord OAuth signin)
- [x] Analytics `loadAnalytics()` now fetches real data from `/api/admin/analytics`
- [x] Removed all TODO comments from source
- [x] Add API route integration tests for shop purchase and items
- [x] Add component tests for BalanceCard, RaffleCard, EnhancedShopItemCard
- [x] Add hook tests for useShop
- [x] Wrap app in ErrorBoundary (RootProvider + page content)
- [x] Add aria-labels to icon-only buttons in Header and MobileNavigation
- [ ] Fix React hook dependency warnings

### P2 — Polish
- [ ] Remove or downgrade console.log statements to proper logger
- [ ] Fix TypeScript warnings in analytics
- [ ] Document Discord bot setup (standalone process vs. Next.js integration)

---

## Testing Strategy

- **Unit**: Jest + Testing Library for utility functions and pure services (already in place)
- **Integration**: Jest with mocked services for API route handlers (`src/__tests__/api/`)
- **Component**: Testing Library for BalanceCard, RaffleCard, EnhancedShopItemCard (`src/__tests__/components/`)
- **Hook**: Renderless hook tests for `useShop` (`src/__tests__/hooks/`)
- **E2E** (future): Playwright for full user flows

### Running tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (no watch, with coverage)
npm run test:ci
```

---

## Deployment Checklist

### Pre-deploy
- [ ] Copy `.env.example` → `.env.production` and fill all values
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Generate new `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Enable Firebase project (production Firestore rules)
- [ ] Add production URL to Discord application's OAuth redirect URIs

### Build & verify
- [ ] `npm run lint` — zero errors
- [ ] `npm run test:ci` — all tests pass
- [ ] `npm run build` — build succeeds

### Deploy
- [ ] Push to Vercel / hosting provider
- [ ] Verify `/api/auth/[...nextauth]` callback works with Discord
- [ ] Smoke test: login → shop → purchase flow
- [ ] Smoke test: admin dashboard accessible only with admin role

---

## Session Changelog (2026-03-31)

### Completed
- **TASK 1 — ROADMAP.md**: Created this comprehensive roadmap.
- **TASK 2 — .env.example**: Verified complete; all 12 env vars documented.
- **TASK 3 — Component & API Tests**: Added 5 new test files (~39 tests):
  - `src/__tests__/components/BalanceCard.test.tsx` — 6 tests
  - `src/__tests__/components/RaffleCard.test.tsx` — 8 tests
  - `src/__tests__/components/ShopItem.test.tsx` — 10 tests
  - `src/__tests__/api/shop.test.ts` — 8 tests (GET items, POST purchase auth/validation)
  - `src/__tests__/hooks/useShop.test.ts` — 7 tests (items/loading/error/purchase states)
- **TASK 5 — Error Boundaries**: Wrapped `RootProvider` children with `ErrorBoundary` at two levels (outer provider + page content).
- **TASK 6 — Accessibility**: Added `aria-label` to icon-only `IconButton` elements in `Header.tsx` and `MobileNavigation.tsx`.

### Remaining
- Fix React hook dependency warnings
- Remove/downgrade console.log statements
- Fix TypeScript warnings in analytics aggregation
- Document Discord bot standalone-process setup
- E2E tests with Playwright

## Definition of Done

- All P0 and P1 tasks complete
- No unauthenticated access to protected endpoints
- Admin routes require admin role
- `npm run lint` passes with 0 errors
- `npm run test` passes with 0 failures
- All TODO comments either resolved or converted to tracked issues
- ROADMAP.md updated to reflect final state
