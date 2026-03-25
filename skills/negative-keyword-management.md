# negative-keyword-management

## Description

Recommendation-first workflow for finding, reviewing, and optionally applying negative keywords.
This skill should usually operate downstream of `mine-search-terms.md` and `search-term-methodology.md`.

## When to use

Use when the user wants to:
- identify wasted spend from irrelevant queries
- generate negative keyword recommendations
- apply approved negatives via API mutations
- create or refine shared negative lists

## Required inputs

- search term findings
- account or campaign scope
- existing negative keywords or lists, if available
- protected terms and known converting themes
- target CPA or efficiency guardrails, if available

## Steps

1. Pull candidate negatives from search term findings.
2. Classify each candidate:
   - free/DIY
   - jobs/careers
   - support intent
   - wrong product or service
   - geo mismatch
   - competitor or policy-sensitive
   - ambiguous
3. Choose a proposed negative match type:
   - exact
   - phrase
   - broad
4. Run a collision check against converting queries and protected terms.
5. Split outputs into:
   - safe to queue
   - needs human review
   - reject
6. If approved, prepare direct mutation payloads.
7. Return a blocked-intent preview for anything risky.

## Evaluation criteria

- strong irrelevant-intent patterns are best for safe negatives
- ambiguous negatives should bias toward exact match or manual review
- shared negative lists are appropriate for universal junk themes
- campaign-level negatives are safer when funnel separation matters

## Output format

- proposed negative
- match type
- scope level
- reason category
- confidence
- collision risk
- blocked-intent preview
- apply/no-apply recommendation

## Approval and safety

- Never auto-apply a negative that could block proven converting intent.
- Do not use broad negatives casually.
- Account for singular/plural and synonym coverage because negatives are stricter than positive keywords.
- Mutations require explicit approval unless the operator has opted into low-risk safe-apply rules.
- Follow CEP: confirm exact negatives and scope, execute only after approval, then post-check that no protected terms or key winners were unintentionally blocked.

## Example GAQL queries

### Search terms driving waste
```sql
SELECT
  campaign.name,
  ad_group.name,
  search_term_view.search_term,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
LIMIT 500
```

### Existing negative keyword scan
```sql
SELECT
  campaign_criterion.campaign,
  campaign_criterion.negative,
  campaign_criterion.keyword.text,
  campaign_criterion.keyword.match_type
FROM campaign_criterion
WHERE campaign_criterion.type = KEYWORD
  AND campaign_criterion.negative = TRUE
```
