# budget-optimization

## Description

Month-aware budget pacing and reallocation workflow.
This skill exists to stop budget management from becoming caveman automation.
It evaluates pacing, efficiency, impression share, and budget constraints before recommending changes.

## When to use

Use when the user wants to:
- understand overspend or underspend
- reallocate budget across campaigns
- identify budget-limited winners
- prepare budget change recommendations
- review month-to-date pacing

For weekly account rollups, pair with `weekly-review.md`.
For bidding considerations, pair with `bid-management.md`.

## Required inputs

- monthly budget target or campaign budget constraints
- date range, usually month-to-date plus trailing comparison window
- spend, conversions, conversion value, CPA/ROAS
- impression share and lost impression share by budget/rank, when available
- current bid strategy and learning status

## Steps

1. Calculate month-to-date pacing against the expected spend curve.
2. Separate campaigns into:
   - on pace
   - underspending
   - overspending
   - budget-limited winners
   - overfunded weak performers
3. Check whether pacing issues are caused by:
   - real budget pressure
   - poor efficiency
   - weak demand
   - tracking issues
   - strategy learning instability
4. Rank reallocation opportunities by marginal efficiency, not just raw CPA.
5. Recommend changes as:
   - increase budget
   - decrease budget
   - shift budget from X to Y
   - no change
   - needs human review
6. Where useful, estimate month-end projected spend.

## Evaluation criteria

- daily pace ratio: actual MTD spend / expected MTD spend
- budget-limited but efficient campaigns get priority for increases
- inefficient overspend should be trimmed before healthy winners
- budget changes should be smaller and more stable for Smart Bidding campaigns

## Output format

- month-to-date pacing summary
- projected month-end spend
- campaigns on pace / under pace / over pace
- reallocation recommendations with evidence
- risk notes
- approval tier for each proposed change

## Approval and safety

- Avoid budget changes above 20% in one move unless explicitly requested.
- Do not confuse a tracking problem with a budget problem.
- For Smart Bidding campaigns, avoid repeated edits in short windows.
- Favor reallocation over blunt cuts.

## Example GAQL queries

### Campaign budget pacing
```sql
SELECT
  campaign.id,
  campaign.name,
  campaign_budget.amount_micros,
  campaign_budget.name,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date DURING THIS_MONTH
ORDER BY metrics.cost_micros DESC
```

### Daily pacing trend
```sql
SELECT
  campaign.name,
  segments.date,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE segments.date DURING THIS_MONTH
ORDER BY segments.date ASC
```
