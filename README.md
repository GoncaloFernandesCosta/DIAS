# LeadPilot (formerly D.I.A.S)

A SaaS for lead generation. Search Google, Facebook, Apollo, Hunter.io, Crunchbase and the open web in a single query, enrich results with real contact data, and run your whole pipeline from a beautiful dashboard.

The engine behind it is **D.I.A.S** — a modular system for automated B2B lead generation: discover companies, detect outdated tech stacks, build modern websites, draft personalized proposals, and track deals through a state machine.

## Quick Start (SaaS App)

```bash
# Install dependencies
pnpm install

# Build all packages (incl. the lead-sources adapters)
pnpm -r build

# Copy env template and add your API keys
cp .env.example web/.env.local

# Start the web app
pnpm dev            # http://localhost:3000
```

**Demo login (no setup needed):** `demo@leadpilot.io` / `demo1234`

The app ships with a built-in **Demo Search** source that returns realistic leads instantly, so you can try the whole product before adding any API keys.

## Features

- **Multi-source lead search** — one query across Google Places, Facebook/Meta, Apollo.io, Hunter.io, Crunchbase and Google Search (SerpAPI). Results are merged, deduplicated by domain, and enriched.
- **Kanban dashboard** — track every lead from `New → Contacted → Responded → Won/Lost`, with KPI cards and filterable search.
- **Instant enrichment** — Hunter.io verifies emails, Apollo adds titles, Crunchbase surfaces funding.
- **Add-to-dashboard** — save any returned lead to your pipeline with one click.
- **Auth** — NextAuth with demo credentials, email/password and Google OAuth.

## Architecture

The monorepo is split into independent, composable systems:

```
dias/
├── web/                          # NEW — Next.js SaaS app (NextAuth, Tailwind, App Router)
│   └── src/
│       ├── app/                  # pages: /, /login, /signup, /dashboard, /search, /settings
│       ├── components/home/      # landing page (Hero, Features, Integrations, Pricing...)
│       ├── components/dashboard/ # app UI
│       └── lib/                  # auth, lead search, lead store
├── cli/                          # CLI entrypoint (commander.js) — original D.I.A.S
├── shared/
│   └── contracts/                # Domain events & shared DTOs
├── systems/
│   ├── lead-sources/             # NEW — search/enrichment API adapters
│   │   └── src/infrastructure/
│   │       ├── google-places.adapter.ts
│   │       ├── facebook.adapter.ts
│   │       ├── hunter.adapter.ts
│   │       ├── apollo.adapter.ts
│   │       ├── crunchbase.adapter.ts
│   │       ├── serp.adapter.ts
│   │       └── demo.adapter.ts
│   ├── prospecting/
│   ├── site-builder/
│   ├── outreach/
│   ├── pipeline/
│   └── dashboard/
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### Adding a new lead source (easy)

1. Create `systems/lead-sources/src/infrastructure/<name>.adapter.ts` implementing `LeadSearchProvider` (or `EnrichmentProvider`).
2. Register it in `src/index.ts` → `buildLeadSearchService()`.
3. Optionally add a card to `web/src/components/home/Integrations.tsx` and an env key to `web/src/app/(app)/settings/page.tsx`.

No other changes needed — the service aggregates, deduplicates and enriches automatically.

## Configuration

| Variable | Purpose |
|----------|---------|
| `GOOGLE_PLACES_API_KEY` | Google Places lead search |
| `FACEBOOK_ACCESS_TOKEN` | Meta Graph API |
| `HUNTER_API_KEY` | Email finder / enrichment |
| `APOLLO_API_KEY` | B2B contacts |
| `CRUNCHBASE_API_KEY` | Company / funding data |
| `SERP_API_KEY` | Google Search results |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Auth |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Demo credentials (default `demo@leadpilot.io` / `demo1234`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth |

> Lead search keys are read server-side and never sent to the browser.

## Original D.I.A.S CLI (still available)

```bash
node cli/dist/index.js --help

dias prospect run --industry restaurants --region Lisbon --limit 200
dias pipeline run --industry restaurants --region Lisbon --limit 50
dias dashboard --port 3000
```

## Development

```bash
pnpm install
pnpm -r build    # builds all packages
pnpm -r test     # runs all tests (TDD via Vitest)
pnpm dev         # start the SaaS web app
```

## License

MIT
