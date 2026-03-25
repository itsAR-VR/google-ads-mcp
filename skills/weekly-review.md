# weekly-review

## Description

Structured weekly performance review for Google Ads accounts.
This is the control-tower skill that turns platform noise into operator decisions.

## When to use

Use when the user wants to:
- run a weekly review
- compare this week vs last week
- identify what changed and why
- prepare a decision-grade account update

For polished stakeholder-facing output, pair with `reporting.md`.

## Required inputs

- last 7 days and prior 7 days data
- optional 28-day baseline
- campaign, ad group, search term, ad, and auction insights data where available
- current bid strategy and learning state
- budget pacing snapshot

## Steps

1. Compare last 7 days to prior 7 days.
2. Normalize against longer-term trend when possible.
3. Review:
   - spend pacing
   - conversions and CPA/ROAS
   - query quality and search term findings
   - negative keyword changes
   - RSA health and asset changes
   - bid strategy status
   - auction insights shifts
   - impression share losses from budget and rank
   - anomalies and recent account changes
4. Assign root causes:
   - budget
   - query quality
   - creative
   - landing page
   - bid strategy
   - competition shift
   - tracking issue
5. End with three buckets:
   - safe to automate
   - needs approval
   - low-data / monitor only

## Evaluation criteria

Flag only material deltas by default:
- spend change greater than 15-20%
- conversions change greater than 20%
- CPA/ROAS deterioration greater than 15%
- major lost impression share changes
- visible search term drift
- tracking anomalies

## Output format

- executive summary
- biggest wins
- biggest risks
- what changed
- why it changed
- severity-rated findings
- recommended next actions
- approval queue

## Severity scoring

Each issue should be tagged with:
- severity: critical / high / medium / low
- confidence: high / medium / low
- action type: observe / investigate / recommend / approve / apply

## Safety notes

- Do not report metrics without context and denominators.
- Flag when data is low-volume or unstable.
- If tracking changed recently, note that confidence is reduced.

## Example GAQL queries

### Weekly campaign comparison
```sql
SELECT
  campaign.name,
  segments.week,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.ctr,
  metrics.average_cpc
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY segments.week DESC, metrics.cost_micros DESC
```

### Change history support query
```sql
SELECT
  change_event.change_date_time,
  change_event.change_resource_type,
  change_event.change_resource_name,
  change_event.user_email,
  change_event.resource_change_operation
FROM change_event
WHERE change_event.change_date_time DURING LAST_14_DAYS
ORDER BY change_event.change_date_time DESC
```
