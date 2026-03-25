export type EntityStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';

export interface GoogleAdsMutationResult {
  operation: string;
  resourceNames: string[];
  partialFailureError?: unknown;
}

export interface ManagedCustomerSummary {
  customerId: string;
  descriptiveName?: string;
  currencyCode?: string;
  timeZone?: string;
  manager?: boolean;
  testAccount?: boolean;
}
