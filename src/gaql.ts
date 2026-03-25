import { z } from 'zod';

export const gaqlSearchSchema = z.object({
  customerId: z.string().optional(),
  query: z.string().min(1),
  pageSize: z.number().int().positive().max(10000).optional(),
  limit: z.number().int().positive().max(10000).optional()
});

export const commonDateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const performanceOverviewSchema = commonDateRangeSchema.extend({
  customerId: z.string().optional(),
  campaignStatus: z.array(z.enum(['ENABLED', 'PAUSED', 'REMOVED'])).optional(),
  limit: z.number().int().positive().max(1000).optional().default(50)
});

export const entityLookupSchema = z.object({
  customerId: z.string().optional(),
  ids: z.array(z.string()).optional(),
  status: z.array(z.enum(['ENABLED', 'PAUSED', 'REMOVED'])).optional(),
  limit: z.number().int().positive().max(1000).optional().default(100)
});

export const searchTermsSchema = commonDateRangeSchema.extend({
  customerId: z.string().optional(),
  campaignIds: z.array(z.string()).optional(),
  adGroupIds: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(1000).optional().default(100)
});

function joinQuoted(values?: string[]): string | null {
  if (!values || values.length === 0) return null;
  return values.map((value) => `'${value}'`).join(', ');
}

function joinIds(values?: string[]): string | null {
  if (!values || values.length === 0) return null;
  return values.join(', ');
}

export function buildCampaignPerformanceQuery(input: z.infer<typeof performanceOverviewSchema>): string {
  const conditions = [
    `segments.date BETWEEN '${input.startDate}' AND '${input.endDate}'`
  ];

  const statuses = joinQuoted(input.campaignStatus);
  if (statuses) conditions.push(`campaign.status IN (${statuses})`);

  return `SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign_budget.amount_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.average_cpc,
  metrics.ctr,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE ${conditions.join('\n  AND ')}
ORDER BY metrics.cost_micros DESC
LIMIT ${input.limit}`;
}

export function buildAdGroupPerformanceQuery(input: z.infer<typeof performanceOverviewSchema>): string {
  const conditions = [
    `segments.date BETWEEN '${input.startDate}' AND '${input.endDate}'`
  ];

  const statuses = joinQuoted(input.campaignStatus);
  if (statuses) conditions.push(`ad_group.status IN (${statuses})`);

  return `SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group.status,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.average_cpc,
  metrics.ctr
FROM ad_group
WHERE ${conditions.join('\n  AND ')}
ORDER BY metrics.cost_micros DESC
LIMIT ${input.limit}`;
}

export function buildKeywordPerformanceQuery(input: z.infer<typeof performanceOverviewSchema>): string {
  return `SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group_criterion.criterion_id,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group_criterion.status,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.average_cpc,
  metrics.ctr
FROM keyword_view
WHERE segments.date BETWEEN '${input.startDate}' AND '${input.endDate}'
ORDER BY metrics.cost_micros DESC
LIMIT ${input.limit}`;
}

export function buildSearchTermsQuery(input: z.infer<typeof searchTermsSchema>): string {
  const conditions = [
    `segments.date BETWEEN '${input.startDate}' AND '${input.endDate}'`
  ];

  const campaignIds = joinIds(input.campaignIds);
  if (campaignIds) conditions.push(`campaign.id IN (${campaignIds})`);

  const adGroupIds = joinIds(input.adGroupIds);
  if (adGroupIds) conditions.push(`ad_group.id IN (${adGroupIds})`);

  return `SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  search_term_view.search_term,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM search_term_view
WHERE ${conditions.join('\n  AND ')}
ORDER BY metrics.impressions DESC
LIMIT ${input.limit}`;
}

export function buildCampaignLookupQuery(input: z.infer<typeof entityLookupSchema>): string {
  const conditions: string[] = [];
  const ids = joinIds(input.ids);
  if (ids) conditions.push(`campaign.id IN (${ids})`);
  const statuses = joinQuoted(input.status);
  if (statuses) conditions.push(`campaign.status IN (${statuses})`);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return `SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  campaign.start_date,
  campaign.end_date,
  campaign_budget.resource_name,
  campaign_budget.amount_micros
FROM campaign
${where}
ORDER BY campaign.id
LIMIT ${input.limit}`;
}

export function buildAdGroupLookupQuery(input: z.infer<typeof entityLookupSchema>): string {
  const conditions: string[] = [];
  const ids = joinIds(input.ids);
  if (ids) conditions.push(`ad_group.id IN (${ids})`);
  const statuses = joinQuoted(input.status);
  if (statuses) conditions.push(`ad_group.status IN (${statuses})`);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return `SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group.status,
  ad_group.type,
  ad_group.cpc_bid_micros
FROM ad_group
${where}
ORDER BY ad_group.id
LIMIT ${input.limit}`;
}

export function buildAdLookupQuery(input: z.infer<typeof entityLookupSchema>): string {
  const conditions: string[] = [];
  const ids = joinIds(input.ids);
  if (ids) conditions.push(`ad_group_ad.ad.id IN (${ids})`);
  const statuses = joinQuoted(input.status);
  if (statuses) conditions.push(`ad_group_ad.status IN (${statuses})`);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return `SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group_ad.ad.id,
  ad_group_ad.status,
  ad_group_ad.ad.type,
  ad_group_ad.ad.final_urls,
  ad_group_ad.ad.responsive_search_ad.headlines,
  ad_group_ad.ad.responsive_search_ad.descriptions
FROM ad_group_ad
${where}
ORDER BY ad_group_ad.ad.id
LIMIT ${input.limit}`;
}
