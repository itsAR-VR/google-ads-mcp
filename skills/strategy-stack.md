# strategy-stack

## Description

Recommended companion stack for turning this repo from a raw Google Ads MCP into a paid-acquisition operating system.

## Core repo skills

### Read-first foundation
- product-marketing-context
- mine-search-terms
- search-term-methodology
- weekly-review
- reporting
- campaign-health-check
- google-ads-audit-framework

### Mutation-safe operations
- negative-keyword-management
- budget-optimization
- bid-management
- cep-write-operations

### Creative and competition
- ad-copy-analysis
- competitor-analysis

## Strong companion skills from broader marketing libraries

These are not shipped as copies in this repo, but they are worth integrating in a larger agent setup:

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

## Suggested operating layers

### Strategy and context
- product-marketing-context
- paid-ads
- competitor-analysis
- competitive-ads-extractor

### Query and account operations
- mine-search-terms
- search-term-methodology
- negative-keyword-management
- budget-optimization
- bid-management
- campaign-health-check

### Creative and messaging
- ad-copy-analysis
- ad-creative
- copywriting
- marketing-psychology
- hormozi-hooks

### Measurement and testing
- reporting
- weekly-review
- analytics-tracking
- ab-test-setup

### Post-click
- landing-page-architecture
- page-cro
- form-cro

## Why this structure works

It follows the strongest public pattern we found:
- read-first foundation before write automation
- separate audit/reporting from mutation execution
- workflow skills instead of just entity CRUD
- preview/confirm/post-check safety for writes
- negative-keyword hygiene treated as a first-class operating loop

That keeps strategy, analysis, mutation planning, testing, and post-click optimization separate enough to stay sane, while still letting workflows chain together like a proper operator loop.
