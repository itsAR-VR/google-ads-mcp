import { z } from 'zod';
import {
  buildAdGroupLookupQuery,
  buildAdGroupPerformanceQuery,
  buildAdLookupQuery,
  buildCampaignLookupQuery,
  buildCampaignPerformanceQuery,
  buildKeywordPerformanceQuery,
  buildSearchTermsQuery,
  entityLookupSchema,
  gaqlSearchSchema,
  performanceOverviewSchema,
  searchTermsSchema
} from './gaql.js';
import type {
  CreateAdGroupInput,
  CreateCampaignInput,
  CreateKeywordInput,
  CreateResponsiveSearchAdInput,
  StatusUpdateInput,
  UpdateAdGroupInput,
  UpdateCampaignBudgetInput,
  UpdateCampaignInput,
  UpdateKeywordInput,
  UpdateResponsiveSearchAdInput
} from './googleAdsClient.js';
import { GoogleAdsServiceClient } from './googleAdsClient.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: unknown) => Promise<unknown>;
}

const createCampaignSchema = z.object({
  customerId: z.string().optional(),
  name: z.string().min(1),
  advertisingChannelType: z.enum(['SEARCH', 'DISPLAY', 'SHOPPING', 'VIDEO', 'PERFORMANCE_MAX']).optional(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional(),
  campaignBudgetAmountMicros: z.number().int().positive(),
  biddingStrategyType: z.enum(['MANUAL_CPC']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const updateCampaignSchema = z.object({
  customerId: z.string().optional(),
  campaignId: z.string().min(1),
  name: z.string().optional(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const createAdGroupSchema = z.object({
  customerId: z.string().optional(),
  campaignId: z.string().min(1),
  name: z.string().min(1),
  cpcBidMicros: z.number().int().positive().optional(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional(),
  type: z.enum(['SEARCH_STANDARD']).optional()
});

const updateAdGroupSchema = z.object({
  customerId: z.string().optional(),
  adGroupId: z.string().min(1),
  name: z.string().optional(),
  cpcBidMicros: z.number().int().positive().optional(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional()
});

const createKeywordSchema = z.object({
  customerId: z.string().optional(),
  adGroupId: z.string().min(1),
  text: z.string().min(1),
  matchType: z.enum(['EXACT', 'PHRASE', 'BROAD']),
  cpcBidMicros: z.number().int().positive().optional(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional(),
  negative: z.boolean().optional()
});

const updateKeywordSchema = z.object({
  customerId: z.string().optional(),
  criterionId: z.string().min(1),
  adGroupId: z.string().min(1),
  text: z.string().optional(),
  matchType: z.enum(['EXACT', 'PHRASE', 'BROAD']).optional(),
  cpcBidMicros: z.number().int().positive().optional(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional()
});

const createRsaSchema = z.object({
  customerId: z.string().optional(),
  adGroupId: z.string().min(1),
  finalUrls: z.array(z.string().url()).min(1),
  headlines: z.array(z.string().min(1)).min(3).max(15),
  descriptions: z.array(z.string().min(1)).min(2).max(4),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional()
});

const updateRsaSchema = z.object({
  customerId: z.string().optional(),
  adId: z.string().min(1),
  adGroupId: z.string().min(1),
  finalUrls: z.array(z.string().url()).optional(),
  headlines: z.array(z.string().min(1)).min(3).max(15).optional(),
  descriptions: z.array(z.string().min(1)).min(2).max(4).optional(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional()
});

const updateBudgetSchema = z.object({
  customerId: z.string().optional(),
  campaignBudgetResourceName: z.string().optional(),
  campaignBudgetId: z.string().optional(),
  amountMicros: z.number().int().positive()
}).refine((value) => value.campaignBudgetResourceName || value.campaignBudgetId, {
  message: 'Provide campaignBudgetResourceName or campaignBudgetId'
});

const statusMutationSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    resourceName: z.string().min(1),
    entity: z.enum(['campaign', 'ad_group', 'ad_group_ad', 'ad_group_criterion']),
    status: z.enum(['ENABLED', 'PAUSED', 'REMOVED'])
  })).min(1)
});

function asJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  return z.toJSONSchema(schema) as Record<string, unknown>;
}

export function buildTools(client: GoogleAdsServiceClient): ToolDefinition[] {
  return [
    {
      name: 'list_accessible_customers',
      description: 'List Google Ads customers accessible to the configured OAuth user.',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => client.listAccessibleCustomers()
    },
    {
      name: 'search_gaql',
      description: 'Run an arbitrary GAQL query against Google Ads.',
      inputSchema: asJsonSchema(gaqlSearchSchema),
      handler: async (args) => {
        const input = gaqlSearchSchema.parse(args);
        const rows = await client.query(input.customerId, input.query);
        return input.limit ? rows.slice(0, input.limit) : rows;
      }
    },
    {
      name: 'get_campaign_performance',
      description: 'Read campaign-level performance metrics using GAQL.',
      inputSchema: asJsonSchema(performanceOverviewSchema),
      handler: async (args) => {
        const input = performanceOverviewSchema.parse(args);
        return client.query(input.customerId, buildCampaignPerformanceQuery(input));
      }
    },
    {
      name: 'get_ad_group_performance',
      description: 'Read ad group performance metrics using GAQL.',
      inputSchema: asJsonSchema(performanceOverviewSchema),
      handler: async (args) => {
        const input = performanceOverviewSchema.parse(args);
        return client.query(input.customerId, buildAdGroupPerformanceQuery(input));
      }
    },
    {
      name: 'get_keyword_performance',
      description: 'Read keyword performance metrics using GAQL.',
      inputSchema: asJsonSchema(performanceOverviewSchema),
      handler: async (args) => {
        const input = performanceOverviewSchema.parse(args);
        return client.query(input.customerId, buildKeywordPerformanceQuery(input));
      }
    },
    {
      name: 'get_search_terms',
      description: 'Read search terms and their performance using search_term_view.',
      inputSchema: asJsonSchema(searchTermsSchema),
      handler: async (args) => {
        const input = searchTermsSchema.parse(args);
        return client.query(input.customerId, buildSearchTermsQuery(input));
      }
    },
    {
      name: 'list_campaigns',
      description: 'List campaigns and core metadata using GAQL.',
      inputSchema: asJsonSchema(entityLookupSchema),
      handler: async (args) => {
        const input = entityLookupSchema.parse(args);
        return client.query(input.customerId, buildCampaignLookupQuery(input));
      }
    },
    {
      name: 'list_ad_groups',
      description: 'List ad groups and core metadata using GAQL.',
      inputSchema: asJsonSchema(entityLookupSchema),
      handler: async (args) => {
        const input = entityLookupSchema.parse(args);
        return client.query(input.customerId, buildAdGroupLookupQuery(input));
      }
    },
    {
      name: 'list_ads',
      description: 'List ads and responsive search ad assets using GAQL.',
      inputSchema: asJsonSchema(entityLookupSchema),
      handler: async (args) => {
        const input = entityLookupSchema.parse(args);
        return client.query(input.customerId, buildAdLookupQuery(input));
      }
    },
    {
      name: 'create_campaign',
      description: 'Create a campaign and its dedicated budget in one mutate request.',
      inputSchema: asJsonSchema(createCampaignSchema),
      handler: async (args) => {
        const input = createCampaignSchema.parse(args);
        return client.createCampaign(input.customerId, input as CreateCampaignInput);
      }
    },
    {
      name: 'update_campaign',
      description: 'Update campaign name, dates, or status.',
      inputSchema: asJsonSchema(updateCampaignSchema),
      handler: async (args) => {
        const input = updateCampaignSchema.parse(args);
        return client.updateCampaign(input.customerId, input as UpdateCampaignInput);
      }
    },
    {
      name: 'create_ad_group',
      description: 'Create an ad group inside an existing campaign.',
      inputSchema: asJsonSchema(createAdGroupSchema),
      handler: async (args) => {
        const input = createAdGroupSchema.parse(args);
        return client.createAdGroup(input.customerId, input as CreateAdGroupInput);
      }
    },
    {
      name: 'update_ad_group',
      description: 'Update ad group bids, name, or status.',
      inputSchema: asJsonSchema(updateAdGroupSchema),
      handler: async (args) => {
        const input = updateAdGroupSchema.parse(args);
        return client.updateAdGroup(input.customerId, input as UpdateAdGroupInput);
      }
    },
    {
      name: 'create_keyword',
      description: 'Create a keyword criterion in an ad group.',
      inputSchema: asJsonSchema(createKeywordSchema),
      handler: async (args) => {
        const input = createKeywordSchema.parse(args);
        return client.createKeyword(input.customerId, input as CreateKeywordInput);
      }
    },
    {
      name: 'update_keyword',
      description: 'Update keyword text, match type, bid, or status.',
      inputSchema: asJsonSchema(updateKeywordSchema),
      handler: async (args) => {
        const input = updateKeywordSchema.parse(args);
        return client.updateKeyword(input.customerId, input as UpdateKeywordInput);
      }
    },
    {
      name: 'create_responsive_search_ad',
      description: 'Create a responsive search ad inside an ad group.',
      inputSchema: asJsonSchema(createRsaSchema),
      handler: async (args) => {
        const input = createRsaSchema.parse(args);
        return client.createResponsiveSearchAd(input.customerId, input as CreateResponsiveSearchAdInput);
      }
    },
    {
      name: 'update_responsive_search_ad',
      description: 'Update a responsive search ad final URLs, assets, or status.',
      inputSchema: asJsonSchema(updateRsaSchema),
      handler: async (args) => {
        const input = updateRsaSchema.parse(args);
        return client.updateResponsiveSearchAd(input.customerId, input as UpdateResponsiveSearchAdInput);
      }
    },
    {
      name: 'update_campaign_budget',
      description: 'Update a campaign budget amount.',
      inputSchema: asJsonSchema(updateBudgetSchema),
      handler: async (args) => {
        const input = updateBudgetSchema.parse(args);
        return client.updateCampaignBudget(input.customerId, input as UpdateCampaignBudgetInput);
      }
    },
    {
      name: 'set_entity_statuses',
      description: 'Batch enable, pause, or remove campaigns, ad groups, ads, and keywords by resource name.',
      inputSchema: asJsonSchema(statusMutationSchema),
      handler: async (args) => {
        const input = statusMutationSchema.parse(args);
        return client.batchUpdateStatuses(input.customerId, input.items as StatusUpdateInput[]);
      }
    }
  ];
}
