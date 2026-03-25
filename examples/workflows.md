# Suggested agent workflows

## 1. Search term mining

1. Run `get_search_terms` for the last 7 or 14 days.
2. Filter for high-cost or high-click terms with low conversions.
3. Turn good queries into keywords with `create_keyword`.
4. Pause weak keywords with `set_entity_statuses` if needed.

## 2. Weekly account review

1. Run `get_campaign_performance`.
2. Run `get_ad_group_performance` on top spenders.
3. Run `get_keyword_performance` for high-cost ad groups.
4. Raise budgets with `update_campaign_budget` for winners.
5. Pause weak entities with `set_entity_statuses`.

## 3. Net-new search buildout

1. `create_campaign`
2. `create_ad_group`
3. `create_keyword`
4. `create_responsive_search_ad`
5. keep everything paused until reviewed
