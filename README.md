# NBA Ratings

NBA team and player net ratings for the 2025-26 season. Built with Next.js, TypeScript, and Recharts.

## Features

- **Team Ratings** — All 30 NBA teams with ORtg / DRtg / NRtg, interactive scatter plot and bar chart
- **All Players** — Individual player net ratings with filtering by name, team, and minimum games played
- **Team Detail** — Per-team roster with player ratings and team summary cards
- **Player Search** — Real-time incremental search with player stat cards
- **Compare Players** — Side-by-side comparison of up to 4 players with radar chart visualization

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts (scatter, bar, radar) |
| Data Source | stats.nba.com API (server-side) |
| Testing | Playwright (E2E) |

## Data Source

Player and team ratings are fetched server-side from `stats.nba.com` via Next.js Server Components. Data is cached with ISR (Incremental Static Regeneration) and revalidated every hour.

**Metrics:**
- **ORtg** — Offensive Rating (points scored per 100 possessions)
- **DRtg** — Defensive Rating (points allowed per 100 possessions)
- **NRtg** — Net Rating (ORtg - DRtg)
- **PIE** — Player Impact Estimate

## Data Update

Data is automatically kept fresh through two mechanisms:

1. **ISR (automatic)** — Pages revalidate every hour when accessed
2. **GitHub Actions (scheduled)** — Triggers revalidation twice daily (07:00 / 16:00 JST)

### Setup for scheduled revalidation

1. Set the `REVALIDATION_TOKEN` environment variable on your hosting platform (e.g. Vercel)
2. Add the following to your GitHub repository:
   - **Secret:** `REVALIDATION_TOKEN` — same value as above
   - **Variable:** `SITE_URL` — your deployed URL (e.g. `https://your-app.vercel.app`)

### Manual revalidation

```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" https://your-app.vercel.app/api/revalidate
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## E2E Tests

```bash
npx playwright install chromium
npx playwright test
```

36 tests across 6 suites covering all pages, navigation, filtering, sorting, search, and player comparison.

## License

MIT
