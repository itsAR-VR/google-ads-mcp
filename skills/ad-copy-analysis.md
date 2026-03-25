# ad-copy-analysis

## Description

RSA and search ad copy analysis skill.
This skill reviews asset diversity, performance evidence, pinning, and message-match issues, then suggests test directions instead of random ad churn.

## When to use

Use when the user wants to:
- review RSA performance
- improve headlines and descriptions
- reduce asset fatigue
- plan ad tests
- diagnose message-match issues between queries, ads, and landing pages

## Required inputs

- ad and RSA asset performance data
- impressions, clicks, conversions, CTR, CVR where available
- search term insights or search term findings
- current headlines/descriptions
- landing page and offer context if available

## Steps

1. Review asset-level and ad-level performance.
2. Check whether messaging covers:
   - keyword relevance
   - value proposition
   - proof/trust
   - CTA
   - urgency
   - differentiation
3. Detect over-pinning.
4. Identify stale or zero-impression assets.
5. Propose test variants by hypothesis family:
   - offer
   - pain point
   - proof
   - urgency
   - CTA
6. Preserve proven winners while rotating weak assets.

## Evaluation criteria

- prioritize actual performance evidence over generic Ad Strength theater
- zero-impression assets after a meaningful window are replacement candidates
- strong ads show both relevance and differentiated value
- one strong RSA per ad group is often enough unless distinct hypotheses deserve separate tests

## Output format

- current asset diagnosis
- missing messaging dimensions
- weak assets to replace
- keep assets to preserve
- proposed test variants
- rationale for each test family

## Safety notes

- Do not rewrite every asset at once.
- Keep at least some proven winner assets live during testing.
- Excess pinning should be treated as a caution flag.

## Example GAQL queries

### Ad performance
```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_ad.ad.id,
  ad_group_ad.status,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.ctr
FROM ad_group_ad
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.impressions DESC
```

### RSA asset support query
```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_ad.ad.id,
  ad_group_ad.ad.responsive_search_ad.headlines,
  ad_group_ad.ad.responsive_search_ad.descriptions,
  ad_group_ad.status
FROM ad_group_ad
WHERE ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD
```
