# campaign-health-check

## Description

Diagnostic triage skill for campaign health.
This skill prioritizes actual business and delivery risks before cosmetic cleanup.

## When to use

Use when the user wants to:
- diagnose underperformance
- audit campaign health
- identify the most urgent issues
- understand whether the problem is tracking, budget, rank, query quality, or creative

## Required inputs

- campaign performance data
- impression share and lost impression share data
- bid strategy status
- asset/ad coverage data where available
- recent change history
- conversion tracking status if available

## Steps

1. Check tracking and measurement integrity first.
2. Check spend control and budget limitations.
3. Check conversion efficiency.
4. Check query quality and search term drift.
5. Check rank loss and demand capture.
6. Check ad/RSA asset coverage.
7. Check recent structural or bid changes.
8. Assign severity:
   - critical
   - warning
   - info

## Evaluation criteria

Critical examples:
- tracking failure
- severe CPA blowout with material volume
- disapprovals or zero impressions on key campaigns

Warning examples:
- budget-limited winners
- poor search query alignment
- rank loss on important campaigns
- unstable learning state

Info examples:
- weak ad strength without deeper evidence
- low-volume noise

## Output format

- health summary scorecard
- weighted account or campaign health score
- critical issues
- warnings
- info notes
- likely root causes
- recommended actions
- approval tier where relevant

## Suggested scoring model

Use weighted scoring rather than raw issue counts:
- tracking and measurement integrity: 30%
- spend control and budget sufficiency: 20%
- conversion efficiency: 20%
- query quality and intent alignment: 15%
- creative and asset health: 10%
- structural hygiene and recent changes: 5%

## Safety notes

- Do not overweight Ad Strength.
- Prioritize tracking, spend control, and conversion efficiency over cosmetic ad polishing.
- Distinguish real problems from low-signal noise.

## Example GAQL queries

### Campaign health overview
```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```

### Asset or ad coverage support
```sql
SELECT
  ad_group_ad.ad.id,
  ad_group_ad.status,
  ad_group.name,
  campaign.name,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions
FROM ad_group_ad
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.impressions DESC
```
