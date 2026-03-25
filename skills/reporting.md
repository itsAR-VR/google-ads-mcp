# reporting

## Description

Decision-grade reporting skill for Google Ads.
This skill produces clean operator and stakeholder summaries instead of vanity dashboards with a fake motivational speech attached.

## When to use

Use when the user wants to:
- generate weekly or monthly reports
- prepare a client or executive update
- summarize account status with clear next actions
- produce a polished performance document

For recurring operational review, start with `weekly-review.md`.

## Required inputs

- reporting period
- spend, clicks, impressions, CPC, CTR
- conversions, conversion value, CVR, CPA/ROAS
- impression share and lost impression share data where available
- pacing summary
- major changes made during period
- anomalies and data quality notes

## Steps

1. Build two reporting views:
   - operator report
   - stakeholder report
2. Group findings by campaign, theme, device, geo, or time trend where relevant.
3. Explain what changed, why it changed, and what to do next.
4. Note confidence caveats:
   - low volume
   - learning period
   - recent structure changes
   - tracking or attribution changes
5. End with concrete actions and owners.

## Evaluation criteria

Must-have metrics:
- spend
- clicks
- CTR
- CPC
- conversions
- CVR
- CPA
- conversion value
- ROAS
- search impression share
- search lost IS by budget
- search lost IS by rank

## Output format

### Operator report
- account summary
- winners
- waste pockets
- root causes
- required approvals
- recommended next actions

### Stakeholder report
- concise performance summary
- key wins
- key risks
- what changed this period
- next actions

## Safety notes

- Never overclaim from tiny samples.
- Add a data-quality caveat section automatically when confidence is weak.
- Distinguish between performance movement and measurement movement.

## Example GAQL queries

### Campaign performance report
```sql
SELECT
  campaign.name,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpc,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```

### Device breakout
```sql
SELECT
  campaign.name,
  segments.device,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```
