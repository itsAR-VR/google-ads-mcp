# google-ads-mcp

Open-source MCP server for Google Ads.

It combines two pieces AR wanted in one repo:

- **GAQL read tools** for campaign analysis, keyword performance, ads, ad groups, and search terms.
- **Mutation tools** for actually changing Google Ads state: create, update, pause, enable, and budget changes.

This repo is designed as the practical open-source companion to Google's official **read-only** `google-ads-mcp` server.

## Why this exists

Google already ships an official GAQL MCP server:

- Docs: <https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server>
- Repo: <https://github.com/googleads/google-ads-mcp>

That server is useful, but it is intentionally limited:

- **Read-only**
- Focused on:
  - `list_accessible_customers`
  - `search` for GAQL queries
- Built in Python
- Uses stdio transport

That is great for analysis. It does **not** let an agent do the rest of the paid-search job:

- create campaigns
- create ad groups
- add keywords
- create RSAs
- pause or enable entities
- change budgets and bids

This repo fills that gap in TypeScript while keeping the same MCP mental model.

## Research summary

### What Austin's X post described
From the X post at <https://x.com/helloitsaustin/status/2036553581625745511>:

> "if you're a performance marketer, here's how I use a custom Claude Cowork plugin to manage Google Ads at @AnthropicAI. it connects to the Google Ads API via MCP, encodes my common paid search workflows into skills, and works on desktop and Dispatch."

What that tells us:

- The plugin is an **MCP-backed Google Ads operator**.
- It is built for **performance marketing workflows**, not generic API access.
- The value is not just raw tools. The value is also **skills/workflow encoding** for repeatable paid-search tasks.
- It works in both desktop and mobile/Dispatch-style agent surfaces.

### What the official Google GAQL MCP server does
Google's official server currently exposes a narrow but useful read surface:

- `list_accessible_customers`
- `search` for GAQL queries

Google's docs explicitly position it as:

- **read-only**
- backed by the Google Ads API
- designed for natural-language analysis
- authenticated with OAuth/Application Default Credentials plus a developer token

### Relevant Google Ads API facts
The Google Ads API supports both:

- **reads** through GAQL using `GoogleAdsService.Search` / `SearchStream`
- **writes** through resource mutate services and `GoogleAdsService.Mutate`

The official docs also call out two important mutation patterns:

- resource-specific mutation endpoints, like `CampaignService.MutateCampaigns`
- `GoogleAdsService.Mutate` for grouped multi-resource writes and temporary resource names

This repo leans into both ideas conceptually, but uses the battle-tested Node library `google-ads-api` for cleaner developer ergonomics.

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

## Supported workflow coverage

This server is meant to cover the core paid-search loops AR described:

- inspect campaign performance with GAQL
- drill into ad groups, ads, keywords, and search terms
- create net-new campaign structure
- pause and enable campaigns, ad groups, ads, and keywords
- update budgets and bids
- manage RSA assets

## Project structure

```text
google-ads-mcp/
├── .env.example
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

### Mutation workflows

- "Create a paused Search campaign called Brand Search US with a $50/day budget."
- "Create an ad group called Core Terms in campaign 1234567890."
- "Add phrase match keyword 'anthropic api pricing' to ad group 9876543210."
- "Pause these three keywords."
- "Enable campaign 1234567890."
- "Raise the campaign budget to 80000000 micros."
- "Update the RSA in ad group 9876543210 with new headlines and descriptions."

## OAuth notes

This repo uses the Node library `google-ads-api` and authenticates with:

- client ID
- client secret
- refresh token
- developer token
- customer ID
- optional login customer ID

That is the simplest practical route for an open-source MCP server that people can self-host.

## Design choices

### Why TypeScript instead of Python

Because this repo is intended to be:

- easy to publish
- easy to extend
- easy to slot into Node-heavy agent stacks

### Why not clone Google's server exactly

Because the point is not to make a second read-only server.

The point is to ship the server Austin implied he actually uses:

- GAQL reads
- mutations wired in
- workflow-friendly tool surface

### Why explicit workflow-oriented tools

Raw `search_gaql` is powerful, but blunt.

Performance marketers tend to repeat the same loops:

- campaign review
- keyword review
- search term mining
- pause losers
- raise budget on winners
- ship new ad groups and ads

So this repo exposes opinionated tools for those loops, plus raw GAQL when needed.

## Limitations

This repo is a strong open-source base, not the final form of every possible Google Ads operation.

Current scope is strongest for:

- Search campaign style workflows
- standard status changes
- keyword management
- RSA management
- campaign budgets

You can extend it for:

- Performance Max asset group tooling
- geo targeting mutations
- audience management
- label management
- bulk upload helpers
- policy diagnostics
- recommendation ingestion

## Safety notes

Google Ads mutations are real writes.

That means:

- use a test account first
- prefer paused creation workflows for new entities
- review manager-account scoping carefully
- do not hand this server to an unconstrained agent without guardrails

My take: read-only is safe but toothless, full-auto writes are powerful but spicy. This repo gives you the knife, so maybe do not juggle it blindfolded.

## Development

```bash
npm run typecheck
npm run build
npm run lint
```

## Ready-to-publish status

This repo is structured to be open-sourceable now:

- clean TypeScript MCP server
- documented setup
- env template
- examples
- MIT license
- clear distinction from Google's official read-only server

Before pushing publicly, I would do two quick real-world passes with live credentials:

1. validate one full read workflow
2. validate one full mutation workflow in a test account

That is the last inch, not the first mile.
