# mine-search-terms

## Description

Primary search term mining workflow for Google Ads.
This skill queries search term data with GAQL, ranks terms and themes by cost and opportunity, and evaluates each term through `search-term-methodology.md` so outputs are auditable instead of hand-wavy.

## When to use

Use when the user wants to:
- find wasted spend
- identify negative keyword opportunities
- mine converting queries for expansion
- understand why a campaign is leaking spend
- generate an audit-ready search term report

This skill should call `search-term-methodology.md` as a sub-evaluation framework.

## Required inputs

- customer/account scope
- campaign or ad group filters, optional
- date range
- target CPA or ROAS, optional but strongly preferred
- protected terms or brand rules, optional
- existing negatives, if available

## Steps

1. Pull search terms with GAQL.
2. Rank by spend descending.
3. Group terms into themes when possible:
   - brand
   - competitor
   - irrelevant intent
   - product/service mismatch
   - research intent
   - high commercial intent
4. For each term, run `search-term-methodology.md`.
5. Split findings into five buckets:
   - negative candidates
   - keyword expansion candidates
   - keep/no action
   - watchlist
   - landing-page or messaging gaps
6. Generate a reasoning field for every flagged term.
7. Generate two outputs:
   - human summary
   - CSV-ready detailed export
8. If direct write access is allowed, prepare a draft mutation queue but do not apply without explicit approval.

## Evaluation criteria

### Required checks
- Is the term aligned with the matched keyword?
- Is the term aligned with the ad group theme?
- Is the spend material relative to target efficiency?
- Is there evidence of conversion or strong intent?
- Could a negative conflict with a valuable nearby term?
- Does the pattern indicate a landing page or ad copy problem instead of a keyword problem?

### Theme-level checks
- top wasting themes
- top converting themes
- rising themes
- queries with spend and no conversions
- converting queries that lack dedicated keyword coverage

## Output format

### Summary
- top 5 waste themes
- top 5 opportunity themes
- recommended negative actions
- recommended keyword expansions
- messaging/landing page insights
- actions safe to queue vs actions needing review

### Detailed CSV-ready output
Columns:
- campaign
- ad_group
- keyword
- keyword_match_type
- search_term
- theme
- clicks
- cost_micros
- conversions
- conversion_value
- ctr
- average_cpc
- recommended_action
- recommended_match_type
- confidence
- reasoning

## Approval and safety

- Mutations require explicit approval.
- Do not auto-apply ambiguous negatives.
- Do not recommend broad negatives without a collision check.
- Surface blocked-intent preview when a negative may affect adjacent valuable traffic.

## Example GAQL queries

### Heavy-spend search term mining
```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  search_term_view.search_term,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.ctr,
  metrics.average_cpc
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
LIMIT 1000
```

### Search term mining by campaign
```sql
SELECT
  campaign.id,
  campaign.name,
  search_term_view.search_term,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM search_term_view
WHERE campaign.id = 1234567890
  AND segments.date DURING LAST_14_DAYS
ORDER BY metrics.cost_micros DESC
LIMIT 500
```
