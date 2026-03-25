# Google Ads MCP Skills

This directory contains the workflow layer for the repo.

The MCP server gives an agent live Google Ads read and mutation tools.
These skills tell the agent **how to think like a paid-search operator** instead of just spraying GAQL at the wall.

## Design principles

- **Observe → Recommend → Approve → Apply**
- Recommendation-first, mutation-second
- Structured outputs with explicit reasoning
- Human approval for meaningful writes
- Concrete GAQL examples in every skill
- Cross-skill chaining where one workflow calls another

## Suggested usage model

- Use `search-term-methodology.md` as a dependency for `mine-search-terms.md`
- Use `product-marketing-context.md` as a shared context file for messaging-heavy skills
- Use `analytics-tracking.md`, `landing-page-architecture.md`, `page-cro.md`, and `form-cro.md` as companion skills from your broader skill library when adapting this repo to a larger agent stack

## Included skills

- `mine-search-terms.md`
- `search-term-methodology.md`
- `budget-optimization.md`
- `weekly-review.md`
- `reporting.md`
- `negative-keyword-management.md`
- `campaign-health-check.md`
- `bid-management.md`
- `ad-copy-analysis.md`
- `competitor-analysis.md`
- `product-marketing-context.md`
- `strategy-stack.md`

## Why skills matter

Austin's Cowork plugin pattern is the right one: raw tools are not enough.
A useful paid-search agent needs:

- explicit review loops
- thresholds and guardrails
- auditability
- output formats that humans can trust
- examples of what to query when diagnosing performance changes

That is what these skills encode.
