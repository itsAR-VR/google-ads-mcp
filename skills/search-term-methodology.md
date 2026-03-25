# search-term-methodology

## Description

Structured evaluation framework for reviewing raw search terms like a paid-search operator.
Use this skill when another workflow, especially `mine-search-terms`, needs a repeatable method for deciding whether a query should be kept, promoted, watched, or excluded.

## When to use

Use when the user wants to:
- review search terms for waste or opportunity
- decide whether to add negatives
- identify keyword expansion opportunities
- diagnose intent drift
- compare a triggering query against the matched keyword and ad group context

For broader reporting, use `reporting.md`.
For direct mutation planning, pair with `negative-keyword-management.md`.

## Required inputs

- date range
- campaign and/or ad group scope
- search term data
- matched keyword text
- match type
- spend, clicks, impressions, conversions, conversion value, CTR, CPC, CVR, CPA/ROAS where available
- target CPA or target ROAS, if known
- brand terms and protected terms, if available

## Steps

1. Filter to terms with `added/excluded = none` when possible.
2. Sort by spend descending to inspect the heaviest hitters first.
3. Compare each search term to the matched keyword and the surrounding ad group/campaign intent.
4. Classify the query into one of these buckets:
   - keep
   - watchlist
   - keyword candidate
   - negative candidate
   - landing-page gap
   - messaging gap
5. Label the intent:
   - commercial high intent
   - research intent
   - support intent
   - jobs intent
   - free/DIY intent
   - competitor intent
   - geo mismatch
   - product mismatch
   - ambiguous
6. Evaluate confidence:
   - high confidence
   - needs human review
   - insufficient data
7. For positive opportunities, decide whether the term should become:
   - an exact match keyword
   - a phrase match keyword
   - a broader theme to monitor
8. For negatives, propose the safest match type:
   - exact
   - phrase
   - broad
9. Explain reasoning in plain English with evidence, not vibes.

## Evaluation criteria

### Strong negative candidates
- obvious irrelevant intent regardless of spend
- spend exceeds target guardrail with zero conversions
- clear mismatch with offer, geo, audience, or product
- repeated low-quality theme across multiple queries

### Strong keyword candidates
- repeated high-intent query with conversions or strong conversion signals
- clear thematic demand that lacks dedicated keyword coverage
- strong CTR + CVR and message-match potential

### Watchlist only
- low-volume terms with weak evidence
- ambiguous intent where a phrase negative could block winners
- noisy queries during learning periods or after recent account changes

## Output format

Return a table or CSV-ready structure with:
- campaign
- ad group
- matched keyword
- keyword match type
- search term
- spend
- clicks
- conversions
- conversion value
- CPA/ROAS
- recommended action
- recommended negative match type or keyword match type
- confidence
- reasoning

## Safety notes

- Never auto-negative a term only because CTR is low.
- Never promote a query to a new keyword from a single isolated lucky conversion.
- Flag ambiguous terms for human review.
- Check whether the proposed negative overlaps with proven converting terms before applying.

## Example GAQL queries

### Search term review
```sql
SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
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
LIMIT 500
```

### Search term segments by day
```sql
SELECT
  campaign.name,
  ad_group.name,
  search_term_view.search_term,
  segments.date,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions
FROM search_term_view
WHERE segments.date DURING LAST_14_DAYS
ORDER BY segments.date DESC, metrics.cost_micros DESC
```
