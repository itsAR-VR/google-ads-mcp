import { GoogleAdsApi, ResourceNames, enums } from 'google-ads-api';
import type { Customer } from 'google-ads-api';
import type { GoogleAdsConfig } from './config.js';
import type { EntityStatus, GoogleAdsMutationResult, ManagedCustomerSummary } from './types.js';
import { Logger } from './logger.js';

export interface StatusUpdateInput {
  resourceName: string;
  entity: 'campaign' | 'ad_group' | 'ad_group_ad' | 'ad_group_criterion';
  status: EntityStatus;
}

export interface CreateCampaignInput {
  name: string;
  advertisingChannelType?: keyof typeof enums.AdvertisingChannelType;
  status?: EntityStatus;
  campaignBudgetAmountMicros: number;
  biddingStrategyType?: keyof typeof enums.BiddingStrategyType;
  startDate?: string;
  endDate?: string;
}

export interface UpdateCampaignInput {
  campaignId: string;
  name?: string;
  status?: EntityStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateAdGroupInput {
  campaignId: string;
  name: string;
  cpcBidMicros?: number;
  status?: EntityStatus;
  type?: keyof typeof enums.AdGroupType;
}

export interface UpdateAdGroupInput {
  adGroupId: string;
  name?: string;
  cpcBidMicros?: number;
  status?: EntityStatus;
}

export interface CreateKeywordInput {
  adGroupId: string;
  text: string;
  matchType: keyof typeof enums.KeywordMatchType;
  cpcBidMicros?: number;
  status?: EntityStatus;
  negative?: boolean;
}

export interface UpdateKeywordInput {
  criterionId: string;
  adGroupId: string;
  text?: string;
  matchType?: keyof typeof enums.KeywordMatchType;
  cpcBidMicros?: number;
  status?: EntityStatus;
}

export interface CreateResponsiveSearchAdInput {
  adGroupId: string;
  finalUrls: string[];
  headlines: string[];
  descriptions: string[];
  status?: EntityStatus;
}

export interface UpdateResponsiveSearchAdInput {
  adId: string;
  adGroupId: string;
  finalUrls?: string[];
  headlines?: string[];
  descriptions?: string[];
  status?: EntityStatus;
}

export interface UpdateCampaignBudgetInput {
  campaignBudgetResourceName?: string;
  campaignBudgetId?: string;
  amountMicros: number;
}

function normalizeStatus(status: EntityStatus | undefined, fallback: EntityStatus = 'ENABLED'): number {
  const value = status ?? fallback;
  return enums.CampaignStatus[value as keyof typeof enums.CampaignStatus] as number;
}

function normalizeAdGroupStatus(status: EntityStatus | undefined, fallback: EntityStatus = 'ENABLED'): number {
  const value = status ?? fallback;
  return enums.AdGroupStatus[value as keyof typeof enums.AdGroupStatus] as number;
}

function normalizeAdGroupAdStatus(status: EntityStatus | undefined, fallback: EntityStatus = 'ENABLED'): number {
  const value = status ?? fallback;
  return enums.AdGroupAdStatus[value as keyof typeof enums.AdGroupAdStatus] as number;
}

function normalizeCriterionStatus(status: EntityStatus | undefined, fallback: EntityStatus = 'ENABLED'): number {
  const value = status ?? fallback;
  return enums.AdGroupCriterionStatus[value as keyof typeof enums.AdGroupCriterionStatus] as number;
}


function extractMutationResourceNames(response: { mutate_operation_responses?: unknown[] }): string[] {
  return (response.mutate_operation_responses ?? []).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    for (const value of Object.values(item as Record<string, unknown>)) {
      if (value && typeof value === 'object' && 'resource_name' in value) {
        const resourceName = (value as { resource_name?: string }).resource_name;
        return resourceName ? [resourceName] : [];
      }
    }
    return [];
  });
}

function resourceNameToId(resourceName: string): string {
  return resourceName.split('/').pop() ?? resourceName;
}

export class GoogleAdsServiceClient {
  private readonly api: GoogleAdsApi;

  constructor(
    private readonly config: GoogleAdsConfig,
    private readonly logger: Logger
  ) {
    this.api = new GoogleAdsApi({
      client_id: config.GOOGLE_ADS_CLIENT_ID,
      client_secret: config.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: config.GOOGLE_ADS_DEVELOPER_TOKEN
    });
  }

  customer(customerId?: string): Customer {
    return this.api.Customer({
      customer_id: customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID,
      login_customer_id: this.config.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      refresh_token: this.config.GOOGLE_ADS_REFRESH_TOKEN
    });
  }

  async query(customerId: string | undefined, query: string): Promise<unknown[]> {
    this.logger.debug('Executing GAQL query', { customerId: customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, query });
    return this.customer(customerId).query(query);
  }

  async listAccessibleCustomers(): Promise<ManagedCustomerSummary[]> {
    const query = `SELECT
  customer_client.id,
  customer_client.descriptive_name,
  customer_client.currency_code,
  customer_client.time_zone,
  customer_client.manager,
  customer_client.test_account
FROM customer_client
ORDER BY customer_client.id`;
    const rows = await this.query(undefined, query) as Array<Record<string, unknown>>;
    return rows.map((row) => {
      const customerClient = row.customer_client as Record<string, unknown>;
      return {
        customerId: String(customerClient.id),
        descriptiveName: customerClient.descriptive_name as string | undefined,
        currencyCode: customerClient.currency_code as string | undefined,
        timeZone: customerClient.time_zone as string | undefined,
        manager: customerClient.manager as boolean | undefined,
        testAccount: customerClient.test_account as boolean | undefined
      };
    });
  }

  async createCampaign(customerId: string | undefined, input: CreateCampaignInput): Promise<GoogleAdsMutationResult> {
    const budgetResourceName = ResourceNames.campaignBudget(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, `-${Date.now()}`);
    const campaignResourceName = ResourceNames.campaign(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, `-${Date.now() + 1}`);
    const operations = [
      {
        entity: 'campaign_budget' as const,
        operation: 'create' as const,
        resource: {
          resource_name: budgetResourceName,
          name: `${input.name} Budget`,
          amount_micros: input.campaignBudgetAmountMicros,
          delivery_method: enums.BudgetDeliveryMethod.STANDARD,
          explicitly_shared: false
        }
      },
      {
        entity: 'campaign' as const,
        operation: 'create' as const,
        resource: {
          resource_name: campaignResourceName,
          name: input.name,
          advertising_channel_type: enums.AdvertisingChannelType[input.advertisingChannelType ?? 'SEARCH'],
          status: normalizeStatus(input.status),
          campaign_budget: budgetResourceName,
          manual_cpc: input.biddingStrategyType === 'MANUAL_CPC' || !input.biddingStrategyType ? {} : undefined,
          start_date: input.startDate,
          end_date: input.endDate
        }
      }
    ];

    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'createCampaign',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async updateCampaign(customerId: string | undefined, input: UpdateCampaignInput): Promise<GoogleAdsMutationResult> {
    const resourceName = ResourceNames.campaign(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, input.campaignId);
    const operations = [
      {
        entity: 'campaign' as const,
        operation: 'update' as const,
        resource: {
          resource_name: resourceName,
          ...(input.name ? { name: input.name } : {}),
          ...(input.status ? { status: normalizeStatus(input.status) } : {}),
          ...(input.startDate ? { start_date: input.startDate } : {}),
          ...(input.endDate ? { end_date: input.endDate } : {})
        }
      }
    ];

    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'updateCampaign',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async createAdGroup(customerId: string | undefined, input: CreateAdGroupInput): Promise<GoogleAdsMutationResult> {
    const resourceName = ResourceNames.adGroup(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, `-${Date.now()}`);
    const operations = [
      {
        entity: 'ad_group' as const,
        operation: 'create' as const,
        resource: {
          resource_name: resourceName,
          campaign: ResourceNames.campaign(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, input.campaignId),
          name: input.name,
          status: normalizeAdGroupStatus(input.status),
          type: enums.AdGroupType[input.type ?? 'SEARCH_STANDARD'],
          cpc_bid_micros: input.cpcBidMicros
        }
      }
    ];

    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'createAdGroup',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async updateAdGroup(customerId: string | undefined, input: UpdateAdGroupInput): Promise<GoogleAdsMutationResult> {
    const resourceName = ResourceNames.adGroup(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, input.adGroupId);
    const operations = [
      {
        entity: 'ad_group' as const,
        operation: 'update' as const,
        resource: {
          resource_name: resourceName,
          ...(input.name ? { name: input.name } : {}),
          ...(input.status ? { status: normalizeAdGroupStatus(input.status) } : {}),
          ...(input.cpcBidMicros ? { cpc_bid_micros: input.cpcBidMicros } : {})
        }
      }
    ];
    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'updateAdGroup',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async createKeyword(customerId: string | undefined, input: CreateKeywordInput): Promise<GoogleAdsMutationResult> {
    const operations = [
      {
        entity: 'ad_group_criterion' as const,
        operation: 'create' as const,
        resource: {
          ad_group: ResourceNames.adGroup(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, input.adGroupId),
          status: normalizeCriterionStatus(input.status),
          negative: input.negative ?? false,
          cpc_bid_micros: input.cpcBidMicros,
          keyword: {
            text: input.text,
            match_type: enums.KeywordMatchType[input.matchType]
          }
        }
      }
    ];
    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'createKeyword',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async updateKeyword(customerId: string | undefined, input: UpdateKeywordInput): Promise<GoogleAdsMutationResult> {
    const resourceName = ResourceNames.adGroupCriterion(
      customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID,
      input.adGroupId,
      input.criterionId
    );

    const operations = [
      {
        entity: 'ad_group_criterion' as const,
        operation: 'update' as const,
        resource: {
          resource_name: resourceName,
          ...(input.status ? { status: normalizeCriterionStatus(input.status) } : {}),
          ...(input.cpcBidMicros ? { cpc_bid_micros: input.cpcBidMicros } : {}),
          ...((input.text || input.matchType)
            ? {
                keyword: {
                  ...(input.text ? { text: input.text } : {}),
                  ...(input.matchType ? { match_type: enums.KeywordMatchType[input.matchType] } : {})
                }
              }
            : {})
        }
      }
    ];

    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'updateKeyword',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async createResponsiveSearchAd(customerId: string | undefined, input: CreateResponsiveSearchAdInput): Promise<GoogleAdsMutationResult> {
    const operations = [
      {
        entity: 'ad_group_ad' as const,
        operation: 'create' as const,
        resource: {
          ad_group: ResourceNames.adGroup(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, input.adGroupId),
          status: normalizeAdGroupAdStatus(input.status),
          ad: {
            final_urls: input.finalUrls,
            responsive_search_ad: {
              headlines: input.headlines.map((text) => ({ text })),
              descriptions: input.descriptions.map((text) => ({ text }))
            }
          }
        }
      }
    ];

    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'createResponsiveSearchAd',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async updateResponsiveSearchAd(customerId: string | undefined, input: UpdateResponsiveSearchAdInput): Promise<GoogleAdsMutationResult> {
    const adResourceName = ResourceNames.ad(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, input.adId);
    const adGroupAdResourceName = ResourceNames.adGroupAd(
      customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID,
      input.adGroupId,
      input.adId
    );

    const operations = [
      {
        entity: 'ad_group_ad' as const,
        operation: 'update' as const,
        resource: {
          resource_name: adGroupAdResourceName,
          ...(input.status ? { status: normalizeAdGroupAdStatus(input.status) } : {}),
          ad: {
            resource_name: adResourceName,
            ...(input.finalUrls ? { final_urls: input.finalUrls } : {}),
            ...((input.headlines || input.descriptions)
              ? {
                  responsive_search_ad: {
                    ...(input.headlines ? { headlines: input.headlines.map((text) => ({ text })) } : {}),
                    ...(input.descriptions ? { descriptions: input.descriptions.map((text) => ({ text })) } : {})
                  }
                }
              : {})
          }
        }
      }
    ];

    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'updateResponsiveSearchAd',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async updateCampaignBudget(customerId: string | undefined, input: UpdateCampaignBudgetInput): Promise<GoogleAdsMutationResult> {
    const resourceName = input.campaignBudgetResourceName ?? ResourceNames.campaignBudget(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, input.campaignBudgetId ?? '');
    const operations = [
      {
        entity: 'campaign_budget' as const,
        operation: 'update' as const,
        resource: {
          resource_name: resourceName,
          amount_micros: input.amountMicros
        }
      }
    ];
    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'updateCampaignBudget',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  async batchUpdateStatuses(customerId: string | undefined, input: StatusUpdateInput[]): Promise<GoogleAdsMutationResult> {
    const operations = input.map((item) => {
      switch (item.entity) {
        case 'campaign':
          return {
            entity: 'campaign' as const,
            operation: 'update' as const,
            resource: {
              resource_name: item.resourceName,
              status: normalizeStatus(item.status)
            }
          };
        case 'ad_group':
          return {
            entity: 'ad_group' as const,
            operation: 'update' as const,
            resource: {
              resource_name: item.resourceName,
              status: normalizeAdGroupStatus(item.status)
            }
          };
        case 'ad_group_ad':
          return {
            entity: 'ad_group_ad' as const,
            operation: 'update' as const,
            resource: {
              resource_name: item.resourceName,
              status: normalizeAdGroupAdStatus(item.status)
            }
          };
        case 'ad_group_criterion':
          return {
            entity: 'ad_group_criterion' as const,
            operation: 'update' as const,
            resource: {
              resource_name: item.resourceName,
              status: normalizeCriterionStatus(item.status)
            }
          };
      }
    });

    const response = await this.customer(customerId).mutateResources(operations as never[]);
    return {
      operation: 'batchUpdateStatuses',
      resourceNames: extractMutationResourceNames(response)
    };
  }

  campaignResourceName(customerId: string | undefined, campaignId: string): string {
    return ResourceNames.campaign(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, campaignId);
  }

  adGroupResourceName(customerId: string | undefined, adGroupId: string): string {
    return ResourceNames.adGroup(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, adGroupId);
  }

  adGroupAdResourceName(customerId: string | undefined, adGroupId: string, adId: string): string {
    return ResourceNames.adGroupAd(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, adGroupId, adId);
  }

  adGroupCriterionResourceName(customerId: string | undefined, adGroupId: string, criterionId: string): string {
    return ResourceNames.adGroupCriterion(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, adGroupId, criterionId);
  }

  campaignBudgetResourceName(customerId: string | undefined, campaignBudgetId: string): string {
    return ResourceNames.campaignBudget(customerId ?? this.config.GOOGLE_ADS_CUSTOMER_ID, campaignBudgetId);
  }

  extractId(resourceName: string): string {
    return resourceNameToId(resourceName);
  }
}
