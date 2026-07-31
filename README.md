# D.I.A.S — Dynamic Intelligent Assistant Software

Automated B2B lead generation and outreach. Discover companies, build or upgrade their websites, send personalized proposals, and track deals through a pipeline — all from a single machine.

## Architecture

D.I.A.S is split into independent, composable systems (bounded contexts):

| System | Responsibility |
|--------|---------------|
| **Prospecting** | Scrape/parse company data from search engines. Detect outdated tech stacks. |
| **Site Builder** | Build websites for prospects in preview/deploy mode. |
| **Outreach** | Generate and send personalized Email/SMS proposals. |
| **Pipeline** | Orchestrate the workflow and own the Proposal state machine. |
| **Dashboard** | UI to run systems, monitor jobs, and approve proposals. |

Each system lives in `systems/<name>/` with a DDD layout (`domain/`, `application/`, `infrastructure/`, `interface/`). They communicate through typed domain events in `@dias/contracts` — never by reaching into each other's internals.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run the CLI
node cli/dist/index.js --help
```

## CLI Usage

```
Usage: dias [options] [command]

Commands:
  prospect   Run prospecting jobs to discover companies
  outreach   Send outreach messages (email/SMS)
  site       Build and deploy websites
  pipeline   Coordinate the full D.I.A.S workflow
  dashboard  Launch the D.I.A.S dashboard UI
```

### Standalone mode (run one system)

```bash
dias prospect run --industry restaurants --region Lisbon --limit 200
dias outreach send --case-id <id> --channel email
dias site build --case-id <id> --tier simple
```

### Full pipeline

```bash
dias pipeline run --industry restaurants --region Lisbon --limit 50
```

### Dashboard

```bash
dias dashboard --port 3000
```

## Proposal State Machine

Every prospect is tracked as a `ProposalCase` through explicit states:

```
DISCOVERED → ENRICHED → QUALIFIED → SITE_DRAFT_BUILDING → SITE_DRAFT_READY
→ PROPOSAL_DRAFTED → PROPOSAL_APPROVED → PROPOSAL_SENT → RESPONDED → WON/LOST/STALE
```

State transitions are enforced by the domain model and emit typed events that other systems subscribe to.

## Configuration

D.I.A.S runs fully offline by default (SQLite + in-memory queue + local AI). To use external services, set environment variables:

| Variable | Purpose |
|----------|---------|
| `AI_API_KEY` | Anthropic/OpenAI API key (optional, local AI is default) |
| `AI_PROVIDER` | `local` (default) or `api` |
| `EMAIL_API_KEY` | Resend/SendGrid API key |
| `SMS_API_KEY` | Twilio API key |

## Project Structure

```
dias/
├── cli/                        # CLI entrypoint (commander.js)
├── shared/
│   └── contracts/              # Domain events & shared DTOs
├── systems/
│   ├── prospecting/            # Company discovery & enrichment
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interface/
│   ├── outreach/               # Email/SMS generation & sending
│   ├── site-builder/           # Website building & deployment
│   ├── pipeline/               # Workflow orchestration
│   └── dashboard/              # Web UI
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Development

```bash
pnpm install
pnpm -r build    # builds all packages
pnpm -r test     # runs all tests
```

## License

MIT
