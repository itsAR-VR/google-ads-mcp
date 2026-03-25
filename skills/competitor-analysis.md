# competitor-analysis

## Description

Auction-insights and competitive positioning skill for paid search.
This skill should help decide whether to fight, flank, or avoid, instead of brainlessly screaming 'raise bids' at every competitive signal.

## When to use

Use when the user wants to:
- review auction insights
- understand competitor pressure
- assess conquesting opportunities
- decide whether rank problems are worth fixing

## Required inputs

- auction insights metrics where available
- campaign and brand context
- impression share, overlap rate, outranking share, top-of-page and absolute-top rates
- efficiency metrics and business economics
- competitor intelligence or ad-library findings, optional

## Steps

1. Review auction insights over time, not as a one-off snapshot.
2. Identify real competitive pressure vs noise.
3. Decide strategic stance:
   - fight
   - flank
   - avoid
4. Pair auction insight interpretation with economics and message differentiation.
5. Recommend actions across:
   - bids / budgets
   - query selection
   - ad messaging
   - landing page positioning
   - conquesting or exclusion strategy

## Evaluation criteria

- high overlap + low outranking share may justify action if unit economics support it
- low impression share can make auction insights misleading
- rank issues are not always solved by bidding harder
- message differentiation can outperform brute-force bid inflation

## Output format

- competitive summary
- top threats
- where we are winning or losing
- stance recommendation: fight / flank / avoid
- recommended actions
- confidence level

## Safety notes

- Do not recommend raising bids by default.
- Ignore low-signal auction noise.
- Tie competitive recommendations to unit economics, not ego.

## Example GAQL queries

### Auction insight support query
```sql
SELECT
  campaign.name,
  metrics.search_impression_share,
  metrics.search_rank_lost_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.impressions DESC
```

### Competitor-adjacent query proxy via search terms
```sql
SELECT
  campaign.name,
  search_term_view.search_term,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
LIMIT 300
```
