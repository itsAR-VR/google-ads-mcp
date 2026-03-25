# bid-management

## Description

Bid strategy oversight skill with anti-thrashing guardrails.
This skill is for evaluating manual CPC and Smart Bidding setups, not for letting an LLM randomly light the account on fire.

## When to use

Use when the user wants to:
- evaluate current bid strategy
- review target CPA / target ROAS sanity
- consider manual CPC vs Smart Bidding in a specific context
- diagnose volume throttling or efficiency deterioration

## Required inputs

- current bid strategy per campaign
- conversions, CPA/ROAS, conversion value
- impression share and rank-loss data
- budget status
- learning state if available
- recent change history

## Steps

1. Identify bidding mode per campaign.
2. Check whether the campaign is in or near learning.
3. Evaluate whether targets are too tight or too loose.
4. Cross-check rank loss, volume, and efficiency together.
5. Recommend one of:
   - no change
   - observe longer
   - small target adjustment
   - manual CPC review
   - budget-first fix
6. Explain expected tradeoff of any bid strategy change.

## Evaluation criteria

- Smart Bidding campaigns should usually get smaller target edits, not constant intervention.
- If target CPA/tROAS is too aggressive, expect throttled volume and lost rank.
- If conversion volume is low, confidence should drop sharply.
- Impression share helps diagnose throttling but should not be the sole reason to raise bids.

## Output format

- current bid strategy
- diagnosis
- recommendation
- expected upside
- risks
- confidence
- cooldown recommendation

## Safety notes

- Do not stack major bid changes with major budget changes, large keyword expansion, and RSA rewrites in the same cycle.
- Use cooldown windows after material bid strategy edits.
- Bias toward observe/no change when data volume is weak.

## Example GAQL queries

### Bid strategy review
```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.bidding_strategy_type,
  campaign.target_cpa.target_cpa_micros,
  campaign.target_roas.target_roas,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.search_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```

### Daily efficiency trend
```sql
SELECT
  campaign.name,
  segments.date,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY segments.date ASC
```
