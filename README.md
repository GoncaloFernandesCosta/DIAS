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

**Works out of the box — zero cost, zero setup:**
- **Demo login:** `demo@leadpilot.io` / `demo1234` (or click *"Use demo account instantly"* on the login page)
- **Free sign-up:** create your own account in the app (email + password) — no external service needed
- **Demo Search source:** returns realistic leads instantly, so you can try the whole product before adding any API keys

> Google OAuth and real lead APIs are optional — they only light up once you add their (free) credentials.

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
| `NEXTAUTH_SECRET` | Auth token secret. **Optional — a safe default is bundled** so demo/sign-up auth works with zero config. Set your own in production. |
| `NEXTAUTH_URL` | Only needed for local dev (`http://localhost:3000`). **Do not set this on Vercel** — it is auto-detected. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth (see below) |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Demo credentials (default `demo@leadpilot.io` / `demo1234`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional extra account |
| `DIAS_DATA_DIR` | Override where leads/accounts are stored (defaults: local `.dias/data`, Vercel `/tmp/leadpilot`) |

> Lead search keys are read server-side and never sent to the browser.

### Google sign-in (free)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project (or pick one).
2. **APIs & Services → OAuth consent screen** → choose **External** → fill app name + your email.
3. **Credentials → Create credentials → OAuth client ID → Web application.**
4. Add an *Authorized redirect URI*: `https://<your-vercel-domain>/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for local dev).
5. Copy the Client ID / Secret into your env or Vercel Project Settings → Environment Variables as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

### Free lead-data options (all have free tiers)

| Source | Where to get a free key |
|--------|------------------------|
| Google Places | [Google Maps Platform](https://console.cloud.google.com/marketplace/product/google/places-backend.googleapis.com) — free trial credit, then ~$200/mo free allowance (Places API) |
| Google Search (SERP) | [SerpApi](https://serpapi.com) — 100 free searches/month, or use [value serp](https://www.valueserp.com) |
| Hunter.io | [hunter.io](https://hunter.io) — 50 free email verifications/mo |
| Apollo.io | [apollo.io](https://apollo.io) — full web app, free membership; API keys on higher plans |
| Crunchbase | [crunchbase.com](https://developer.crunchbase.com) — API requires approval |
| Facebook/Meta | [developers.facebook.com](https://developers.facebook.com) — Graph API access requires an app + review |

Until a real key is configured, the **Demo** source keeps every feature testable.

### Deploying to Vercel

- The repo is configured for Vercel: slim monorepo build (`web` + `lead-sources`), output in `web/.next`.
- **Auth just works on the deployed site** (bundled secret fallback + demo account). You only need env vars for the *optional* items above.
- Demo reminder: on the free serverless plan, leads/accounts live in the ephemeral `/tmp` and reset when the app redeploys. For real persistent data, add a free PostgreSQL (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and we can switch the stores to rows.

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
