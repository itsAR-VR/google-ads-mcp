# google-ads-mcp

Open-source Google Ads MCP server plus a paid-search skill pack.

This repo now ships two layers:

- **MCP server tools** for live Google Ads reads and mutations
- **Structured workflow skills** in `/skills` so an agent behaves like a performance marketer instead of a confused SQL intern with a developer token

## Why this exists

Google already ships an official Google Ads MCP server:

- Docs: <https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server>
- Repo: <https://github.com/googleads/google-ads-mcp>

That server is useful, but intentionally narrow:

- read-only
- GAQL-focused
- Python-based

Austin's Cowork thread showed the more interesting pattern:

- Google Ads data access via MCP
- marketer workflows encoded as skills
- approval-gated mutations
- useful output formats with reasoning and auditability
- works on desktop and Dispatch, not just a laptop dev setup

This repo is built around that idea.

## What Austin's thread confirmed

From <https://x.com/helloitsaustin/status/2036553581625745511> and the surrounding thread:

- his plugin uses the official GAQL MCP as the read layer
- mutations are wired separately through the Google Ads API
- the value comes from **skills**, not just raw access
- confirmed skill/workflow pattern includes:
  - `mine-search-terms`
  - `search-term-methodology`
  - budget optimizations
  - weekly reviews
  - reporting
- search term outputs include a **reasoning column** for auditability
- mutations require explicit approval

That is the right model, so this repo copies the architecture and expands the skill suite.

## Repo philosophy

This is not supposed to be a "set bids with AI" toy.

The useful version of Google Ads automation is:
- observe
- recommend
- approve
- apply

In practice, that means:
- recommendation-first
- mutation-second
- strong guardrails
- structured outputs
- concrete GAQL examples
- auditability for every meaningful change

## Research basis

This repo was shaped from five inputs:
- Austin's full X thread and follow-ups
- Google's official GAQL MCP server and docs
- broader public Google Ads MCP / skill ecosystems
- local marketing skill inventory
- best-practice research on Google Ads automation and PPC operations

Common pattern across the ecosystem:
- **MCP servers** handle live data and mutations
- **skills/plugins** encode workflow logic
- the best systems behave like operator copilots, not autonomous budget arsonists

## Exposed MCP tools

### Read tools
- `list_accessible_customers`
- `search_gaql`
- `get_campaign_performance`
- `get_ad_group_performance`
- `get_keyword_performance`
- `get_search_terms`
- `list_campaigns`
- `list_ad_groups`
- `list_ads`

### Mutation tools
- `create_campaign`
- `update_campaign`
- `create_ad_group`
- `update_ad_group`
- `create_keyword`
- `update_keyword`
- `create_responsive_search_ad`
- `update_responsive_search_ad`
- `update_campaign_budget`
- `set_entity_statuses`

## Included skills

Inside `/skills`:

- `search-term-methodology.md`
- `mine-search-terms.md`
- `budget-optimization.md`
- `weekly-review.md`
- `reporting.md`
- `negative-keyword-management.md`
- `campaign-health-check.md`
- `bid-management.md`
- `ad-copy-analysis.md`
- `competitor-analysis.md`
- `product-marketing-context.md`
- `google-ads-audit-framework.md`
- `cep-write-operations.md`
- `strategy-stack.md`

These skills are structured markdown workflows with:
- description
- when to use
- required inputs
- step-by-step method
- evaluation criteria
- output format
- safety/approval notes
- CEP write protocol where relevant
- example GAQL queries

## Public research upgrades folded into this version

Public repo and skill-library scans pushed this repo in four important directions:

- **Read-first core** inspired by public Google Ads MCP baselines
- **Audit / reporting / mutation separation** instead of one giant blob skill
- **CEP write safety**: Confirm → Execute → Post-check
- **Negative keyword hygiene as a first-class workflow**, including future room for conflict cleanup and shared list propagation

Useful public references included:
- `google-marketing-solutions/google_ads_mcp`
- `cohnen/mcp-google-ads`
- `gomarble-ai/google-ads-mcp-server`
- `AgriciDaniel/claude-ads`
- `itallstartedwithaidea/google-ads-skills`

The best idea stolen from the public internet, respectfully, is this:
raw tools are table stakes. The real value is safe workflow packaging.

## What the skill pack covers

### 1. Search term mining and negative management
The core Austin-style loop is here and expanded:
- mine terms by spend and intent
- evaluate them with a repeatable methodology
- recommend negatives with collision checks
- produce CSV-ready outputs with reasoning
- support approval-gated mutation prep

### 2. Budget pacing and optimization
- month-aware pacing
- overspend and underspend detection
- budget-limited winner detection
- reallocation recommendations instead of dumb blanket cuts

### 3. Weekly reviews and reporting
- weekly performance review structure
- operator summary vs stakeholder summary
- root-cause tagging
- action queues and approval separation

### 4. Campaign diagnostics and bid oversight
- campaign health triage
- tracking, budget, query quality, rank, and creative checks
- Smart Bidding oversight with anti-thrashing rules
- manual CPC and target sanity review where relevant

### 5. Creative and competition
- RSA/ad copy analysis
- asset gap detection
- pinning warnings
- competitor and auction-insights interpretation
- fight / flank / avoid decision framing

### 6. Shared context
- reusable product-marketing context for ads and landing pages
- strategy stack doc that maps companion skills outside this repo

## Strong companion skills from broader marketing libraries

This repo focuses on the Google Ads operator layer, but it gets much stronger when paired with adjacent marketing skills like:

- paid-ads
- ad-creative
- analytics-tracking
- ab-test-setup
- competitive-ads-extractor
- landing-page-architecture
- page-cro
- form-cro
- copywriting
- marketing-psychology
- hormozi-hooks
- hormozi-value-equation
- competitor-alternatives

Those are referenced in `skills/strategy-stack.md` so the repo can grow into a fuller paid-acquisition system without turning into a junk drawer.

## Project structure

```text
google-ads-mcp/
├── .env.example
├── .eslintignore
├── .gitignore
├── LICENSE
├── README.md
├── eslint.config.js
├── package.json
├── tsconfig.json
├── examples/
│   ├── claude-desktop-config.json
│   ├── prompt-examples.md
│   └── workflows.md
├── skills/
│   ├── README.md
│   ├── search-term-methodology.md
│   ├── mine-search-terms.md
│   ├── budget-optimization.md
│   ├── weekly-review.md
│   ├── reporting.md
│   ├── negative-keyword-management.md
│   ├── campaign-health-check.md
│   ├── bid-management.md
│   ├── ad-copy-analysis.md
│   ├── competitor-analysis.md
│   ├── product-marketing-context.md
│   └── strategy-stack.md
└── src/
    ├── config.ts
    ├── gaql.ts
    ├── googleAdsClient.ts
    ├── index.ts
    ├── logger.ts
    ├── tools.ts
    └── types.ts
```

## Setup

### 1. Prerequisites

You need:
- Node.js 20+
- a Google Ads API developer token
- a Google Cloud OAuth client
- a refresh token for a user with Google Ads access
- a Google Ads customer ID
- optionally a manager account login customer ID

### 2. Install

```bash
npm install
npm run build
```

### 3. Configure env

Copy `.env.example` to `.env` and fill in:

```bash
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=
GOOGLE_ADS_PROJECT_ID=
GOOGLE_ADS_MCP_LOG_LEVEL=info
```

### 4. Run locally

```bash
npm run dev
```

or:

```bash
npm run build
npm start
```

## Claude Desktop / MCP config example

See `examples/claude-desktop-config.json`.

Minimal example:

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "node",
      "args": ["/absolute/path/to/google-ads-mcp/dist/index.js"],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "...",
        "GOOGLE_ADS_CLIENT_SECRET": "...",
        "GOOGLE_ADS_REFRESH_TOKEN": "...",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "...",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "0987654321"
      }
    }
  }
}
```

## Example prompts

### Read workflows
- "List my accessible Google Ads customers."
- "Show campaign performance for the last 30 days."
- "Which keywords spent the most in the last 14 days?"
- "Pull search terms for campaign 123456 over the last 7 days."
- "List active RSAs and their headlines."

### Skill workflows
- "Run mine-search-terms for the last 30 days and give me a CSV-style output with reasoning for every flagged query."
- "Use search-term-methodology to classify these 100 search terms into keep, watchlist, negative, or keyword candidate."
- "Run a weekly-review and tell me what changed, why it changed, and what needs approval."
- "Prepare budget-optimization recommendations for this month, but do not apply anything."
- "Run a competitor-analysis and tell me whether we should fight, flank, or avoid on these campaigns."

### Mutation workflows
- "Create a paused Search campaign called Brand Search US with a $50/day budget."
- "Create an ad group called Core Terms in campaign 1234567890."
- "Add phrase match keyword 'anthropic api pricing' to ad group 9876543210."
- "Pause these three keywords."
- "Raise the campaign budget to 80000000 micros."
- "Queue these negative keywords for approval but don't apply them yet."

## OAuth notes

This repo uses the Node library `google-ads-api` and authenticates with:
- client ID
- client secret
- refresh token
- developer token
- customer ID
- optional login customer ID

That is the simplest practical route for an open-source Node MCP server people can self-host.

## Safety model

Google Ads mutations are real writes, so the repo is designed around an approval-aware model.

Recommended policy:
- **Auto-safe**: reports, audits, summaries, draft queues
- **Review required**: keyword adds, negative adds outside safe taxonomies, budget reallocations, ad launches, bid target changes
- **Manual only**: structural rebuilds, tracking changes, broad-match expansion at scale, brand-risky edits

Hard guardrail ideas encoded into the skills:
- never mutate when tracking is unhealthy
- never push high-impact changes without a preview/diff
- never auto-apply risky negatives
- avoid repeated Smart Bidding thrash
- never recommend Broad Match with Manual CPC as a casual default
- prefer pause over remove for most operational changes
- new entities should usually launch paused first
- require reasoning and confidence labels
- keep an audit trail for recommended and applied actions

## Why TypeScript instead of Python

Because the repo is meant to be:
- easy to publish
- easy to extend
- easy to slot into Node-heavy agent stacks

## Limitations

This is a strong open-source base, not the last form of every Google Ads workflow.

Current strengths:
- Search-style account operations
- search term mining
- keyword and RSA workflows
- approval-aware mutation prep
- budgets and status changes
- workflow skill packaging

Good next extensions:
- Performance Max deeper support
- labels
- shared negative list helpers
- recommendation ingestion and filtering
- anomaly detection as first-class tools
- change-history driven rollback helpers
- landing-page/CRO integrations

## Development

```bash
npm run typecheck
npm run build
npm run lint
```

## Ready-to-publish status

This repo is public-ready as an open-source base:
- clean TypeScript MCP server
- structured skills directory
- examples and env template
- MIT license
- docs that explain the read + write + skill architecture

Before trusting it with real money, do two boring but necessary things:
1. validate one full read workflow with live credentials
2. validate one mutation workflow in a test account

That last part is less sexy than the demo, but it's how you avoid becoming the world's smartest intern who accidentally set fire to a budget.
